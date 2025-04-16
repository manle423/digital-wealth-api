import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { RiskAssessmentService } from '../risk-assessment.service';
import { CreateAssessmentResultDto } from '../dto/create-assessment-result.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { AssessmentResult } from '../entities/assessment-result.entity';
import { AuthError } from '../../auth/enum/error.enum';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { QuestionService } from '../services/question.service';

@Controller('risk-assessment')
export class RiskAssessmentController {
  constructor(
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly questionService: QuestionService
  ) {}

  /**
   * Lấy danh sách câu hỏi đánh giá rủi ro
   * Endpoint này không yêu cầu đăng nhập, để người dùng có thể xem câu hỏi trước khi đăng ký
   */
  @Get('questions')
  async getQuestions(@Query() query: GetQuestionsDto) {
    return this.questionService.getQuestions(query);
  }

  /**
   * Gửi kết quả đánh giá rủi ro
   * Người dùng có thể gửi kết quả mà không cần đăng nhập, nhưng nếu đã đăng nhập thì kết quả sẽ được lưu vào tài khoản
   */
  @Post('submit')
  async submitAssessment(
    @Body() createAssessmentResultDto: CreateAssessmentResultDto,
    @Request() req,
  ): Promise<AssessmentResult> {
    if (req.user) {
      createAssessmentResultDto.userId = req.user.id;
    }
    
    return this.riskAssessmentService.saveAssessmentResult(createAssessmentResultDto);
  }

  /**
   * Lấy lịch sử đánh giá rủi ro của người dùng
   * Endpoint này yêu cầu đăng nhập
   */
  @UseGuards(JwtGuard)
  @Get('history')
  async getAssessmentHistory(@Request() req): Promise<AssessmentResult[]> {
    if (!req.user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    
    return this.riskAssessmentService.getUserAssessmentHistory(req.user.id);
  }

  /**
   * Lấy kết quả đánh giá rủi ro gần nhất của người dùng
   * Endpoint này yêu cầu đăng nhập
   */
  @UseGuards(JwtGuard)
  @Get('latest')
  async getLatestAssessment(@Request() req): Promise<AssessmentResult> {
    if (!req.user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    
    return this.riskAssessmentService.getLatestAssessmentResult(req.user.id);
  }
} 