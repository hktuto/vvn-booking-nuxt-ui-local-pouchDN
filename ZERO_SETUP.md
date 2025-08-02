# Zero Sync Setup Guide

This document explains how to set up Zero sync for the Student Management App.

## Current Status

✅ **Completed:**
- Zero client library installed (`@rocicorp/zero`)
- Database schema defined in `server/schema.ts`
- Zero plugin and composables created
- Mock data setup for development

⏳ **Next Steps:**
- Set up PostgreSQL database with logical replication
- Deploy Zero cache server
- Configure authentication
- Connect real database

## Development Mode

Currently, the app runs in development mode with:
- Mock data in composables (`useStudents`, `usePackages`)
- Memory-only storage (`kvStore: 'mem'`)
- Mock authentication

## Production Setup

To set up Zero for production, you'll need:

### 1. PostgreSQL Database

```sql
-- Enable logical replication
ALTER SYSTEM SET wal_level = 'logical';

-- Create the database
CREATE DATABASE student_management;
```

### 2. Zero Cache Server

Install Zero cache server:
```bash
npm install -g @rocicorp/zero-cache
```

Or use Docker:
```bash
docker run -p 4848:4848 rocicorp/zero:latest
```

### 3. Environment Variables

Create `.env` file:
```env
# Database connection
ZERO_UPSTREAM_DB=postgresql://username:password@localhost:5432/student_management

# Zero cache server
ZERO_CACHE_URL=ws://localhost:4848

# Authentication (using your auth provider)
ZERO_AUTH_SECRET=your-jwt-secret
# OR
ZERO_AUTH_JWKS_URL=https://your-auth-provider.com/.well-known/jwks.json
```

### 4. Update Zero Client

Update `plugins/zero.client.ts`:

```typescript
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  const zero = new Zero({
    userID: 'teacher-1', // Get from authentication
    server: config.public.zeroCacheUrl,
    schema,
    kvStore: 'idb', // Use IndexedDB for persistence
    auth: async () => {
      // Return actual JWT token from your auth system
      const { data } = await $fetch('/api/auth/token')
      return data.token
    }
  })

  return {
    provide: {
      zero
    }
  }
})
```

### 5. Update Composables

Replace mock data with real Zero queries:

```typescript
// In useStudents.ts
export const useStudents = () => {
  const zero = useZero()
  
  // Real Zero query instead of mock data
  const students = computed(() => {
    try {
      return zero.query.students.toArray()
    } catch {
      return []
    }
  })
  
  const addStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    const newStudent = {
      ...studentData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await zero.mutate.students.insert(newStudent)
    return newStudent
  }
  
  // ... other methods
}
```

## Database Schema

The schema in `server/schema.ts` defines:

- **Users**: Authentication and roles
- **Students**: Student profiles and credit tracking  
- **Packages**: Credit packages for sale
- **ClassTypes**: Different types of classes
- **Locations**: Class locations
- **Schedules**: Recurring class schedules
- **Classes**: Individual class instances
- **Bookings**: Student bookings for classes
- **Transactions**: Payment and credit transactions

## Permissions

The schema includes role-based permissions:
- **Teachers**: Full access to all data
- **Students**: Can view their own data and book classes
- Public data is readable by all authenticated users

## Next Development Steps

1. **Authentication System**: Implement proper login/logout
2. **Real Database**: Set up PostgreSQL with Zero cache
3. **Class Management**: Build schedule and booking interfaces
4. **Payment Tracking**: Implement transaction management
5. **Reporting**: Add analytics and reports

## Resources

- [Zero Documentation](https://zero.rocicorp.dev/docs)
- [Zero Cache Setup](https://zero.rocicorp.dev/docs/cache-setup)
- [Zero with Vue](https://zero.rocicorp.dev/docs/vue)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)