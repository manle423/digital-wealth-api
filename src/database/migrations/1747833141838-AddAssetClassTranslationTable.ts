import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssetClassTranslationTable1747833141838 implements MigrationInterface {
    name = 'AddAssetClassTranslationTable1747833141838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`risk_assessment_asset_class_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`asset_class_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`name\` text NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` ADD \`icon\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` ADD \`risk_level\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` ADD \`expected_return\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` CHANGE \`order\` \`order\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` CHANGE \`order\` \`order\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` DROP COLUMN \`expected_return\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` DROP COLUMN \`risk_level\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` DROP COLUMN \`icon\``);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`risk_assessment_asset_classes\` ADD \`description\` text NULL`);
        await queryRunner.query(`DROP TABLE \`risk_assessment_asset_class_translations\``);
    }

}
