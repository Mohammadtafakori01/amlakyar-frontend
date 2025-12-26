# Payment Entries Fix Guide

## Problem

The backend API was returning validation errors when updating contracts with payment entries:
```
"paymentEntries.0.property paymentType should not exist"
"paymentEntries.0.property amount should not exist"
...
```

This error indicated that the backend was receiving payment entries with a nested structure like:
```json
{
  "paymentEntries": [
    {
      "property": {
        "paymentType": "...",
        "amount": "..."
      }
    }
  ]
}
```

But the backend expects a flat structure:
```json
{
  "paymentEntries": [
    {
      "paymentType": "...",
      "amount": "..."
    }
  ]
}
```

## Solution

Fixed the issue by ensuring payment entries are always sent in a flat structure without any nested `property` key. The changes were made in two files:

### 1. `pages/dashboard/contracts/[id]/edit.tsx`

#### Changes Made:

1. **Updated `cleanPaymentEntry` function** (lines ~371-395):
   - Added defensive coding to handle nested `property` key if it exists
   - Explicitly removes any `property` key from the cleaned entry
   - Ensures only flat structure is returned

2. **Updated payment entries mapping when sending data** (lines ~1968-1975 and ~2079-2086):
   - Changed from spreading `cleaned` object to explicitly building a flat `flatEntry` object
   - Only includes fields that exist (no undefined/null values)
   - Ensures proper number conversion for amounts

3. **Updated payment entries loading from backend** (lines ~732-741):
   - Added handling for nested `property` structure when loading from backend
   - Explicitly builds flat entry objects when converting from backend response

### 2. `pages/dashboard/contracts/create.tsx`

#### Changes Made:

1. **Updated `cleanPaymentEntry` function** (lines ~1966-1990):
   - Same changes as in edit.tsx - handles nested structures and ensures flat output

2. **Updated payment entries mapping when sending data** (lines ~1649-1657 and ~1717-1725):
   - Same changes as in edit.tsx - explicitly builds flat entry objects

## Code Changes Summary

### Before:
```typescript
const cleanPaymentEntry = (entry: PaymentEntry): Partial<PaymentEntry> => {
  const cleaned: any = {
    paymentType: entry.paymentType,
    paymentMethod: entry.paymentMethod,
    amount: entry.amount,
    order: entry.order,
  };
  // ... rest of fields
  return cleaned;
};

// When sending:
paymentEntries: paymentEntries.map(entry => {
  const cleaned = cleanPaymentEntry(entry);
  return {
    ...cleaned,
    amount: parseLatinNumber(entry.amount),
    // ...
  };
})
```

### After:
```typescript
const cleanPaymentEntry = (entry: PaymentEntry | any): Partial<PaymentEntry> => {
  // Handle nested 'property' key if it exists
  const actualEntry = entry?.property ? entry.property : entry;
  
  const cleaned: any = {
    paymentType: actualEntry.paymentType,
    paymentMethod: actualEntry.paymentMethod,
    amount: actualEntry.amount,
    order: actualEntry.order,
  };
  // ... rest of fields
  delete cleaned.property; // Explicitly remove property key
  return cleaned;
};

// When sending:
paymentEntries: paymentEntries.map(entry => {
  const cleaned = cleanPaymentEntry(entry);
  const flatEntry: any = {
    paymentType: cleaned.paymentType,
    paymentMethod: cleaned.paymentMethod,
    amount: parseLatinNumber(cleaned.amount || entry.amount),
    order: cleaned.order,
  };
  // Only include fields that exist
  if (cleaned.id) flatEntry.id = cleaned.id;
  // ... other optional fields
  return flatEntry;
})
```

## Testing

After these changes, when updating a contract with payment entries:

1. **Payment entries are sent in flat structure** - No nested `property` key
2. **All required fields are included** - `paymentType`, `paymentMethod`, `amount`, `order`
3. **Optional fields are only included if they have values** - No undefined/null fields
4. **Backend validation should pass** - Payment entries match expected schema

## Expected Request Format

The payment entries should now be sent as:
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
    }
  ]
}
```

## Notes

- The fix handles both cases: when data comes from backend with nested structure and when building new entries
- All payment entry fields are explicitly mapped to ensure no unexpected keys are included
- The `cleanPaymentEntry` function now accepts `any` type to handle edge cases where data might have unexpected structure

