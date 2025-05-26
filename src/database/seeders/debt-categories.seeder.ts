import { DebtCategory } from '../../modules/debt-management/entities/debt-category.entity';

export const debtCategories = [
  {
    name: 'Thẻ tín dụng',
    codeName: 'credit_cards',
    description: 'Nợ thẻ tín dụng và số dư',
    icon: 'credit-card',
    isActive: true,
    order: 1
  },
  {
    name: 'Vay cá nhân',
    codeName: 'personal_loans',
    description: 'Các khoản vay cá nhân và nợ tín chấp',
    icon: 'user-circle',
    isActive: true,
    order: 2
  },
  {
    name: 'Vay mua nhà',
    codeName: 'mortgages',
    description: 'Vay thế chấp mua nhà và bất động sản',
    icon: 'home',
    isActive: true,
    order: 3
  },
  {
    name: 'Vay mua xe',
    codeName: 'auto_loans',
    description: 'Vay mua xe và các khoản vay phương tiện',
    icon: 'car',
    isActive: true,
    order: 4
  },
  {
    name: 'Vay học tập',
    codeName: 'student_loans',
    description: 'Vay du học và tài trợ giáo dục',
    icon: 'graduation-cap',
    isActive: true,
    order: 5
  },
  {
    name: 'Vay kinh doanh',
    codeName: 'business_loans',
    description: 'Vay kinh doanh và tài trợ thương mại',
    icon: 'briefcase',
    isActive: true,
    order: 6
  },
  {
    name: 'Nợ y tế',
    codeName: 'medical_debt',
    description: 'Viện phí và chi phí y tế',
    icon: 'heart',
    isActive: true,
    order: 7
  },
  {
    name: 'Nợ thuế',
    codeName: 'tax_debt',
    description: 'Nghĩa vụ thuế và nợ với nhà nước',
    icon: 'receipt',
    isActive: true,
    order: 8
  },
  {
    name: 'Nợ khác',
    codeName: 'other_debts',
    description: 'Các khoản nợ và nghĩa vụ khác',
    icon: 'ellipsis-h',
    isActive: true,
    order: 9
  }
] as Partial<DebtCategory>[]; 