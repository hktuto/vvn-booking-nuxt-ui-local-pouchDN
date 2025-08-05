# Conditional PouchDB Initialization with Nuxt v4

This document explains how PouchDB is conditionally initialized only when users are authenticated in our Nuxt v4 application, allowing for public pages that don't require database access.

## Overview

Previously, PouchDB was initialized globally on every page load. Now, PouchDB is only initialized when:
1. A user is authenticated
2. A page explicitly requires database access

This approach provides several benefits:
- **Performance**: Public pages load faster without database overhead
- **Security**: Database access restricted to authenticated users
- **Flexibility**: Easy to add public pages without database initialization
- **User Isolation**: Each user gets their own isolated databases

## Architecture

### 1. Database State Helper (`utils/dbStateHelper.ts`)

The core of our conditional database system:

```typescript
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

// Add plugins to PouchDB
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

// Database state management with useState
export const useUserState = () => useState<PouchDB.Database | null>('userDB', () => null)
export const useStudentState = () => useState<PouchDB.Database | null>('studentDB', () => null)
// ... other database states

// Index definitions for each database
const DB_INDEXES = {
  users: [{ fields: ['type', 'username', 'created_at'] }],
  students: [
    { fields: ['type', 'name'] },
    { fields: ['type', 'phone'] },
    { fields: ['type', 'created_at'] }
  ],
  // ... other indexes
}

// Helper to get/init database with automatic index creation
export const useDatabase = (dbName: keyof typeof DB_INDEXES, requireAuth: boolean = true) => {
  const { auth } = useAuth()
  const dbState = useState<PouchDB.Database | null>(`${dbName}DB`, () => null)
  const indexesCreated = useState<boolean>(`${dbName}IndexesCreated`, () => false)
  
  const getDB = async () => {
    // Check authentication if required
    if (requireAuth && (!auth.value.isAuthenticated || !auth.value.user)) {
      throw new Error('Authentication required')
    }
    
    // For user database, use a shared database name since it's for registration
    // For other databases, use user-specific naming
    const dbNameToUse = dbName === 'users' ? 'users' : `${auth.value.user?.id || 'anonymous'}_${dbName}`
    
    // Initialize if needed
    if (!dbState.value) {
      dbState.value = new PouchDB(dbNameToUse)
    }
    
    // Create indexes if not already created
    if (!indexesCreated.value) {
      try {
        const indexes = DB_INDEXES[dbName]
        for (const index of indexes) {
          await dbState.value.createIndex({ index })
        }
        indexesCreated.value = true
      } catch (error) {
        console.warn(`Some indexes for ${dbName} might already exist:`, error)
        indexesCreated.value = true
      }
    }
    
    return dbState.value
  }
  
  return { getDB, dbState }
}

// Specific database helpers
export const useUserDB = () => useDatabase('users', false) // No auth required for user registration
export const useStudentDB = () => useDatabase('students')
export const usePackageDB = () => useDatabase('packages')
// ... other database helpers
```

### 2. Composable Pattern

Each composable follows this pattern:

```typescript
// composables/useStudents.ts
export const useStudents = () => {
  const { getDB } = useStudentDB()
  
  const loadStudents = async () => {
    try {
      const studentsDB = await getDB() // DB and indexes automatically ready
      const studentsCRUD = usePouchCRUD<StudentDocument>(studentsDB)
      const docs = await studentsCRUD.findAll('student')
      return docs.map(transformStudentDoc)
    } catch (error) {
      console.error('Error loading students:', error)
      throw error
    }
  }
  
  return { loadStudents }
}
```

### 3. Global Error Handling

Using Nuxt v4's `NuxtErrorBoundary`:

```vue
<!-- app.vue -->
<template>
  <NuxtErrorBoundary>
    <UApp>
      <NuxtPwaManifest />
      <NuxtLoadingIndicator />
      <PWAInstallButton />
      <NuxtPage />
    </UApp>
    
    <template #error="{ error, clearError }">
      <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div class="max-w-md w-full space-y-8 p-6">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              {{ error.message || 'An unexpected error occurred' }}
            </p>
            <div class="space-x-4">
              <UButton @click="clearError" color="blue">
                Try Again
              </UButton>
              <UButton @click="goHome" variant="outline">
                Go Home
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>
```

## Database Cleanup Utilities

### Overview

The application includes comprehensive database cleanup utilities to help manage IndexedDB databases during development and migration:

- **`app/utils/cleanupOldDatabases.ts`**: Core cleanup functions
- **`app/composables/useDatabaseCleanup.ts`**: Composable for easy access
- **`app/pages/cleanup.vue`**: Web interface for cleanup operations

### Available Cleanup Functions

```typescript
// Core utilities
import { 
  cleanupOldDatabases,           // Delete all databases
  cleanupSpecificDatabases,      // Delete specific databases
  cleanupOldPouchDBDatabases,    // Delete old PouchDB databases
  cleanupUserSpecificDatabases,  // Delete user-specific databases
  listAllDatabases              // List all databases
} from '~/app/utils/cleanupOldDatabases'

// Composable usage
const { 
  cleanupAll, 
  cleanupOldPouchDB, 
  cleanupCurrentUser,
  quickCleanup,
  resetApplication 
} = useDatabaseCleanup()
```

### Cleanup Scenarios

#### 1. Development Cleanup
```typescript
// Quick cleanup for development
const { quickCleanup } = useDatabaseCleanup()
await quickCleanup() // Cleans old PouchDB + user-specific databases, then logs out
```

#### 2. Migration Cleanup
```typescript
// Clean up old databases after migration
const { cleanupOldPouchDB } = useDatabaseCleanup()
await cleanupOldPouchDB() // Removes old global databases, then logs out
```

#### 3. User Data Cleanup
```typescript
// Clean up specific user's data
const { cleanupUserSpecific } = useDatabaseCleanup()
await cleanupUserSpecific('user123') // Removes user123_* databases, then logs out
```

#### 4. Nuclear Reset
```typescript
// Complete application reset
const { resetApplication } = useDatabaseCleanup()
await resetApplication() // Deletes everything, logs out user, and redirects to home
```

### Web Interface

Access the cleanup interface at `/cleanup`:

- **Database List**: View all current databases
- **Bulk Operations**: Clean up all, old PouchDB, or user-specific databases
- **Targeted Cleanup**: Delete specific databases by name
- **Safety Features**: Confirmation dialogs and warnings

### Safety Features

- **Confirmation Dialogs**: All destructive operations require confirmation
- **Warning Messages**: Clear warnings about permanent data loss
- **Error Handling**: Comprehensive error reporting
- **Audit Trail**: Console logging of all operations
- **Automatic Logout**: User is automatically logged out and redirected to home after cleanup

## Usage Examples

### Creating Public Pages (No Authentication Required)

```vue
<template>
  <div>
    <h1>Public Page</h1>
    <p>No database access needed</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false // Skip authentication for this page
})
</script>
```

### Creating Protected Pages (Authentication Required)

```vue
<template>
  <div>
    <h1>Protected Page</h1>
    <div v-if="students">Students: {{ students.length }}</div>
  </div>
</template>

<script setup lang="ts">
const { loadStudents } = useStudents()
const students = ref([])

onMounted(async () => {
  try {
    students.value = await loadStudents()
  } catch (error) {
    // Error will be caught by NuxtErrorBoundary
    throw error
  }
})
</script>
```

### Using Composables

```typescript
// In any composable
export const useMyData = () => {
  const { getDB } = useMyDB()
  
  const loadData = async () => {
    try {
      const db = await getDB() // Indexes automatically ready
      const crud = usePouchCRUD<MyDocument>(db)
      return await crud.findAll('my_type')
    } catch (error) {
      console.error('Error loading data:', error)
      return []
    }
  }
  
  return { loadData }
}
```

## Database Structure

### User-Specific Databases

Each authenticated user gets their own isolated databases:

- `{userId}_students` - Student data
- `{userId}_packages` - Package data
- `{userId}_classes` - Class data
- `{userId}_bookings` - Booking data
- `{userId}_transactions` - Transaction data
- `{userId}_locations` - Location data
- `{userId}_student_packages` - Student package relationships

### Shared Databases

- `users` - Shared user authentication database (accessible for registration)

## Authentication Flow

1. **Registration**: Uses shared `users` database (no auth required)
2. **Login**: Authenticates against shared `users` database
3. **Protected Operations**: Uses user-specific databases with auth checks

## Error Handling

The system provides clear error messages:

- `"Authentication required"`: User is not logged in
- `"PouchDB databases not initialized"`: Database initialization failed
- `"Access denied"`: User doesn't have permission

All errors are caught by `NuxtErrorBoundary` and displayed with a user-friendly interface.

## Performance Benefits

- **Public pages**: No database initialization overhead
- **Protected pages**: Database only initialized when needed
- **Memory usage**: Reduced memory footprint for public pages
- **Load time**: Faster initial page loads

## Security Benefits

- **Access control**: Database access restricted to authenticated users
- **Data isolation**: Public pages cannot access sensitive data
- **User isolation**: Each user's data is completely separated
- **Error prevention**: Clear error messages for unauthorized access

## Migration from Nuxt 3

### Key Changes

1. **Removed global PouchDB plugin**: No more `plugins/pouchdb.client.ts`
2. **Updated composables**: All use new `getDB()` pattern
3. **Added error boundaries**: Using `NuxtErrorBoundary` for global error handling
4. **User-specific databases**: Each user gets isolated data
5. **Cleanup utilities**: Tools for managing database lifecycle

### Breaking Changes

- Composable functions are now async (must await `getDB()`)
- Database access requires authentication (except user registration)
- Error handling is now global via `NuxtErrorBoundary`

## Best Practices

1. **Always use try-catch** when accessing databases
2. **Check authentication state** before database operations
3. **Use loading states** while databases initialize
4. **Handle errors gracefully** - let `NuxtErrorBoundary` handle them
5. **Test both authenticated and unauthenticated states**
6. **Use TypeScript** for type safety
7. **Regular cleanup** during development to prevent database bloat

## Troubleshooting

### Common Issues

1. **"Authentication required" error on public pages**
   - Ensure `definePageMeta({ auth: false })` is set

2. **Database not initialized**
   - Check if user is authenticated
   - Verify database helper is imported correctly

3. **Index creation errors**
   - These are usually harmless (indexes already exist)
   - Check console for warnings

4. **TypeScript errors**
   - Ensure proper typing for database operations
   - Use `as` casting when needed for PouchDB results

5. **Too many databases**
   - Use cleanup utilities to remove old databases
   - Access `/cleanup` page for web interface

### Debug Mode

Enable debug logging in `utils/dbStateHelper.ts`:

```typescript
console.log('indexesCreated.value', indexesCreated.value)
```

### Database Cleanup

Use the cleanup utilities for development and maintenance:

```typescript
// Quick development cleanup
const { quickCleanup } = useDatabaseCleanup()
await quickCleanup()

// List all databases
const { listDatabases } = useDatabaseCleanup()
const databases = await listDatabases()
console.log('Current databases:', databases)
```

## Future Enhancements

1. **Role-based access**: Different permissions per database
2. **Database cleanup**: Automatic cleanup of unused databases
3. **Offline sync**: Enhanced offline capabilities
4. **Performance monitoring**: Track database initialization times
5. **Migration tools**: Automated data migration between versions
6. **Backup/restore**: Database backup and restoration features 