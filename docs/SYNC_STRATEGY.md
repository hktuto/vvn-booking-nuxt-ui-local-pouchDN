# CouchDB Sync Strategy with User Isolation

This document explains how to implement CouchDB synchronization while maintaining complete user data isolation.

## Overview

The sync strategy uses a **Database-per-User** pattern to ensure that each user's data is completely isolated from other users. This provides the highest level of security and data privacy.

## Architecture

### 1. Database Naming Convention

Each user gets their own set of databases on the CouchDB server:

```
user_{userId}_students
user_{userId}_packages
user_{userId}_classes
user_{userId}_bookings
user_{userId}_transactions
user_{userId}_locations
user_{userId}_schedules
user_{userId}_class_types
user_{userId}_student_packages
```

### 2. Security Model

- **Admin Access**: Only the application admin can create/delete user databases
- **User Access**: Each user can only access their own databases
- **CouchDB Security Documents**: Each database has a security document that restricts access

### 3. Sync Process

1. **User Login**: When a user logs in, their databases are created on CouchDB (if they don't exist)
2. **Security Setup**: Security documents are configured to restrict access to only that user
3. **Sync Initialization**: Bidirectional sync is established between local PouchDB and remote CouchDB
4. **Continuous Sync**: Changes are synced in real-time between local and remote databases

## Implementation

### Files Created

1. **`utils/syncHelper.ts`**: Core sync functionality
2. **`composables/useSync.ts`**: Vue composable for managing sync
3. **`utils/authSync.ts`**: Integration with authentication
4. **`utils/couchConfig.ts`**: Configuration management

### Usage Example

```typescript
// In your login component
import { handleUserLogin } from '~/utils/authSync'
import { getCouchConfig } from '~/utils/couchConfig'

const login = async () => {
  const config = getCouchConfig()
  
  try {
    const user = await handleUserLogin(username, password, config)
    // User is now logged in and sync is active
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// In your logout component
import { handleUserLogout } from '~/utils/authSync'

const logout = () => {
  handleUserLogout()
  // Sync is stopped and user is logged out
}
```

## Security Benefits

### 1. Complete Data Isolation
- Each user's data is stored in separate databases
- No possibility of cross-user data access
- Database names include user ID for clear separation

### 2. CouchDB Security Documents
```json
{
  "admins": {
    "names": ["admin"],
    "roles": []
  },
  "members": {
    "names": ["user123"],
    "roles": []
  }
}
```

### 3. Authentication Integration
- Sync only starts after successful user authentication
- User credentials are used for CouchDB authentication
- Sync stops immediately on logout

## Alternative Strategies

### 1. Single Database with User Filtering
```typescript
// Less secure - not recommended
const remoteDb = new PouchDB('shared_database')
const sync = localDb.sync(remoteDb, {
  filter: (doc) => doc.userId === currentUserId
})
```

### 2. Database-per-Role
```typescript
// Moderate security
const dbName = `role_${userRole}_${locationId}`
```

### 3. Database-per-Location
```typescript
// Location-based isolation
const dbName = `location_${locationId}_${entityType}`
```

## CouchDB Server Setup

### 1. Create Admin User
```bash
curl -X PUT http://localhost:5984/_users/org.couchdb.user:admin \
  -H "Content-Type: application/json" \
  -d '{"name": "admin", "password": "password", "roles": ["_admin"]}'
```

### 2. Enable CORS (if needed)
```bash
curl -X PUT http://localhost:5984/_node/_local/_config/httpd/enable_cors \
  -d '"true"'
```

### 3. Configure CORS Origins
```bash
curl -X PUT http://localhost:5984/_node/_local/_config/cors/origins \
  -d '"http://localhost:3000,https://yourdomain.com"'
```

## Environment Variables

Set these in your production environment:

```bash
COUCHDB_URL=http://your-couchdb-server:5984
COUCHDB_ADMIN_USERNAME=admin
COUCHDB_ADMIN_PASSWORD=your-secure-password
```

## Monitoring and Debugging

### Sync Status
```typescript
import { getUserSyncStatus } from '~/utils/authSync'

const status = getUserSyncStatus()
console.log('Sync Status:', status)
// Output: { isSyncing: false, status: 'connected', lastSyncTime: Date, error: null, activeSyncs: 9 }
```

### Manual Sync Trigger
```typescript
import { useSync } from '~/composables/useSync'

const { triggerSync } = useSync()
await triggerSync() // Manually trigger sync
```

## Best Practices

1. **Always validate user authentication before starting sync**
2. **Use environment variables for sensitive configuration**
3. **Implement proper error handling for sync failures**
4. **Monitor sync status and provide user feedback**
5. **Test sync functionality thoroughly before production**
6. **Backup CouchDB data regularly**
7. **Use HTTPS in production for secure communication**

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured on CouchDB
2. **Authentication Failures**: Verify user credentials and CouchDB user setup
3. **Sync Conflicts**: Implement conflict resolution strategies
4. **Network Issues**: Implement retry logic and offline handling

### Debug Commands

```bash
# Check CouchDB status
curl http://localhost:5984/

# List all databases
curl http://localhost:5984/_all_dbs

# Check specific user database
curl http://localhost:5984/user_123_students
```