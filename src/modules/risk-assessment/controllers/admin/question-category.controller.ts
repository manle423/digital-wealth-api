import { Body, Controller, Delete, Get, UseGuards, Query, Post, Put, Param } from '@nestjs/common';
import { QuestionCategoryService } from '@/modules/risk-assessment/services/question-category.service';
import { QuestionCategory } from '@/modules/risk-assessment/entities/question-category.entity';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { CreateMultipleQuestionCategoriesDto } from '@/modules/risk-assessment/dto/question-category/create-question-category.dto';
import { UpdateMultipleQuestionCategoriesDto } from '@/modules/risk-assessment/dto/question-category/update-question-category.dto';
import { GetQuestionCategoriesDto } from '@/modules/risk-assessment/dto/question-category/get-question-categories.dto';
import { DeleteQuestionCategoriesDto } from '@/modules/risk-assessment/dto/question-category/delete-question-categories.dto';

@Controller('admin/risk-assessment/question-categories')
@UseGuards(JwtGuard, AdminGuard)
export class AdminQuestionCategoryController {
  constructor(private readonly categoryService: QuestionCategoryService) {}

  @Get()
  async findAll(@Query() query: GetQuestionCategoriesDto) {
    return this.categoryService.getCategories(query);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  @Get('active')
  async findAllActive(): Promise<QuestionCategory[]> {
    return this.categoryService.findAllActive();
  }

  @Post()
  async createCategories(@Body() createDto: CreateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    return this.categoryService.createMultiple(createDto);
  }

  @Put()
  async updateCategories(@Body() updateDto: UpdateMultipleQuestionCategoriesDto): Promise<QuestionCategory[]> {
    return this.categoryService.updateMultiple(updateDto);
  }

  @Delete()
  async deleteCategories(@Body() deleteDto: DeleteQuestionCategoriesDto): Promise<{ success: boolean }> {
    return this.categoryService.removeMultiple(deleteDto)
      .then(result => ({ success: result }));
  }
} 