# CouchDB API Wrapper

This document explains how to use the CouchDB API wrapper for clean and consistent API calls.

## Overview

The CouchDB API wrapper provides a clean interface for making authenticated requests to CouchDB, eliminating the need to manually handle authentication headers and URL construction.

**Note**: This wrapper is server-side only and should be used in API routes (`server/api/`). It's located in `server/utils/` to maintain proper Nuxt 4 server/client code separation.

## Features

- ✅ **Automatic Authentication**: Handles admin and user authentication
- ✅ **Default Headers**: Sets Content-Type and Authorization headers
- ✅ **Error Handling**: Consistent error handling across all requests
- ✅ **Type Safety**: TypeScript interfaces for better development experience
- ✅ **Convenience Functions**: Pre-built functions for common operations

## Basic Usage

### 1. Import the Wrapper

```typescript
// In server/api/ files, use relative import
import { 
  couchDBRequest, 
  couchDBGet, 
  couchDBPost, 
  couchDBPut, 
  couchDBDelete,
  couchDBDatabase,
  couchDBDocument,
  couchDBUser 
} from '../../utils/couchdbApiWrapper'

// Or use dynamic import
const { couchDBDatabase, couchDBDocument, couchDBUser } = await import('../../utils/couchdbApiWrapper')
```

### 2. Make Requests

#### Basic Request with Admin Auth (Default)
```typescript
// GET request with admin authentication
const response = await couchDBGet('/_all_dbs')

// POST request with admin authentication
const response = await couchDBPost('/database_name', { 
  type: 'document',
  name: 'test' 
})
```

#### Request with User Auth
```typescript
// GET request with user authentication
const response = await couchDBGet('/user_database', {
  useAdminAuth: false,
  username: 'teacher1',
  password: 'password123'
})
```

## Convenience Functions

### Database Operations

```typescript
// Create database
await couchDBDatabase.create('my_database')

// Check if database exists
const exists = await couchDBDatabase.exists('my_database')

// Get database info
const info = await couchDBDatabase.info('my_database')

// Set database security
await couchDBDatabase.setSecurity('my_database', {
  admins: { names: ['user1'] },
  members: { names: ['user1'] }
})

// List all databases
const databases = await couchDBDatabase.listAll()
```

### Document Operations

```typescript
// Create document
const response = await couchDBDocument.create('database_name', {
  type: 'user',
  name: 'John Doe',
  email: 'john@example.com'
})

// Get document
const doc = await couchDBDocument.get('database_name', 'document_id')

// Update document
await couchDBDocument.update('database_name', 'document_id', {
  ...existingDoc,
  name: 'Updated Name'
})

// Delete document
await couchDBDocument.delete('database_name', 'document_id', 'revision_id')

// Find documents
const results = await couchDBDocument.find('database_name', {
  type: 'user',
  email: 'john@example.com'
})

// Get all documents
const allDocs = await couchDBDocument.getAll('database_name', true)
```

### User Operations

```typescript
// Create CouchDB user
await couchDBUser.create('teacher1', 'password123', ['teacher'])

// Get user
const user = await couchDBUser.get('teacher1')

// Update user password
await couchDBUser.updatePassword('teacher1', 'newpassword123')

// Delete user
await couchDBUser.delete('teacher1')

// Check if user exists
const exists = await couchDBUser.exists('teacher1')
```

### Session Operations

```typescript
// Create session (login)
const session = await couchDBSession.create('teacher1', 'password123')

// Get session info
const sessionInfo = await couchDBSession.get()

// Delete session (logout)
await couchDBSession.delete()
```

## Before vs After Examples

### Before (Manual Authentication)

```typescript
// ❌ Manual approach
const config = useRuntimeConfig()
const baseUrl = config.couchdbUrl
const adminUsername = config.couchdbAdminUsername
const adminPassword = config.couchdbAdminPassword

const response = await fetch(`${baseUrl}/database_name`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
  },
  body: JSON.stringify(document)
})

if (!response.ok) {
  throw new Error(`CouchDB error: ${response.status}`)
}

const result = await response.json()
```

### After (Using Wrapper)

```typescript
// ✅ Clean wrapper approach
const response = await couchDBDocument.create('database_name', document)
const result = await response.json()
```

## API Endpoint Examples

### Registration API (Before)
```typescript
// ❌ Old way with manual fetch
const dbCheck = await fetch(dbUrl, {
  headers: {
    'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
  }
})

const findResponse = await fetch(findUrl, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
  },
  body: JSON.stringify(selector)
})
```

### Registration API (After)
```typescript
// ✅ New way with wrapper
import { couchDBDatabase, couchDBDocument } from '../../utils/couchdbApiWrapper'

if (!(await couchDBDatabase.exists(dbName))) {
  await couchDBDatabase.create(dbName)
}

const findResult = await couchDBDocument.find(dbName, selector)
```

## Error Handling

The wrapper provides consistent error handling:

```typescript
try {
  const response = await couchDBDocument.create('database_name', doc)
  const result = await response.json()
} catch (error) {
  // Error includes status code and message
  console.error('CouchDB API error:', error.message)
  throw createError({ 
    statusCode: 500, 
    statusMessage: error.message 
  })
}
```

## Configuration

The wrapper automatically uses the configuration from `nuxt.config.ts`:

```typescript
runtimeConfig: {
  couchdbUrl: process.env.COUCHDB_URL || 'http://localhost:5984',
  couchdbAdminUsername: process.env.COUCHDB_ADMIN_USERNAME || 'admin',
  couchdbAdminPassword: process.env.COUCHDB_ADMIN_PASSWORD || 'admin',
  public: {
    couchdbBaseUrl: process.env.COUCHDB_URL || 'http://localhost:5984'
  }
}
```

## Benefits

1. **Cleaner Code**: No more repetitive authentication headers
2. **Consistent Error Handling**: Standardized error responses
3. **Type Safety**: TypeScript interfaces for better development
4. **Maintainability**: Centralized authentication logic
5. **Reusability**: Easy to use across all API endpoints
6. **Security**: Proper credential management

## Migration Guide

To migrate existing API endpoints:

1. **Import the wrapper** at the top of your API file
2. **Replace manual fetch calls** with wrapper functions
3. **Remove manual authentication** code
4. **Update error handling** to use wrapper errors
5. **Test thoroughly** to ensure functionality

This wrapper makes CouchDB API calls much cleaner and more maintainable!
