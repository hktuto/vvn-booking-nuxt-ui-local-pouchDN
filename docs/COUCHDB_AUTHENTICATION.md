# CouchDB Authentication Guide

This document explains how to handle authentication when making API calls to CouchDB from your Nuxt server.

## Authentication Methods

### 1. Admin Authentication (Recommended for Server APIs)

For server-side operations like creating users, databases, and managing permissions:

```typescript
// Environment Variables (add to .env)
COUCHDB_ADMIN_USERNAME=admin
COUCHDB_ADMIN_PASSWORD=your_admin_password

// In your API endpoint
const adminUsername = process.env.COUCHDB_ADMIN_USERNAME || 'admin'
const adminPassword = process.env.COUCHDB_ADMIN_PASSWORD || 'admin'

const response = await fetch(couchdbUrl, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
  },
  body: JSON.stringify(data)
})
```

### 2. User Authentication (For User-Specific Operations)

For operations that should be performed as the user:

```typescript
// In your API endpoint
const response = await fetch(couchdbUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  }
})
```

## Environment Setup

### 1. Add Environment Variables

Create or update your `.env` file:

```bash
# CouchDB Connection
COUCHDB_URL=http://localhost:5984

# CouchDB Admin Credentials (for server operations)
COUCHDB_ADMIN_USERNAME=admin
COUCHDB_ADMIN_PASSWORD=your_secure_admin_password
```

### 2. Update nuxt.config.ts

```typescript
export default defineNuxtConfig({
  // ... other config
  runtimeConfig: {
    couchdbUrl: process.env.COUCHDB_URL || 'http://localhost:5984',
    couchdbAdminUsername: process.env.COUCHDB_ADMIN_USERNAME || 'admin',
    couchdbAdminPassword: process.env.COUCHDB_ADMIN_PASSWORD || 'admin',
    public: {
      couchdbBaseUrl: process.env.COUCHDB_URL || 'http://localhost:5984'
    }
  }
})
```

## API Endpoint Examples

### 1. Create User Account (Admin Auth)

```typescript
// server/api/auth/register.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl
  
  // Get admin credentials
  const adminUsername = config.couchdbAdminUsername
  const adminPassword = config.couchdbAdminPassword
  
  // Create CouchDB user account
  const couchUserUrl = new URL('/_users/org.couchdb.user:' + encodeURIComponent(username), baseUrl).toString()
  const couchUserDoc = {
    _id: `org.couchdb.user:${username}`,
    name: username,
    password: password,
    roles: ['teacher'],
    type: 'user'
  }
  
  const response = await fetch(couchUserUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    },
    body: JSON.stringify(couchUserDoc)
  })
  
  if (!response.ok) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create CouchDB user' })
  }
})
```

### 2. Create Database (Admin Auth)

```typescript
// server/api/admin/create-database.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl
  const adminUsername = config.couchdbAdminUsername
  const adminPassword = config.couchdbAdminPassword
  
  const body = await readBody(event)
  const { dbName } = body
  
  const response = await fetch(`${baseUrl}/${dbName}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    }
  })
  
  if (!response.ok) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create database' })
  }
  
  return { success: true }
})
```

### 3. User-Specific Operation (User Auth)

```typescript
// server/api/user/profile.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl
  
  // Get user credentials from request (you'll need to implement this)
  const { username, password } = await getUserCredentials(event)
  
  const response = await fetch(`${baseUrl}/_users/org.couchdb.user:${username}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
    }
  })
  
  if (!response.ok) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  return await response.json()
})
```

## Security Best Practices

### 1. Use Environment Variables

Never hardcode credentials in your code:

```typescript
// ❌ Bad
const adminPassword = 'admin123'

// ✅ Good
const adminPassword = process.env.COUCHDB_ADMIN_PASSWORD
```

### 2. Validate User Permissions

Always check if a user has permission to access a resource:

```typescript
// Check if user can access their own database
const userDbName = `${username}_students`
const dbUrl = `${baseUrl}/${userDbName}`

const response = await fetch(dbUrl, {
  headers: {
    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
  }
})

if (!response.ok) {
  throw createError({ statusCode: 403, statusMessage: 'Access denied' })
}
```

### 3. Use HTTPS in Production

Always use HTTPS for CouchDB in production:

```bash
# Production environment
COUCHDB_URL=https://your-couchdb-server.com
```

## Common Operations

### 1. Create Database with Permissions

```typescript
const createUserDatabase = async (username: string) => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl
  const adminUsername = config.couchdbAdminUsername
  const adminPassword = config.couchdbAdminPassword
  
  const dbName = `${username}_students`
  
  // Create database
  await fetch(`${baseUrl}/${dbName}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    }
  })
  
  // Set permissions
  await fetch(`${baseUrl}/${dbName}/_security`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      admins: { names: [username] },
      members: { names: [username] }
    })
  })
}
```

### 2. List All Databases (Admin Only)

```typescript
const getAllDatabases = async () => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl
  const adminUsername = config.couchdbAdminUsername
  const adminPassword = config.couchdbAdminPassword
  
  const response = await fetch(`${baseUrl}/_all_dbs`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    }
  })
  
  return await response.json()
}
```

## Troubleshooting

### 1. Authentication Errors

If you get 401 errors:

```bash
# Check if admin credentials are correct
curl -u admin:password http://localhost:5984/_users/_all_docs

# Check if user exists
curl -u admin:password http://localhost:5984/_users/org.couchdb.user:username
```

### 2. Permission Errors

If you get 403 errors:

```bash
# Check database permissions
curl -u admin:password http://localhost:5984/database_name/_security
```

### 3. Connection Errors

If you can't connect to CouchDB:

```bash
# Check if CouchDB is running
curl http://localhost:5984

# Check CouchDB logs
tail -f /var/log/couchdb/couch.log
```

## Summary

- **Admin Authentication**: Use for server operations (create users, databases, set permissions)
- **User Authentication**: Use for user-specific operations
- **Environment Variables**: Store credentials securely
- **HTTPS**: Use in production
- **Permissions**: Always validate user access rights

This setup ensures secure and proper authentication for all CouchDB operations in your application.
