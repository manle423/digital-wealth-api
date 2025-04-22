import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { QuestionTranslation } from './question-translation.entity';

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

  @OneToMany(() => QuestionTranslation, translation => translation.question)
  translations: QuestionTranslation[];

  @Column({ type: 'json' })
  options: {
    textVi: string;
    textEn: string;
    value: number;
  }[];
} 