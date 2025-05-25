export enum AssetType {
  // Tài sản tài chính
  STOCK = 'STOCK',                    // Cổ phiếu
  BOND = 'BOND',                      // Trái phiếu
  MUTUAL_FUND = 'MUTUAL_FUND',        // Quỹ đầu tư
  ETF = 'ETF',                        // Quỹ hoán đổi danh mục
  CRYPTO = 'CRYPTO',                  // Tiền điện tử
  BANK_DEPOSIT = 'BANK_DEPOSIT',      // Tiền gửi ngân hàng
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT', // Tài khoản tiết kiệm
  
  // Bất động sản
  REAL_ESTATE = 'REAL_ESTATE',        // Bất động sản
  LAND = 'LAND',                      // Đất đai
  
  // Tài sản cá nhân
  VEHICLE = 'VEHICLE',                // Xe cộ
  JEWELRY = 'JEWELRY',                // Trang sức
  ART = 'ART',                        // Nghệ thuật
  COLLECTIBLES = 'COLLECTIBLES',      // Đồ sưu tập
  
  // Tài sản kinh doanh
  BUSINESS = 'BUSINESS',              // Doanh nghiệp
  EQUIPMENT = 'EQUIPMENT',            // Thiết bị
  
  // Khác
  CASH = 'CASH',                      // Tiền mặt
  INSURANCE = 'INSURANCE',            // Bảo hiểm
  PENSION = 'PENSION',                // Quỹ hưu trí
  OTHER = 'OTHER'                     // Khác
} 