import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserAsset } from './user-asset.entity';

@Entity('asset_categories')
export class AssetCategory extends BaseEntity {
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

  @OneToMany(() => UserAsset, (asset) => asset.category)
  userAssets: UserAsset[];
}
