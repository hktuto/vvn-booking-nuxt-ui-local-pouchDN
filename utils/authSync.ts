import { useSync } from '~/composables/useSync'
import { usePouchDB } from '~/composables/usePouchDB'
import type { UserDocument } from '~/composables/usePouchDB'

export interface CouchDBSyncConfig {
  couchUrl: string
  adminUsername: string
  adminPassword: string
}

/**
 * Initialize sync when user logs in
 */
export async function initializeUserSync(
  user: UserDocument,
  syncConfig: CouchDBSyncConfig
) {
  const { initializeSync } = useSync()
  const { $pouchdb } = useNuxtApp()

  if (!$pouchdb) {
    throw new Error('PouchDB not initialized')
  }

  // Create sync configuration for this user
  const userSyncConfig = {
    couchUrl: syncConfig.couchUrl,
    username: user.username, // User's CouchDB username
    password: user.password_hash, // In production, use proper auth
    userRole: user.role
  }

  // Initialize sync for all user databases
  await initializeSync($pouchdb, userSyncConfig, user._id)
}

/**
 * Stop sync when user logs out
 */
export function stopUserSync() {
  const { stopSync } = useSync()
  stopSync()
}

/**
 * Check if user has active sync
 */
export function getUserSyncStatus() {
  const { getSyncStats } = useSync()
  return getSyncStats()
}

/**
 * Example usage in a login component or middleware
 */
export async function handleUserLogin(
  username: string,
  password: string,
  syncConfig: CouchDBSyncConfig
) {
  const { users: usersDB } = usePouchDB()
  
  try {
    // Find user in local database
    const result = await usersDB.find({
      selector: {
        type: 'user',
        username: username
      }
    })

    if (result.docs.length === 0) {
      throw new Error('User not found')
    }

    const user = result.docs[0] as UserDocument
    
    // In production, verify password hash here
    // if (!verifyPassword(password, user.password_hash)) {
    //   throw new Error('Invalid password')
    // }

    // Initialize sync for this user
    await initializeUserSync(user, syncConfig)

    return user
  } catch (error: any) {
    console.error('Login failed:', error)
    throw error
  }
}

/**
 * Example usage in a logout function
 */
export function handleUserLogout() {
  stopUserSync()
  // Additional logout logic here
}