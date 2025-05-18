import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { QuestionError } from '../enums/question-error.enum';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';
import { QuestionUpdate } from '../dto/question/update-question.dto';
import { QuestionTranslation } from '../entities/question-translation.entity';

@Injectable()
export class QuestionRepository extends MysqldbRepository<Question> {
  constructor(
    @InjectRepository(Question, MysqldbConnection.name)
    repository: Repository<Question>,
  ) {
    super(repository);
  }
  
  async findAllQuestions(
    query?: Partial<GetQuestionsDto>,
    pagination?: Partial<IPagination>
  ): Promise<[Question[], number]> {
    const { isActive, categories, sortBy = 'order', sortDirection = SortDirection.ASC } = query || {};
    
    const qb = this.repository.createQueryBuilder('question')
      .leftJoinAndSelect('question.translations', 'translations');
    
    if (isActive !== undefined) {
      const booleanValue = isActive === 'false' ? false : true;
      qb.andWhere('question.isActive = :isActive', { isActive: booleanValue });
    }
    
    if (categories && categories.length > 0) {
      if (categories.length === 1) {
        qb.andWhere('(question.category = :category OR question.questionCategoryId IN (SELECT id FROM risk_assessment_question_categories WHERE code_name = :category))', 
          { category: categories[0] });
      } else {
        qb.andWhere('(question.category IN (:...categories) OR question.questionCategoryId IN (SELECT id FROM risk_assessment_question_categories WHERE code_name IN (:...categories)))', 
          { categories });
      }
    }
    
    qb.orderBy(`question.${sortBy}`, sortDirection);
    
    if (!pagination) {
      return qb.getManyAndCount();
    }
    
    const results = await qb
      .take(pagination.limit)
      .skip(pagination.offset)
      .getManyAndCount();
      
    return results;
  }
  
  async updateMultipleQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    const ids = updates.map(update => update.id);
    const existingQuestions = await this.find({ id: In(ids) });
    
    if (existingQuestions.length !== ids.length) {
      throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
    }
    
    return this.withTnx(async (manager) => {
      const updatedQuestions: Question[] = [];
      
      for (const update of updates) {
        const question = existingQuestions.find(q => q.id === update.id)!;
        const updatedQuestion = {
          ...question,
          ...update.data
        };
        
        const saved = await manager.save(this.repository.target, updatedQuestion);
        updatedQuestions.push(saved);
      }
      
      return updatedQuestions;
    });
  }
  
  async deleteMultipleQuestions(ids: string[]): Promise<boolean> {
    const existingQuestions = await this.find({ id: In(ids) });
    
    if (existingQuestions.length !== ids.length) {
      throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
    }
    
    return this.withTnx(async (manager) => {
      await manager.softDelete(this.repository.target, { id: In(ids) });
      return true;
    });
  }
}
