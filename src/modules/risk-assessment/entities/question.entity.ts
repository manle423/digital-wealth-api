import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity } from 'typeorm';

@Entity('risk_assessment_questions')
export class Question extends BaseEntity {
  @Column()
  text: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'json' })
  options: {
    text: string;
    value: number;
  }[];
} 