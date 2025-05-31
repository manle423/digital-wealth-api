import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { AdminGuard } from '@/modules/auth/guards/admin.guard';
import { CreateMultipleQuestionsDto } from '@/modules/risk-assessment/dto/question/create-question.dto';
import { UpdateMultipleQuestionsDto } from '@/modules/risk-assessment/dto/question/update-question.dto';
import { DeleteQuestionsDto } from '@/modules/risk-assessment/dto/question/delete-questions.dto';
import { GetQuestionsDto } from '@/modules/risk-assessment/dto/question/get-questions.dto';
import { QuestionService } from '@/modules/risk-assessment/services/question.service';

@Controller('admin/risk-assessment/questions')
@UseGuards(JwtGuard, AdminGuard)
export class AdminQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getQuestions(@Query() query: GetQuestionsDto) {
    return this.questionService.getQuestions(query);
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  @Post()
  async createQuestions(@Body() dto: CreateMultipleQuestionsDto) {
    return this.questionService.createQuestions(dto.questions);
  }

  @Put()
  async updateQuestions(@Body() dto: UpdateMultipleQuestionsDto) {
    return this.questionService.updateQuestions(dto.questions);
  }

  @Delete()
  async deleteQuestions(@Body() dto: DeleteQuestionsDto) {
    const result = await this.questionService.deleteQuestions(dto.ids);
    return { success: result };
  }
}
