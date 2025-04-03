import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743707402967 implements MigrationInterface {
    name = 'Migration1743707402967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_details\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`date_of_birth\` datetime NULL, \`phone_number\` varchar(255) NULL, \`occupation\` varchar(255) NULL, \`annual_income\` int NULL, \`investment_experience\` varchar(255) NULL, \`risk_tolerance\` int NULL, \`investment_preferences\` json NULL, \`total_portfolio_value\` decimal(10,2) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`kyc_details\` json NULL, \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`risk_assessment_questions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`text\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`category\` varchar(50) NOT NULL, \`options\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`risk_assessment_results\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`total_score\` int NOT NULL, \`risk_profile\` enum ('CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE') NOT NULL, \`user_responses\` json NOT NULL, \`recommended_allocation\` json NOT NULL, \`summary\` text NULL, \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`risk_assessment_results\``);
        await queryRunner.query(`DROP TABLE \`risk_assessment_questions\``);
        await queryRunner.query(`DROP TABLE \`user_details\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
