import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User count
    const usersCount = await this.usersRepository.count();

    // Order counts
    const ordersTotal = await this.ordersRepository.count();
    const ordersLastMonth = await this.ordersRepository.count({
      where: { createdAt: MoreThanOrEqual(oneMonthAgo) },
    });
    const ordersLast24Hours = await this.ordersRepository.count({
      where: { createdAt: MoreThanOrEqual(oneDayAgo) },
    });

    // Get all orders for revenue calculation
    const allOrders = await this.ordersRepository.find({
      relations: ['items'],
    });

    let totalAllTime = 0;
    let totalLastMonth = 0;
    let totalLast24Hours = 0;

    for (const order of allOrders) {
      let orderTotal = 0;
      for (const item of order.items) {
        orderTotal += item.price * item.quantity;
      }
      
      totalAllTime += orderTotal;
      
      if (order.createdAt >= oneMonthAgo) {
        totalLastMonth += orderTotal;
      }
      if (order.createdAt >= oneDayAgo) {
        totalLast24Hours += orderTotal;
      }
    }

    // Products count
    const productsCount = await this.productsRepository.count();

    // Get current dollar rate
    const firstProduct = await this.productsRepository.findOne({ where: {} });
    const currentDollar = firstProduct?.dollar || 1.0;

    return {
      usersCount,
      ordersTotal,
      ordersLastMonth,
      ordersLast24Hours,
      totalAllTime: Math.round(totalAllTime * 100) / 100,
      totalLastMonth: Math.round(totalLastMonth * 100) / 100,
      totalLast24Hours: Math.round(totalLast24Hours * 100) / 100,
      productsCount,
      currentDollar,
    };
  }

  async getRecentOrders(limit: number = 10) {
    return this.ordersRepository.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAllSections(): Promise<string[]> {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.section', 'section')
      .where('product.section IS NOT NULL')
      .getRawMany();
    
    return products.map(p => p.section).filter(Boolean);
  }
}
