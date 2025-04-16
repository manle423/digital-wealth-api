import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repositories/question.repository';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from '../dto/question/create-question.dto';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { QuestionUpdate } from '../dto/question/update-question.dto';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository
  ) {}

  /**
   * Lấy danh sách câu hỏi với phân trang và lọc
   */
  async getQuestions(query?: GetQuestionsDto): Promise<{ data: Question[], pagination?: PgPagination }> {
    let pagination = null;
    
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }
    
    const questions = await this.questionRepository.findAllQuestions(query, pagination);
    
    if (!(questions && questions.length)) {
      return { data: [], pagination };
    }
    
    if (pagination) {
      pagination.totalItems = questions[1];
    }
    
    const result = {
      data: questions[0],
      pagination,
    };
    
    return result;
  }

  /**
   * Tạo nhiều câu hỏi mới
   */
  async createQuestions(questionsData: CreateQuestionDto[]): Promise<Question[]> {
    const questions = questionsData.map(questionDto => ({
      ...questionDto,
      isActive: questionDto.isActive ?? true,
    }));
    
    try {
      return await this.questionRepository.save(questions) as Question[];
    } catch (error) {
      handleDatabaseError(error, 'Risk Assessment Question');
    }
  }
  
  /**
   * Cập nhật nhiều câu hỏi
   */
  async updateQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    return this.questionRepository.updateMultipleQuestions(updates);
  }
  
  /**
   * Xóa nhiều câu hỏi
   */
  async deleteQuestions(ids: string[]): Promise<boolean> {
    return this.questionRepository.deleteMultipleQuestions(ids);
  }
} 