import { BaseEntity } from "@/shared/mysqldb/types/base-entity.type";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { RiskProfile } from "./risk-profile.entity";
import { Language } from "@/shared/enums/language.enum";

@Entity('risk_assessment_profile_translations')
export class RiskProfileTranslation extends BaseEntity {
  @ManyToOne(() => RiskProfile, profile => profile.translations, { 
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: 'risk_profile_id', referencedColumnName: 'id' })
  riskProfile: RiskProfile;

  @Column({ name: 'risk_profile_id' })
  riskProfileId: string;

  @Column({ type: 'enum', enum: Language })
  language: Language;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;
} 