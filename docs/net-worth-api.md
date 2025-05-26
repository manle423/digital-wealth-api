# Net Worth API Documentation

## Overview
The Net Worth API provides comprehensive net worth calculation and tracking functionality, combining asset and debt data to give users insights into their financial position.

## Base URL
```
/net-worth
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Current Net Worth
Calculate and return the current net worth based on latest asset and debt data.

**Endpoint:** `GET /net-worth/current`

**Response:**
```json
{
  "totalAssets": 1250000.00,
  "totalDebts": 450000.00,
  "netWorth": 800000.00,
  "assetBreakdown": [
    {
      "categoryId": "uuid",
      "categoryName": "Real Estate",
      "totalValue": 800000.00,
      "percentage": 64.0,
      "assetCount": 1
    },
    {
      "categoryId": "uuid", 
      "categoryName": "Investments",
      "totalValue": 300000.00,
      "percentage": 24.0,
      "assetCount": 5
    },
    {
      "categoryId": "uuid",
      "categoryName": "Cash & Savings",
      "totalValue": 150000.00,
      "percentage": 12.0,
      "assetCount": 3
    }
  ],
  "debtBreakdown": [
    {
      "categoryId": "uuid",
      "categoryName": "Mortgage",
      "totalValue": 350000.00,
      "percentage": 77.8,
      "count": 1
    },
    {
      "categoryId": "uuid",
      "categoryName": "Credit Cards", 
      "totalValue": 75000.00,
      "percentage": 16.7,
      "count": 2
    },
    {
      "categoryId": "uuid",
      "categoryName": "Auto Loans",
      "totalValue": 25000.00,
      "percentage": 5.5,
      "count": 1
    }
  ]
}
```

### 2. Get Net Worth Summary
Get comprehensive net worth summary including current position, trend, and breakdown.

**Endpoint:** `GET /net-worth/summary`

**Response:**
```json
{
  "current": {
    "totalAssets": 1250000.00,
    "totalDebts": 450000.00,
    "netWorth": 800000.00,
    "liquidAssets": 150000.00
  },
  "trend": {
    "change": 50000.00,
    "changePercentage": 6.67,
    "trend": "UP"
  },
  "breakdown": {
    "assets": [
      {
        "categoryId": "uuid",
        "categoryName": "Real Estate",
        "totalValue": 800000.00,
        "percentage": 64.0,
        "assetCount": 1
      }
    ],
    "debts": [
      {
        "categoryId": "uuid",
        "categoryName": "Mortgage",
        "totalValue": 350000.00,
        "percentage": 77.8,
        "count": 1
      }
    ]
  }
}
```

### 3. Get Net Worth Trend
Get net worth trend comparison with previous snapshot.

**Endpoint:** `GET /net-worth/trend`

**Response:**
```json
{
  "currentNetWorth": 800000.00,
  "previousNetWorth": 750000.00,
  "change": 50000.00,
  "changePercentage": 6.67,
  "trend": "UP"
}
```

**Trend Values:**
- `UP`: Net worth increased by more than 1%
- `DOWN`: Net worth decreased by more than 1%
- `STABLE`: Net worth changed by less than 1%

### 4. Get Net Worth History
Get historical net worth snapshots over a specified period.

**Endpoint:** `GET /net-worth/history`

**Query Parameters:**
- `months` (optional): Number of months to look back (default: 12)

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "snapshotDate": "2024-02-15T10:00:00Z",
    "totalAssets": 1250000.00,
    "totalDebts": 450000.00,
    "netWorth": 800000.00,
    "assetBreakdown": [
      {
        "categoryId": "uuid",
        "categoryName": "Real Estate",
        "totalValue": 800000.00,
        "percentage": 64.0
      }
    ],
    "debtBreakdown": [
      {
        "categoryId": "uuid",
        "categoryName": "Mortgage", 
        "totalValue": 350000.00,
        "percentage": 77.8
      }
    ],
    "liquidAssets": 150000.00,
    "investmentAssets": 300000.00,
    "realEstateAssets": 800000.00,
    "personalAssets": 0.00,
    "shortTermDebts": 100000.00,
    "longTermDebts": 350000.00,
    "notes": null,
    "isManual": false,
    "createdAt": "2024-02-15T10:00:00Z"
  },
  {
    "id": "uuid",
    "userId": "uuid", 
    "snapshotDate": "2024-01-15T10:00:00Z",
    "totalAssets": 1200000.00,
    "totalDebts": 450000.00,
    "netWorth": 750000.00,
    "assetBreakdown": [...],
    "debtBreakdown": [...],
    "liquidAssets": 120000.00,
    "investmentAssets": 280000.00,
    "realEstateAssets": 800000.00,
    "personalAssets": 0.00,
    "shortTermDebts": 100000.00,
    "longTermDebts": 350000.00,
    "notes": null,
    "isManual": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### 5. Create Manual Snapshot
Create a manual net worth snapshot with current data.

**Endpoint:** `POST /net-worth/snapshot`

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "snapshotDate": "2024-02-15T10:30:00Z",
  "totalAssets": 1250000.00,
  "totalDebts": 450000.00,
  "netWorth": 800000.00,
  "assetBreakdown": [...],
  "debtBreakdown": [...],
  "liquidAssets": 150000.00,
  "investmentAssets": 300000.00,
  "realEstateAssets": 800000.00,
  "personalAssets": 0.00,
  "shortTermDebts": 100000.00,
  "longTermDebts": 350000.00,
  "notes": null,
  "isManual": true,
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-15T10:30:00Z"
}
```

## Asset Categorization

The system automatically categorizes assets into different types based on category names:

### Liquid Assets
- Cash, Savings, Checking, Money Market accounts

### Investment Assets  
- Stocks, Bonds, Mutual Funds, ETFs, Investment accounts

### Real Estate Assets
- Real Estate, Property, House, Apartment

### Personal Assets
- Vehicles, Jewelry, Electronics, Furniture

## Debt Categorization

Debts are categorized into short-term and long-term based on category names:

### Short-term Debts
- Credit Cards, Personal Loans, Short-term loans

### Long-term Debts
- Mortgages, Auto Loans, Student Loans, Long-term loans

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Usage Examples

### Get Current Net Worth
```bash
curl -X GET http://localhost:3000/net-worth/current \
  -H "Authorization: Bearer <token>"
```

### Get Net Worth Summary
```bash
curl -X GET http://localhost:3000/net-worth/summary \
  -H "Authorization: Bearer <token>"
```

### Get 6-Month History
```bash
curl -X GET "http://localhost:3000/net-worth/history?months=6" \
  -H "Authorization: Bearer <token>"
```

### Create Manual Snapshot
```bash
curl -X POST http://localhost:3000/net-worth/snapshot \
  -H "Authorization: Bearer <token>"
```

## Integration Notes

### Dependencies
- **Asset Management Module**: Provides total asset value and breakdown
- **Debt Management Module**: Provides total debt value and breakdown
- **Redis**: Used for caching calculations (30-minute TTL)

### Automatic Snapshots
- Snapshots can be created automatically via scheduled jobs
- Manual snapshots can be created by users at any time
- Old snapshots are automatically cleaned up (keeps last 100)

### Performance Considerations
- Net worth calculations are cached for 30 minutes
- History queries are cached for 1 hour
- Breakdown calculations use efficient database queries
- Asset and debt data is fetched in parallel for better performance

### Data Consistency
- Net worth is calculated in real-time from current asset and debt data
- Snapshots preserve historical data even if underlying assets/debts change
- All monetary values are rounded to 2 decimal places for consistency 