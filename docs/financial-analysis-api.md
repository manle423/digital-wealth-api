# Financial Analysis API Documentation

## Overview
The Financial Analysis API provides comprehensive financial health assessment and metrics calculation functionality. It analyzes user's assets, debts, and financial patterns to generate insights and recommendations.

## Base URL
```
/financial-analysis
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Financial Summary
Get comprehensive financial health summary with key metrics and status assessments.

**Endpoint:** `GET /financial-analysis/summary`

**Response:**
```json
{
  "liquidity": {
    "liquidityRatio": 25.5,
    "emergencyFundRatio": 15.2,
    "status": "GOOD"
  },
  "debt": {
    "debtToAssetRatio": 35.8,
    "debtToIncomeRatio": 28.5,
    "status": "FAIR"
  },
  "investment": {
    "investmentRatio": 45.2,
    "diversificationIndex": 72.3,
    "status": "GOOD"
  },
  "overall": {
    "netWorth": 800000.00,
    "financialHealthScore": 75.5,
    "status": "GOOD"
  }
}
```

**Status Values:**
- **Liquidity/Debt/Investment**: `GOOD`, `FAIR`, `POOR`
- **Overall**: `EXCELLENT`, `GOOD`, `FAIR`, `POOR`

### 2. Calculate All Metrics
Trigger calculation of all financial metrics for the current user.

**Endpoint:** `POST /financial-analysis/calculate`

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "LIQUIDITY_RATIO",
    "value": 25.5,
    "calculationDate": "2024-02-15T10:00:00Z",
    "category": "liquidity",
    "calculationDetails": {
      "formula": "(Liquid Assets / Total Assets) * 100",
      "inputs": {
        "liquidAssets": 150000.00,
        "totalAssets": 1250000.00
      }
    },
    "isCurrent": true,
    "createdAt": "2024-02-15T10:00:00Z",
    "updatedAt": "2024-02-15T10:00:00Z"
  },
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "DEBT_TO_ASSET_RATIO",
    "value": 35.8,
    "calculationDate": "2024-02-15T10:00:00Z",
    "category": "debt",
    "calculationDetails": {
      "formula": "(Total Debts / Total Assets) * 100",
      "inputs": {
        "totalDebts": 450000.00,
        "totalAssets": 1250000.00
      }
    },
    "isCurrent": true,
    "createdAt": "2024-02-15T10:00:00Z",
    "updatedAt": "2024-02-15T10:00:00Z"
  }
]
```

### 3. Get Metrics by Type
Get all historical metrics of a specific type.

**Endpoint:** `GET /financial-analysis/metrics`

**Query Parameters:**
- `type` (required): Metric type (see [Metric Types](#metric-types))

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "LIQUIDITY_RATIO",
    "value": 25.5,
    "calculationDate": "2024-02-15T10:00:00Z",
    "category": "liquidity",
    "calculationDetails": {
      "formula": "(Liquid Assets / Total Assets) * 100",
      "inputs": {
        "liquidAssets": 150000.00,
        "totalAssets": 1250000.00
      }
    },
    "isCurrent": true,
    "createdAt": "2024-02-15T10:00:00Z"
  },
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "LIQUIDITY_RATIO",
    "value": 23.2,
    "calculationDate": "2024-01-15T10:00:00Z",
    "category": "liquidity",
    "calculationDetails": {
      "formula": "(Liquid Assets / Total Assets) * 100",
      "inputs": {
        "liquidAssets": 140000.00,
        "totalAssets": 1200000.00
      }
    },
    "isCurrent": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### 4. Get Latest Metric
Get the most recent metric of a specific type.

**Endpoint:** `GET /financial-analysis/metrics/latest`

**Query Parameters:**
- `type` (required): Metric type (see [Metric Types](#metric-types))

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "LIQUIDITY_RATIO",
  "value": 25.5,
  "calculationDate": "2024-02-15T10:00:00Z",
  "category": "liquidity",
  "calculationDetails": {
    "formula": "(Liquid Assets / Total Assets) * 100",
    "inputs": {
      "liquidAssets": 150000.00,
      "totalAssets": 1250000.00
    }
  },
  "isCurrent": true,
  "createdAt": "2024-02-15T10:00:00Z",
  "updatedAt": "2024-02-15T10:00:00Z"
}
```

### 5. Get Metric Trend
Get trend data for a specific metric over time.

**Endpoint:** `GET /financial-analysis/metrics/trend`

**Query Parameters:**
- `type` (required): Metric type (see [Metric Types](#metric-types))
- `months` (optional): Number of months to look back (default: 12)

**Response:**
```json
[
  {
    "date": "2024-01-15T10:00:00Z",
    "value": 23.2
  },
  {
    "date": "2024-02-15T10:00:00Z",
    "value": 25.5
  }
]
```

## Metric Types

### Liquidity Metrics
- `LIQUIDITY_RATIO`: Percentage of liquid assets to total assets
- `EMERGENCY_FUND_RATIO`: Emergency fund coverage ratio

### Debt Metrics
- `DEBT_TO_INCOME_RATIO`: Debt payments as percentage of income
- `DEBT_TO_ASSET_RATIO`: Total debt as percentage of total assets
- `DEBT_SERVICE_RATIO`: Debt service payments to income ratio

### Investment & Savings Metrics
- `SAVINGS_RATE`: Percentage of income saved
- `INVESTMENT_RATIO`: Investment assets as percentage of total assets
- `PORTFOLIO_RETURN`: Investment portfolio return rate
- `RISK_ADJUSTED_RETURN`: Risk-adjusted investment returns
- `SHARPE_RATIO`: Risk-adjusted return metric

### Net Worth Metrics
- `NET_WORTH`: Total net worth value
- `NET_WORTH_GROWTH`: Net worth growth rate

### Expense Metrics
- `EXPENSE_RATIO`: Total expenses as percentage of income
- `HOUSING_EXPENSE_RATIO`: Housing costs as percentage of income

### Financial Independence Metrics
- `FINANCIAL_INDEPENDENCE_RATIO`: Progress toward financial independence
- `RETIREMENT_READINESS`: Retirement preparedness score

### Diversification Metrics
- `DIVERSIFICATION_INDEX`: Portfolio diversification score (0-100)
- `ASSET_ALLOCATION_SCORE`: Asset allocation optimization score

### Risk Metrics
- `PORTFOLIO_VOLATILITY`: Investment portfolio volatility
- `VALUE_AT_RISK`: Potential loss under normal market conditions

### Other Metrics
- `CREDIT_UTILIZATION`: Credit utilization ratio
- `INSURANCE_COVERAGE_RATIO`: Insurance coverage adequacy

## Financial Health Scoring

### Liquidity Status
- **GOOD**: Liquidity ratio ≥ 20%
- **FAIR**: Liquidity ratio 10-19%
- **POOR**: Liquidity ratio < 10%

### Debt Status
- **GOOD**: Debt-to-asset ratio ≤ 30%
- **FAIR**: Debt-to-asset ratio 31-50%
- **POOR**: Debt-to-asset ratio > 50%

### Investment Status
- **GOOD**: Average of investment ratio and diversification index ≥ 60%
- **FAIR**: Average score 30-59%
- **POOR**: Average score < 30%

### Overall Financial Health Score
Calculated using weighted average:
- Liquidity Score: 25% weight
- Debt Score: 30% weight
- Investment Score: 25% weight
- Diversification Score: 20% weight

**Overall Status:**
- **EXCELLENT**: Score ≥ 80
- **GOOD**: Score 60-79
- **FAIR**: Score 40-59
- **POOR**: Score < 40

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid metric type",
  "error": "Bad Request"
}
```

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

### Get Financial Summary
```bash
curl -X GET http://localhost:3000/financial-analysis/summary \
  -H "Authorization: Bearer <token>"
```

### Calculate All Metrics
```bash
curl -X POST http://localhost:3000/financial-analysis/calculate \
  -H "Authorization: Bearer <token>"
```

### Get Liquidity Ratio History
```bash
curl -X GET "http://localhost:3000/financial-analysis/metrics?type=LIQUIDITY_RATIO" \
  -H "Authorization: Bearer <token>"
```

### Get Latest Debt-to-Asset Ratio
```bash
curl -X GET "http://localhost:3000/financial-analysis/metrics/latest?type=DEBT_TO_ASSET_RATIO" \
  -H "Authorization: Bearer <token>"
```

### Get 6-Month Net Worth Trend
```bash
curl -X GET "http://localhost:3000/financial-analysis/metrics/trend?type=NET_WORTH&months=6" \
  -H "Authorization: Bearer <token>"
```

## Integration Notes

### Dependencies
- **Asset Management Module**: Provides asset data for calculations
- **Net Worth Module**: Provides net worth calculations
- **Redis**: Used for caching calculations (1-hour TTL for metrics, 30-minute TTL for summary)

### Automatic Calculations
- Metrics are calculated on-demand when requested
- Results are cached to improve performance
- Old metrics are automatically cleaned up (keeps last 100 per user)

### Performance Considerations
- Financial summary is cached for 30 minutes
- Individual metrics are cached for 1 hour
- Trend calculations use efficient database queries
- Asset and net worth data is fetched in parallel

### Data Consistency
- Metrics are calculated from current asset and debt data
- Historical metrics preserve calculation details for transparency
- All percentage values are rounded to 2 decimal places
- Calculation formulas and inputs are stored for audit purposes 