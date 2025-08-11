# CouchDB Sync Implementation Document

## Overview

This document outlines the implementation strategy for CouchDB synchronization in the VVN Booking App. The sync system will enable offline-first functionality with seamless data synchronization across multiple devices and users.

## Architecture

### Current State
- **Local Database**: PouchDB (IndexedDB) for offline storage
- **Data Types**: Users, Students, Packages, Classes, Bookings, Transactions, Locations
- **Authentication**: Local user management with simple password hashing

### Target State
- **Local Database**: PouchDB (IndexedDB) for offline storage
- **Remote Database**: CouchDB/Cloudant for centralized storage
- **Sync Engine**: PouchDB sync with conflict resolution
- **Authentication**: CouchDB user authentication with JWT tokens

## Data Flow

### 1. Initial Setup
```
User Registration → Create CouchDB User → Setup Local DB → Initial Sync
```

### 2. Normal Operation
```
Local Changes → Queue for Sync → Sync to Remote → Conflict Resolution → Update Local
Remote Changes → Sync to Local → Update UI → Notify User
```

### 3. Offline Operation
```
Local Changes → Store Locally → Queue for Sync → Sync When Online
```

## Database Schema

### User Document
```json
{
  "_id": "user_123",
  "type": "user",
  "username": "teacher1",
  "password_hash": "hashed_password",
  "display_name": "John Doe",
  "email": "john@example.com",
  "phone": "+85212345678",
  "country_code": "+852",
  "role": "teacher",
  "settings": {
    "language": "en",
    "timezone": "Asia/Hong_Kong",
    "currency": "HKD",
    "theme": "light"
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Student Document
```json
{
  "_id": "student_456",
  "type": "student",
  "name": "Jane Smith",
  "phone": "+85298765432",
  "email": "jane@example.com",
  "address": "123 Main St, Hong Kong",
  "notes": "Beginner student",
  "tags": ["beginner", "morning"],
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Package Document
```json
{
  "_id": "package_789",
  "type": "package",
  "name": "10-Class Package",
  "description": "10 classes for beginners",
  "price": 1000,
  "credits": 10,
  "duration_days": 90,
  "active": true,
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Student Package Document
```json
{
  "_id": "student_package_101",
  "type": "student_package",
  "student_id": "student_456",
  "package_id": "package_789",
  "purchase_date": "2024-01-01T00:00:00Z",
  "expiry_date": "2024-04-01T00:00:00Z",
  "credits_purchased": 10,
  "credits_remaining": 8,
  "price_paid": 1000,
  "status": "active",
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Class Document
```json
{
  "_id": "class_202",
  "type": "class",
  "name": "Yoga Basics",
  "description": "Basic yoga class for beginners",
  "location_id": "location_303",
  "instructor": "John Doe",
  "max_students": 15,
  "credit_cost": 1,
  "duration_minutes": 60,
  "schedule_type": "recurring",
  "weekly_days": ["monday", "wednesday", "friday"],
  "start_time": "09:00",
  "end_time": "10:00",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "active": true,
  "tags": ["yoga", "beginner"],
  "color": "#3B82F6",
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Booking Document
```json
{
  "_id": "booking_404",
  "type": "booking",
  "class_id": "class_202",
  "student_id": "student_456",
  "booking_date": "2024-01-15",
  "booking_time": "09:00",
  "status": "confirmed",
  "credits_used": 1,
  "notes": "First class",
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Transaction Document
```json
{
  "_id": "transaction_505",
  "type": "transaction",
  "student_id": "student_456",
  "transaction_type": "package_purchase",
  "package_id": "package_789",
  "amount": 1000,
  "payment_method": "cash",
  "credit_change": 10,
  "notes": "10-class package purchase",
  "transaction_date": "2024-01-01T00:00:00Z",
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Location Document
```json
{
  "_id": "location_303",
  "type": "location",
  "name": "Yoga Studio Central",
  "address": "456 Central St, Hong Kong",
  "phone": "+85223456789",
  "email": "info@yogastudio.com",
  "website": "https://yogastudio.com",
  "active": true,
  "created_by": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Sync Implementation

### 1. Database Setup

#### Local Database Configuration
```typescript
// app/composables/usePouchDB.ts
export const usePouchDB = () => {
  const localDB = new PouchDB('vvn_booking_local')
  
  // Enable sync with remote database
  const setupSync = (remoteUrl: string, username: string, password: string) => {
    const remoteDB = new PouchDB(`${remoteUrl}/vvn_booking_${username}`, {
      auth: {
        username,
        password
      }
    })
    
    return localDB.sync(remoteDB, {
      live: true,
      retry: true,
      continuous: true
    })
  }
  
  return {
    localDB,
    setupSync
  }
}
```

#### Remote Database Configuration
```typescript
// app/composables/useCouchDB.ts
export const useCouchDB = () => {
  const COUCHDB_URL = process.env.COUCHDB_URL || 'http://localhost:5984'
  
  const createUser = async (username: string, password: string, userData: any) => {
    const response = await fetch(`${COUCHDB_URL}/_users/org.couchdb.user:${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa('admin:password')}` // Replace with proper admin credentials
      },
      body: JSON.stringify({
        _id: `org.couchdb.user:${username}`,
        name: username,
        password: password,
        roles: ['teacher'],
        type: 'user',
        ...userData
      })
    })
    
    if (response.ok) {
      // Create user's private database
      await createUserDatabase(username)
      return await response.json()
    } else {
      throw new Error('Failed to create user')
    }
  }
  
  const createUserDatabase = async (username: string) => {
    const response = await fetch(`${COUCHDB_URL}/vvn_booking_${username}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa('admin:password')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to create user database')
    }
  }
  
  return {
    createUser,
    createUserDatabase
  }
}
```

### 2. Authentication Integration

#### CouchDB Authentication
```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const auth = useAuthState()
  
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${process.env.COUCHDB_URL}/_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: username,
          password: password
        })
      })
      
      if (response.ok) {
        const session = await response.json()
        
        // Store session token
        localStorage.setItem('couchdb_session', JSON.stringify(session))
        
        // Setup sync
        const { setupSync } = usePouchDB()
        const sync = setupSync(process.env.COUCHDB_URL!, username, password)
        
        // Update auth state
        auth.value.user = {
          id: session.userCtx.name,
          username: session.userCtx.name,
          roles: session.userCtx.roles
        }
        auth.value.isAuthenticated = true
        
        return { success: true, user: auth.value.user }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  return {
    auth,
    login,
    logout
  }
}
```

### 3. Conflict Resolution

#### Conflict Detection and Resolution
```typescript
// app/composables/useConflictResolution.ts
export const useConflictResolution = () => {
  const resolveConflict = async (doc: any, conflicts: any[]) => {
    // Sort conflicts by timestamp
    const sortedConflicts = conflicts.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    
    // Use the most recent version as winner
    const winner = sortedConflicts[0]
    
    // Merge any non-conflicting fields from other versions
    const merged = { ...winner }
    
    for (const conflict of sortedConflicts.slice(1)) {
      for (const [key, value] of Object.entries(conflict)) {
        if (!merged.hasOwnProperty(key) || merged[key] === undefined) {
          merged[key] = value
        }
      }
    }
    
    // Update timestamp
    merged.updated_at = new Date().toISOString()
    
    return merged
  }
  
  const handleConflict = async (err: any) => {
    if (err.name === 'conflict') {
      const doc = err.doc
      const conflicts = await getConflicts(doc._id)
      
      if (conflicts.length > 0) {
        const resolved = await resolveConflict(doc, conflicts)
        await updateDocument(doc._id, resolved)
      }
    }
  }
  
  return {
    resolveConflict,
    handleConflict
  }
}
```

### 4. Data Validation

#### Document Validation
```typescript
// app/composables/useDocumentValidation.ts
export const useDocumentValidation = () => {
  const validateDocument = (doc: any, type: string) => {
    const validators = {
      user: validateUser,
      student: validateStudent,
      package: validatePackage,
      class: validateClass,
      booking: validateBooking,
      transaction: validateTransaction,
      location: validateLocation
    }
    
    const validator = validators[type]
    if (validator) {
      return validator(doc)
    }
    
    return { valid: true }
  }
  
  const validateUser = (doc: any) => {
    const errors = []
    
    if (!doc.username) errors.push('Username is required')
    if (!doc.display_name) errors.push('Display name is required')
    if (!doc.phone) errors.push('Phone is required')
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  const validateStudent = (doc: any) => {
    const errors = []
    
    if (!doc.name) errors.push('Name is required')
    if (!doc.phone) errors.push('Phone is required')
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Add other validators...
  
  return {
    validateDocument
  }
}
```

### 5. Sync Status Management

#### Sync Status Tracking
```typescript
// app/composables/useSyncStatus.ts
export const useSyncStatus = () => {
  const syncStatus = ref({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null as Date | null,
    pendingChanges: 0,
    errors: [] as string[]
  })
  
  const updateSyncStatus = (status: Partial<typeof syncStatus.value>) => {
    syncStatus.value = { ...syncStatus.value, ...status }
  }
  
  const trackPendingChanges = () => {
    syncStatus.value.pendingChanges++
  }
  
  const clearPendingChanges = () => {
    syncStatus.value.pendingChanges = 0
  }
  
  return {
    syncStatus: readonly(syncStatus),
    updateSyncStatus,
    trackPendingChanges,
    clearPendingChanges
  }
}
```

## Implementation Steps

### Phase 1: Infrastructure Setup
1. **Set up CouchDB server** (local or cloud)
2. **Configure CouchDB authentication**
3. **Create user management system**
4. **Set up database replication**

### Phase 2: Authentication Integration
1. **Integrate CouchDB authentication**
2. **Update login/register flow**
3. **Implement session management**
4. **Add user role management**

### Phase 3: Sync Implementation
1. **Implement PouchDB sync**
2. **Add conflict resolution**
3. **Implement offline queue**
4. **Add sync status indicators**

### Phase 4: Data Migration
1. **Create migration scripts**
2. **Migrate existing data**
3. **Validate data integrity**
4. **Test sync functionality**

### Phase 5: Testing & Optimization
1. **Test offline functionality**
2. **Test conflict resolution**
3. **Performance optimization**
4. **User acceptance testing**

## Security Considerations

### 1. Authentication
- Use CouchDB's built-in authentication
- Implement JWT tokens for session management
- Secure password hashing (bcrypt)

### 2. Authorization
- User-based database access
- Document-level permissions
- Role-based access control

### 3. Data Protection
- Encrypt sensitive data
- Implement data retention policies
- Regular backup procedures

## Performance Considerations

### 1. Sync Optimization
- Batch sync operations
- Incremental sync
- Conflict resolution optimization

### 2. Database Optimization
- Proper indexing
- Document design optimization
- Query optimization

### 3. Network Optimization
- Compress sync data
- Implement retry logic
- Handle network failures gracefully

## Monitoring & Maintenance

### 1. Sync Monitoring
- Track sync status
- Monitor sync performance
- Alert on sync failures

### 2. Data Integrity
- Regular data validation
- Conflict resolution monitoring
- Data consistency checks

### 3. Performance Monitoring
- Database performance metrics
- Sync performance metrics
- User experience metrics

## Future Enhancements

### 1. Multi-User Support
- Shared databases
- User collaboration
- Real-time updates

### 2. Advanced Sync Features
- Selective sync
- Sync filters
- Sync scheduling

### 3. Integration Features
- API integrations
- Third-party services
- Export/import functionality

## Conclusion

This CouchDB sync implementation will provide a robust, scalable solution for offline-first functionality while maintaining data consistency and user experience. The phased approach ensures smooth migration and minimal disruption to existing users.

The implementation focuses on:
- **Reliability**: Robust conflict resolution and error handling
- **Performance**: Optimized sync operations and database design
- **Security**: Proper authentication and authorization
- **Scalability**: Support for multiple users and devices
- **User Experience**: Seamless offline/online transitions 