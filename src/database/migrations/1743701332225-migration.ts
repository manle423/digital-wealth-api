import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743701332225 implements MigrationInterface {
    name = 'Migration1743701332225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_details\` (\`id\` varchar(36) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` timestamp(6) NULL, \`userId\` varchar(255) NULL, \`dateOfBirth\` datetime NULL, \`phoneNumber\` varchar(255) NULL, \`occupation\` varchar(255) NULL, \`annualIncome\` int NULL, \`investmentExperience\` varchar(255) NULL, \`riskTolerance\` int NULL, \`investmentPreferences\` json NULL, \`totalPortfolioValue\` decimal(10,2) NULL, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`kycDetails\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` timestamp(6) NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`user_details\``);
    }

}
