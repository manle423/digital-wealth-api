export enum DebtStatus {
  ACTIVE = 'ACTIVE', // Đang trả
  PAID_OFF = 'PAID_OFF', // Đã trả hết
  OVERDUE = 'OVERDUE', // Quá hạn
  DEFAULTED = 'DEFAULTED', // Vỡ nợ
  RESTRUCTURED = 'RESTRUCTURED', // Tái cơ cấu
  FROZEN = 'FROZEN', // Tạm dừng
  CANCELLED = 'CANCELLED', // Hủy bỏ
}
