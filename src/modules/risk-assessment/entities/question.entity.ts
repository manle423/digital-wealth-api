import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { QuestionTranslation } from './question-translation.entity';
import { QuestionCategory } from './question-category.entity';

@Entity('risk_assessment_questions')
export class Question extends BaseEntity {
  @Column()
  text: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @ManyToOne(() => QuestionCategory, category => category.questions, { 
    nullable: true, 
    createForeignKeyConstraints: false 
  })
  @JoinColumn({ name: 'question_category_id', referencedColumnName: 'id' })
  questionCategory: QuestionCategory;

  @Column({ type: 'uuid', nullable: true, name: 'question_category_id' })
  questionCategoryId: string;

  @OneToMany(() => QuestionTranslation, translation => translation.question)
  translations: QuestionTranslation[];

  @Column({ type: 'json' })
  options: {
    textVi: string;
    textEn: string;
    value: number;
  }[];
} 