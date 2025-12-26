# API Requirements: Payment Entries

## Overview

This document specifies the requirements for the Payment Entries API endpoint for contract updates. The API must accept payment entries in a flat structure without any nested keys.

## Endpoint

**PUT** `/api/contracts/{contractId}`

## Request Body Structure

### Payment Entries Format

Payment entries must be sent as an array of flat objects. Each entry should be a direct property of the payment entry object, not nested under any other key.

#### ✅ Correct Format

```json
{
  "paymentEntries": [
    {
      "id": "c7a61835-2b16-4350-a784-1961fb692ad5",
      "paymentType": "MORTGAGE",
      "paymentMethod": "CASH",
      "amount": 49999986,
      "order": 0
    },
    {
      "paymentType": "RENTAL_PAYMENT",
      "paymentMethod": "CHECK",
      "amount": 7000000,
      "order": 1,
      "checkNumber": "3434",
      "bankName": "343434",
      "branchName": "343434"
    },
    {
      "paymentType": "RENTAL_PAYMENT",
      "paymentMethod": "CHECK",
      "amount": 7000000,
      "order": 2,
      "description": "6767",
      "checkNumber": "6767",
      "bankName": "6767",
      "branchName": "6767"
    },
    {
      "paymentType": "MORTGAGE",
      "paymentMethod": "CARD_TO_CARD",
      "amount": 14,
      "order": 3,
      "cardNumber": "6221"
    }
  ]
}
```

#### ❌ Incorrect Format (Nested Structure)

The following structure should be **rejected** by validation:

```json
{
  "paymentEntries": [
    {
      "property": {
        "paymentType": "MORTGAGE",
        "paymentMethod": "CASH",
        "amount": 49999986,
        "order": 0
      }
    }
  ]
}
```

## Validation Requirements

### 1. Structure Validation

- **REQUIRED**: Payment entries must be an array
- **REQUIRED**: Each payment entry must be a flat object (no nested keys)
- **REJECT**: Any payment entry containing a `property` key should be rejected
- **REJECT**: Any nested structure within payment entries should be rejected

### 2. Required Fields

Each payment entry must include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentType` | enum | ✅ Yes | One of: `MORTGAGE`, `RENTAL_PAYMENT`, `DOWN_PAYMENT`, `BILL_OF_SALE` |
| `paymentMethod` | enum | ✅ Yes | One of: `CASH`, `CHECK`, `CARD_TO_CARD`, `SHABA`, `ACCOUNT_TO_ACCOUNT` |
| `amount` | number | ✅ Yes | Payment amount in Rials (must be > 0) |
| `order` | number | ✅ Yes | Order/sequence of the payment entry (0-based index) |

### 3. Optional Fields

The following fields are optional and should only be validated if present:

| Field | Type | Required | Condition |
|-------|------|----------|-----------|
| `id` | string (UUID) | ❌ No | Existing payment entry ID (for updates) |
| `description` | string | ❌ No | Payment description |
| `checkNumber` | string | ❌ No | Required if `paymentMethod` is `CHECK` |
| `bankName` | string | ❌ No | Required if `paymentMethod` is `CHECK` or `ACCOUNT_TO_ACCOUNT` |
| `branchName` | string | ❌ No | Optional for `CHECK` or `ACCOUNT_TO_ACCOUNT` |
| `accountNumber` | string | ❌ No | Required if `paymentMethod` is `ACCOUNT_TO_ACCOUNT` |
| `shabaNumber` | string | ❌ No | Required if `paymentMethod` is `SHABA` |
| `cardNumber` | string | ❌ No | Required if `paymentMethod` is `CARD_TO_CARD` |

### 4. Field-Specific Validation Rules

#### Payment Method: CHECK
- `checkNumber` is required
- `bankName` is required
- `branchName` is optional but recommended

#### Payment Method: CARD_TO_CARD
- `cardNumber` is required
- Should be validated as a valid card number format

#### Payment Method: SHABA
- `shabaNumber` is required
- Should be validated as a valid SHABA number format (24 digits, starts with IR)

#### Payment Method: ACCOUNT_TO_ACCOUNT
- `accountNumber` is required
- `bankName` is required
- `branchName` is optional

#### Payment Method: CASH
- No additional fields required

### 5. Business Logic Validation

- **Order Validation**: `order` field should be sequential (0, 1, 2, ...) without gaps
- **Amount Validation**: `amount` must be a positive number
- **Type Validation**: `paymentType` must match the contract type:
  - For `RENTAL` contracts: `MORTGAGE`, `RENTAL_PAYMENT`
  - For `PURCHASE` contracts: `DOWN_PAYMENT`, `BILL_OF_SALE`

## Error Response Format

### Current Error (Should be Fixed)

The current error message format is confusing:
```
"paymentEntries.0.property paymentType should not exist"
```

This suggests the validation is checking for a nested `property` key, which is correct, but the error message format needs improvement.

### Recommended Error Format

When validation fails, return clear error messages:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "paymentEntries[0]: Payment entry must be a flat object. Nested 'property' key is not allowed.",
    "paymentEntries[1].checkNumber: Check number is required when paymentMethod is CHECK",
    "paymentEntries[2].amount: Amount must be a positive number"
  ]
}
```

## Validation Schema (Example - NestJS/class-validator)

```typescript
class PaymentEntryDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.CHECK)
  @IsString()
  @IsNotEmpty()
  checkNumber?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.CHECK || o.paymentMethod === PaymentMethod.ACCOUNT_TO_ACCOUNT)
  @IsString()
  @IsNotEmpty()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.ACCOUNT_TO_ACCOUNT)
  @IsString()
  @IsNotEmpty()
  accountNumber?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.SHABA)
  @IsString()
  @Matches(/^IR\d{24}$/, { message: 'SHABA number must be 24 digits starting with IR' })
  shabaNumber?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.CARD_TO_CARD)
  @IsString()
  @IsNotEmpty()
  cardNumber?: string;

  // Explicitly reject nested 'property' key
  @ValidateIf(() => false)
  @IsNever()
  property?: never; // This ensures 'property' key is always rejected
}
```

## Implementation Checklist

- [ ] Update validation to explicitly reject nested `property` key in payment entries
- [ ] Ensure payment entries are validated as flat objects
- [ ] Add conditional validation for payment method-specific fields
- [ ] Update error messages to be more descriptive
- [ ] Add validation for `order` field sequence
- [ ] Add validation for `paymentType` matching contract type
- [ ] Test with frontend to ensure compatibility
- [ ] Update API documentation

## Testing Scenarios

### Test Case 1: Valid Payment Entries
**Input**: Flat payment entries structure
**Expected**: ✅ Success (200 OK)

### Test Case 2: Nested Property Key
**Input**: Payment entry with nested `property` key
**Expected**: ❌ Error: "Payment entry must be a flat object. Nested 'property' key is not allowed."

### Test Case 3: Missing Required Fields
**Input**: Payment entry without `paymentType`
**Expected**: ❌ Error: "paymentType is required"

### Test Case 4: Missing Conditional Fields
**Input**: Payment entry with `paymentMethod: CHECK` but no `checkNumber`
**Expected**: ❌ Error: "checkNumber is required when paymentMethod is CHECK"

### Test Case 5: Invalid Amount
**Input**: Payment entry with `amount: -100`
**Expected**: ❌ Error: "Amount must be a positive number"

### Test Case 6: Invalid Order Sequence
**Input**: Payment entries with orders [0, 2, 3] (missing 1)
**Expected**: ⚠️ Warning or auto-correction (depending on business logic)

## Migration Notes

If existing data in the database has payment entries with nested structures, a migration script should be created to flatten them:

```sql
-- Example migration (adjust based on actual schema)
UPDATE payment_entries 
SET data = jsonb_build_object(
  'paymentType', data->'property'->>'paymentType',
  'paymentMethod', data->'property'->>'paymentMethod',
  'amount', (data->'property'->>'amount')::numeric,
  'order', (data->'property'->>'order')::integer
)
WHERE data ? 'property';
```

## API Documentation Update

Update the OpenAPI/Swagger documentation to reflect:

1. Payment entries must be flat objects
2. No nested structures are allowed
3. Conditional field requirements based on `paymentMethod`
4. Clear examples of valid and invalid formats

## Contact

For questions or clarifications, refer to:
- Frontend implementation: `pages/dashboard/contracts/[id]/edit.tsx`
- Frontend fix guide: `PAYMENT_ENTRIES_FIX_GUIDE.md`

