# Multi-User Database Separation Guide
## PouchDB to CouchDB Sync Architecture

This guide explains how to implement secure user data separation when syncing PouchDB with CouchDB, ensuring that each teacher's data (students, classes, packages, etc.) remains completely isolated from other users.

## 🎯 Problem Statement

Your application needs to ensure that:
- Each teacher can only access their own students, classes, and data
- Student data from different teachers cannot be accessed by unauthorized users
- Location and class data is properly isolated per teacher
- Sync between local PouchDB and remote CouchDB maintains data separation

## 🏗️ Architecture Approaches

### 1. Database-Per-User Pattern (Recommended)

#### Local PouchDB Structure
```javascript
// Instead of shared databases:
❌ new PouchDB('students')
❌ new PouchDB('packages')

// Use user-specific databases:
✅ new PouchDB('teacher123_students')
✅ new PouchDB('teacher123_packages')
✅ new PouchDB('teacher123_classes')
```

#### CouchDB Remote Structure
```
CouchDB Server:
├── teacher123_students     # Teacher 123's students
├── teacher123_packages     # Teacher 123's packages
├── teacher123_classes      # Teacher 123's classes
├── teacher456_students     # Teacher 456's students (isolated)
├── teacher456_packages     # Teacher 456's packages (isolated)
└── teacher456_classes      # Teacher 456's classes (isolated)
```

### 2. Document-Level Security (Alternative)

Use a single database with document-level filtering:
```javascript
// Add user_id to every document
{
  "_id": "student_001",
  "user_id": "teacher123",  // Security boundary
  "type": "student",
  "name": "John Doe",
  // ... other fields
}
```

**⚠️ Not recommended** - More complex to implement securely and prone to data leakage.

## 🔧 Implementation Details

### Step 1: Modify PouchDB Plugin

The provided `plugins/pouchdb.client.ts` now includes:
- User context detection
- User-specific database naming
- Database switching capabilities

### Step 2: Authentication Integration

You'll need to integrate with your authentication system:

```javascript
// Example authentication composable
export const useAuth = () => {
  const currentUser = ref(null)
  
  const login = async (username: string, password: string) => {
    // Your login logic here
    const user = await authenticateUser(username, password)
    currentUser.value = user
    localStorage.setItem('currentUserId', user.id)
    
    // Reload PouchDB with new user context
    await reloadDatabases()
  }
  
  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUserId')
    // Clear local databases or redirect to login
  }
  
  return { currentUser, login, logout }
}
```

### Step 3: CouchDB Server Configuration

#### Enable Database-Per-User Plugin
```ini
# In CouchDB's local.ini
[couch_peruser]
enable = true
delete_dbs = true
```

#### Configure Database Security
```javascript
// For each user database, set security document
{
  "_id": "_security",
  "admins": {
    "names": ["teacher123"],
    "roles": []
  },
  "members": {
    "names": ["teacher123"],
    "roles": []
  }
}
```

### Step 4: Sync Configuration

```javascript
// Sync user-specific databases
const syncDatabases = (userId: string) => {
  const localStudents = new PouchDB(`${userId}_students`)
  const remoteStudents = new PouchDB(`${COUCHDB_URL}/${userId}_students`)
  
  // Bi-directional sync
  const sync = localStudents.sync(remoteStudents, {
    live: true,
    retry: true,
    continuous: true
  })
  
  sync.on('change', (info) => {
    console.log('Sync change:', info)
  }).on('error', (err) => {
    console.error('Sync error:', err)
  })
  
  return sync
}
```

## 🔐 Security Considerations

### 1. CouchDB User Authentication
```javascript
// Create CouchDB users for each teacher
const createCouchDBUser = async (teacherId: string, password: string) => {
  const userDoc = {
    "_id": `org.couchdb.user:${teacherId}`,
    "name": teacherId,
    "type": "user",
    "password": password,
    "roles": []
  }
  
  // Add to _users database
  await usersDB.put(userDoc)
}
```

### 2. Database Security Documents
```javascript
// Set security for each database
const secureDatabaseForUser = async (dbName: string, userId: string) => {
  const db = new PouchDB(`${COUCHDB_URL}/${dbName}`)
  
  await db.put({
    "_id": "_security",
    "admins": {
      "names": [userId],
      "roles": []
    },
    "members": {
      "names": [userId],
      "roles": []
    }
  })
}
```

### 3. Validation Functions
```javascript
// Add validation function to prevent cross-user access
const validationFunction = `
function(newDoc, oldDoc, userCtx) {
  if (userCtx.name !== newDoc.user_id) {
    throw({forbidden: 'User can only access their own documents'});
  }
}
`
```

## 📝 Database Naming Conventions

### Recommended Pattern
```
{userId}_{entityType}
```

Examples:
- `teacher_123_students`
- `teacher_123_packages`
- `teacher_123_classes`
- `teacher_456_students` (different teacher)

### CouchDB Considerations
- Database names must be lowercase
- Use underscores instead of hyphens
- Avoid special characters
- Max length: 255 characters

## 🚀 Migration Strategy

### From Shared to User-Specific Databases

1. **Backup Current Data**
   ```bash
   # Export existing data
   npm run backup-data
   ```

2. **Add User Context to Existing Documents**
   ```javascript
   // Add user_id to all existing documents
   const addUserContext = async () => {
     const allDocs = await sharedDB.allDocs({include_docs: true})
     
     for (const row of allDocs.rows) {
       const doc = row.doc
       doc.user_id = 'default_teacher' // Or derive from context
       await sharedDB.put(doc)
     }
   }
   ```

3. **Migrate to User-Specific Databases**
   ```javascript
   const migrateToUserDatabases = async (userId: string) => {
     const sharedStudents = new PouchDB('students')
     const userStudents = new PouchDB(`${userId}_students`)
     
     // Query documents for this user
     const result = await sharedStudents.find({
       selector: { user_id: userId }
     })
     
     // Copy to user-specific database
     for (const doc of result.docs) {
       delete doc.user_id // Remove user_id as it's implicit now
       await userStudents.put(doc)
     }
   }
   ```

## 🔄 Sync Strategy

### 1. Selective Sync
```javascript
// Sync only user's databases
const startUserSync = (userId: string) => {
  const databases = ['students', 'packages', 'classes', 'bookings']
  
  databases.forEach(dbType => {
    const localDB = new PouchDB(`${userId}_${dbType}`)
    const remoteDB = new PouchDB(`${COUCHDB_URL}/${userId}_${dbType}`)
    
    localDB.sync(remoteDB, {
      live: true,
      retry: true
    })
  })
}
```

### 2. Filtered Replication (If using shared databases)
```javascript
// Only sync documents belonging to current user
const sync = localDB.sync(remoteDB, {
  live: true,
  retry: true,
  filter: (doc) => doc.user_id === currentUserId
})
```

## 🛠️ Development Tips

### 1. Database Initialization
```javascript
const initializeUserDatabases = async (userId: string) => {
  const dbTypes = ['students', 'packages', 'classes', 'bookings']
  
  for (const dbType of dbTypes) {
    const dbName = `${userId}_${dbType}`
    const db = new PouchDB(dbName)
    
    // Create necessary indexes
    await createIndexes(db, dbType)
    
    // Seed with default data if needed
    await seedDefaultData(db, dbType)
  }
}
```

### 2. Error Handling
```javascript
const handleSyncError = (err: any) => {
  if (err.status === 401) {
    // Authentication failed
    redirectToLogin()
  } else if (err.status === 403) {
    // Forbidden - user doesn't have access
    showAccessDeniedMessage()
  } else {
    // Other sync errors
    console.error('Sync error:', err)
  }
}
```

## 📊 Performance Considerations

### 1. Index Strategy
- Create indexes per user database (not shared)
- Use compound indexes for common queries
- Monitor index performance

### 2. Sync Optimization
```javascript
// Batch sync for better performance
const syncOptions = {
  live: true,
  retry: true,
  batch_size: 100,          // Sync in batches
  batches_limit: 10,        // Limit concurrent batches
  checkpoint: 'target'      // Checkpoint on target DB
}
```

## 🧪 Testing

### Unit Tests
```javascript
describe('Multi-user database separation', () => {
  it('should isolate user data', async () => {
    const teacher1DB = new PouchDB('teacher1_students')
    const teacher2DB = new PouchDB('teacher2_students')
    
    // Add student to teacher1
    await teacher1DB.put({
      _id: 'student1',
      name: 'John Doe',
      type: 'student'
    })
    
    // Verify teacher2 cannot access teacher1's student
    const teacher2Students = await teacher2DB.allDocs()
    expect(teacher2Students.rows).toHaveLength(0)
  })
})
```

## 🚨 Security Checklist

- [ ] Each user has separate databases
- [ ] CouchDB security documents configured
- [ ] Authentication integrated
- [ ] Validation functions in place
- [ ] Database names follow conventions
- [ ] Sync permissions verified
- [ ] Cross-user access prevented
- [ ] Backup and recovery tested

## 📚 Additional Resources

- [CouchDB Database-Per-User Documentation](https://docs.couchdb.org/en/stable/config/couch-peruser.html)
- [PouchDB Authentication Guide](https://pouchdb.com/guides/authentication.html)
- [CouchDB Security Best Practices](https://docs.couchdb.org/en/stable/api/database/security.html)

## 🤝 Implementation Support

This approach ensures complete data isolation while maintaining the benefits of offline-first architecture. Each teacher's data remains completely separate, and sync only occurs between matching user-specific databases.

For production deployment, consider:
- SSL/TLS encryption for CouchDB
- Regular security audits
- Database monitoring and logging
- Backup strategies per user
- Performance monitoring