# Digital Wealth Management - Financial Modules Overview

## Tổng quan hệ thống

Hệ thống Digital Wealth Management bao gồm các module tài chính chính sau:

### ✅ **Modules đã có (cần cập nhật):**
1. **Portfolio Management Module** - Quản lý phân bổ tài sản theo khẩu vị rủi ro
2. **Risk Assessment Module** - Đánh giá khẩu vị rủi ro
3. **User Module** - Thông tin user với `totalPortfolioValue`

### 🆕 **Modules mới được tạo:**
1. **Asset Management Module** - Quản lý tài sản cá nhân
2. **Debt Management Module** - Quản lý nợ
3. **Net Worth Module** - Tính toán giá trị ròng
4. **Financial Analysis Module** - Phân tích tài chính
5. **Recommendation Module** - Gợi ý dựa trên khẩu vị rủi ro

---

## 1. Asset Management Module

### Mục đích
Quản lý tất cả tài sản cá nhân của người dùng, bao gồm tài sản tài chính, bất động sản, tài sản cá nhân.

### Entities

#### AssetCategory
```typescript
- id: string (UUID)
- name: string                    // Tên danh mục
- codeName: string               // Mã danh mục (unique)
- description: string            // Mô tả
- icon: string                   // Icon
- isActive: boolean              // Trạng thái hoạt động
- order: number                  // Thứ tự hiển thị
- userAssets: UserAsset[]        // Quan hệ 1-n với UserAsset
```

#### UserAsset
```typescript
- id: string (UUID)
- userId: string                 // ID người dùng
- categoryId: string             // ID danh mục tài sản
- name: string                   // Tên tài sản
- description: string            // Mô tả
- type: AssetType               // Loại tài sản (enum)
- currentValue: number          // Giá trị hiện tại
- purchasePrice: number         // Giá mua
- purchaseDate: Date            // Ngày mua
- lastUpdated: Date             // Cập nhật cuối
- additionalInfo: JSON          // Thông tin bổ sung
- isActive: boolean             // Trạng thái hoạt động
- notes: string                 // Ghi chú
```

### AssetType Enum
```typescript
// Tài sản tài chính
STOCK, BOND, MUTUAL_FUND, ETF, CRYPTO, BANK_DEPOSIT, SAVINGS_ACCOUNT

// Bất động sản
REAL_ESTATE, LAND

// Tài sản cá nhân
VEHICLE, JEWELRY, ART, COLLECTIBLES

// Tài sản kinh doanh
BUSINESS, EQUIPMENT

// Khác
CASH, INSURANCE, PENSION, OTHER
```

### Services
- `AssetManagementService`: Quản lý tài sản người dùng
  - `getUserAssets(userId)`: Lấy tất cả tài sản
  - `getAssetsByCategory(userId, categoryId)`: Lấy tài sản theo danh mục
  - `getTotalAssetValue(userId)`: Tính tổng giá trị tài sản
  - `getAssetBreakdown(userId)`: Phân tích cơ cấu tài sản
  - `updateAssetValue(assetId, newValue)`: Cập nhật giá trị tài sản

---

## 2. Debt Management Module

### Mục đích
Quản lý tất cả các khoản nợ của người dùng, theo dõi lịch trả nợ, tính toán lãi suất.

### Entities

#### DebtCategory
```typescript
- id: string (UUID)
- name: string                   // Tên danh mục nợ
- codeName: string              // Mã danh mục (unique)
- description: string           // Mô tả
- icon: string                  // Icon
- isActive: boolean             // Trạng thái hoạt động
- order: number                 // Thứ tự hiển thị
- userDebts: UserDebt[]         // Quan hệ 1-n với UserDebt
```

#### UserDebt
```typescript
- id: string (UUID)
- userId: string                // ID người dùng
- categoryId: string            // ID danh mục nợ
- name: string                  // Tên khoản nợ
- description: string           // Mô tả
- type: DebtType               // Loại nợ (enum)
- status: DebtStatus           // Trạng thái nợ (enum)
- originalAmount: number       // Số tiền vay ban đầu
- currentBalance: number       // Số dư hiện tại
- interestRate: number         // Lãi suất
- startDate: Date              // Ngày bắt đầu
- dueDate: Date                // Ngày đến hạn
- monthlyPayment: number       // Số tiền trả hàng tháng
- creditor: string             // Chủ nợ
- paymentSchedule: JSON        // Lịch trả nợ
- additionalInfo: JSON         // Thông tin bổ sung
- isActive: boolean            // Trạng thái hoạt động
- notes: string                // Ghi chú
```

### DebtType Enum
```typescript
// Nợ ngân hàng
MORTGAGE, AUTO_LOAN, PERSONAL_LOAN, BUSINESS_LOAN

// Thẻ tín dụng
CREDIT_CARD

// Nợ giáo dục
STUDENT_LOAN

// Nợ cá nhân
FAMILY_LOAN, FRIEND_LOAN

// Nợ khác
TAX_DEBT, MEDICAL_DEBT, UTILITY_DEBT, OTHER
```

### DebtStatus Enum
```typescript
ACTIVE,        // Đang trả
PAID_OFF,      // Đã trả hết
OVERDUE,       // Quá hạn
DEFAULTED,     // Vỡ nợ
RESTRUCTURED,  // Tái cơ cấu
FROZEN,        // Tạm dừng
CANCELLED      // Hủy bỏ
```

---

## 3. Net Worth Module

### Mục đích
Tính toán và theo dõi giá trị tài sản ròng của người dùng theo thời gian.

### Entities

#### NetWorthSnapshot
```typescript
- id: string (UUID)
- userId: string                // ID người dùng
- snapshotDate: Date            // Ngày chụp snapshot
- totalAssets: number           // Tổng tài sản
- totalDebts: number            // Tổng nợ
- netWorth: number              // Tài sản ròng
- assetBreakdown: JSON          // Phân tích cơ cấu tài sản
- debtBreakdown: JSON           // Phân tích cơ cấu nợ
- liquidAssets: number          // Tài sản thanh khoản
- investmentAssets: number      // Tài sản đầu tư
- realEstateAssets: number      // Tài sản bất động sản
- personalAssets: number        // Tài sản cá nhân
- shortTermDebts: number        // Nợ ngắn hạn
- longTermDebts: number         // Nợ dài hạn
- notes: string                 // Ghi chú
- isManual: boolean             // Snapshot thủ công hay tự động
```

### Services
- `NetWorthService`: Tính toán giá trị ròng
  - `calculateCurrentNetWorth(userId)`: Tính giá trị ròng hiện tại
  - `createSnapshot(userId, isManual)`: Tạo snapshot
  - `getNetWorthHistory(userId, months)`: Lấy lịch sử giá trị ròng
  - `getNetWorthTrend(userId)`: Phân tích xu hướng

---

## 4. Financial Analysis Module

### Mục đích
Tính toán các chỉ số tài chính quan trọng để đánh giá tình hình tài chính của người dùng.

### Entities

#### FinancialMetric
```typescript
- id: string (UUID)
- userId: string                // ID người dùng
- type: MetricType             // Loại chỉ số (enum)
- value: number                // Giá trị chỉ số
- calculationDate: Date        // Ngày tính toán
- periodStart: Date            // Ngày bắt đầu kỳ
- periodEnd: Date              // Ngày kết thúc kỳ
- calculationDetails: JSON     // Chi tiết tính toán
- benchmarkComparison: JSON    // So sánh với benchmark
- category: string             // Danh mục
- subcategory: string          // Danh mục con
- isCurrent: boolean           // Chỉ số hiện tại
```

### MetricType Enum
```typescript
// Tỷ lệ thanh khoản
LIQUIDITY_RATIO, EMERGENCY_FUND_RATIO

// Tỷ lệ nợ
DEBT_TO_INCOME_RATIO, DEBT_TO_ASSET_RATIO, DEBT_SERVICE_RATIO

// Tỷ lệ tiết kiệm và đầu tư
SAVINGS_RATE, INVESTMENT_RATIO

// Hiệu suất đầu tư
PORTFOLIO_RETURN, RISK_ADJUSTED_RETURN, SHARPE_RATIO

// Tài sản ròng
NET_WORTH, NET_WORTH_GROWTH

// Tỷ lệ chi tiêu
EXPENSE_RATIO, HOUSING_EXPENSE_RATIO

// Chỉ số tài chính cá nhân
FINANCIAL_INDEPENDENCE_RATIO, RETIREMENT_READINESS

// Đa dạng hóa
DIVERSIFICATION_INDEX, ASSET_ALLOCATION_SCORE

// Rủi ro
PORTFOLIO_VOLATILITY, VALUE_AT_RISK

// Khác
CREDIT_UTILIZATION, INSURANCE_COVERAGE_RATIO
```

---

## 5. Recommendation Module

### Mục đích
Tạo ra các gợi ý tài chính cá nhân hóa dựa trên khẩu vị rủi ro và tình hình tài chính của người dùng.

### Entities

#### Recommendation
```typescript
- id: string (UUID)
- userId: string                    // ID người dùng
- type: RecommendationType         // Loại gợi ý (enum)
- priority: RecommendationPriority // Độ ưu tiên (enum)
- status: RecommendationStatus     // Trạng thái (enum)
- title: string                    // Tiêu đề
- description: string              // Mô tả
- rationale: string                // Lý do
- actionSteps: JSON                // Các bước thực hiện
- expectedImpact: JSON             // Tác động dự kiến
- triggerConditions: JSON          // Điều kiện kích hoạt
- expiresAt: Date                  // Ngày hết hạn
- viewedAt: Date                   // Ngày xem
- dismissedAt: Date                // Ngày bỏ qua
- completedAt: Date                // Ngày hoàn thành
- userFeedback: string             // Phản hồi người dùng
- userRating: number               // Đánh giá người dùng
- metadata: JSON                   // Metadata
```

### RecommendationType Enum
```typescript
// Quản lý nợ
DEBT_REDUCTION, DEBT_CONSOLIDATION, REFINANCING

// Tiết kiệm và đầu tư
INCREASE_SAVINGS, EMERGENCY_FUND, INVESTMENT_OPPORTUNITY, 
PORTFOLIO_REBALANCING, DIVERSIFICATION

// Bảo hiểm
INSURANCE_COVERAGE, LIFE_INSURANCE, HEALTH_INSURANCE

// Nghỉ hưu
RETIREMENT_PLANNING, PENSION_OPTIMIZATION

// Chi tiêu
EXPENSE_REDUCTION, BUDGET_OPTIMIZATION

// Thuế
TAX_OPTIMIZATION, TAX_PLANNING

// Tín dụng
CREDIT_IMPROVEMENT, CREDIT_UTILIZATION

// Mục tiêu tài chính
FINANCIAL_GOAL, WEALTH_BUILDING

// Giáo dục tài chính
FINANCIAL_EDUCATION, RISK_AWARENESS

// Khác
GENERAL_ADVICE, MARKET_OPPORTUNITY
```

### RecommendationPriority Enum
```typescript
CRITICAL,  // Khẩn cấp - cần hành động ngay
HIGH,      // Cao - nên thực hiện sớm
MEDIUM,    // Trung bình - có thể thực hiện
LOW        // Thấp - tùy chọn
```

### RecommendationStatus Enum
```typescript
ACTIVE,       // Đang hoạt động
VIEWED,       // Đã xem
IN_PROGRESS,  // Đang thực hiện
COMPLETED,    // Đã hoàn thành
DISMISSED,    // Đã bỏ qua
EXPIRED,      // Đã hết hạn
ARCHIVED      // Đã lưu trữ
```

---

## Cập nhật cần thiết cho modules hiện có

### 1. User Module
**Cần thêm vào UserDetail entity:**
```typescript
// Thông tin tài chính bổ sung
monthlyIncome: number           // Thu nhập hàng tháng
monthlyExpenses: number         // Chi tiêu hàng tháng
emergencyFundGoal: number       // Mục tiêu quỹ khẩn cấp
retirementGoal: number          // Mục tiêu nghỉ hưu
financialGoals: JSON            // Các mục tiêu tài chính khác
lastFinancialReview: Date       // Lần đánh giá tài chính cuối
```

### 2. Portfolio Management Module
**Cần cập nhật:**
- Tích hợp với Asset Management để sync dữ liệu đầu tư
- Thêm tracking hiệu suất thực tế vs khuyến nghị
- Thêm rebalancing alerts

### 3. Risk Assessment Module
**Cần cập nhật:**
- Tích hợp với Financial Analysis để cập nhật khẩu vị rủi ro dựa trên tình hình tài chính thực tế
- Thêm periodic reassessment

---

## Luồng hoạt động tổng thể

### 1. Onboarding Flow
```
User Registration → Risk Assessment → Portfolio Recommendation → 
Asset/Debt Input → Net Worth Calculation → Financial Analysis → 
Personalized Recommendations
```

### 2. Daily Operations
```
Asset Value Updates → Net Worth Recalculation → 
Financial Metrics Update → Recommendation Engine → 
User Notifications
```

### 3. Periodic Reviews
```
Monthly: Net Worth Snapshot → Quarterly: Financial Analysis → 
Yearly: Risk Assessment Review → Portfolio Rebalancing
```

---

## API Endpoints Structure

### Asset Management
```
GET    /api/assets                    // Lấy tất cả tài sản
GET    /api/assets/categories         // Lấy danh mục tài sản
GET    /api/assets/breakdown          // Phân tích cơ cấu tài sản
POST   /api/assets                    // Thêm tài sản mới
PUT    /api/assets/:id                // Cập nhật tài sản
DELETE /api/assets/:id                // Xóa tài sản
```

### Debt Management
```
GET    /api/debts                     // Lấy tất cả nợ
GET    /api/debts/categories          // Lấy danh mục nợ
GET    /api/debts/breakdown           // Phân tích cơ cấu nợ
POST   /api/debts                     // Thêm nợ mới
PUT    /api/debts/:id                 // Cập nhật nợ
DELETE /api/debts/:id                 // Xóa nợ
```

### Net Worth
```
GET    /api/net-worth                 // Lấy giá trị ròng hiện tại
GET    /api/net-worth/history         // Lịch sử giá trị ròng
GET    /api/net-worth/trend           // Xu hướng giá trị ròng
POST   /api/net-worth/snapshot        // Tạo snapshot thủ công
```

### Financial Analysis
```
GET    /api/financial-analysis        // Tất cả chỉ số tài chính
GET    /api/financial-analysis/metrics // Chỉ số cụ thể
GET    /api/financial-analysis/dashboard // Dashboard tổng quan
POST   /api/financial-analysis/calculate // Tính toán lại chỉ số
```

### Recommendations
```
GET    /api/recommendations           // Lấy tất cả gợi ý
GET    /api/recommendations/active    // Gợi ý đang hoạt động
POST   /api/recommendations/:id/view  // Đánh dấu đã xem
POST   /api/recommendations/:id/dismiss // Bỏ qua gợi ý
POST   /api/recommendations/:id/complete // Hoàn thành gợi ý
POST   /api/recommendations/:id/feedback // Phản hồi gợi ý
```

---

## Caching Strategy

### Redis Keys đã thêm:
```typescript
// Asset Management
USER_ASSETS = 'user:assets'
USER_TOTAL_ASSETS = 'user:total_assets'

// Debt Management  
USER_DEBTS = 'user:debts'
USER_TOTAL_DEBTS = 'user:total_debts'

// Net Worth
NET_WORTH = 'net_worth'
NET_WORTH_HISTORY = 'net_worth:history'

// Financial Analysis
FINANCIAL_METRICS = 'financial:metrics'

// Recommendations
RECOMMENDATIONS = 'recommendations'
```

---

## Next Steps - Implementation Priority

### Phase 1 (Core Foundation)
1. ✅ Tạo entities và enums
2. 🔄 Tạo repositories
3. 🔄 Implement basic services
4. 🔄 Tạo DTOs và validation

### Phase 2 (Business Logic)
1. 🔄 Implement calculation engines
2. 🔄 Tạo recommendation algorithms
3. 🔄 Integration between modules
4. 🔄 Caching implementation

### Phase 3 (API & Frontend)
1. 🔄 Tạo controllers và endpoints
2. 🔄 API documentation
3. 🔄 Frontend integration
4. 🔄 Testing

### Phase 4 (Advanced Features)
1. 🔄 Real-time updates
2. 🔄 Advanced analytics
3. 🔄 Machine learning recommendations
4. 🔄 Performance optimization

---

## Database Migration Strategy

Tất cả entities mới cần được thêm vào migration để tạo tables:

```sql
-- Asset Management Tables
CREATE TABLE asset_categories (...)
CREATE TABLE user_assets (...)

-- Debt Management Tables  
CREATE TABLE debt_categories (...)
CREATE TABLE user_debts (...)

-- Net Worth Tables
CREATE TABLE net_worth_snapshots (...)

-- Financial Analysis Tables
CREATE TABLE financial_metrics (...)

-- Recommendation Tables
CREATE TABLE recommendations (...)
```

---

## Kết luận

Hệ thống Digital Wealth Management hiện đã có đầy đủ các module cần thiết để:

✅ **Quản lý tài sản toàn diện** - Theo dõi mọi loại tài sản  
✅ **Quản lý nợ hiệu quả** - Theo dõi và lập kế hoạch trả nợ  
✅ **Tính toán giá trị ròng** - Snapshot và tracking theo thời gian  
✅ **Phân tích tài chính chuyên sâu** - Các chỉ số tài chính quan trọng  
✅ **Gợi ý cá nhân hóa** - Dựa trên khẩu vị rủi ro và tình hình tài chính  

Hệ thống được thiết kế để scale và có thể mở rộng thêm các tính năng advanced như AI/ML recommendations, real-time market data integration, và advanced portfolio optimization. 