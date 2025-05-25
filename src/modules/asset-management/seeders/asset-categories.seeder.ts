import { AssetCategory } from '../entities/asset-category.entity';

export const assetCategoriesSeeder = [
  {
    name: 'Chứng khoán',
    codeName: 'STOCKS',
    description: 'Cổ phiếu, trái phiếu, quỹ đầu tư',
    icon: 'trending-up',
    isActive: true,
    order: 1
  },
  {
    name: 'Bất động sản',
    codeName: 'REAL_ESTATE',
    description: 'Nhà đất, căn hộ, đất nền',
    icon: 'home',
    isActive: true,
    order: 2
  },
  {
    name: 'Tiền mặt & Tiết kiệm',
    codeName: 'CASH_SAVINGS',
    description: 'Tiền mặt, tài khoản tiết kiệm, sổ tiết kiệm',
    icon: 'dollar-sign',
    isActive: true,
    order: 3
  },
  {
    name: 'Tài sản cá nhân',
    codeName: 'PERSONAL_ASSETS',
    description: 'Xe cộ, trang sức, đồ cổ',
    icon: 'user',
    isActive: true,
    order: 4
  },
  {
    name: 'Kinh doanh',
    codeName: 'BUSINESS',
    description: 'Doanh nghiệp, thiết bị kinh doanh',
    icon: 'briefcase',
    isActive: true,
    order: 5
  },
  {
    name: 'Bảo hiểm & Hưu trí',
    codeName: 'INSURANCE_RETIREMENT',
    description: 'Bảo hiểm nhân thọ, quỹ hưu trí',
    icon: 'shield',
    isActive: true,
    order: 6
  },
  {
    name: 'Hàng hóa & Ngoại tệ',
    codeName: 'COMMODITIES_FOREX',
    description: 'Vàng, bạc, ngoại tệ, hàng hóa',
    icon: 'globe',
    isActive: true,
    order: 7
  },
  {
    name: 'Khác',
    codeName: 'OTHERS',
    description: 'Các tài sản khác',
    icon: 'more-horizontal',
    isActive: true,
    order: 8
  }
] as Partial<AssetCategory>[]; 