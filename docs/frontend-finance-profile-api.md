# 📊 Frontend Integration Guide - Finance Profile API

## 🎯 Overview

API `GET /user/me/get-finance-profile` cung cấp thông tin tài chính toàn diện của user kèm theo lời khuyên từ Gemini AI.

## 🔗 API Endpoint

```http
GET /user/me/get-finance-profile
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📋 Request

### Headers Required
```javascript
{
  "Authorization": "Bearer <user_jwt_token>",
  "Content-Type": "application/json"
}
```

### No Request Body
API này không cần request body, chỉ cần JWT token để xác thực user.

## 📊 Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "profile": {
      "user": {
        "name": "Nguyễn Văn A",
        "email": "user@example.com", 
        "age": 28,
        "occupation": "Software Engineer",
        "investmentExperience": "Mới bắt đầu",
        "riskTolerance": 3
      },
      "financial": {
        "monthlyIncome": 15000000,
        "monthlyExpenses": 8000000,
        "monthlySavings": 7000000,
        "savingsRate": 47,
        "totalAssets": 150000000,
        "totalDebts": 50000000,
        "netWorth": 100000000,
        "liquidAssets": 30000000,
        "emergencyFundMonths": 4
      },
      "assets": {
        "breakdown": [
          {
            "categoryName": "Tiết kiệm",
            "totalValue": 50000000,
            "percentage": 33.33
          },
          {
            "categoryName": "Cổ phiếu", 
            "totalValue": 80000000,
            "percentage": 53.33
          }
        ],
        "liquid": [
          {
            "name": "Tài khoản tiết kiệm",
            "type": "SAVINGS",
            "value": 30000000,
            "category": "Tiết kiệm"
          }
        ],
        "totalCategories": 3
      },
      "debts": {
        "breakdown": [
          {
            "categoryName": "Vay mua nhà",
            "totalValue": 40000000,
            "percentage": 80
          }
        ],
        "totalCategories": 1,
        "debtToAssetRatio": 33
      },
      "healthMetrics": {
        "overallScore": 75,
        "trend": {
          "change": 5000000,
          "changePercentage": 15.5,
          "trend": "INCREASING"
        },
        "liquidityRatio": 20
      },
      "preferences": {
        "goals": ["Mua nhà", "Nghỉ hưu sớm"],
        "preferredTypes": ["Cổ phiếu", "Trái phiếu"],
        "timeHorizon": "5-10 năm"
      }
    },
    "advice": {
      "aiGenerated": "🎯 **PHÂN TÍCH TÀI CHÍNH TỔNG QUAN**\n\n✅ **Tỷ lệ tiết kiệm 47% rất xuất sắc!** Bạn đang trên đường xây dựng sự giàu có bền vững...",
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "source": "gemini-ai"
    },
    "summary": {
      "netWorth": 100000000,
      "totalAssets": 150000000,
      "totalDebts": 50000000,
      "liquidAssets": 30000000,
      "monthlyIncome": 15000000,
      "monthlySavings": 7000000,
      "financialHealthScore": 75
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": "..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 💻 Frontend Implementation

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; // Your auth hook

export const useFinanceProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchFinanceProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/me/get-finance-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err.message);
      console.error('Finance Profile Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceProfile();
  }, [token]);

  return {
    data,
    loading,
    error,
    refetch: fetchFinanceProfile
  };
};
```

### React Component Example
```javascript
import React from 'react';
import { useFinanceProfile } from './useFinanceProfile';

const FinanceProfileDashboard = () => {
  const { data, loading, error, refetch } = useFinanceProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Lỗi tải dữ liệu</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  const { profile, advice, summary } = data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hồ sơ tài chính của {profile.user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Cập nhật lần cuối: {new Date(data.timestamp).toLocaleString('vi-VN')}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Tài sản ròng"
          value={formatCurrency(summary.netWorth)}
          trend={profile.healthMetrics.trend}
          icon="💰"
        />
        <SummaryCard
          title="Thu nhập tháng"
          value={formatCurrency(summary.monthlyIncome)}
          subtitle={`Tiết kiệm: ${formatCurrency(summary.monthlySavings)}`}
          icon="📈"
        />
        <SummaryCard
          title="Điểm sức khỏe tài chính"
          value={`${summary.financialHealthScore}/100`}
          progress={summary.financialHealthScore}
          icon="🎯"
        />
      </div>

      {/* Asset & Debt Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetBreakdownChart data={profile.assets.breakdown} />
        <DebtBreakdownChart data={profile.debts.breakdown} />
      </div>

      {/* AI Advice Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-xl font-semibold text-gray-900">
              Lời khuyên từ AI
            </h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Powered by Gemini
            </span>
          </div>
        </div>
        <div className="prose max-w-none">
          <ReactMarkdown>{advice.aiGenerated}</ReactMarkdown>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Được tạo lúc: {new Date(advice.generatedAt).toLocaleString('vi-VN')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button 
          onClick={refetch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Cập nhật dữ liệu
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          🖨️ In báo cáo
        </button>
      </div>
    </div>
  );
};

// Helper Components
const SummaryCard = ({ title, value, subtitle, trend, progress, icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    
    {trend && (
      <div className={`flex items-center mt-2 ${
        trend.trend === 'INCREASING' ? 'text-green-600' : 
        trend.trend === 'DECREASING' ? 'text-red-600' : 'text-gray-600'
      }`}>
        <span className="text-sm">
          {trend.trend === 'INCREASING' ? '↗️' : 
           trend.trend === 'DECREASING' ? '↘️' : '➡️'}
          {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage}%
        </span>
      </div>
    )}
    
    {progress !== undefined && (
      <div className="mt-2">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
);

// Utility function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export default FinanceProfileDashboard;
```

## 🎨 UI/UX Recommendations

### 1. Loading States
```javascript
// Skeleton loading for better UX
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
  </div>
);
```

### 2. Error Handling
```javascript
const ErrorBoundary = ({ error, onRetry }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <XCircleIcon className="h-5 w-5 text-red-400" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Không thể tải dữ liệu tài chính
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm hover:bg-red-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  </div>
);
```

### 3. Data Visualization
Recommend using:
- **Chart.js** or **Recharts** cho pie charts (asset/debt breakdown)
- **Framer Motion** cho animations
- **React Markdown** cho hiển thị AI advice

## ⚡ Performance Tips

### 1. Caching Strategy
```javascript
// Cache response for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const cacheKey = `finance-profile-${userId}`;
const cachedData = localStorage.getItem(cacheKey);
const cacheTime = localStorage.getItem(`${cacheKey}-time`);

if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
  setData(JSON.parse(cachedData));
  return;
}
```

### 2. Lazy Loading
```javascript
// Only load when user scrolls to financial section
import { lazy, Suspense } from 'react';

const FinanceProfile = lazy(() => import('./FinanceProfile'));

const App = () => (
  <Suspense fallback={<SkeletonCard />}>
    <FinanceProfile />
  </Suspense>
);
```

## 🔄 Auto Refresh

```javascript
// Auto refresh every 10 minutes
useEffect(() => {
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refetch();
    }
  }, 10 * 60 * 1000);

  return () => clearInterval(interval);
}, [refetch]);
```

## 🚦 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `USER_NOT_FOUND` | User không tồn tại | Redirect to login |
| `INSUFFICIENT_DATA` | Chưa đủ dữ liệu tài chính | Guide user to add assets/debts |
| `GEMINI_API_ERROR` | Lỗi AI service | Show fallback advice |
| `RATE_LIMIT_EXCEEDED` | Quá nhiều requests | Show retry after timer |

## 📱 Mobile Responsive

```css
/* Responsive design */
@media (max-width: 768px) {
  .finance-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    padding: 1rem;
  }
  
  .chart-container {
    height: 250px;
  }
}
```

## 🔒 Security Notes

1. **Never log** financial data in browser console
2. **Clear sensitive data** when user logs out
3. **Validate** all data before displaying
4. **Use HTTPS** only for API calls

## 🧪 Testing

```javascript
// Jest test example
describe('Finance Profile API', () => {
  test('should fetch and display finance profile', async () => {
    const mockData = { /* mock response */ };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<FinanceProfileDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Tài sản ròng/)).toBeInTheDocument();
    });
  });
});
```

## 📞 Support

Nếu gặp vấn đề:
1. Check browser console for errors
2. Verify JWT token is valid
3. Check network connectivity
4. Contact backend team with error details

---

**💡 Pro Tips:**
- Cache dữ liệu để tăng performance
- Sử dụng skeleton loading cho UX tốt hơn  
- Implement auto-refresh cho real-time data
- Add print functionality cho reports
- Use progressive loading cho charts lớn
</rewritten_file> 