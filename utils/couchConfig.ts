export interface CouchDBConfig {
  url: string
  adminUsername: string
  adminPassword: string
  syncOptions: {
    live: boolean
    retry: boolean
    continuous: boolean
    timeout?: number
  }
}

// Default configuration - replace with your actual CouchDB settings
export const defaultCouchConfig: CouchDBConfig = {
  url: 'http://localhost:5984', // Replace with your CouchDB URL
  adminUsername: 'admin', // Replace with your admin username
  adminPassword: 'password', // Replace with your admin password
  syncOptions: {
    live: true,
    retry: true,
    continuous: true,
    timeout: 30000
  }
}

// Environment-based configuration
export function getCouchConfig(): CouchDBConfig {
  // In production, load from environment variables
  if (process.env.NODE_ENV === 'production') {
    return {
      url: process.env.COUCHDB_URL || 'http://localhost:5984',
      adminUsername: process.env.COUCHDB_ADMIN_USERNAME || 'admin',
      adminPassword: process.env.COUCHDB_ADMIN_PASSWORD || 'password',
      syncOptions: {
        live: true,
        retry: true,
        continuous: true,
        timeout: 30000
      }
    }
  }

  return defaultCouchConfig
}

// Validation function
export function validateCouchConfig(config: CouchDBConfig): boolean {
  return !!(
    config.url &&
    config.adminUsername &&
    config.adminPassword &&
    config.url.startsWith('http')
  )
}