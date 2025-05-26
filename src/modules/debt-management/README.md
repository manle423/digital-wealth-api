# Debt Management Module

## Overview
The Debt Management module provides comprehensive debt tracking and management functionality for the Digital Wealth API. It allows users to manage their debts, track payments, analyze debt breakdown, and integrate with net worth calculations.

## Features

### Core Functionality
- ✅ **Debt CRUD Operations**: Create, read, update, and delete debt entries
- ✅ **Payment Tracking**: Track payments and update debt balances
- ✅ **Debt Categories**: Organize debts by categories (Credit Cards, Loans, etc.)
- ✅ **Debt Analysis**: Get debt breakdown by category with percentages
- ✅ **Overdue Tracking**: Identify and track overdue debts
- ✅ **Payment Reminders**: Get upcoming payment notifications
- ✅ **Comprehensive Filtering**: Filter debts by type, status, amount, dates, etc.
- ✅ **Pagination Support**: Handle large debt lists efficiently

### Business Logic
- ✅ **Validation**: Comprehensive data validation and business rules
- ✅ **Auto Status Updates**: Automatically update debt status when paid off
- ✅ **Interest Calculation**: Track interest rates and penalty rates
- ✅ **Payment Schedules**: Support for different payment frequencies
- ✅ **Soft Delete**: Maintain data integrity with soft deletion

### Performance & Caching
- ✅ **Redis Caching**: Cache frequently accessed data
- ✅ **Optimized Queries**: Efficient database queries with proper indexing
- ✅ **Pagination**: Handle large datasets efficiently

## Module Structure

```
src/modules/debt-management/
├── controllers/
│   └── debt-management.controller.ts    # API endpoints
├── dto/
│   ├── create-debt.dto.ts              # Create debt validation
│   ├── update-debt.dto.ts              # Update debt validation
│   ├── get-debts.dto.ts                # Query parameters & balance update
│   └── create-debt-category.dto.ts     # Category creation validation
├── entities/
│   ├── user-debt.entity.ts             # User debt entity
│   └── debt-category.entity.ts         # Debt category entity
├── enums/
│   ├── debt-type.enum.ts               # Debt types (Credit Card, Loan, etc.)
│   └── debt-status.enum.ts             # Debt status (Active, Paid Off, etc.)
├── repositories/
│   ├── user-debt.repository.ts         # Debt data access layer
│   └── debt-category.repository.ts     # Category data access layer
├── services/
│   └── debt-management.service.ts      # Business logic layer
├── seeders/
│   └── debt-category.seeder.ts         # Default categories seeder
├── debt-management.module.ts           # Module configuration
└── README.md                           # This file
```

## API Endpoints

### Debt Management
- `GET /debt-management/debts` - Get user debts with filtering
- `GET /debt-management/debts/:id` - Get specific debt
- `POST /debt-management/debts` - Create new debt
- `PUT /debt-management/debts/:id` - Update debt
- `DELETE /debt-management/debts/:id` - Delete debt
- `PUT /debt-management/debts/:id/balance` - Update debt balance

### Analytics & Summary
- `GET /debt-management/summary/total-value` - Get total debt value
- `GET /debt-management/summary/breakdown` - Get debt breakdown by category
- `GET /debt-management/summary` - Get comprehensive debt summary
- `GET /debt-management/overdue` - Get overdue debts
- `GET /debt-management/upcoming-payments` - Get upcoming payments

### Categories
- `GET /debt-management/categories` - Get all debt categories
- `POST /debt-management/categories` - Create new category

## Data Models

### UserDebt Entity
```typescript
{
  id: string;                    // UUID
  userId: string;                // User ID
  categoryId: string;            // Category ID
  name: string;                  // Debt name
  description?: string;          // Optional description
  type: DebtType;               // Debt type enum
  status: DebtStatus;           // Debt status enum
  originalAmount: number;        // Original debt amount
  currentBalance: number;        // Current outstanding balance
  interestRate?: number;         // Annual interest rate (%)
  startDate?: Date;             // Debt start date
  dueDate?: Date;               // Due date
  monthlyPayment?: number;       // Monthly payment amount
  creditor?: string;            // Creditor name
  currency: string;             // Currency (default: VND)
  termMonths?: number;          // Loan term in months
  totalPaid: number;            // Total amount paid
  totalInterest: number;        // Total interest paid
  penaltyRate?: number;         // Penalty rate (%)
  lastPaymentDate?: Date;       // Last payment date
  nextPaymentDate?: Date;       // Next payment due date
  paymentMethod?: string;       // Payment method
  paymentSchedule?: object;     // Payment schedule details
  additionalInfo?: object;      // Additional information
  notes?: string;               // User notes
  isActive: boolean;            // Soft delete flag
  category: DebtCategory;       // Related category
}
```

### DebtCategory Entity
```typescript
{
  id: string;                   // UUID
  name: string;                 // Category name
  codeName: string;             // Unique code name
  description?: string;         // Category description
  icon?: string;               // Icon identifier
  isActive: boolean;           // Active status
  order: number;               // Display order
  userDebts: UserDebt[];       // Related debts
}
```

## Enums

### DebtType
- `PERSONAL_LOAN` - Personal loans
- `CREDIT_CARD` - Credit card debts
- `MORTGAGE` - Home mortgages
- `AUTO_LOAN` - Vehicle loans
- `STUDENT_LOAN` - Educational loans
- `BUSINESS_LOAN` - Business loans
- `OTHER` - Other debt types

### DebtStatus
- `ACTIVE` - Currently active debt
- `PAID_OFF` - Fully paid debt
- `OVERDUE` - Past due date
- `DEFAULTED` - In default
- `RESTRUCTURED` - Restructured debt
- `SUSPENDED` - Temporarily suspended

## Usage Examples

### Create a Credit Card Debt
```typescript
const debtData = {
  categoryId: 'credit-card-category-uuid',
  name: 'Visa Credit Card',
  type: DebtType.CREDIT_CARD,
  originalAmount: 100000,
  currentBalance: 75000,
  interestRate: 24.0,
  creditor: 'ABC Bank',
  monthlyPayment: 5000,
  dueDate: '2025-12-31'
};

const debt = await debtService.createDebt(userId, debtData);
```

### Make a Payment
```typescript
const paymentData = {
  currentBalance: 70000,
  paymentAmount: 5000,
  lastPaymentDate: '2024-02-15',
  notes: 'Monthly payment'
};

const updatedDebt = await debtService.updateDebtBalance(userId, debtId, paymentData);
```

### Get Debt Summary
```typescript
const summary = await debtService.getDebtSummary(userId);
// Returns: { totalDebt, breakdown, overdueCount, overdueAmount, ... }
```

## Integration with Net Worth

The debt management module integrates seamlessly with the net worth calculation:

1. **Total Debt Value**: Provides the sum of all active debt balances
2. **Real-time Updates**: Updates net worth when debt balances change
3. **Category Breakdown**: Enables detailed financial analysis
4. **Payment Tracking**: Tracks debt reduction over time

```typescript
// Net Worth Calculation
const totalAssets = await assetService.getTotalAssetValue(userId);
const totalDebts = await debtService.getTotalDebtValue(userId);
const netWorth = totalAssets - totalDebts;
```

## Caching Strategy

The module implements intelligent caching for performance:

- **User Debts**: Cached for 15 minutes with query-specific keys
- **Total Debt Value**: Cached for 30 minutes
- **Debt Breakdown**: Cached for 30 minutes
- **Debt Categories**: Cached for 1 hour
- **Cache Invalidation**: Automatic cache clearing on data updates

## Security & Validation

### Input Validation
- All DTOs use class-validator decorators
- Business rule validation in service layer
- Type safety with TypeScript enums

### Security Features
- JWT authentication required for all endpoints
- User isolation (users can only access their own debts)
- Soft delete for data integrity
- Input sanitization and validation

### Business Rules
- Current balance cannot exceed original amount
- Interest rate must be between 0-100%
- Due date must be after start date
- Automatic status updates when debt is paid off

## Database Schema

### Tables
- `user_debts` - Main debt records
- `debt_categories` - Debt categories

### Indexes
- `user_id` for efficient user-specific queries
- `category_id` for category-based filtering
- `due_date` for overdue debt queries
- `next_payment_date` for upcoming payments

## Error Handling

The module provides comprehensive error handling:

- **400 Bad Request**: Invalid input data or business rule violations
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Debt or category not found
- **409 Conflict**: Duplicate category code names

## Testing

### Unit Tests
- Service layer business logic
- Repository data access methods
- DTO validation rules

### Integration Tests
- API endpoint functionality
- Database operations
- Cache behavior

### Test Data
- Use the debt category seeder for consistent test data
- Mock user authentication for isolated testing

## Deployment

### Environment Variables
- Database connection settings
- Redis configuration
- JWT secret keys

### Database Migrations
- Run migrations to create debt tables
- Execute seeder to populate default categories

### Monitoring
- Log all debt operations for audit trails
- Monitor cache hit rates
- Track API response times

## Future Enhancements

### Planned Features
- [ ] Debt consolidation recommendations
- [ ] Interest calculation automation
- [ ] Payment reminder notifications
- [ ] Debt payoff projections
- [ ] Integration with banking APIs
- [ ] Debt-to-income ratio analysis
- [ ] Credit score impact tracking

### Performance Improvements
- [ ] Database query optimization
- [ ] Advanced caching strategies
- [ ] Background job processing for calculations
- [ ] Real-time debt updates via WebSocket

## Contributing

When contributing to this module:

1. Follow the existing code patterns and structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure proper error handling and validation
5. Consider performance implications of changes
6. Update the API documentation accordingly

## Support

For questions or issues related to the debt management module:

1. Check the API documentation in `/docs/debt-management-api.md`
2. Review the test files for usage examples
3. Consult the service layer for business logic details
4. Check the repository layer for data access patterns 