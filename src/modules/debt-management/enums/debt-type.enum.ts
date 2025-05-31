export enum DebtType {
  // Nợ ngân hàng
  MORTGAGE = 'MORTGAGE', // Vay mua nhà
  AUTO_LOAN = 'AUTO_LOAN', // Vay mua xe
  PERSONAL_LOAN = 'PERSONAL_LOAN', // Vay cá nhân
  BUSINESS_LOAN = 'BUSINESS_LOAN', // Vay kinh doanh

  // Thẻ tín dụng
  CREDIT_CARD = 'CREDIT_CARD', // Thẻ tín dụng

  // Nợ giáo dục
  STUDENT_LOAN = 'STUDENT_LOAN', // Vay học phí

  // Nợ cá nhân
  FAMILY_LOAN = 'FAMILY_LOAN', // Nợ gia đình
  FRIEND_LOAN = 'FRIEND_LOAN', // Nợ bạn bè

  // Nợ khác
  TAX_DEBT = 'TAX_DEBT', // Nợ thuế
  MEDICAL_DEBT = 'MEDICAL_DEBT', // Nợ y tế
  UTILITY_DEBT = 'UTILITY_DEBT', // Nợ tiện ích
  OTHER = 'OTHER', // Khác
}
