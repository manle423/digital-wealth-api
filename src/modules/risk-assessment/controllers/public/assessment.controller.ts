import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { RiskAssessmentService } from '@/modules/risk-assessment/risk-assessment.service';
import { CreateAssessmentResultDto } from '@/modules/risk-assessment/dto/create-assessment-result.dto';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { AssessmentResult } from '@/modules/risk-assessment/entities/assessment-result.entity';
import { AuthError } from '@/modules/auth/enum/error.enum';
import { OptionalJwtGuard } from '@/modules/auth/guards/optional-jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';

@Controller('risk-assessment')
export class PublicAssessmentController {
  constructor(
    private readonly riskAssessmentService: RiskAssessmentService,
  ) {}

  /**
   * Gửi kết quả đánh giá rủi ro
   * Người dùng có thể gửi kết quả mà không cần đăng nhập, nhưng nếu đã đăng nhập thì kết quả sẽ được lưu vào tài khoản
   */
  @Post('submit')
  @UseGuards(OptionalJwtGuard)
  async submitAssessment(
    @Body() createAssessmentResultDto: CreateAssessmentResultDto,
    @Request() req,
  ): Promise<AssessmentResult> {
    if (req.user) {
      createAssessmentResultDto.userId = req.user.sub;
    }
    return this.riskAssessmentService.saveAssessmentResult(createAssessmentResultDto);
  }

  /**
   * Lấy lịch sử đánh giá rủi ro của người dùng
   * Endpoint này yêu cầu đăng nhập
   */
  @UseGuards(JwtGuard)
  @Get('history')
  async getAssessmentHistory(@CurrentUser() user): Promise<AssessmentResult[]> {
    if (!user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    return this.riskAssessmentService.getUserAssessmentHistory(user.sub);
  }

  /**
   * Lấy kết quả đánh giá rủi ro gần nhất của người dùng
   * Endpoint này yêu cầu đăng nhập
   */
  @UseGuards(JwtGuard)
  @Get('latest')
  async getLatestAssessment(@CurrentUser() user): Promise<AssessmentResult> {
    if (!user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    
    return this.riskAssessmentService.getLatestAssessmentResult(user.sub);
  }
} 