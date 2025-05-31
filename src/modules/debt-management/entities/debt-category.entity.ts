import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserDebt } from './user-debt.entity';

@Entity('debt_categories')
export class DebtCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true, name: 'code_name' })
  codeName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => UserDebt, (debt) => debt.category)
  userDebts: UserDebt[];
}
