import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionCategory1747562180939 implements MigrationInterface {
    name = 'AddQuestionCategory1747562180939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`risk_assessment_question_categories\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`name\` varchar(255) NOT NULL, \`code_name\` varchar(255) NULL, \`description\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`order\` int NOT NULL DEFAULT '0', \`image_url\` varchar(255) NULL, UNIQUE INDEX \`IDX_e7b910b8b90d0679ac7b5ba040\` (\`code_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_questions\` ADD \`question_category_id\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`risk_assessment_questions\` DROP COLUMN \`question_category_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_e7b910b8b90d0679ac7b5ba040\` ON \`risk_assessment_question_categories\``);
        await queryRunner.query(`DROP TABLE \`risk_assessment_question_categories\``);
    }

}
