export enum MetricType {
  // Tỷ lệ thanh khoản
  LIQUIDITY_RATIO = 'LIQUIDITY_RATIO', // Tỷ lệ thanh khoản
  EMERGENCY_FUND_RATIO = 'EMERGENCY_FUND_RATIO', // Tỷ lệ quỹ khẩn cấp

  // Tỷ lệ nợ
  DEBT_TO_INCOME_RATIO = 'DEBT_TO_INCOME_RATIO', // Tỷ lệ nợ/thu nhập
  DEBT_TO_ASSET_RATIO = 'DEBT_TO_ASSET_RATIO', // Tỷ lệ nợ/tài sản
  DEBT_SERVICE_RATIO = 'DEBT_SERVICE_RATIO', // Tỷ lệ phục vụ nợ

  // Tỷ lệ tiết kiệm và đầu tư
  SAVINGS_RATE = 'SAVINGS_RATE', // Tỷ lệ tiết kiệm
  INVESTMENT_RATIO = 'INVESTMENT_RATIO', // Tỷ lệ đầu tư

  // Hiệu suất đầu tư
  PORTFOLIO_RETURN = 'PORTFOLIO_RETURN', // Lợi nhuận danh mục
  RISK_ADJUSTED_RETURN = 'RISK_ADJUSTED_RETURN', // Lợi nhuận điều chỉnh rủi ro
  SHARPE_RATIO = 'SHARPE_RATIO', // Tỷ lệ Sharpe

  // Tài sản ròng
  NET_WORTH = 'NET_WORTH', // Tài sản ròng
  NET_WORTH_GROWTH = 'NET_WORTH_GROWTH', // Tăng trưởng tài sản ròng

  // Tỷ lệ chi tiêu
  EXPENSE_RATIO = 'EXPENSE_RATIO', // Tỷ lệ chi tiêu
  HOUSING_EXPENSE_RATIO = 'HOUSING_EXPENSE_RATIO', // Tỷ lệ chi tiêu nhà ở

  // Chỉ số tài chính cá nhân
  FINANCIAL_INDEPENDENCE_RATIO = 'FINANCIAL_INDEPENDENCE_RATIO', // Tỷ lệ độc lập tài chính
  RETIREMENT_READINESS = 'RETIREMENT_READINESS', // Sẵn sàng nghỉ hưu

  // Đa dạng hóa
  DIVERSIFICATION_INDEX = 'DIVERSIFICATION_INDEX', // Chỉ số đa dạng hóa
  ASSET_ALLOCATION_SCORE = 'ASSET_ALLOCATION_SCORE', // Điểm phân bổ tài sản

  // Rủi ro
  PORTFOLIO_VOLATILITY = 'PORTFOLIO_VOLATILITY', // Độ biến động danh mục
  VALUE_AT_RISK = 'VALUE_AT_RISK', // Giá trị có rủi ro

  // Khác
  CREDIT_UTILIZATION = 'CREDIT_UTILIZATION', // Tỷ lệ sử dụng tín dụng
  INSURANCE_COVERAGE_RATIO = 'INSURANCE_COVERAGE_RATIO', // Tỷ lệ bảo hiểm
}
