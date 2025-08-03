# Transaction Filters Composable

This document explains how to use the `useTransactionFilters` composable for managing transaction filter state across different pages.

## Overview

The `useTransactionFilters` composable provides a centralized way to manage transaction filter parameters with the following features:

- **Default Values**: Automatically sets start and end dates to the current month
- **State Management**: Uses `useState` to persist filter state across page navigation
- **Reusable**: Can be used by any page that needs to interact with transaction filters
- **Type Safety**: Full TypeScript support with proper interfaces

## Basic Usage

```typescript
import { useTransactionFilters } from '~/composables/useTransactionFilters'

const { 
  filters, 
  hasActiveFilters, 
  clearFilters 
} = useTransactionFilters()
```

**Note**: The `filters` object is a Nuxt `useState` ref, so you can access properties directly without `.value`:
```typescript
// ✅ Correct - direct access
console.log(filters.startDate)

// ❌ Incorrect - no .value needed
console.log(filters.value.startDate)
```

## API Reference

### State

- `filters: Ref<TransactionFilters>` - The current filter state (Nuxt useState)
- `hasActiveFilters: ComputedRef<boolean>` - Whether any filters are active
- `isDefaultDateRange: ComputedRef<boolean>` - Whether using default date range

### Methods

- `setFilters(newFilters: Partial<TransactionFilters>)` - Update multiple filters at once
- `clearFilters()` - Reset all filters to default values
- `resetToDefaultDates()` - Reset only date filters to current month
- `updateDateRange(startDate: string, endDate: string)` - Update date range
- `updateTransactionType(type: string)` - Update transaction type filter
- `updateStudentId(id: string)` - Update student filter

## Filter Interface

```typescript
interface TransactionFilters {
  startDate: string    // ISO date string (YYYY-MM-DD)
  endDate: string      // ISO date string (YYYY-MM-DD)
  transactionType: string  // Transaction type or empty string
  studentId: string    // Student ID or empty string
}
```

## Examples

### Setting Filters from Another Page

```typescript
// In a student detail page
const { updateStudentId, updateDateRange } = useTransactionFilters()

// Set filters for a specific student
const viewStudentTransactions = (studentId: string) => {
  updateStudentId(studentId)
  updateDateRange('2024-01-01', '2024-12-31')
  navigateTo('/transactions')
}
```

### Clearing Filters

```typescript
const { clearFilters } = useTransactionFilters()

// Clear all filters and reset to defaults
clearFilters()
```

### Checking Filter State

```typescript
const { filters, hasActiveFilters } = useTransactionFilters()

// Check if specific filters are set
if (filters.studentId) {
  console.log('Filtering by student:', filters.studentId)
}

// Check if any filters are active
if (hasActiveFilters.value) {
  console.log('Some filters are active')
}
```

### Setting Custom Date Ranges

```typescript
const { updateDateRange } = useTransactionFilters()

// Set last week
const setLastWeek = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  
  updateDateRange(
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  )
}
```

## Integration with Transactions Page

The transactions page (`/pages/transactions.vue`) automatically uses this composable:

1. **Template Binding**: Uses `filters` directly for v-model bindings (no `.value` needed)
2. **Watchers**: Automatically reloads data when filters change
3. **Clear Function**: Uses the composable's `clearFilters` method

## Demo Page

Visit `/filter-demo` to see a demonstration of how to use the composable from other pages.

## Best Practices

1. **Always use the composable methods** instead of directly modifying the filters ref
2. **Check filter state** before making API calls
3. **Use the computed properties** for reactive UI updates
4. **Reset filters appropriately** when navigating between pages
5. **Provide user feedback** when filters are active

## Migration from Old Implementation

The old implementation used a local `reactive` object. The new composable:

- ✅ Uses Nuxt `useState` for proper state management
- ✅ Persists state across navigation
- ✅ Provides default values
- ✅ Is reusable across pages
- ✅ Has better TypeScript support
- ✅ Includes helper methods for common operations
- ✅ No `.value` needed when accessing filter properties