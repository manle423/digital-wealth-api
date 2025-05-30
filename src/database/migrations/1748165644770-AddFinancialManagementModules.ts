import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinancialManagementModules1748165644770
  implements MigrationInterface
{
  name = 'AddFinancialManagementModules1748165644770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`recommendations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NOT NULL, \`type\` enum ('DEBT_REDUCTION', 'DEBT_CONSOLIDATION', 'REFINANCING', 'INCREASE_SAVINGS', 'EMERGENCY_FUND', 'INVESTMENT_OPPORTUNITY', 'PORTFOLIO_REBALANCING', 'DIVERSIFICATION', 'INSURANCE_COVERAGE', 'LIFE_INSURANCE', 'HEALTH_INSURANCE', 'RETIREMENT_PLANNING', 'PENSION_OPTIMIZATION', 'EXPENSE_REDUCTION', 'BUDGET_OPTIMIZATION', 'TAX_OPTIMIZATION', 'TAX_PLANNING', 'CREDIT_IMPROVEMENT', 'CREDIT_UTILIZATION', 'FINANCIAL_GOAL', 'WEALTH_BUILDING', 'FINANCIAL_EDUCATION', 'RISK_AWARENESS', 'GENERAL_ADVICE', 'MARKET_OPPORTUNITY') NOT NULL, \`priority\` enum ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM', \`status\` enum ('ACTIVE', 'VIEWED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED', 'EXPIRED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE', \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`rationale\` text NULL, \`action_steps\` json NULL, \`expected_impact\` json NULL, \`trigger_conditions\` json NULL, \`expires_at\` datetime NULL, \`viewed_at\` datetime NULL, \`dismissed_at\` datetime NULL, \`completed_at\` datetime NULL, \`user_feedback\` text NULL, \`user_rating\` int NULL, \`metadata\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`financial_metrics\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NOT NULL, \`type\` enum ('LIQUIDITY_RATIO', 'EMERGENCY_FUND_RATIO', 'DEBT_TO_INCOME_RATIO', 'DEBT_TO_ASSET_RATIO', 'DEBT_SERVICE_RATIO', 'SAVINGS_RATE', 'INVESTMENT_RATIO', 'PORTFOLIO_RETURN', 'RISK_ADJUSTED_RETURN', 'SHARPE_RATIO', 'NET_WORTH', 'NET_WORTH_GROWTH', 'EXPENSE_RATIO', 'HOUSING_EXPENSE_RATIO', 'FINANCIAL_INDEPENDENCE_RATIO', 'RETIREMENT_READINESS', 'DIVERSIFICATION_INDEX', 'ASSET_ALLOCATION_SCORE', 'PORTFOLIO_VOLATILITY', 'VALUE_AT_RISK', 'CREDIT_UTILIZATION', 'INSURANCE_COVERAGE_RATIO') NOT NULL, \`value\` decimal(15,4) NOT NULL, \`calculation_date\` datetime NOT NULL, \`period_start\` datetime NULL, \`period_end\` datetime NULL, \`calculation_details\` json NULL, \`benchmark_comparison\` json NULL, \`category\` varchar(255) NULL, \`subcategory\` varchar(255) NULL, \`is_current\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`net_worth_snapshots\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NOT NULL, \`snapshot_date\` datetime NOT NULL, \`total_assets\` decimal(15,2) NOT NULL, \`total_debts\` decimal(15,2) NOT NULL, \`net_worth\` decimal(15,2) NOT NULL, \`asset_breakdown\` json NOT NULL, \`debt_breakdown\` json NOT NULL, \`liquid_assets\` decimal(15,2) NULL, \`investment_assets\` decimal(15,2) NULL, \`real_estate_assets\` decimal(15,2) NULL, \`personal_assets\` decimal(15,2) NULL, \`short_term_debts\` decimal(15,2) NULL, \`long_term_debts\` decimal(15,2) NULL, \`notes\` text NULL, \`is_manual\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`debt_categories\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`name\` varchar(255) NOT NULL, \`code_name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`icon\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`order\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_99633dda4ba9b9fa61139a1687\` (\`code_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_debts\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NOT NULL, \`category_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`type\` enum ('MORTGAGE', 'AUTO_LOAN', 'PERSONAL_LOAN', 'BUSINESS_LOAN', 'CREDIT_CARD', 'STUDENT_LOAN', 'FAMILY_LOAN', 'FRIEND_LOAN', 'TAX_DEBT', 'MEDICAL_DEBT', 'UTILITY_DEBT', 'OTHER') NOT NULL DEFAULT 'OTHER', \`status\` enum ('ACTIVE', 'PAID_OFF', 'OVERDUE', 'DEFAULTED', 'RESTRUCTURED', 'FROZEN', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE', \`original_amount\` decimal(15,2) NOT NULL, \`current_balance\` decimal(15,2) NOT NULL, \`interest_rate\` decimal(5,2) NULL, \`start_date\` datetime NULL, \`due_date\` datetime NULL, \`monthly_payment\` decimal(15,2) NULL, \`creditor\` varchar(255) NULL, \`currency\` varchar(10) NULL, \`term_months\` int NULL, \`total_paid\` decimal(15,2) NULL, \`total_interest\` decimal(15,2) NULL, \`penalty_rate\` decimal(5,2) NULL, \`last_payment_date\` datetime NULL, \`next_payment_date\` datetime NULL, \`payment_method\` varchar(20) NULL, \`payment_schedule\` json NULL, \`additional_info\` json NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`notes\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`asset_categories\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`name\` varchar(255) NOT NULL, \`code_name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`icon\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`order\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_f1ed871d548c1662b7070713d2\` (\`code_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_assets\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NOT NULL, \`category_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`type\` enum ('STOCK', 'BOND', 'MUTUAL_FUND', 'ETF', 'CRYPTO', 'BANK_DEPOSIT', 'SAVINGS_ACCOUNT', 'REAL_ESTATE', 'LAND', 'VEHICLE', 'JEWELRY', 'ART', 'COLLECTIBLES', 'BUSINESS', 'EQUIPMENT', 'CASH', 'INSURANCE', 'PENSION', 'OTHER') NOT NULL DEFAULT 'OTHER', \`current_value\` decimal(15,2) NOT NULL, \`purchase_price\` decimal(15,2) NULL, \`purchase_date\` datetime NULL, \`last_updated\` datetime NULL, \`currency\` varchar(10) NULL, \`annual_return\` decimal(5,2) NULL, \`market_value\` decimal(15,2) NULL, \`valuation_date\` datetime NULL, \`liquidity_level\` varchar(50) NULL, \`additional_info\` json NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`notes\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user_assets\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f1ed871d548c1662b7070713d2\` ON \`asset_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`asset_categories\``);
    await queryRunner.query(`DROP TABLE \`user_debts\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_99633dda4ba9b9fa61139a1687\` ON \`debt_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`debt_categories\``);
    await queryRunner.query(`DROP TABLE \`net_worth_snapshots\``);
    await queryRunner.query(`DROP TABLE \`financial_metrics\``);
    await queryRunner.query(`DROP TABLE \`recommendations\``);
  }
}
