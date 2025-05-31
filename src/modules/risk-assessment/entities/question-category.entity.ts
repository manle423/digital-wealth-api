import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { Question } from './question.entity';

@Entity('question_categories')
export class QuestionCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true, nullable: true, name: 'code_name' })
  codeName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ nullable: true, name: 'image_url' })
  imageUrl: string;

  @OneToMany(() => Question, (question) => question.questionCategory)
  questions: Question[];
}
