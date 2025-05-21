import { BaseEntity } from "@/shared/mysqldb/types/base-entity.type";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Question } from "./question.entity";
import { Language } from "@/shared/enums/language.enum";

@Entity('question_translations')
export class QuestionTranslation extends BaseEntity {
  @ManyToOne(() => Question, question => question.translations, { 
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'question_id', referencedColumnName: 'id' })
  question: Question;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ type: 'enum', enum: Language })
  language: Language;

  @Column({ type: 'text' })
  text: string;
}