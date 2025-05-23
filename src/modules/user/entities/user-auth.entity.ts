import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type'

@Entity({ name: 'user_auths' })
export class UserAuth extends BaseEntity {
  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @Column({ name: 'session_id', type: 'varchar', nullable: true })
  sessionId: string

  @Column({ name: 'device_id', type: 'varchar', nullable: true })
  deviceId: string

  @Column({ name: 'device_type', type: 'varchar', nullable: true })
  deviceType: string

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  deviceName: string

  @Column({ name: 'device_model', type: 'varchar', nullable: true })
  deviceModel: string

  @Column({ name: 'os_version', type: 'varchar', nullable: true })
  osVersion: string

  @Column({ name: 'app_version', type: 'varchar', nullable: true })
  appVersion: string

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string

  @Column({ type: 'varchar', nullable: true })
  location: string

  @Column({ name: 'last_access_at', type: 'timestamp', nullable: true })
  lastAccessAt: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'is_trusted', type: 'boolean', default: false })
  isTrusted: boolean

  @Column({ name: 'trusted_at', type: 'timestamp', nullable: true })
  trustedAt: Date
}
