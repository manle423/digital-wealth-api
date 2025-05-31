import { BaseEntity } from '@/shared/mysqldb/types/base-entity.type';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Language } from '@/shared/enums/language.enum';
import { AssetClass } from './asset-class.entity';

@Entity('asset_class_translations')
export class AssetClassTranslation extends BaseEntity {
  @ManyToOne(() => AssetClass, (assetClass) => assetClass.translations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'asset_class_id', referencedColumnName: 'id' })
  assetClass: AssetClass;

  @Column({ name: 'asset_class_id' })
  assetClassId: string;

  @Column({ type: 'enum', enum: Language })
  language: Language;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;
}
