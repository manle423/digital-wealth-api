# Asset Management API Documentation

## Overview
Asset Management module cung cấp các API để quản lý tài sản của người dùng, bao gồm tạo, cập nhật, xóa và truy vấn thông tin tài sản.

## Base URL
```
/asset-management
```

## Authentication
Tất cả các endpoint đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your-jwt-token>
```

## Asset Types (Enum)
```typescript
enum AssetType {
  // Financial Assets
  STOCK = 'STOCK',
  BOND = 'BOND', 
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  CRYPTO = 'CRYPTO',
  BANK_DEPOSIT = 'BANK_DEPOSIT',
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  CERTIFICATE_OF_DEPOSIT = 'CERTIFICATE_OF_DEPOSIT',
  
  // Real Estate
  REAL_ESTATE = 'REAL_ESTATE',
  LAND = 'LAND',
  
  // Personal Assets
  VEHICLE = 'VEHICLE',
  JEWELRY = 'JEWELRY',
  ART = 'ART',
  COLLECTIBLES = 'COLLECTIBLES',
  
  // Business Assets
  BUSINESS = 'BUSINESS',
  EQUIPMENT = 'EQUIPMENT',
  
  // Insurance & Retirement
  INSURANCE = 'INSURANCE',
  PENSION = 'PENSION',
  
  // Others
  CASH = 'CASH',
  COMMODITY = 'COMMODITY',
  FOREX = 'FOREX',
  OTHER = 'OTHER'
}
```

## Liquidity Levels
- `HIGH`: Có thể chuyển đổi thành tiền mặt ngay lập tức
- `MEDIUM`: Có thể chuyển đổi trong vài ngày
- `LOW`: Cần thời gian dài để chuyển đổi

---

## API Endpoints

### 1. Get User Assets
**GET** `/assets`

Lấy danh sách tài sản của user với filtering và pagination.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| categoryId | string | No | Filter theo category ID |
| type | AssetType | No | Filter theo loại tài sản |
| liquidityLevel | string | No | Filter theo mức độ thanh khoản |
| minValue | number | No | Giá trị tối thiểu |
| maxValue | number | No | Giá trị tối đa |
| currency | string | No | Filter theo loại tiền tệ |
| search | string | No | Tìm kiếm theo tên hoặc mô tả |
| sortBy | string | No | Sắp xếp theo field |
| sortDirection | 'ASC' \| 'DESC' | No | Hướng sắp xếp |
| page | number | No | Số trang (bắt đầu từ 1) |
| limit | number | No | Số item per page (max 100) |

#### Response
```typescript
{
  success: boolean;
  data: {
    assets: UserAsset[];
    total: number;
    summary: {
      totalValue: number;
      totalAssets: number;
      byCategory: Array<{
        categoryId: string;
        categoryName: string;
        totalValue: number;
        percentage: number;
        assetCount: number;
      }>;
      byType: Array<{
        type: AssetType;
        totalValue: number;
        assetCount: number;
      }>;
    };
  };
  message: string;
  statusCode: number;
}
```

#### Example Request
```javascript
const response = await fetch('/asset-management/assets?page=1&limit=10&type=STOCK', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

---

### 2. Get Asset by ID
**GET** `/assets/:id`

Lấy thông tin chi tiết của một tài sản.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Asset ID |

#### Response
```typescript
{
  success: boolean;
  data: UserAsset;
  message: string;
  statusCode: number;
}
```

---

### 3. Create Asset
**POST** `/assets`

Tạo tài sản mới.

#### Request Body
```typescript
{
  categoryId: string; // Required - UUID của category
  name: string; // Required - Tên tài sản
  description?: string; // Optional - Mô tả
  type?: AssetType; // Optional - Loại tài sản (default: OTHER)
  currentValue: number; // Required - Giá trị hiện tại
  purchasePrice?: number; // Optional - Giá mua
  purchaseDate?: string; // Optional - Ngày mua (ISO date)
  currency?: string; // Optional - Loại tiền tệ (default: VND)
  annualReturn?: number; // Optional - Lợi nhuận hàng năm (%)
  marketValue?: number; // Optional - Giá trị thị trường
  valuationDate?: string; // Optional - Ngày định giá (ISO date)
  liquidityLevel?: string; // Optional - Mức độ thanh khoản (default: MEDIUM)
  additionalInfo?: {
    location?: string;
    condition?: string;
    serialNumber?: string;
    broker?: string;
    accountNumber?: string;
    interestRate?: number;
    maturityDate?: Date;
    dividendYield?: number;
    riskRating?: string;
    [key: string]: any;
  };
  notes?: string; // Optional - Ghi chú
}
```

#### Response
```typescript
{
  success: boolean;
  data: UserAsset;
  message: string;
  statusCode: number;
}
```

#### Example Request
```javascript
const response = await fetch('/asset-management/assets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    categoryId: 'uuid-category-id',
    name: 'Cổ phiếu VCB',
    type: 'STOCK',
    currentValue: 100000000,
    purchasePrice: 95000000,
    purchaseDate: '2024-01-15',
    currency: 'VND',
    liquidityLevel: 'HIGH',
    additionalInfo: {
      broker: 'SSI',
      accountNumber: '123456789'
    }
  })
});
```

---

### 4. Update Asset
**PUT** `/assets/:id`

Cập nhật thông tin tài sản.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Asset ID |

#### Request Body
Tương tự như Create Asset nhưng tất cả fields đều optional.

#### Response
```typescript
{
  success: boolean;
  data: UserAsset;
  message: string;
  statusCode: number;
}
```

---

### 5. Delete Asset
**DELETE** `/assets/:id`

Xóa tài sản (soft delete).

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Asset ID |

#### Response
```typescript
{
  success: boolean;
  data: { message: string };
  message: string;
  statusCode: number;
}
```

---

### 6. Update Asset Value
**PUT** `/assets/:id/value`

Cập nhật giá trị tài sản nhanh.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Asset ID |

#### Request Body
```typescript
{
  currentValue: number; // Required - Giá trị hiện tại mới
  marketValue?: number; // Optional - Giá trị thị trường
  notes?: string; // Optional - Ghi chú về việc cập nhật
}
```

#### Response
```typescript
{
  success: boolean;
  data: UserAsset;
  message: string;
  statusCode: number;
}
```

---

### 7. Get Total Asset Value
**GET** `/summary/total-value`

Lấy tổng giá trị tài sản của user.

#### Response
```typescript
{
  success: boolean;
  data: {
    totalValue: number;
  };
  message: string;
  statusCode: number;
}
```

---

### 8. Get Asset Breakdown
**GET** `/summary/breakdown`

Lấy phân tích tài sản theo category.

#### Response
```typescript
{
  success: boolean;
  data: Array<{
    categoryId: string;
    categoryName: string;
    totalValue: number;
    percentage: number;
    assetCount: number;
  }>;
  message: string;
  statusCode: number;
}
```

---

### 9. Get Asset Categories
**GET** `/categories`

Lấy danh sách các category tài sản.

#### Response
```typescript
{
  success: boolean;
  data: AssetCategory[];
  message: string;
  statusCode: number;
}
```

#### AssetCategory Structure
```typescript
{
  id: string;
  name: string;
  codeName: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 10. Get Liquid Assets
**GET** `/assets/liquid`

Lấy danh sách tài sản có tính thanh khoản cao.

#### Response
```typescript
{
  success: boolean;
  data: UserAsset[];
  message: string;
  statusCode: number;
}
```

---

### 11. Get Recently Updated Assets
**GET** `/assets/recent`

Lấy danh sách tài sản được cập nhật gần đây.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | number | No | Số ngày nhìn lại (default: 30) |

#### Response
```typescript
{
  success: boolean;
  data: UserAsset[];
  message: string;
  statusCode: number;
}
```

---

## UserAsset Data Structure

```typescript
interface UserAsset {
  id: string;
  userId: string;
  categoryId: string;
  category?: AssetCategory;
  name: string;
  description?: string;
  type: AssetType;
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  lastUpdated: Date;
  currency: string;
  annualReturn?: number;
  marketValue?: number;
  valuationDate?: Date;
  liquidityLevel: string;
  additionalInfo?: Record<string, any>;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```typescript
{
  success: false;
  data: null;
  message: "Validation error message";
  statusCode: 400;
}
```

#### 401 Unauthorized
```typescript
{
  success: false;
  data: null;
  message: "Unauthorized";
  statusCode: 401;
}
```

#### 404 Not Found
```typescript
{
  success: false;
  data: null;
  message: "Asset not found";
  statusCode: 404;
}
```

#### 500 Internal Server Error
```typescript
{
  success: false;
  data: null;
  message: "Internal server error";
  statusCode: 500;
}
```

---

## Frontend Integration Examples

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

interface UseAssetsOptions {
  page?: number;
  limit?: number;
  type?: AssetType;
  search?: string;
}

export const useAssets = (options: UseAssetsOptions = {}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/asset-management/assets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAssets(result.data.assets);
        setSummary(result.data.summary);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [JSON.stringify(options)]);

  return { assets, loading, error, summary, refetch: fetchAssets };
};
```

### Vue Composable Example
```typescript
import { ref, computed, watch } from 'vue';

export const useAssets = (options = ref({})) => {
  const assets = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const summary = ref(null);

  const fetchAssets = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const params = new URLSearchParams();
      Object.entries(options.value).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/asset-management/assets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        assets.value = result.data.assets;
        summary.value = result.data.summary;
      } else {
        error.value = result.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  watch(options, fetchAssets, { deep: true, immediate: true });

  return {
    assets: readonly(assets),
    loading: readonly(loading),
    error: readonly(error),
    summary: readonly(summary),
    refetch: fetchAssets
  };
};
```

---

## Best Practices

### 1. Caching
- API đã implement Redis caching cho performance tốt hơn
- Cache sẽ tự động clear khi có update/create/delete

### 2. Pagination
- Luôn sử dụng pagination cho danh sách lớn
- Limit tối đa là 100 items per page

### 3. Error Handling
- Luôn check `success` field trong response
- Handle các error codes phù hợp

### 4. Real-time Updates
- Sau khi create/update/delete, gọi lại API để refresh data
- Hoặc update local state optimistically

### 5. Validation
- Frontend nên validate input trước khi gửi API
- Backend sẽ validate lại và trả về error nếu cần

---

## Testing

### Sample Test Data
```typescript
// Sample asset categories
const categories = [
  { id: 'cat-1', name: 'Chứng khoán', codeName: 'STOCKS' },
  { id: 'cat-2', name: 'Bất động sản', codeName: 'REAL_ESTATE' },
  { id: 'cat-3', name: 'Tiền mặt', codeName: 'CASH' }
];

// Sample asset creation
const newAsset = {
  categoryId: 'cat-1',
  name: 'Cổ phiếu VCB',
  type: 'STOCK',
  currentValue: 100000000,
  currency: 'VND',
  liquidityLevel: 'HIGH'
};
``` 