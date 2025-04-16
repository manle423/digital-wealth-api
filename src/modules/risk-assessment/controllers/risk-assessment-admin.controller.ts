import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { Question } from '../entities/question.entity';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CreateMultipleQuestionsDto } from '../dto/question/create-question.dto';
import { UpdateMultipleQuestionsDto } from '../dto/question/update-question.dto';
import { DeleteQuestionsDto } from '../dto/question/delete-questions.dto';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { CreateMultipleRiskProfilesDto } from '../dto/risk-profile/create-profile.dto';
import { UpdateRiskProfileDto } from '../dto/risk-profile/update-profile.dto';
import { GetRiskProfilesDto } from '../dto/risk-profile/get-profiles.dto';
import { UpdateAssetClassDto } from '../dto/asset/update-asset-class.dto';
import { CreateMultipleAssetClassesDto } from '../dto/asset/create-asset-class.dto';
import { GetAssetClassesDto } from '../dto/asset/get-asset-classes.dto';
import { QuestionService } from '../services/question.service';
import { RiskProfileService } from '../services/risk-profile.service';
import { AssetClassService } from '../services/asset-class.service';
import { AssetAllocationService } from '../services/asset-allocation.service';
import { CreateAssetAllocationDto } from '../dto/asset-allocation/create-asset-alllocation.dto';
import { BatchUpdateAllocationDto, UpdateAssetAllocationDto } from '../dto/asset-allocation/update-asset-allocation.dto';

@Controller('admin/risk-assessment')
@UseGuards(JwtGuard, AdminGuard)
export class RiskAssessmentAdminController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly riskProfileService: RiskProfileService,
    private readonly assetClassService: AssetClassService,
    private readonly assetAllocationService: AssetAllocationService,
  ) { }

  //#region Questions Management
  @Get('questions')
  async getQuestions(@Query() query: GetQuestionsDto) {
    return this.questionService.getQuestions(query);
  }

  @Post('questions')
  async createQuestions(
    @Body() dto: CreateMultipleQuestionsDto,
  ) {
    return this.questionService.createQuestions(dto.questions);
  }

  @Put('questions')
  async updateQuestions(
    @Body() dto: UpdateMultipleQuestionsDto,
  ) {
    return this.questionService.updateQuestions(dto.questions);
  }

  @Delete('questions')
  async deleteQuestions(
    @Body() dto: DeleteQuestionsDto,
  ) {
    const result = await this.questionService.deleteQuestions(dto.ids);
    return { success: result };
  }
  //#endregion Questions Management

  //#region Risk Profiles Management
  @Get('profiles')
  async getRiskProfiles(@Query() query: GetRiskProfilesDto) {
    return this.riskProfileService.getAllRiskProfiles(query);
  }

  @Post('profiles')
  async createRiskProfiles(
    @Body() dto: CreateMultipleRiskProfilesDto,
  ) {
    return this.riskProfileService.createRiskProfiles(dto.profiles);
  }

  @Get('profiles/:id')
  async getRiskProfile(@Param('id') id: string) {
    return this.riskProfileService.getRiskProfileWithAllocations(id);
  }

  @Put('profiles/:id')
  async updateRiskProfile(
    @Param('id') id: string,
    @Body() dto: UpdateRiskProfileDto,
  ) {
    return this.riskProfileService.updateRiskProfile(id, dto);
  }

  @Delete('profiles/:id')
  async deleteRiskProfile(@Param('id') id: string) {
    return this.riskProfileService.deleteRiskProfile(id);
  }
  //#endregion Risk Profiles Management

  //#region Asset Classes Management
  @Get('asset-classes')
  async getAssetClasses(@Query() query: GetAssetClassesDto) {
    return this.assetClassService.getAllAssetClasses(query);
  }

  @Post('asset-classes')
  async createAssetClasses(@Body() dto: CreateMultipleAssetClassesDto) {
    return this.assetClassService.createAssetClasses(dto.assetClasses);
  }

  @Put('asset-classes/:id')
  async updateAssetClass(
    @Param('id') id: string,
    @Body() dto: UpdateAssetClassDto,
  ) {
    return this.assetClassService.updateAssetClass(id, dto);
  }

  @Delete('asset-classes/:id')
  async deleteAssetClass(@Param('id') id: string) {
    return this.assetClassService.deleteAssetClass(id);
  }
  //#endregion Asset Classes Management

  //#region Asset Allocations Management
  @Post('allocations')
  async createAllocation(@Body() dto: CreateAssetAllocationDto) {
    return this.assetAllocationService.createAllocation(dto);
  }

  @Put('allocations/:id')
  async updateAllocation(
    @Param('id') id: string,
    @Body() dto: UpdateAssetAllocationDto,
  ) {
    return this.assetAllocationService.updateAllocation(id, dto);
  }

  @Post('allocations/batch')
  async batchUpdateAllocations(@Body() dto: BatchUpdateAllocationDto) {
    return this.assetAllocationService.batchUpdateAllocations(dto);
  }
  //#endregion Asset Allocations Management
} 