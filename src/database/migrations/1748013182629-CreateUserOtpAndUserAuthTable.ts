import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserOtpAndUserAuthTable1748013182629 implements MigrationInterface {
    name = 'CreateUserOtpAndUserAuthTable1748013182629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_auths\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`session_id\` varchar(255) NULL, \`device_id\` varchar(255) NULL, \`device_type\` varchar(255) NULL, \`device_name\` varchar(255) NULL, \`device_model\` varchar(255) NULL, \`os_version\` varchar(255) NULL, \`app_version\` varchar(255) NULL, \`ip_address\` varchar(255) NULL, \`location\` varchar(255) NULL, \`last_access_at\` timestamp NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_trusted\` tinyint NOT NULL DEFAULT 0, \`trusted_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_otps\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(0) NULL, \`user_id\` varchar(255) NULL, \`otp\` varchar(255) NULL, \`type\` enum ('RESET_PASSWORD', 'CHANGE_PASSWORD', 'VERIFY_EMAIL', 'CHANGE_EMAIL', 'TWO_FACTOR_AUTH') NOT NULL, \`status\` enum ('PENDING', 'VERIFIED', 'EXPIRED', 'USED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`expires_at\` timestamp NULL, \`email\` varchar(255) NULL, \`retry_count\` int NOT NULL DEFAULT '0', \`last_retry_at\` timestamp NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` varchar(255) NULL, \`verified_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user_otps\``);
        await queryRunner.query(`DROP TABLE \`user_auths\``);
    }

}
