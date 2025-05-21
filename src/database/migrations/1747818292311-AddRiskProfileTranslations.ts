import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRiskProfileTranslations1747818292311 implements MigrationInterface {
    name = 'AddRiskProfileTranslations1747818292311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`risk_assessment_profile_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`risk_profile_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`name\` text NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_profiles\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_profiles\` DROP COLUMN \`name\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`risk_assessment_profiles\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_profiles\` ADD \`description\` text NOT NULL`);
        await queryRunner.query(`DROP TABLE \`risk_assessment_profile_translations\``);
    }

}
