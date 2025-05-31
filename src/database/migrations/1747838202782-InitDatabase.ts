import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDatabase1747838202782 implements MigrationInterface {
  name = 'InitDatabase1747838202782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER', UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_details\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`date_of_birth\` datetime NULL, \`phone_number\` varchar(255) NULL, \`occupation\` varchar(255) NULL, \`annual_income\` int NULL, \`investment_experience\` varchar(255) NULL, \`risk_tolerance\` int NULL, \`investment_preferences\` json NULL, \`total_portfolio_value\` decimal(10,2) NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`kyc_details\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_categories\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`name\` varchar(255) NOT NULL, \`code_name\` varchar(255) NULL, \`description\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`order\` int NOT NULL DEFAULT '0', \`image_url\` varchar(255) NULL, UNIQUE INDEX \`IDX_ecf626313a95e2ab66e7a40935\` (\`code_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`questions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`text\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`category\` varchar(50) NULL, \`question_category_id\` varchar(255) NULL, \`options\` json NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`question_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`text\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`assessment_results\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`total_score\` int NOT NULL, \`risk_profile\` enum ('CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE') NOT NULL, \`user_responses\` json NOT NULL, \`recommended_allocation\` json NOT NULL, \`summary\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`asset_class_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`asset_class_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`name\` text NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`asset_classes\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`order\` int NOT NULL, \`icon\` varchar(255) NULL, \`risk_level\` int NULL, \`expected_return\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`allocations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`risk_profile_id\` varchar(255) NOT NULL, \`asset_class_id\` varchar(255) NOT NULL, \`percentage\` int NOT NULL, UNIQUE INDEX \`IDX_3e9f235801e669205ed54240e1\` (\`risk_profile_id\`, \`asset_class_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`profile_translations\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`risk_profile_id\` varchar(255) NOT NULL, \`language\` enum ('vi', 'en') NOT NULL, \`name\` text NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`profiles\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`type\` enum ('CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE') NOT NULL, \`min_score\` int NOT NULL, \`max_score\` int NOT NULL, UNIQUE INDEX \`IDX_d8e9bb4542a452efbb5db49f05\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_d8e9bb4542a452efbb5db49f05\` ON \`profiles\``,
    );
    await queryRunner.query(`DROP TABLE \`profiles\``);
    await queryRunner.query(`DROP TABLE \`profile_translations\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_3e9f235801e669205ed54240e1\` ON \`allocations\``,
    );
    await queryRunner.query(`DROP TABLE \`allocations\``);
    await queryRunner.query(`DROP TABLE \`asset_classes\``);
    await queryRunner.query(`DROP TABLE \`asset_class_translations\``);
    await queryRunner.query(`DROP TABLE \`assessment_results\``);
    await queryRunner.query(`DROP TABLE \`question_translations\``);
    await queryRunner.query(`DROP TABLE \`questions\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ecf626313a95e2ab66e7a40935\` ON \`question_categories\``,
    );
    await queryRunner.query(`DROP TABLE \`question_categories\``);
    await queryRunner.query(`DROP TABLE \`user_details\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
