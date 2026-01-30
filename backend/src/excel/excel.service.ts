import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ExcelService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async exportOrders(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заказы');

    worksheet.columns = [
      { header: 'Номер заказа', key: 'id', width: 15 },
      { header: 'Заказ', key: 'orderInfo', width: 50 },
      { header: 'Пользователь', key: 'userInfo', width: 30 },
      { header: 'Дата и время заказа', key: 'createdAt', width: 25 },
    ];

    const orders = await this.ordersRepository.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
    });

    for (const order of orders) {
      let orderInfoText = '';
      let totalSum = 0;

      for (const item of order.items) {
        const itemTotal = item.price * item.quantity;
        orderInfoText += `${item.productName}, ${item.price}, ${item.quantity}\n`;
        totalSum += itemTotal;
      }
      orderInfoText += `Итого: ${totalSum}`;

      const userInfo = order.user
        ? `${order.user.name}, ${order.user.email}, ${order.user.phone || ''}`
        : 'Нет данных';

      worksheet.addRow({
        id: order.id,
        orderInfo: orderInfoText,
        userInfo,
        createdAt: order.createdAt,
      });
    }

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'top', wrapText: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportSingleOrder(orderId: number): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заказ');

    worksheet.columns = [
      { header: 'Наименование', key: 'title', width: 40 },
      { header: 'Цена за шт.', key: 'price', width: 15 },
      { header: 'Количество', key: 'quantity', width: 15 },
      { header: 'Всего', key: 'total', width: 15 },
    ];

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    let totalSum = 0;

    for (const item of order.items) {
      const itemTotal = item.price * item.quantity;
      totalSum += itemTotal;
      worksheet.addRow({
        title: item.productName,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Add total row
    worksheet.addRow({
      title: 'Итого:',
      price: '',
      quantity: '',
      total: totalSum,
    });

    // Add empty row
    worksheet.addRow({});

    // Add order info
    worksheet.addRow({ title: 'Номер заказа', price: order.id });
    worksheet.addRow({ title: 'Дата и время заказа', price: order.createdAt });
    
    const userInfo = order.user
      ? `${order.user.name}, ${order.user.email}, ${order.user.phone || ''}`
      : 'Нет данных';
    worksheet.addRow({ title: 'Пользователь', price: userInfo });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportUsers(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Пользователи');

    worksheet.columns = [
      { header: 'ФИО', key: 'name', width: 30 },
      { header: 'Логин', key: 'login', width: 15 },
      { header: 'Почта', key: 'email', width: 30 },
      { header: 'Телефон', key: 'phone', width: 20 },
      { header: 'Дата рождения', key: 'birth', width: 15 },
      { header: 'Пол', key: 'sex', width: 10 },
      { header: 'Город', key: 'city', width: 20 },
      { header: 'Место работы', key: 'placeOfWork', width: 30 },
    ];

    const users = await this.usersRepository.find();

    for (const user of users) {
      worksheet.addRow({
        name: user.name,
        login: user.email,
        email: user.email,
        phone: user.phone,
        birth: '',
        sex: '',
        city: user.city,
        placeOfWork: user.company,
      });
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'top', wrapText: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async importProducts(buffer: Buffer): Promise<{ imported: number }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    let imported = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Skip header row if exists
      if (rowNumber === 1) return;

      const section = row.getCell(1).value?.toString() || '';
      const name = row.getCell(2).value?.toString() || '';
      const retailPrice = parseFloat(row.getCell(3).value?.toString() || '0');
      const dealerPrice = parseFloat(row.getCell(4).value?.toString() || '0');
      const availability = row.getCell(5).value?.toString() || 'В наличии';
      const description = row.getCell(6).value?.toString() || '';

      if (name) {
        this.productsRepository.save({
          section,
          name,
          retailPrice,
          dealerPrice,
          dollar: 1.0,
          availability,
          description,
        });
        imported++;
      }
    });

    return { imported };
  }

  async updateDollarRate(newRate: number): Promise<{ updated: number }> {
    const products = await this.productsRepository.find();
    
    if (products.length === 0) {
      return { updated: 0 };
    }

    const currentDollar = products[0]?.dollar || 1.0;
    const ratio = newRate / currentDollar;

    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        retailPrice: () => `retail_price * ${ratio}`,
        dealerPrice: () => `dealer_price * ${ratio}`,
        dollar: newRate,
      })
      .execute();

    return { updated: products.length };
  }

  async deleteAllProducts(): Promise<void> {
    await this.productsRepository.clear();
  }
}
