import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';
import { RecommendationType } from '../enums/recommendation-type.enum';
import { SubmitFeedbackDto } from '../dto/submit-feedback.dto';

@UseGuards(JwtGuard)
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('generate')
  async generateRecommendations(@CurrentUser() user: any) {
    return await this.recommendationService.generateRecommendations(user.sub);
  }

  @Get()
  async getActiveRecommendations(@CurrentUser() user: any) {
    return await this.recommendationService.getActiveRecommendations(user.sub);
  }

  @Get('by-type')
  async getRecommendationsByType(
    @CurrentUser() user: any,
    @Query('type', new ParseEnumPipe(RecommendationType)) type: RecommendationType
  ) {
    return await this.recommendationService.getRecommendationsByType(user.sub, type);
  }

  @Get('stats')
  async getRecommendationStats(@CurrentUser() user: any) {
    return await this.recommendationService.getRecommendationStats(user.sub);
  }

  @Patch(':id/view')
  async markAsViewed(
    @CurrentUser() user: any,
    @Param('id') recommendationId: string
  ) {
    await this.recommendationService.markAsViewed(user.sub, recommendationId);
    return { message: 'Recommendation marked as viewed' };
  }

  @Patch(':id/dismiss')
  async markAsDismissed(
    @CurrentUser() user: any,
    @Param('id') recommendationId: string
  ) {
    await this.recommendationService.markAsDismissed(user.sub, recommendationId);
    return { message: 'Recommendation dismissed' };
  }

  @Patch(':id/complete')
  async markAsCompleted(
    @CurrentUser() user: any,
    @Param('id') recommendationId: string
  ) {
    await this.recommendationService.markAsCompleted(user.sub, recommendationId);
    return { message: 'Recommendation marked as completed' };
  }

  @Post(':id/feedback')
  async submitFeedback(
    @CurrentUser() user: any,
    @Param('id') recommendationId: string,
    @Body() feedbackDto: SubmitFeedbackDto
  ) {
    await this.recommendationService.submitFeedback(
      user.sub,
      recommendationId,
      feedbackDto.feedback,
      feedbackDto.rating
    );
    return { message: 'Feedback submitted successfully' };
  }
} 