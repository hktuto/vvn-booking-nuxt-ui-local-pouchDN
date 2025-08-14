# Nuxt 4 File Structure Guide

This document explains the proper file structure for Nuxt 4 applications, particularly the separation between server and client code.

## Directory Structure

```
project-root/
├── app/                    # Client-side code (browser)
│   ├── components/         # Vue components
│   ├── composables/        # Client-side composables
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── utils/             # Client-side utilities
│   └── assets/            # Static assets
├── server/                # Server-side code (Node.js)
│   ├── api/               # API routes
│   └── utils/             # Server-side utilities
├── docs/                  # Documentation
├── i18n/                  # Internationalization
├── public/                # Public static files
└── nuxt.config.ts         # Nuxt configuration
```

## Code Separation Rules

### Server-Side Code (`server/`)

**Location**: `server/` directory
**Environment**: Node.js runtime
**Use Cases**: API routes, database operations, authentication, file system access

#### Examples:
```typescript
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  // Server-side code here
  const body = await readBody(event)
  // Database operations, authentication, etc.
})

// server/utils/couchdbApiWrapper.ts
export const couchDBRequest = async (path: string) => {
  // Server-side utility functions
}
```

### Client-Side Code (`app/`)

**Location**: `app/` directory  
**Environment**: Browser runtime
**Use Cases**: UI components, client-side logic, user interactions

#### Examples:
```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  // Client-side composable
  const user = ref(null)
  // Browser APIs, localStorage, etc.
}

// app/components/UserProfile.vue
<template>
  <!-- Vue component template -->
</template>
```

## Import Paths

### Server-to-Server Imports

```typescript
// In server/api/auth/register.post.ts
import { couchDBDatabase } from '../../utils/couchdbApiWrapper'

// Or using dynamic import
const { couchDBDatabase } = await import('../../utils/couchdbApiWrapper')
```

### Client-to-Client Imports

```typescript
// In app/pages/login.vue
import { useAuth } from '~/composables/useAuth'

// Or using auto-imports (recommended)
const { auth } = useAuth()
```

### Client-to-Server Communication

```typescript
// In app/composables/useAuth.ts
const login = async (username: string, password: string) => {
  // Call server API
  const response = await $fetch('/api/auth/login', {
    method: 'POST',
    body: { username, password }
  })
}
```

## Best Practices

### 1. Keep Server and Client Code Separate

```typescript
// ✅ Good: Server utility in server/utils/
// server/utils/couchdbApiWrapper.ts
export const couchDBRequest = async () => {
  // Server-side only code
}

// ✅ Good: Client utility in app/utils/
// app/utils/dateHelper.ts
export const formatDate = (date: Date) => {
  // Client-side only code
}
```

### 2. Use Proper Import Paths

```typescript
// ✅ Good: Relative imports for server code
import { helper } from '../../utils/helper'

// ✅ Good: Auto-imports for client code
const { helper } = useHelper()
```

### 3. Environment-Specific Code

```typescript
// ✅ Good: Server-side environment variables
// server/api/config.ts
const config = useRuntimeConfig()
const dbUrl = config.couchdbUrl // Server-only

// ✅ Good: Client-side environment variables
// app/composables/useConfig.ts
const config = useRuntimeConfig()
const publicUrl = config.public.apiUrl // Client-accessible
```

### 4. API Route Structure

```
server/api/
├── auth/
│   ├── login.post.ts
│   ├── register.post.ts
│   └── logout.post.ts
├── users/
│   ├── [id].get.ts
│   └── [id].put.ts
└── admin/
    └── settings.get.ts
```

## Common Mistakes to Avoid

### ❌ Don't: Mix Server and Client Code

```typescript
// ❌ Bad: Server code in app/utils/
// app/utils/database.ts
export const connectToDatabase = async () => {
  // This should be in server/utils/
}
```

### ❌ Don't: Use Client APIs in Server Code

```typescript
// ❌ Bad: Browser APIs in server code
// server/api/user.get.ts
export default defineEventHandler(() => {
  localStorage.getItem('user') // Won't work on server
})
```

### ❌ Don't: Use Server APIs in Client Code

```typescript
// ❌ Bad: Direct database access in client
// app/composables/useDatabase.ts
export const useDatabase = () => {
  const db = new PouchDB('users') // Should use API calls instead
}
```

## Migration from Nuxt 3

If migrating from Nuxt 3:

1. **Move server utilities** from `utils/` to `server/utils/`
2. **Update import paths** to use relative imports for server code
3. **Keep client utilities** in `app/utils/`
4. **Use auto-imports** for client-side composables

## Benefits of Proper Structure

1. **Clear Separation**: Easy to understand what runs where
2. **Better Performance**: Server code doesn't bundle to client
3. **Security**: Sensitive operations stay on server
4. **Maintainability**: Easier to debug and maintain
5. **Type Safety**: Better TypeScript support
6. **Tree Shaking**: Unused code can be eliminated

This structure ensures your Nuxt 4 application follows best practices and maintains clear boundaries between server and client code.
