/**
 * CouchDB Authentication Helper for API calls
 * Handles different authentication methods for server-side API calls
 */

export interface CouchDBCredentials {
  username: string
  password: string
  baseUrl: string
}

export interface CouchDBAdminCredentials {
  adminUsername: string
  adminPassword: string
  baseUrl: string
}

// Get CouchDB credentials from environment or runtime config
export const getCouchDBCredentials = (): CouchDBAdminCredentials => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl || config.public.couchdbBaseUrl
  
  // For admin operations, use admin credentials
  const adminUsername = process.env.COUCHDB_ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.COUCHDB_ADMIN_PASSWORD || 'admin'
  
  return {
    adminUsername,
    adminPassword,
    baseUrl: baseUrl || 'http://localhost:5984'
  }
}

// Get user-specific credentials (for user operations)
export const getUserCouchDBCredentials = (username: string, password: string): CouchDBCredentials => {
  const config = useRuntimeConfig()
  const baseUrl = config.couchdbUrl || config.public.couchdbBaseUrl
  
  return {
    username,
    password,
    baseUrl: baseUrl || 'http://localhost:5984'
  }
}

// Build authenticated URL for admin operations
export const buildAdminCouchDBUrl = (path: string): { url: string; headers: Record<string, string> } => {
  const creds = getCouchDBCredentials()
  const url = new URL(path, creds.baseUrl).toString()
  
  return {
    url,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${creds.adminUsername}:${creds.adminPassword}`).toString('base64'),
      'Content-Type': 'application/json'
    }
  }
}

// Build authenticated URL for user operations
export const buildUserCouchDBUrl = (path: string, username: string, password: string): { url: string; headers: Record<string, string> } => {
  const creds = getUserCouchDBCredentials(username, password)
  const url = new URL(path, creds.baseUrl).toString()
  
  return {
    url,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/json'
    }
  }
}

// Generic CouchDB API call with admin authentication
export const couchDBAdminCall = async (path: string, options: RequestInit = {}) => {
  const { url, headers } = buildAdminCouchDBUrl(path)
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`CouchDB admin call failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response
}

// Generic CouchDB API call with user authentication
export const couchDBUserCall = async (path: string, username: string, password: string, options: RequestInit = {}) => {
  const { url, headers } = buildUserCouchDBUrl(path, username, password)
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`CouchDB user call failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response
}

// Create database with admin privileges
export const createCouchDBDatabase = async (dbName: string) => {
  return await couchDBAdminCall(`/${dbName}`, { method: 'PUT' })
}

// Delete database with admin privileges
export const deleteCouchDBDatabase = async (dbName: string) => {
  return await couchDBAdminCall(`/${dbName}`, { method: 'DELETE' })
}

// Get database info with admin privileges
export const getCouchDBDatabaseInfo = async (dbName: string) => {
  const response = await couchDBAdminCall(`/${dbName}`)
  return await response.json()
}

// Set database security with admin privileges
export const setCouchDBSecurity = async (dbName: string, security: any) => {
  return await couchDBAdminCall(`/${dbName}/_security`, {
    method: 'PUT',
    body: JSON.stringify(security)
  })
}

// Get all databases with admin privileges
export const getAllCouchDBDatabases = async () => {
  const response = await couchDBAdminCall('/_all_dbs')
  return await response.json()
}

// Check if database exists
export const databaseExists = async (dbName: string): Promise<boolean> => {
  try {
    await getCouchDBDatabaseInfo(dbName)
    return true
  } catch (error: any) {
    if (error.message.includes('404')) {
      return false
    }
    throw error
  }
}

// Create user-specific database with proper permissions
export const createUserDatabase = async (username: string) => {
  const dbName = `${username}_students` // Example database
  
  try {
    // Create database
    await createCouchDBDatabase(dbName)
    
    // Set security permissions
    await setCouchDBSecurity(dbName, {
      admins: {
        names: [username],
        roles: ['teacher']
      },
      members: {
        names: [username],
        roles: ['teacher']
      }
    })
    
    console.log(`Database ${dbName} created with permissions for user ${username}`)
    return true
  } catch (error) {
    console.error(`Failed to create database ${dbName}:`, error)
    throw error
  }
}
