/**
 * CouchDB API Wrapper
 * Provides default authentication and base URL for CouchDB API calls
 * Server-side only - for use in API routes
 */

export interface CouchDBConfig {
  baseUrl: string
  adminUsername: string
  adminPassword: string
}

export interface CouchDBRequestOptions extends RequestInit {
  useAdminAuth?: boolean
  username?: string
  password?: string
}

// Get CouchDB configuration from runtime config
const getCouchDBConfig = (): CouchDBConfig => {
  const config = useRuntimeConfig()
  return {
    baseUrl: config.couchdbUrl || 'http://localhost:5984',
    adminUsername: config.couchdbAdminUsername || 'admin',
    adminPassword: config.couchdbAdminPassword || 'admin'
  }
}

// Build authorization header
const buildAuthHeader = (username: string, password: string): string => {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
}

// Main CouchDB API wrapper function
export const couchDBRequest = async (
  path: string, 
  options: CouchDBRequestOptions = {}
): Promise<Response> => {
  const config = getCouchDBConfig()
  const { useAdminAuth = true, username, password, ...fetchOptions } = options
  
  // Determine authentication credentials
  let authUsername: string
  let authPassword: string
  
  if (useAdminAuth) {
    authUsername = config.adminUsername
    authPassword = config.adminPassword
  } else if (username && password) {
    authUsername = username
    authPassword = password
  } else {
    throw new Error('Authentication credentials required')
  }
  
  // Build full URL
  const url = new URL(path, config.baseUrl).toString()
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': buildAuthHeader(authUsername, authPassword),
    ...fetchOptions.headers
  }
  
  // Make the request
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  })
  
  // Handle errors
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`CouchDB API error: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response
}

// Convenience functions for common operations

// GET request
export const couchDBGet = async (path: string, options: CouchDBRequestOptions = {}) => {
  return await couchDBRequest(path, { method: 'GET', ...options })
}

// POST request
export const couchDBPost = async (path: string, data: any, options: CouchDBRequestOptions = {}) => {
  return await couchDBRequest(path, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  })
}

// PUT request
export const couchDBPut = async (path: string, data: any, options: CouchDBRequestOptions = {}) => {
  return await couchDBRequest(path, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  })
}

// DELETE request
export const couchDBDelete = async (path: string, options: CouchDBRequestOptions = {}) => {
  return await couchDBRequest(path, { method: 'DELETE', ...options })
}

// Database operations
export const couchDBDatabase = {
  // Create database
  create: async (dbName: string) => {
    return await couchDBPut(`/${dbName}`)
  },
  
  // Delete database
  delete: async (dbName: string) => {
    return await couchDBDelete(`/${dbName}`)
  },
  
  // Get database info
  info: async (dbName: string) => {
    const response = await couchDBGet(`/${dbName}`)
    return await response.json()
  },
  
  // Check if database exists
  exists: async (dbName: string): Promise<boolean> => {
    try {
      await couchDBDatabase.info(dbName)
      return true
    } catch (error: any) {
      if (error.message.includes('404')) {
        return false
      }
      throw error
    }
  },
  
  // Set database security
  setSecurity: async (dbName: string, security: any) => {
    return await couchDBPut(`/${dbName}/_security`, security)
  },
  
  // Get all databases
  listAll: async () => {
    const response = await couchDBGet('/_all_dbs')
    return await response.json()
  }
}

// Document operations
export const couchDBDocument = {
  // Create document
  create: async (dbName: string, doc: any) => {
    return await couchDBPost(`/${dbName}`, doc)
  },
  
  // Get document
  get: async (dbName: string, docId: string) => {
    const response = await couchDBGet(`/${dbName}/${docId}`)
    return await response.json()
  },
  
  // Update document
  update: async (dbName: string, docId: string, doc: any) => {
    return await couchDBPut(`/${dbName}/${docId}`, doc)
  },
  
  // Delete document
  delete: async (dbName: string, docId: string, rev: string) => {
    return await couchDBDelete(`/${dbName}/${docId}?rev=${rev}`)
  },
  
  // Find documents
  find: async (dbName: string, selector: any) => {
    const response = await couchDBPost(`/${dbName}/_find`, { selector })
    return await response.json()
  },
  
  // Get all documents
  getAll: async (dbName: string, includeDocs: boolean = true) => {
    const response = await couchDBGet(`/${dbName}/_all_docs?include_docs=${includeDocs}`)
    return await response.json()
  }
}

// User operations
export const couchDBUser = {
  // Create user
  create: async (username: string, password: string, roles: string[] = ['teacher']) => {
    const userDoc = {
      _id: `org.couchdb.user:${username}`,
      name: username,
      password: password,
      roles: roles,
      type: 'user'
    }
    return await couchDBPut(`/_users/org.couchdb.user:${username}`, userDoc)
  },
  
  // Get user
  get: async (username: string) => {
    const response = await couchDBGet(`/_users/org.couchdb.user:${username}`)
    return await response.json()
  },
  
  // Update user password
  updatePassword: async (username: string, newPassword: string) => {
    // First get the user to get the _rev
    const userDoc = await couchDBUser.get(username)
    const updateDoc = {
      ...userDoc,
      password: newPassword
    }
    return await couchDBPut(`/_users/org.couchdb.user:${username}`, updateDoc)
  },
  
  // Delete user
  delete: async (username: string) => {
    const userDoc = await couchDBUser.get(username)
    return await couchDBDelete(`/_users/org.couchdb.user:${username}?rev=${userDoc._rev}`)
  },
  
  // Check if user exists
  exists: async (username: string): Promise<boolean> => {
    try {
      await couchDBUser.get(username)
      return true
    } catch (error: any) {
      if (error.message.includes('404')) {
        return false
      }
      throw error
    }
  }
}

// Session operations
export const couchDBSession = {
  // Create session (login)
  create: async (username: string, password: string) => {
    const response = await couchDBPost('/_session', {
      name: username,
      password: password
    }, {
      useAdminAuth: false,
      username,
      password
    })
    return await response.json()
  },
  
  // Get session info
  get: async () => {
    const response = await couchDBGet('/_session')
    return await response.json()
  },
  
  // Delete session (logout)
  delete: async () => {
    return await couchDBDelete('/_session')
  }
}
