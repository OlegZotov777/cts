import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(query: ProductQueryDto): Promise<{ products: Product[]; total: number; currentDollar: number }> {
    const { search, categoryId, section, page = 1, limit = 20 } = query;
    
    let queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (search) {
      const keywords = search.split(' ').filter(Boolean);
      for (const word of keywords) {
        queryBuilder = queryBuilder.andWhere(
          '(LOWER(product.name) LIKE :word OR LOWER(product.description) LIKE :word)',
          { word: `%${word.toLowerCase()}%` }
        );
      }
    }

    if (categoryId) {
      queryBuilder = queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (section) {
      queryBuilder = queryBuilder.andWhere('product.section = :section', { section });
    }

    const [products, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get current dollar rate
    const firstProduct = await this.productsRepository.findOne({ where: {} });
    const currentDollar = firstProduct?.dollar || 1.0;

    return { products, total, currentDollar };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productsRepository.find({
      where: { categoryId },
      relations: ['category'],
    });
  }

  async findBySection(section: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { section },
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
