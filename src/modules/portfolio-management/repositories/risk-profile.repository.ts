import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, DeleteResult } from 'typeorm';
import { RiskProfile } from '../entities/risk-profile.entity';
import { MysqldbRepository } from '@/shared/mysqldb/mysqldb.repository';
import { MysqldbConnection } from '@/shared/mysqldb/connections/db.connection';
import { RiskProfileType } from '../enums/risk-profile.enum';
import { GetRiskProfilesDto } from '../dto/risk-profile/get-profiles.dto';
import { IPagination } from '@/shared/mysqldb/interfaces/pagination.interface';
import { SortDirection } from '@/shared/mysqldb/enums/sort-direction.enum';

@Injectable()
export class RiskProfileRepository extends MysqldbRepository<RiskProfile> {
  constructor(
    @InjectRepository(RiskProfile, MysqldbConnection.name)
    repository: Repository<RiskProfile>,
  ) {
    super(repository);
  }

  async findByType(type: RiskProfileType): Promise<RiskProfile | null> {
    return this.repository.findOne({ 
      where: { type },
      relations: ['translations']
    });
  }

  async findByScore(score: number): Promise<RiskProfile | null> {
    return this.repository.findOne({ 
      where: { 
        minScore: LessThanOrEqual(score), 
        maxScore: MoreThanOrEqual(score) 
      },
      relations: ['translations']
    });
  }

  async getAllWithAllocations(): Promise<RiskProfile[]> {
    return this.repository.find({
      relations: ['allocations', 'allocations.assetClass', 'translations'],
      order: { 
        minScore: 'ASC',
        allocations: { assetClass: { order: 'ASC' } }
      }
    });
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  /**
   * Lấy danh sách hồ sơ rủi ro với phân trang và bộ lọc
   * @param query Tham số phân trang và lọc
   * @param pagination Thông tin phân trang
   * @returns Mảng [items, totalCount] hoặc chỉ items nếu không có phân trang
   */
  async findAllProfiles(
    query?: Partial<GetRiskProfilesDto>,
    pagination?: Partial<IPagination>
  ): Promise<[RiskProfile[], number]> {
    const { types, sortBy = 'minScore', sortDirection = SortDirection.ASC } = query || {};
    
    const qb = this.repository.createQueryBuilder('profile')
      .leftJoinAndSelect('profile.translations', 'translations');
    
    if (types && types.length > 0) {
      qb.andWhere('profile.type IN (:...types)', { types: types });
    }
    
    qb.orderBy(`profile.${sortBy}`, sortDirection);
    
    if (!pagination) {
      return qb.getManyAndCount();
    }
    
    const results = await qb
      .take(pagination.limit)
      .skip(pagination.offset)
      .getManyAndCount();
      
    return results;
  }
} 