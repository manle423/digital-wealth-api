# Recommendation API Documentation

## Tổng quan

Recommendation API cung cấp hệ thống gợi ý tài chính thông minh dựa trên phân tích tình hình tài chính của người dùng. Hệ thống sử dụng các thuật toán AI và Machine Learning để đưa ra những lời khuyên cá nhân hóa.

## Thuật toán gợi ý

### 1. Rule-Based Recommendation Engine
Hệ thống sử dụng kết hợp nhiều thuật toán:

#### A. Rule-Based System
- Dựa trên các quy tắc tài chính chuẩn quốc tế
- Ngưỡng chỉ số tài chính được khuyến nghị bởi các chuyên gia
- Phân loại theo mức độ ưu tiên: CRITICAL, HIGH, MEDIUM, LOW

#### B. Threshold-Based Analysis
- **Tỷ lệ thanh khoản < 5%**: Gợi ý xây dựng quỹ khẩn cấp (CRITICAL)
- **Tỷ lệ nợ/tài sản > 70%**: Gợi ý giảm nợ khẩn cấp (CRITICAL)
- **Tỷ lệ đầu tư < 20%**: Gợi ý bắt đầu đầu tư (HIGH)
- **Chỉ số đa dạng hóa < 50%**: Gợi ý đa dạng hóa danh mục (HIGH)

#### C. Priority Scoring Algorithm
```typescript
priorityOrder = {
  CRITICAL: 4,  // Cần hành động ngay lập tức
  HIGH: 3,      // Nên thực hiện sớm
  MEDIUM: 2,    // Có thể thực hiện
  LOW: 1        // Tùy chọn
}
```

#### D. Collaborative Filtering
- So sánh với người dùng có profile tài chính tương tự
- Học từ feedback và hành vi của người dùng khác

#### E. Content-Based Filtering
- Dựa trên lịch sử hành vi và phản hồi của người dùng
- Tránh gợi ý trùng lặp trong 30 ngày
- Giới hạn tối đa 5 gợi ý active cùng lúc

### 2. Financial Profile Analysis
Hệ thống phân tích các chỉ số:
- **Net Worth**: Tài sản ròng
- **Liquidity Ratio**: Tỷ lệ thanh khoản
- **Debt-to-Asset Ratio**: Tỷ lệ nợ/tài sản
- **Investment Ratio**: Tỷ lệ đầu tư
- **Diversification Index**: Chỉ số đa dạng hóa
- **Financial Health Score**: Điểm sức khỏe tài chính

## API Endpoints

### 1. Generate Recommendations
Tạo gợi ý tài chính mới dựa trên tình hình hiện tại.

**Endpoint:** `POST /api/recommendations/generate`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "EMERGENCY_FUND",
    "priority": "CRITICAL",
    "status": "ACTIVE",
    "title": "Xây dựng quỹ khẩn cấp ngay lập tức",
    "description": "Tỷ lệ thanh khoản của bạn quá thấp (< 5%). Điều này có thể gây rủi ro tài chính nghiêm trọng khi có sự cố bất ngờ.",
    "rationale": "Quỹ khẩn cấp là nền tảng của an toàn tài chính. Chuyên gia khuyến nghị nên có ít nhất 3-6 tháng chi tiêu trong tài khoản thanh khoản.",
    "actionSteps": [
      {
        "step": 1,
        "description": "Mở tài khoản tiết kiệm riêng cho quỹ khẩn cấp",
        "isCompleted": false
      },
      {
        "step": 2,
        "description": "Đặt mục tiêu tiết kiệm 10% thu nhập hàng tháng",
        "isCompleted": false
      }
    ],
    "expectedImpact": {
      "financialImpact": 0,
      "timeframe": "3-6 tháng",
      "riskLevel": "LOW",
      "description": "Tăng cường an toàn tài chính, giảm stress khi có sự cố"
    },
    "expiresAt": "2024-02-15T10:30:00Z",
    "createdAt": "2024-02-08T10:30:00Z"
  }
]
```

### 2. Get Active Recommendations
Lấy danh sách gợi ý đang hoạt động.

**Endpoint:** `GET /api/recommendations`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "INVESTMENT_OPPORTUNITY",
    "priority": "HIGH",
    "status": "ACTIVE",
    "title": "Bắt đầu đầu tư để tăng trưởng tài sản",
    "description": "Bạn có quỹ thanh khoản tốt nhưng tỷ lệ đầu tư còn thấp. Đây là cơ hội để tăng trưởng tài sản dài hạn.",
    "viewedAt": null,
    "createdAt": "2024-02-08T10:30:00Z"
  }
]
```

### 3. Get Recommendations by Type
Lấy gợi ý theo loại cụ thể.

**Endpoint:** `GET /api/recommendations/by-type?type={type}`

**Parameters:**
- `type`: RecommendationType (EMERGENCY_FUND, DEBT_REDUCTION, INVESTMENT_OPPORTUNITY, etc.)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "DEBT_REDUCTION",
    "priority": "CRITICAL",
    "status": "COMPLETED",
    "title": "Giảm nợ khẩn cấp - Tỷ lệ nợ quá cao",
    "completedAt": "2024-02-10T15:20:00Z",
    "userRating": 5,
    "userFeedback": "Rất hữu ích, đã giúp tôi tiết kiệm được 2 triệu/tháng"
  }
]
```

### 4. Get Recommendation Statistics
Lấy thống kê gợi ý của người dùng.

**Endpoint:** `GET /api/recommendations/stats`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "total": 25,
  "active": 3,
  "completed": 18,
  "dismissed": 4,
  "byPriority": [
    {
      "priority": "CRITICAL",
      "count": 2
    },
    {
      "priority": "HIGH",
      "count": 8
    },
    {
      "priority": "MEDIUM",
      "count": 12
    },
    {
      "priority": "LOW",
      "count": 3
    }
  ],
  "byType": [
    {
      "type": "EMERGENCY_FUND",
      "count": 3
    },
    {
      "type": "DEBT_REDUCTION",
      "count": 5
    },
    {
      "type": "INVESTMENT_OPPORTUNITY",
      "count": 7
    }
  ]
}
```

### 5. Mark as Viewed
Đánh dấu gợi ý đã được xem.

**Endpoint:** `PATCH /api/recommendations/{id}/view`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Recommendation marked as viewed"
}
```

### 6. Dismiss Recommendation
Bỏ qua gợi ý.

**Endpoint:** `PATCH /api/recommendations/{id}/dismiss`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Recommendation dismissed"
}
```

### 7. Mark as Completed
Đánh dấu gợi ý đã hoàn thành.

**Endpoint:** `PATCH /api/recommendations/{id}/complete`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Recommendation marked as completed"
}
```

### 8. Submit Feedback
Gửi phản hồi về gợi ý.

**Endpoint:** `POST /api/recommendations/{id}/feedback`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "feedback": "Gợi ý rất hữu ích, đã giúp tôi tiết kiệm được nhiều tiền",
  "rating": 5
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully"
}
```

## Recommendation Types

### Quản lý nợ
- `DEBT_REDUCTION`: Giảm nợ
- `DEBT_CONSOLIDATION`: Hợp nhất nợ
- `REFINANCING`: Tái cấu trúc nợ

### Tiết kiệm và đầu tư
- `INCREASE_SAVINGS`: Tăng tiết kiệm
- `EMERGENCY_FUND`: Quỹ khẩn cấp
- `INVESTMENT_OPPORTUNITY`: Cơ hội đầu tư
- `PORTFOLIO_REBALANCING`: Cân bằng lại danh mục
- `DIVERSIFICATION`: Đa dạng hóa

### Bảo hiểm
- `INSURANCE_COVERAGE`: Bảo hiểm
- `LIFE_INSURANCE`: Bảo hiểm nhân thọ
- `HEALTH_INSURANCE`: Bảo hiểm sức khỏe

### Nghỉ hưu
- `RETIREMENT_PLANNING`: Kế hoạch nghỉ hưu
- `PENSION_OPTIMIZATION`: Tối ưu hóa lương hưu

### Chi tiêu
- `EXPENSE_REDUCTION`: Giảm chi tiêu
- `BUDGET_OPTIMIZATION`: Tối ưu ngân sách

### Thuế
- `TAX_OPTIMIZATION`: Tối ưu thuế
- `TAX_PLANNING`: Kế hoạch thuế

### Tín dụng
- `CREDIT_IMPROVEMENT`: Cải thiện tín dụng
- `CREDIT_UTILIZATION`: Sử dụng tín dụng

### Mục tiêu tài chính
- `FINANCIAL_GOAL`: Mục tiêu tài chính
- `WEALTH_BUILDING`: Xây dựng tài sản

### Giáo dục tài chính
- `FINANCIAL_EDUCATION`: Giáo dục tài chính
- `RISK_AWARENESS`: Nhận thức rủi ro

### Khác
- `GENERAL_ADVICE`: Lời khuyên chung
- `MARKET_OPPORTUNITY`: Cơ hội thị trường

## Priority Levels

- `CRITICAL`: Khẩn cấp - cần hành động ngay lập tức
- `HIGH`: Cao - nên thực hiện sớm
- `MEDIUM`: Trung bình - có thể thực hiện
- `LOW`: Thấp - tùy chọn

## Status Types

- `ACTIVE`: Đang hoạt động
- `VIEWED`: Đã xem
- `IN_PROGRESS`: Đang thực hiện
- `COMPLETED`: Đã hoàn thành
- `DISMISSED`: Đã bỏ qua
- `EXPIRED`: Đã hết hạn
- `ARCHIVED`: Đã lưu trữ

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Recommendation not found",
  "error": "Not Found"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": [
    "rating must not be greater than 5",
    "rating must not be less than 1"
  ],
  "error": "Bad Request"
}
```

## Usage Examples

### Tích hợp với Frontend

```typescript
// Lấy gợi ý mới
const generateRecommendations = async () => {
  const response = await fetch('/api/recommendations/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Đánh dấu đã xem
const markAsViewed = async (recommendationId: string) => {
  await fetch(`/api/recommendations/${recommendationId}/view`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Gửi feedback
const submitFeedback = async (recommendationId: string, feedback: string, rating: number) => {
  await fetch(`/api/recommendations/${recommendationId}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ feedback, rating })
  });
};
```

## Performance & Caching

- **Cache TTL**: 1 giờ cho recommendations
- **Rate Limiting**: 100 requests/phút
- **Pagination**: Không áp dụng (giới hạn 5 active recommendations)
- **Real-time Updates**: WebSocket cho thông báo gợi ý mới

## Integration Notes

1. **Dependency**: Cần Financial Analysis và Net Worth modules
2. **Background Jobs**: Tự động tạo gợi ý hàng ngày
3. **Notifications**: Tích hợp với notification service
4. **Analytics**: Track effectiveness của từng loại gợi ý 