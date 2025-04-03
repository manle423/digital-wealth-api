import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserDetail } from './user-detail.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  password: string;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user) 
  userDetail: UserDetail;
}
