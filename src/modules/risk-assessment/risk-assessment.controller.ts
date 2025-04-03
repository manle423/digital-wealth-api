import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { RiskAssessmentService } from './risk-assessment.service';
import { Question } from './entities/question.entity';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AssessmentResult } from './entities/assessment-result.entity';
import { AuthError } from '../auth/enum/error.enum';

@Controller('risk-assessment')
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Get('questions')
  async getQuestions(): Promise<Question[]> {
    return this.riskAssessmentService.getQuestions();
  }

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

  @UseGuards(JwtGuard)
  @Get('history')
  async getAssessmentHistory(@Request() req): Promise<AssessmentResult[]> {
    if (!req.user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    
    return this.riskAssessmentService.getUserAssessmentHistory(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Get('latest')
  async getLatestAssessment(@Request() req): Promise<AssessmentResult> {
    if (!req.user) {
      throw new UnauthorizedException(AuthError.USER_NOT_VERIFIED);
    }
    
    return this.riskAssessmentService.getLatestAssessmentResult(req.user.id);
  }
} 