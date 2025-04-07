import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { RiskAssessmentService } from './risk-assessment.service';
import { Question } from './entities/question.entity';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AssessmentResult } from './entities/assessment-result.entity';
import { AuthError } from '../auth/enum/error.enum';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateMultipleQuestionsDto } from './dto/create-multiple-questions.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { UpdateMultipleQuestionsDto } from './dto/update-multiple-questions.dto';
import { DeleteQuestionsDto } from './dto/delete-questions.dto';

@Controller('risk-assessment')
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Get('questions')
  async getQuestions(@Query() query: GetQuestionsDto) {
    return this.riskAssessmentService.getQuestions(query);
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

  @UseGuards(JwtGuard, AdminGuard)
  @Post('questions')
  async createQuestions(
    @Body() dto: CreateMultipleQuestionsDto,
  ): Promise<Question[]> {
    return this.riskAssessmentService.createQuestions(dto.questions);
  }
  
  @UseGuards(JwtGuard, AdminGuard)
  @Put('questions')
  async updateQuestions(
    @Body() dto: UpdateMultipleQuestionsDto,
  ): Promise<Question[]> {
    return this.riskAssessmentService.updateQuestions(dto.questions);
  }
  
  @UseGuards(JwtGuard, AdminGuard)
  @Delete('questions')
  async deleteQuestions(
    @Body() dto: DeleteQuestionsDto,
  ): Promise<{ success: boolean }> {
    const result = await this.riskAssessmentService.deleteQuestions(dto.ids);
    return { success: result };
  }
} 