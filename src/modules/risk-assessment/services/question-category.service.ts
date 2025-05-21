import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionCategoryRepository } from '../repositories/question-category.repository';
import { QuestionCategory } from '../entities/question-category.entity';
import { LoggerService } from '@/shared/logger/logger.service';
import { CreateMultipleQuestionCategoriesDto } from '../dto/question-category/create-question-category.dto';
import { UpdateMultipleQuestionCategoriesDto } from '../dto/question-category/update-question-category.dto';
import { GetQuestionCategoriesDto } from '../dto/question-category/get-question-categories.dto';
import { DeleteQuestionCategoriesDto } from '../dto/question-category/delete-question-categories.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { RedisService } from '@/shared/redis/redis.service';
import { RedisKeyPrefix, RedisKeyTtl } from '@/shared/enums/redis-key.enum';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';

@Injectable()
export class QuestionCategoryService {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) { }

  async getCategories(query?: GetQuestionCategoriesDto) {
    this.logger.info('[getCategories]', { query });
    try {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const sortBy = query?.sortBy || 'order';
    const sortDir = query?.sortDirection || 'ASC';
    const isActive = query?.isActive || '';
    const name = query?.name || '';
    
    const cacheKey = `${RedisKeyPrefix.QUESTION_CATEGORY}:p${page}:l${limit}:s${sortBy}:d${sortDir}:a${isActive}:n${name}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    let pagination = null;
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }

    const [categories, totalCount] = await this.questionCategoryRepository.findAllCategories(query, pagination);

    if (!(categories && categories.length)) {
      return { data: [], pagination };
    }

    if (pagination) {
      pagination.totalItems = totalCount;
    }

    const result = {
      data: categories,
      pagination,
    };
    
    await this.redisService.set(cacheKey, JSON.stringify(result), RedisKeyTtl.THIRTY_DAYS);
    
    return result;
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.getCategories');
    }
  }

  async getCategoryById(id: string) {
    this.logger.info('[getCategoryById]', { id });
    try {
    const cacheKey = `${RedisKeyPrefix.QUESTION_CATEGORY}:id:${id}`;
    
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    const category = await this.questionCategoryRepository.findOne({ id });
    if (!category) {
      throw new NotFoundException(`Question category with ID ${id} not found`);
    }

    const questions = await this.questionCategoryRepository.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.questions', 'questions')
      .where('category.id = :id', { id })
      .getOne();

    const categoryWithQuestions = {
      ...category,
      questions: questions?.questions || []
    };

    await this.redisService.set(cacheKey, JSON.stringify(categoryWithQuestions), RedisKeyTtl.THIRTY_DAYS);
    
    return categoryWithQuestions;
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.getCategoryById');
    }
  }

  async findAll(query?: GetQuestionCategoriesDto, pagination?: IPagination): Promise<[QuestionCategory[], number]> {
    this.logger.info('[findAll]', { query, pagination });
    try {
      return await this.questionCategoryRepository.findAllCategories(query, pagination);
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.findAll');
    }
  }

  async findAllActive(): Promise<QuestionCategory[]> {
    this.logger.info('[findAllActive]');
    try {
      return await this.questionCategoryRepository.find(
      { isActive: true },
      { order: { order: 'ASC' } }
    );
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.findAllActive');
    }
  }

  async createMultiple(createDto: CreateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    this.logger.info('[createMultiple]', { categories: createDto.categories });
    try {
    if (!createDto.categories || !Array.isArray(createDto.categories) || createDto.categories.length === 0) {
      throw new Error('No valid categories provided');
    }

    this.logger.info(`Creating multiple question categories: ${createDto.categories.length} items`);
    this.logger.debug(`Categories data: ${JSON.stringify(createDto.categories)}`);

      const result = await this.questionCategoryRepository.repository.save(createDto.categories);
      
      await this.clearCategoryCache();
      
      return result;
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.createMultiple');
    }
  }

  async updateMultiple(updateDto: UpdateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    this.logger.info('[updateMultiple]', { categories: updateDto.categories });
    try {
    if (!updateDto.categories || !Array.isArray(updateDto.categories) || updateDto.categories.length === 0) {
      throw new Error('No valid categories to update');
    }

    this.logger.info(`Updating multiple question categories: ${updateDto.categories.length} items`);
    const result = await this.questionCategoryRepository.updateMultipleCategories(updateDto.categories);
    
    await this.clearCategoryCache();
    
    return result;
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.updateMultiple');
    }
  }

  async removeMultiple(deleteDto: DeleteQuestionCategoriesDto): Promise<boolean> {
    this.logger.info('[removeMultiple]', { ids: deleteDto.ids });
    try {
    if (!deleteDto.ids || !Array.isArray(deleteDto.ids) || deleteDto.ids.length === 0) {
      throw new Error('No valid IDs to remove');
    }

    this.logger.info(`Removing multiple question categories: ${deleteDto.ids.length} items`);
    const result = await this.questionCategoryRepository.deleteMultipleCategories(deleteDto.ids);
    
    await this.clearCategoryCache();
    
    return result;
    } catch (error) {
      handleDatabaseError(error, 'QuestionCategoryService.removeMultiple');
    }
  }
  
  private async clearCategoryCache(): Promise<void> {
    try {
      const prefix = this.redisService.buildKey(`${RedisKeyPrefix.QUESTION_CATEGORY}`);
      await this.redisService.delWithPrefix(prefix);
      this.logger.debug(`Cleared cache with prefix: ${prefix}`);
    } catch (error) {
      this.logger.error(`Error clearing category cache: ${error.message}`, error.stack);
      throw error;
    }
  }
} 