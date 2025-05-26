# Debt Management API Documentation

## Overview
The Debt Management API allows users to manage their debts, track payments, and analyze debt breakdown for net worth calculation.

## Base URL
```
/debt-management
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get User Debts
Get all debts for the authenticated user with optional filtering.

**Endpoint:** `GET /debt-management/debts`

**Query Parameters:**
- `type` (optional): Filter by debt type (PERSONAL_LOAN, CREDIT_CARD, MORTGAGE, etc.)
- `status` (optional): Filter by debt status (ACTIVE, PAID_OFF, OVERDUE, etc.)
- `categoryId` (optional): Filter by debt category ID
- `creditor` (optional): Filter by creditor name (partial match)
- `dueDateFrom` (optional): Filter debts due from this date (ISO string)
- `dueDateTo` (optional): Filter debts due until this date (ISO string)
- `minAmount` (optional): Filter debts with minimum current balance
- `maxAmount` (optional): Filter debts with maximum current balance
- `sortBy` (optional): Sort field (name, currentBalance, dueDate, createdAt)
- `sortOrder` (optional): Sort order (ASC, DESC)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Response:**
```json
{
  "debts": [
    {
      "id": "uuid",
      "name": "Credit Card Debt",
      "description": "Monthly credit card balance",
      "type": "CREDIT_CARD",
      "status": "ACTIVE",
      "originalAmount": 50000.00,
      "currentBalance": 35000.00,
      "interestRate": 18.5,
      "startDate": "2023-01-15",
      "dueDate": "2025-01-15",
      "monthlyPayment": 2500.00,
      "creditor": "ABC Bank",
      "currency": "VND",
      "termMonths": 24,
      "totalPaid": 15000.00,
      "totalInterest": 5000.00,
      "penaltyRate": 2.0,
      "lastPaymentDate": "2024-01-15",
      "nextPaymentDate": "2024-02-15",
      "paymentMethod": "Bank Transfer",
      "paymentSchedule": {
        "frequency": "MONTHLY",
        "amount": 2500.00,
        "nextPaymentDate": "2024-02-15",
        "remainingPayments": 10
      },
      "additionalInfo": {
        "accountNumber": "1234567890",
        "contractNumber": "CC-2023-001"
      },
      "notes": "High priority debt",
      "category": {
        "id": "uuid",
        "name": "Credit Cards",
        "codeName": "credit_cards",
        "description": "Credit card debts",
        "icon": "credit-card",
        "isActive": true,
        "order": 1
      },
      "createdAt": "2023-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 2. Get Debt by ID
Get a specific debt by its ID.

**Endpoint:** `GET /debt-management/debts/:id`

**Parameters:**
- `id`: Debt UUID

**Response:**
```json
{
  "id": "uuid",
  "name": "Credit Card Debt",
  // ... same structure as above
}
```

### 3. Create Debt
Create a new debt entry.

**Endpoint:** `POST /debt-management/debts`

**Request Body:**
```json
{
  "categoryId": "uuid",
  "name": "Credit Card Debt",
  "description": "Monthly credit card balance",
  "type": "CREDIT_CARD",
  "status": "ACTIVE",
  "originalAmount": 50000.00,
  "currentBalance": 35000.00,
  "interestRate": 18.5,
  "startDate": "2023-01-15",
  "dueDate": "2025-01-15",
  "monthlyPayment": 2500.00,
  "creditor": "ABC Bank",
  "currency": "VND",
  "termMonths": 24,
  "totalPaid": 15000.00,
  "totalInterest": 5000.00,
  "penaltyRate": 2.0,
  "lastPaymentDate": "2024-01-15",
  "nextPaymentDate": "2024-02-15",
  "paymentMethod": "Bank Transfer",
  "paymentSchedule": {
    "frequency": "MONTHLY",
    "amount": 2500.00,
    "nextPaymentDate": "2024-02-15",
    "remainingPayments": 10
  },
  "additionalInfo": {
    "accountNumber": "1234567890",
    "contractNumber": "CC-2023-001"
  },
  "notes": "High priority debt"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Credit Card Debt",
  // ... full debt object
}
```

### 4. Update Debt
Update an existing debt.

**Endpoint:** `PUT /debt-management/debts/:id`

**Parameters:**
- `id`: Debt UUID

**Request Body:** Same as create debt (all fields optional)

**Response:**
```json
{
  "id": "uuid",
  "name": "Updated Credit Card Debt",
  // ... full debt object
}
```

### 5. Delete Debt
Soft delete a debt.

**Endpoint:** `DELETE /debt-management/debts/:id`

**Parameters:**
- `id`: Debt UUID

**Response:**
```json
{
  "message": "Debt deleted successfully"
}
```

### 6. Update Debt Balance
Update the current balance of a debt (for payment tracking).

**Endpoint:** `PUT /debt-management/debts/:id/balance`

**Parameters:**
- `id`: Debt UUID

**Request Body:**
```json
{
  "currentBalance": 32500.00,
  "lastPaymentDate": "2024-02-15",
  "paymentAmount": 2500.00,
  "notes": "Monthly payment made"
}
```

**Response:**
```json
{
  "id": "uuid",
  "currentBalance": 32500.00,
  // ... full debt object with updated values
}
```

### 7. Get Total Debt Value
Get the total value of all active debts for the user.

**Endpoint:** `GET /debt-management/summary/total-value`

**Response:**
```json
{
  "totalValue": 125000.00
}
```

### 8. Get Debt Breakdown
Get debt breakdown by category with percentages.

**Endpoint:** `GET /debt-management/summary/breakdown`

**Response:**
```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Credit Cards",
    "totalValue": 75000.00,
    "count": 3,
    "percentage": 60.0
  },
  {
    "categoryId": "uuid",
    "categoryName": "Personal Loans",
    "totalValue": 50000.00,
    "count": 1,
    "percentage": 40.0
  }
]
```

### 9. Get Debt Summary
Get comprehensive debt summary including overdue and upcoming payments.

**Endpoint:** `GET /debt-management/summary`

**Response:**
```json
{
  "totalDebt": 125000.00,
  "breakdown": [
    {
      "categoryId": "uuid",
      "categoryName": "Credit Cards",
      "totalValue": 75000.00,
      "count": 3,
      "percentage": 60.0
    }
  ],
  "overdueCount": 2,
  "overdueAmount": 15000.00,
  "upcomingPaymentsCount": 5,
  "upcomingPaymentsAmount": 12500.00
}
```

### 10. Get Overdue Debts
Get all debts that are past their due date.

**Endpoint:** `GET /debt-management/overdue`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Overdue Credit Card",
    "currentBalance": 15000.00,
    "dueDate": "2024-01-01",
    // ... full debt object
  }
]
```

### 11. Get Upcoming Payments
Get debts with upcoming payment dates.

**Endpoint:** `GET /debt-management/upcoming-payments`

**Query Parameters:**
- `days` (optional): Number of days to look ahead (default: 30)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Credit Card Payment",
    "monthlyPayment": 2500.00,
    "nextPaymentDate": "2024-02-15",
    // ... full debt object
  }
]
```

### 12. Get Debt Categories
Get all available debt categories.

**Endpoint:** `GET /debt-management/categories`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Credit Cards",
    "codeName": "credit_cards",
    "description": "Credit card debts and balances",
    "icon": "credit-card",
    "isActive": true,
    "order": 1,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
]
```

### 13. Create Debt Category
Create a new debt category (admin only).

**Endpoint:** `POST /debt-management/categories`

**Request Body:**
```json
{
  "name": "Student Loans",
  "codeName": "student_loans",
  "description": "Educational loan debts",
  "icon": "graduation-cap",
  "isActive": true,
  "order": 5
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Student Loans",
  "codeName": "student_loans",
  // ... full category object
}
```

## Debt Types
- `PERSONAL_LOAN`: Personal loans
- `CREDIT_CARD`: Credit card debts
- `MORTGAGE`: Home mortgages
- `AUTO_LOAN`: Vehicle loans
- `STUDENT_LOAN`: Educational loans
- `BUSINESS_LOAN`: Business loans
- `OTHER`: Other types of debt

## Debt Status
- `ACTIVE`: Currently active debt
- `PAID_OFF`: Fully paid debt
- `OVERDUE`: Past due date
- `DEFAULTED`: In default
- `RESTRUCTURED`: Restructured debt
- `SUSPENDED`: Temporarily suspended

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Current balance cannot be greater than original amount",
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

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Debt not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Code name already exists",
  "error": "Conflict"
}
```

## Usage Examples

### Create a Credit Card Debt
```bash
curl -X POST http://localhost:3000/debt-management/debts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "credit-card-category-uuid",
    "name": "Visa Credit Card",
    "type": "CREDIT_CARD",
    "originalAmount": 100000,
    "currentBalance": 75000,
    "interestRate": 24.0,
    "creditor": "XYZ Bank",
    "monthlyPayment": 5000,
    "dueDate": "2025-12-31"
  }'
```

### Make a Payment
```bash
curl -X PUT http://localhost:3000/debt-management/debts/<debt-id>/balance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentBalance": 70000,
    "paymentAmount": 5000,
    "lastPaymentDate": "2024-02-15",
    "notes": "Monthly payment"
  }'
```

### Get Debt Summary
```bash
curl -X GET http://localhost:3000/debt-management/summary \
  -H "Authorization: Bearer <token>"
```

## Integration with Net Worth Calculation

The debt management module integrates with the net worth calculation by:

1. **Total Debt Value**: Provides the total current balance of all active debts
2. **Debt Breakdown**: Shows debt distribution by category for analysis
3. **Real-time Updates**: Updates net worth when debt balances change
4. **Payment Tracking**: Tracks payment history for financial analysis

The total debt value is subtracted from total assets to calculate net worth:
```
Net Worth = Total Assets - Total Debts
``` 