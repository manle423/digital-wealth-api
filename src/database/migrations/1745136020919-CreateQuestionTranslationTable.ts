import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuestionTranslationTable1745136020919 implements MigrationInterface {
    name = 'CreateQuestionTranslationTable1745136020919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`risk_assessment_question_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`question_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`text\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`risk_assessment_question_translations\``);
    }

}
