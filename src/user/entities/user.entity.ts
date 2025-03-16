import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type'
import { Column, Entity } from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @Column()
  password: string
}
