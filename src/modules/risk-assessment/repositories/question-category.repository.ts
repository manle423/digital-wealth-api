import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QuestionCategory } from '../entities/question-category.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { GetQuestionCategoriesDto } from '../dto/question-category/get-question-categories.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';
import { QuestionCategoryUpdate } from '../dto/question-category/update-question-category.dto';

@Injectable()
export class QuestionCategoryRepository extends MysqldbRepository<QuestionCategory> {
  constructor(
    @InjectRepository(QuestionCategory, MysqldbConnection.name)
    repository: Repository<QuestionCategory>,
  ) {
    super(repository);
  }

  async findAllCategories(
    query?: Partial<GetQuestionCategoriesDto>,
    pagination?: Partial<IPagination>,
  ): Promise<[QuestionCategory[], number]> {
    const {
      name,
      isActive,
      sortBy = 'order',
      sortDirection = SortDirection.ASC,
    } = query || {};

    const qb = this.repository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.questions', 'questions');

    if (isActive !== undefined) {
      const booleanValue = isActive === 'false' ? false : true;
      qb.andWhere('category.isActive = :isActive', { isActive: booleanValue });
    }

    if (name) {
      qb.andWhere('category.name LIKE :name', { name: `%${name}%` });
    }

    qb.orderBy(`category.${sortBy}`, sortDirection);

    if (!pagination) {
      return qb.getManyAndCount();
    }

    const results = await qb
      .take(pagination.limit)
      .skip(pagination.offset)
      .getManyAndCount();

    return results;
  }

  async updateMultipleCategories(
    updates: QuestionCategoryUpdate[],
  ): Promise<QuestionCategory[]> {
    // First check if all categories exist
    const ids = updates.map((update) => update.id);
    const existingCategories = await this.find({ id: In(ids) });

    if (existingCategories.length !== ids.length) {
      throw new NotFoundException('One or more question categories not found');
    }

    // Use transaction to ensure atomicity
    return this.withTnx(async (manager) => {
      const updatedCategories: QuestionCategory[] = [];

      // Process each update with existing category as base
      for (const update of updates) {
        const category = existingCategories.find((c) => c.id === update.id)!;

        const updatedCategory = {
          ...category,
          ...update.data,
        };

        const saved = await manager.save(
          this.repository.target,
          updatedCategory,
        );
        updatedCategories.push(saved);
      }

      return updatedCategories;
    });
  }

  async deleteMultipleCategories(ids: string[]): Promise<boolean> {
    // First check if all categories exist
    const existingCategories = await this.find({ id: In(ids) });

    if (existingCategories.length !== ids.length) {
      throw new NotFoundException('One or more question categories not found');
    }

    // Use transaction to ensure atomicity
    return this.withTnx(async (manager) => {
      // Delete all categories in one operation
      await manager.softDelete(this.repository.target, { id: In(ids) });
      return true;
    });
  }
}
