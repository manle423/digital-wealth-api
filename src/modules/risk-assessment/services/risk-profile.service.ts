import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskProfileRepository } from '../repositories/risk-profile.repository';
import { GetRiskProfilesDto } from '../dto/risk-profile/get-profiles.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { RiskProfile } from '../entities/risk-profile.entity';
import { CreateRiskProfileDto } from '../dto/risk-profile/create-profile.dto';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';
import { UpdateRiskProfileDto } from '../dto/risk-profile/update-profile.dto';
import { LoggerService } from '@/shared/logger/logger.service';

@Injectable()
export class RiskProfileService {
  constructor(
    private readonly riskProfileRepository: RiskProfileRepository,
    private readonly logger: LoggerService
  ) {}

  /**
   * Lấy tất cả các hồ sơ rủi ro
   * @param query - Các tiêu chí lọc và phân trang
   * @returns Mảng các hồ sơ rủi ro và thông tin phân trang (nếu có)
   */
  async getAllRiskProfiles(query?: GetRiskProfilesDto): Promise<{ data: RiskProfile[], pagination?: PgPagination }> {
    this.logger.info('[getAllRiskProfiles]', { query });
    let pagination = null;
    
    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }
    
    const [profiles, totalCount] = await this.riskProfileRepository.findAllProfiles(query, pagination);
    
    if (pagination) {
      pagination.totalItems = totalCount;
    }
    
    return {
      data: profiles,
      pagination,
    };
  }

  /**
   * Tạo nhiều hồ sơ rủi ro
   * @param profilesData - Danh sách các hồ sơ rủi ro cần tạo
   * @returns Mảng các hồ sơ rủi ro đã tạo
   */
  async createRiskProfiles(profilesData: CreateRiskProfileDto[]) {
    this.logger.info('[createRiskProfiles]', { profiles: profilesData });
    const profiles = profilesData.map(profileDto => ({
      ...profileDto,
    }));
    
    try {
      return await this.riskProfileRepository.save(profiles);
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.createRiskProfiles');
    }
  }

  /**
   * Lấy hồ sơ rủi ro và các phân bổ tài sản liên quan
   * @param id - ID của hồ sơ rủi ro
   * @returns Hồ sơ rủi ro và các phân bổ tài sản liên quan
   */
  async getRiskProfileWithAllocations(id: string): Promise<RiskProfile> {
    this.logger.info('[getRiskProfileWithAllocations]', { id });
    const profile = await this.riskProfileRepository.findById(id, {
      relations: ['allocations', 'allocations.assetClass']
    });
    
    if (!profile) {
      throw new NotFoundException(`Risk profile with ID ${id} not found`);
    }
    
    return profile;
  }

  /**
   * Cập nhật hồ sơ rủi ro
   * @param id - ID của hồ sơ rủi ro
   * @param updateDto - Dữ liệu cập nhật
   * @returns Hồ sơ rủi ro đã cập nhật
   */
  async updateRiskProfile(id: string, updateDto: UpdateRiskProfileDto): Promise<RiskProfile> {
    this.logger.info('[updateRiskProfile]', { id, updateData: updateDto });
    const profile = await this.getRiskProfileById(id);
    const updated = { ...profile, ...updateDto };
    
    try {
      const result = await this.riskProfileRepository.save(updated);
      return result[0] as RiskProfile;
    } catch (error) {
      handleDatabaseError(error, 'RiskProfileService.updateRiskProfile');
    }
  }

  /**
   * Xóa hồ sơ rủi ro
   * @param id - ID của hồ sơ rủi ro
   * @returns true nếu xóa thành công, false nếu không tìm thấy hồ sơ rủi ro
   */
  async deleteRiskProfile(id: string): Promise<boolean> {
    this.logger.info('[deleteRiskProfile]', { id });
    const result = await this.riskProfileRepository.deleteById(id);
    return result.affected !== 0;
  }

  /**
   * Lấy hồ sơ rủi ro theo ID
   * @param id - ID của hồ sơ rủi ro
   * @returns Hồ sơ rủi ro
   */
  async getRiskProfileById(id: string): Promise<RiskProfile> {
    this.logger.info('[getRiskProfileById]', { id });
    const profile = await this.riskProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`Risk profile with ID ${id} not found`);
    }
    return profile;
  }
}