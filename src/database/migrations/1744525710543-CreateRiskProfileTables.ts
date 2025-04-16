import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRiskProfileTables1744525710543 implements MigrationInterface {
    name = 'CreateRiskProfileTables1744525710543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`risk_assessment_asset_classes\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`order\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_e20d1440e4aa9f91416c1bb7a1\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`risk_assessment_allocations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`risk_profile_id\` varchar(255) NOT NULL, \`asset_class_id\` varchar(255) NOT NULL, \`percentage\` int NOT NULL, UNIQUE INDEX \`IDX_7afc839c16c5526086a50d68dd\` (\`risk_profile_id\`, \`asset_class_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`risk_assessment_profiles\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`type\` enum ('CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE') NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`min_score\` int NOT NULL, \`max_score\` int NOT NULL, UNIQUE INDEX \`IDX_2d76baf64ae3ce13e84a1d1961\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_2d76baf64ae3ce13e84a1d1961\` ON \`risk_assessment_profiles\``);
        await queryRunner.query(`DROP TABLE \`risk_assessment_profiles\``);
        await queryRunner.query(`DROP INDEX \`IDX_7afc839c16c5526086a50d68dd\` ON \`risk_assessment_allocations\``);
        await queryRunner.query(`DROP TABLE \`risk_assessment_allocations\``);
        await queryRunner.query(`DROP INDEX \`IDX_e20d1440e4aa9f91416c1bb7a1\` ON \`risk_assessment_asset_classes\``);
        await queryRunner.query(`DROP TABLE \`risk_assessment_asset_classes\``);
    }

}
