import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { GetQuestionsDto } from '@/modules/risk-assessment/dto/question/get-questions.dto';
import { QuestionService } from '@/modules/risk-assessment/services/question.service';

@Controller('risk-assessment/questions')
export class PublicQuestionController {
  constructor(
    private readonly questionService: QuestionService
  ) {}

  /**
   * Lấy danh sách câu hỏi đánh giá rủi ro
   * Endpoint này không yêu cầu đăng nhập, để người dùng có thể xem câu hỏi trước khi đăng ký
   */
  @Get()
  async getQuestions(@Query() query: GetQuestionsDto) {
    return this.questionService.getQuestions(query);
  }
} 