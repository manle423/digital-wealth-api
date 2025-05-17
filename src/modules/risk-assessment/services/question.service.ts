import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../repositories/question.repository';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from '../dto/question/create-question.dto';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { QuestionUpdate } from '../dto/question/update-question.dto';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';
import { QuestionTranslationRepository } from '../repositories/question-translation.repository';
import { In } from 'typeorm';
import { Language } from '@/shared/enums/language.enum';
import { QuestionError } from '../enums/question-error.enum';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix } from '@/shared/enums/redis-key.enum';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionTranslationRepository: QuestionTranslationRepository,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService
  ) { }

  /**
   * Lấy danh sách câu hỏi với phân trang và lọc
   */
  async getQuestions(query?: GetQuestionsDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const sortBy = query?.sortBy || 'order';
    const sortDir = query?.sortDirection || 'ASC';
    const isActive = query?.isActive || '';
    const category = query?.category || '';
    
    const cacheKey = `${RedisKeyPrefix.QUESTION}:p${page}:l${limit}:s${sortBy}:d${sortDir}:a${isActive}:c${category}`;
    
    console.log('Redis key:', cacheKey);

    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return JSON.parse(cachedData);
    }
    
    // Nếu không có trong cache, truy vấn database như bình thường
    let pagination = null;
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }

    const [questions, totalCount] = await this.questionRepository.findAllQuestions(query, pagination);

    if (!(questions && questions.length)) {
      return { data: [], pagination };
    }

    // Lấy translations cho tất cả câu hỏi
    const questionIds = questions.map(q => q.id);
    const translations = await this.questionTranslationRepository.find({
      questionId: In(questionIds)
    });

    // Gộp translations vào questions
    const questionsWithTranslations = questions.map(question => {
      const questionTranslations = translations.filter(t => t.questionId === question.id);
      return {
        ...question,
        textVi: questionTranslations.find(t => t.language === Language.VI)?.text,
        textEn: questionTranslations.find(t => t.language === Language.EN)?.text
      };
    });

    if (pagination) {
      pagination.totalItems = totalCount;
    }

    const result = {
      data: questionsWithTranslations,
      pagination,
    };
    
    // Lưu kết quả vào cache với thời gian 10 phút
    await this.redisService.set(cacheKey, JSON.stringify(result), 600);
    
    return result;
  }

  /**
   * Tạo nhiều câu hỏi mới
   */
  async createQuestions(questionsData: CreateQuestionDto[]) {
    try {
      const questions = await Promise.all(
        questionsData.map(async (questionDto) => {
          // Tạo câu hỏi
          const question = await this.questionRepository.save({
            order: questionDto.order,
            isActive: questionDto.isActive ?? true,
            category: questionDto.category,
            text: questionDto.textVi || questionDto.textEn,
            options: questionDto.options.map(opt => ({
              textVi: opt.textVi,
              textEn: opt.textEn,
              value: opt.value
            }))
          });

          // Tạo translations
          await this.questionTranslationRepository.save([
            {
              questionId: question[0].id,
              language: Language.VI,
              text: questionDto.textVi
            },
            {
              questionId: question[0].id,
              language: Language.EN,
              text: questionDto.textEn
            }
          ]);

          return question;
        })
      );

      // Xóa cache sau khi tạo mới
      await this.invalidateQuestionsCache();
      
      return questions;
    } catch (error) {
      handleDatabaseError(error, 'QuestionService.createQuestions');
    }
  }

  /**
   * Cập nhật nhiều câu hỏi
   */
  async updateQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    try {
      // First check if all questions exist
      const ids = updates.map(update => update.id);
      const existingQuestions = await this.questionRepository.find({ id: In(ids) });

      if (existingQuestions.length !== ids.length) {
        throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
      }

      // Use transaction to ensure atomicity
      const result = await this.questionRepository.withTnx(async (manager) => {
        const updatedQuestions: Question[] = [];

        for (const update of updates) {
          const question = existingQuestions.find(q => q.id === update.id)!;

          // Update question translations if textVi or textEn is provided
          if (update.data.textVi || update.data.textEn) {
            const translations = await this.questionTranslationRepository.find(
              { questionId: question.id }
            );

            for (const translation of translations) {
              if (translation.language === Language.VI && update.data.textVi) {
                translation.text = update.data.textVi;
              } else if (translation.language === Language.EN && update.data.textEn) {
                translation.text = update.data.textEn;
              }
              await manager.save(translation);
            }
          }

          // Update question options if provided
          if (update.data.options) {
            question.options = update.data.options.map(opt => ({
              textVi: opt.textVi || question.options.find(o => o.value === opt.value)?.textVi,
              textEn: opt.textEn || question.options.find(o => o.value === opt.value)?.textEn,
              value: opt.value
            }));
          }

          // Update other question fields
          const updatedQuestion = {
            ...question,
            order: update.data.order ?? question.order,
            category: update.data.category ?? question.category,
            isActive: update.data.isActive ?? question.isActive
          };

          const saved = await manager.save(Question, updatedQuestion);
          updatedQuestions.push(saved);
        }

        return updatedQuestions;
      });
      
      // Xóa cache sau khi cập nhật
      await this.invalidateQuestionsCache();
      
      return result;
    } catch (error) {
      handleDatabaseError(error, 'QuestionService.updateQuestions');
    }
  }

  /**
   * Xóa nhiều câu hỏi
   */
  async deleteQuestions(ids: string[]): Promise<boolean> {
    const result = await this.questionRepository.deleteMultipleQuestions(ids);
    
    // Xóa cache sau khi xóa
    await this.invalidateQuestionsCache();
    
    return result;
  }

  private async invalidateQuestionsCache() {
    // Xóa tất cả cache bắt đầu với prefix QUESTION
    const prefix = this.redisService.buildKey(RedisKeyPrefix.QUESTION);
    await this.redisService.delWithPrefix(prefix);
    this.logger.info('Cleared questions cache');
  }
} 