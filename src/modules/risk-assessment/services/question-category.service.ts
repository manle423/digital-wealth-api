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

@Injectable()
export class QuestionCategoryService {
  constructor(
    private readonly questionCategoryRepository: QuestionCategoryRepository,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
  ) { }

  async getCategories(query?: GetQuestionCategoriesDto) {
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
    
    // Nếu không có trong cache, truy vấn database
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
  }

  async getCategoryById(id: string) {
    const cacheKey = `${RedisKeyPrefix.QUESTION_CATEGORY}:id:${id}`;
    
    // Kiểm tra cache trước
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
    
    // Lấy thông tin category
    const category = await this.questionCategoryRepository.findOne({ id });
    if (!category) {
      throw new NotFoundException(`Question category with ID ${id} not found`);
    }

    // Lấy danh sách câu hỏi thuộc category này
    const questions = await this.questionCategoryRepository.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.questions', 'questions')
      .where('category.id = :id', { id })
      .getOne();

    // Gộp dữ liệu
    const categoryWithQuestions = {
      ...category,
      questions: questions?.questions || []
    };

    // Lưu vào cache
    await this.redisService.set(cacheKey, JSON.stringify(categoryWithQuestions), RedisKeyTtl.THIRTY_DAYS);
    
    return categoryWithQuestions;
  }

  async findAll(query?: GetQuestionCategoriesDto, pagination?: IPagination): Promise<[QuestionCategory[], number]> {
    return this.questionCategoryRepository.findAllCategories(query, pagination);
  }

  async findAllActive(): Promise<QuestionCategory[]> {
    return this.questionCategoryRepository.find(
      { isActive: true },
      { order: { order: 'ASC' } }
    );
  }

  async createMultiple(createDto: CreateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    if (!createDto.categories || !Array.isArray(createDto.categories) || createDto.categories.length === 0) {
      throw new Error('No valid categories provided');
    }

    this.logger.info(`Creating multiple question categories: ${createDto.categories.length} items`);
    this.logger.debug(`Categories data: ${JSON.stringify(createDto.categories)}`);

    try {
      // Thay vì sử dụng create rồi save, sử dụng trực tiếp save để tránh việc map dữ liệu không đúng
      const result = await this.questionCategoryRepository.repository.save(createDto.categories);
      
      // Clear cache khi có thay đổi dữ liệu
      await this.clearCategoryCache();
      
      return result;
    } catch (error) {
      this.logger.error(`Error creating multiple categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateMultiple(updateDto: UpdateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    if (!updateDto.categories || !Array.isArray(updateDto.categories) || updateDto.categories.length === 0) {
      throw new Error('No valid categories to update');
    }

    this.logger.info(`Updating multiple question categories: ${updateDto.categories.length} items`);
    const result = await this.questionCategoryRepository.updateMultipleCategories(updateDto.categories);
    
    // Clear cache khi có thay đổi dữ liệu
    await this.clearCategoryCache();
    
    return result;
  }

  async removeMultiple(deleteDto: DeleteQuestionCategoriesDto): Promise<boolean> {
    if (!deleteDto.ids || !Array.isArray(deleteDto.ids) || deleteDto.ids.length === 0) {
      throw new Error('No valid IDs to remove');
    }

    this.logger.info(`Removing multiple question categories: ${deleteDto.ids.length} items`);
    const result = await this.questionCategoryRepository.deleteMultipleCategories(deleteDto.ids);
    
    // Clear cache khi có thay đổi dữ liệu
    await this.clearCategoryCache();
    
    return result;
  }
  
  // Phương thức để xóa tất cả cache liên quan đến categories
  private async clearCategoryCache(): Promise<void> {
    try {
      const prefix = this.redisService.buildKey(`${RedisKeyPrefix.QUESTION_CATEGORY}`);
      await this.redisService.delWithPrefix(prefix);
      this.logger.debug(`Cleared cache with prefix: ${prefix}`);
    } catch (error) {
      this.logger.error(`Error clearing category cache: ${error.message}`, error.stack);
    }
  }
} 