import { MigrationInterface, QueryRunner } from "typeorm";

export class DelUserIdRedurant1747827067172 implements MigrationInterface {
    name = 'DelUserIdRedurant1747827067172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_results\` DROP COLUMN \`userId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`risk_assessment_results\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`userId\` varchar(36) NULL`);
    }

}
