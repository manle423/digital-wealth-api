import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../entities/question.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { GetQuestionsDto } from '../dto/get-questions.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { QuestionUpdate } from '../dto/update-multiple-questions.dto';
import { QuestionError } from '../enums/question-error.enum';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

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
    const { isActive, category, sortBy = 'order', sortDirection = SortDirection.ASC } = query || {};
    
    const qb = this.repository.createQueryBuilder('question');
    
    if (isActive !== undefined) {
      const booleanValue = isActive === 'false' ? false : true;
      qb.andWhere('question.isActive = :isActive', { isActive: booleanValue });
    }
    
    if (category) {
      qb.andWhere('question.category = :category', { category });
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
    // First check if all questions exist
    const ids = updates.map(update => update.id);
    const existingQuestions = await this.repository.find({ where: { id: In(ids) } });
    
    if (existingQuestions.length !== ids.length) {
      // Find which ID is missing
      const existingIds = existingQuestions.map(q => q.id);
      const missingIds = ids.filter(id => !existingIds.includes(id));
      throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
    }
    
    // Use transaction to ensure atomicity
    return this.withTnx(async (manager) => {
      const updatedQuestions: Question[] = [];
      
      // Process each update with existing question as base
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
    // First check if all questions exist
    const existingQuestions = await this.repository.find({ where: { id: In(ids) } });
    
    if (existingQuestions.length !== ids.length) {
      // Find which ID is missing
      const existingIds = existingQuestions.map(q => q.id);
      const missingIds = ids.filter(id => !existingIds.includes(id));
      console.error(`Questions with IDs ${missingIds.join(', ')} not found`);
      throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
    }
    
    // Use transaction to ensure atomicity
    return this.withTnx(async (manager) => {
      // Delete all questions in one operation
      await manager.softDelete(this.repository.target, { id: In(ids) });
      return true;
    });
  }
}
