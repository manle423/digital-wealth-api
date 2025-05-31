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
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { LoggerService } from '@/shared/logger/logger.service';
import { QuestionCategoryRepository } from '../repositories/question-category.repository';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionTranslationRepository: QuestionTranslationRepository,
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Lấy danh sách câu hỏi với phân trang và lọc
   */
  async getQuestions(query?: GetQuestionsDto) {
    this.logger.info('[getQuestions]', { query });
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const sortBy = query?.sortBy || 'order';
    const sortDir = query?.sortDirection || 'ASC';
    const isActive = query?.isActive || '';
    const categories = query?.categories || [];

    // Tạo chuỗi categories cho cache key
    const categoriesKey =
      categories.length > 0 ? categories.sort().join(',') : '';

    const cacheKey = `${RedisKeyPrefix.QUESTION}:p${page}:l${limit}:s${sortBy}:d${sortDir}:a${isActive}:c${categoriesKey}`;
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    // Nếu không có trong cache, truy vấn database như bình thường
    let pagination = null;
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }

    const [questions, totalCount] =
      await this.questionRepository.findAllQuestions(query, pagination);

    if (!(questions && questions.length)) {
      return { data: [], pagination };
    }

    // Lấy translations cho tất cả câu hỏi
    const questionIds = questions.map((q) => q.id);
    const translations = await this.questionTranslationRepository.find({
      questionId: In(questionIds),
    });

    // Lấy categories cho các câu hỏi nếu có questionCategoryId
    const categoryIds = questions
      .filter((q) => q.questionCategoryId)
      .map((q) => q.questionCategoryId);

    let categoriesMap = {};
    if (categoryIds.length > 0) {
      const categoriesData = await this.questionCategoryRepository.find({
        id: In(categoryIds),
      });
      categoriesMap = categoriesData.reduce((map, cat) => {
        map[cat.id] = cat;
        return map;
      }, {});
    }

    // Gộp translations và categories vào questions
    const questionsWithTranslations = questions.map((question) => {
      const questionTranslations = translations.filter(
        (t) => t.questionId === question.id,
      );
      return {
        ...question,
        textVi: questionTranslations.find((t) => t.language === Language.VI)
          ?.text,
        textEn: questionTranslations.find((t) => t.language === Language.EN)
          ?.text,
        category: question.questionCategoryId
          ? categoriesMap[question.questionCategoryId]
          : null,
      };
    });

    if (pagination) {
      pagination.totalItems = totalCount;
    }

    const result = {
      data: questionsWithTranslations,
      pagination,
    };

    await this.redisService.set(
      cacheKey,
      JSON.stringify(result),
      RedisKeyTtl.THIRTY_DAYS,
    );

    return result;
  }

  /**
   * Lấy thông tin câu hỏi theo id
   */
  async getQuestionById(id: string) {
    this.logger.info('[getQuestionById]', { id });
    const cacheKey = `${RedisKeyPrefix.QUESTION}:id:${id}`;

    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    // Lấy thông tin câu hỏi
    const question = await this.questionRepository.findOne({ id });
    if (!question) {
      throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
    }

    // Lấy translations của câu hỏi
    const translations = await this.questionTranslationRepository.find({
      questionId: id,
    });

    // Lấy thông tin category nếu có
    let category = null;
    if (question.questionCategoryId) {
      category = await this.questionCategoryRepository.findOne({
        id: question.questionCategoryId,
      });
    }

    // Gộp translations vào question
    const questionWithTranslations = {
      ...question,
      textVi: translations.find((t) => t.language === Language.VI)?.text,
      textEn: translations.find((t) => t.language === Language.EN)?.text,
      category,
    };

    // Lưu vào cache
    await this.redisService.set(
      cacheKey,
      JSON.stringify(questionWithTranslations),
      RedisKeyTtl.THIRTY_DAYS,
    );

    return questionWithTranslations;
  }

  /**
   * Tạo nhiều câu hỏi mới
   */
  async createQuestions(questionsData: CreateQuestionDto[]) {
    this.logger.info('[createQuestions]', { questions: questionsData });
    try {
      const questions = await Promise.all(
        questionsData.map(async (questionDto) => {
          let questionCategoryId = null;

          // Xử lý category
          if (questionDto.categoryId) {
            // Kiểm tra xem category có tồn tại không
            const category = await this.questionCategoryRepository.findOne({
              id: questionDto.categoryId,
            });
            if (!category) {
              throw new NotFoundException(
                `Category with id ${questionDto.categoryId} not found`,
              );
            }
            questionCategoryId = questionDto.categoryId;
          } else if (questionDto.newCategory) {
            // Tạo category mới nếu có
            const newCategory =
              await this.questionCategoryRepository.repository.save({
                name: questionDto.newCategory.name,
                codeName: questionDto.newCategory.name
                  .toUpperCase()
                  .replace(/\s+/g, '_'),
                description: questionDto.newCategory.description || '',
                isActive: true,
              });
            questionCategoryId = newCategory.id;
          }

          // Tạo câu hỏi
          const question = await this.questionRepository.save({
            order: questionDto.order,
            isActive: questionDto.isActive ?? true,
            // Vẫn giữ trường category cho tương thích ngược
            category: questionDto.category || '',
            // Sử dụng questionCategoryId mới
            questionCategoryId: questionCategoryId,
            text: questionDto.textVi || questionDto.textEn,
            options: questionDto.options.map((opt) => ({
              textVi: opt.textVi,
              textEn: opt.textEn,
              value: opt.value,
            })),
          });

          // Tạo translations
          await this.questionTranslationRepository.save([
            {
              questionId: question[0].id,
              language: Language.VI,
              text: questionDto.textVi,
            },
            {
              questionId: question[0].id,
              language: Language.EN,
              text: questionDto.textEn,
            },
          ]);

          return question;
        }),
      );

      // Xóa cache sau khi tạo mới
      await this.invalidateQuestionsCache();
      // Xóa cache categories nếu cần
      if (questionsData.some((q) => q.newCategory)) {
        await this.redisService.delWithPrefix(
          this.redisService.buildKey(RedisKeyPrefix.QUESTION_CATEGORY),
        );
      }

      return questions;
    } catch (error) {
      handleDatabaseError(error, 'QuestionService.createQuestions');
    }
  }

  /**
   * Cập nhật nhiều câu hỏi
   */
  async updateQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    this.logger.info('[updateQuestions]', { updates });
    try {
      // First check if all questions exist
      const ids = updates.map((update) => update.id);
      const existingQuestions = await this.questionRepository.find({
        id: In(ids),
      });

      if (existingQuestions.length !== ids.length) {
        throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
      }

      // Use transaction to ensure atomicity
      const result = await this.questionRepository.withTnx(async (manager) => {
        const updatedQuestions: Question[] = [];

        for (const update of updates) {
          const question = existingQuestions.find((q) => q.id === update.id)!;

          // Kiểm tra categoryId nếu có
          if (update.data.categoryId) {
            // Kiểm tra categoryId tồn tại
            const category = await this.questionCategoryRepository.findOne({
              id: update.data.categoryId,
            });

            if (!category) {
              throw new NotFoundException(
                `Category with ID ${update.data.categoryId} not found`,
              );
            }
          }

          // Update question translations if textVi or textEn is provided
          if (update.data.textVi || update.data.textEn) {
            const translations = await this.questionTranslationRepository.find({
              questionId: question.id,
            });

            for (const translation of translations) {
              if (translation.language === Language.VI && update.data.textVi) {
                translation.text = update.data.textVi;
              } else if (
                translation.language === Language.EN &&
                update.data.textEn
              ) {
                translation.text = update.data.textEn;
              }
              await manager.save(translation);
            }
          }

          // Update question options if provided
          if (update.data.options) {
            question.options = update.data.options.map((opt) => ({
              textVi:
                opt.textVi ||
                question.options.find((o) => o.value === opt.value)?.textVi,
              textEn:
                opt.textEn ||
                question.options.find((o) => o.value === opt.value)?.textEn,
              value: opt.value,
            }));
          }

          // Update other question fields
          const updatedQuestion = {
            ...question,
            order: update.data.order ?? question.order,
            category: update.data.category ?? question.category,
            questionCategoryId:
              update.data.categoryId ?? question.questionCategoryId,
            isActive: update.data.isActive ?? question.isActive,
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
    this.logger.info('[deleteQuestions]', { ids });
    const result = await this.questionRepository.deleteMultipleQuestions(ids);

    // Xóa cache sau khi xóa
    await this.invalidateQuestionsCache();

    return result;
  }

  private async invalidateQuestionsCache() {
    try {
      // Xóa tất cả cache bắt đầu với prefix QUESTION
      await this.redisService.delWithPrefix(`${RedisKeyPrefix.QUESTION}`);
      this.logger.debug('[invalidateQuestionsCache] Questions cache cleared');
    } catch (error) {
      this.logger.error(
        `[invalidateQuestionsCache] Error clearing questions cache: ${error.message}`,
      );
    }
  }
}
