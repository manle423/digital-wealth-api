import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DebtManagementService } from '../services/debt-management.service';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import { GetDebtsDto, UpdateDebtBalanceDto } from '../dto/get-debts.dto';
import { JwtGuard } from '@/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@/modules/auth/decorators/track-session.decorator';
import { CreateDebtCategoryDto } from '../dto/create-debt-category.dto';

@UseGuards(JwtGuard)
@Controller('debt-management')
export class DebtManagementController {
  constructor(private readonly debtManagementService: DebtManagementService) {}

  @Get('debts')
  async getUserDebts(@CurrentUser() user: any, @Query() query: GetDebtsDto) {
    return await this.debtManagementService.getUserDebts(user.sub, query);
  }

  @Get('debts/:id')
  async getDebtById(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) debtId: string,
  ) {
    return await this.debtManagementService.getDebtById(user.sub, debtId);
  }

  @Post('debts')
  async createDebt(
    @CurrentUser() user: any,
    @Body() createDebtDto: CreateDebtDto,
  ) {
    return await this.debtManagementService.createDebt(user.sub, createDebtDto);
  }

  @Put('debts/:id')
  async updateDebt(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) debtId: string,
    @Body() updateDebtDto: UpdateDebtDto,
  ) {
    return await this.debtManagementService.updateDebt(
      user.sub,
      debtId,
      updateDebtDto,
    );
  }

  @Delete('debts/:id')
  async deleteDebt(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) debtId: string,
  ) {
    await this.debtManagementService.deleteDebt(user.sub, debtId);
    return { message: 'Debt deleted successfully' };
  }

  @Put('debts/:id/balance')
  async updateDebtBalance(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) debtId: string,
    @Body() updateBalanceDto: UpdateDebtBalanceDto,
  ) {
    return await this.debtManagementService.updateDebtBalance(
      user.sub,
      debtId,
      updateBalanceDto,
    );
  }

  @Get('summary/total-value')
  async getTotalDebtValue(@CurrentUser() user: any) {
    const totalValue = await this.debtManagementService.getTotalDebtValue(
      user.sub,
    );
    return { totalValue };
  }

  @Get('summary/breakdown')
  async getDebtBreakdown(@CurrentUser() user: any) {
    return await this.debtManagementService.getDebtBreakdown(user.sub);
  }

  @Get('summary')
  async getDebtSummary(@CurrentUser() user: any) {
    return await this.debtManagementService.getDebtSummary(user.sub);
  }

  @Get('overdue')
  async getOverdueDebts(@CurrentUser() user: any) {
    return await this.debtManagementService.getOverdueDebts(user.sub);
  }

  @Get('upcoming-payments')
  async getUpcomingPayments(
    @CurrentUser() user: any,
    @Query('days') days?: number,
  ) {
    return await this.debtManagementService.getUpcomingPayments(user.sub, days);
  }

  @Get('categories')
  async getDebtCategories() {
    return await this.debtManagementService.getDebtCategories();
  }

  @Post('categories')
  async createDebtCategory(
    @Body() createDebtCategoryDto: CreateDebtCategoryDto,
  ) {
    return await this.debtManagementService.createDebtCategory(
      createDebtCategoryDto,
    );
  }

  @Post('clear-cache')
  async clearCache(@CurrentUser() user: any) {
    return await this.debtManagementService.clearDebtCaches(user.sub);
  }
}
