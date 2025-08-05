# Conditional PouchDB Initialization

This document explains how PouchDB is now conditionally initialized only when users are authenticated, allowing for public pages that don't require database access.

## Overview

Previously, PouchDB was initialized globally on every page load. Now, PouchDB is only initialized when:
1. A user is authenticated
2. A page explicitly requires database access

This approach provides several benefits:
- **Performance**: Public pages load faster without database initialization
- **Security**: Database access is restricted to authenticated users
- **Flexibility**: Easy to add public pages without database overhead

## How It Works

### 1. Plugin Level (`plugins/pouchdb.client.ts`)

The PouchDB plugin now:
- Watches for authentication state changes
- Only initializes databases when user is authenticated
- Provides async methods to access databases
- Maintains a global state to prevent re-initialization

### 2. Composable Level (`composables/usePouchDB.ts`)

The `usePouchDB` composable now provides:
- `getDatabases()`: Get all databases (requires authentication)
- `getDatabase(dbName)`: Get a specific database
- `isInitialized()`: Check if databases are initialized
- `initialize()`: Manually initialize databases
- Convenience methods: `getUsers()`, `getStudents()`, etc.

### 3. Middleware Level (`middleware/auth.ts`)

The auth middleware now:
- Checks for `auth: false` in page meta to allow public access
- Redirects authenticated users away from login/register pages
- Requires authentication for all other pages by default

## Usage Examples

### Creating Public Pages

```vue
<template>
  <div>
    <h1>Public Page</h1>
    <p>This page doesn't require authentication or database access.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false // Skip authentication for this page
})
</script>
```

### Accessing Databases in Protected Pages

```vue
<template>
  <div>
    <h1>Protected Page</h1>
    <div v-if="students">Students: {{ students.length }}</div>
  </div>
</template>

<script setup lang="ts">
const { getStudents } = usePouchDB()
const students = ref([])

onMounted(async () => {
  try {
    const studentsDB = await getStudents()
    const result = await studentsDB.find({
      selector: { type: 'student' }
    })
    students.value = result.docs
  } catch (error) {
    console.error('Error loading students:', error)
  }
})
</script>
```

### Using Composables

```typescript
// In composables/useStudents.ts
export const useStudents = () => {
  const { getStudents } = usePouchDB()
  
  const getAllStudents = async () => {
    try {
      const studentsDB = await getStudents()
      const result = await studentsDB.find({
        selector: { type: 'student' }
      })
      return result.docs
    } catch (error) {
      console.error('Error getting students:', error)
      return []
    }
  }
  
  return {
    getAllStudents
  }
}
```

## Migration Guide

### For Existing Composables

1. **Replace direct database access:**
   ```typescript
   // Old way
   const { students: studentsDB } = usePouchDB()
   
   // New way
   const { getStudents } = usePouchDB()
   const studentsDB = await getStudents()
   ```

2. **Update CRUD operations:**
   ```typescript
   // Old way
   const studentsCRUD = usePouchCRUD<UserDocument>(studentsDB)
   
   // New way
   const studentsDB = await getStudents()
   const studentsCRUD = usePouchCRUD<UserDocument>(studentsDB)
   ```

3. **Handle authentication errors:**
   ```typescript
   try {
     const studentsDB = await getStudents()
     // ... database operations
   } catch (error) {
     if (error.message.includes('authenticated')) {
       // Handle authentication error
       return []
     }
     throw error
   }
   ```

### For New Pages

1. **Public pages:** Add `auth: false` to `definePageMeta`
2. **Protected pages:** No changes needed (default behavior)
3. **Database access:** Always use async methods from `usePouchDB`

## Error Handling

The new system provides clear error messages:

- `"User must be authenticated to access PouchDB"`: User is not logged in
- `"PouchDB databases not initialized"`: Database initialization failed
- `"PouchDB not initialized. Call initialize() first."`: Database not ready

## Performance Benefits

- **Public pages**: No database initialization overhead
- **Protected pages**: Database only initialized when needed
- **Memory usage**: Reduced memory footprint for public pages
- **Load time**: Faster initial page loads

## Security Benefits

- **Access control**: Database access restricted to authenticated users
- **Data isolation**: Public pages cannot access sensitive data
- **Error prevention**: Clear error messages for unauthorized access

## Best Practices

1. **Always use try-catch** when accessing databases
2. **Check authentication state** before database operations
3. **Use loading states** while databases initialize
4. **Handle errors gracefully** with user-friendly messages
5. **Test both authenticated and unauthenticated states** 