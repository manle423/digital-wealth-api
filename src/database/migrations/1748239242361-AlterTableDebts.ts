import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableDebts1748239242361 implements MigrationInterface {
  name = 'AlterTableDebts1748239242361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`type\` \`type\` enum ('MORTGAGE', 'AUTO_LOAN', 'PERSONAL_LOAN', 'BUSINESS_LOAN', 'CREDIT_CARD', 'STUDENT_LOAN', 'FAMILY_LOAN', 'FRIEND_LOAN', 'TAX_DEBT', 'MEDICAL_DEBT', 'UTILITY_DEBT', 'OTHER') NULL DEFAULT 'PERSONAL_LOAN'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`status\` \`status\` enum ('ACTIVE', 'PAID_OFF', 'OVERDUE', 'DEFAULTED', 'RESTRUCTURED', 'FROZEN', 'CANCELLED') NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`start_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`start_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`due_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`due_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`currency\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`currency\` varchar(255) NOT NULL DEFAULT 'VND'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`total_paid\` \`total_paid\` decimal(15,2) NOT NULL DEFAULT '0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`total_interest\` \`total_interest\` decimal(15,2) NOT NULL DEFAULT '0.00'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`last_payment_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`last_payment_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`next_payment_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`next_payment_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`payment_method\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`payment_method\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`payment_method\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`payment_method\` varchar(20) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`next_payment_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`next_payment_date\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`last_payment_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`last_payment_date\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`total_interest\` \`total_interest\` decimal(15,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`total_paid\` \`total_paid\` decimal(15,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`currency\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`currency\` varchar(10) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`due_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`due_date\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` DROP COLUMN \`start_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` ADD \`start_date\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`status\` \`status\` enum ('ACTIVE', 'PAID_OFF', 'OVERDUE', 'DEFAULTED', 'RESTRUCTURED', 'FROZEN', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_debts\` CHANGE \`type\` \`type\` enum ('MORTGAGE', 'AUTO_LOAN', 'PERSONAL_LOAN', 'BUSINESS_LOAN', 'CREDIT_CARD', 'STUDENT_LOAN', 'FAMILY_LOAN', 'FRIEND_LOAN', 'TAX_DEBT', 'MEDICAL_DEBT', 'UTILITY_DEBT', 'OTHER') NOT NULL DEFAULT 'OTHER'`,
    );
  }
}
