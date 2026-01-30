import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  section: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'retail_price' })
  retailPrice: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'dealer_price' })
  dealerPrice: number;

  @Column('decimal', { precision: 10, scale: 4, default: 1.0 })
  dollar: number;

  @Column({ default: 'В наличии' })
  availability: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
