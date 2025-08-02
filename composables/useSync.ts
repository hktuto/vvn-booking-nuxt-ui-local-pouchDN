import { ref, onUnmounted } from 'vue'
import type { SyncConfig, UserDatabaseMapping } from '~/utils/syncHelper'
import { 
  setupUserSync, 
  stopUserSync, 
  getUserDatabaseNames,
  createUserDatabases,
  setupDatabaseSecurity
} from '~/utils/syncHelper'

export const useSync = () => {
  const isSyncing = ref(false)
  const syncStatus = ref<'idle' | 'syncing' | 'error' | 'connected'>('idle')
  const lastSyncTime = ref<Date | null>(null)
  const syncError = ref<string | null>(null)
  const syncMap = ref<Map<string, any>>(new Map())

  /**
   * Initialize sync for a user
   */
  const initializeSync = async (
    localDbs: any,
    syncConfig: SyncConfig,
    userId: string
  ) => {
    try {
      isSyncing.value = true
      syncStatus.value = 'syncing'
      syncError.value = null

      // Create user databases on CouchDB server if they don't exist
      await createUserDatabases(
        syncConfig.couchUrl,
        { username: syncConfig.username, password: syncConfig.password },
        userId
      )

      // Setup security for user databases
      await setupDatabaseSecurity(
        syncConfig.couchUrl,
        { username: syncConfig.username, password: syncConfig.password },
        userId,
        syncConfig.userRole
      )

      // Setup sync
      const newSyncMap = await setupUserSync(localDbs, syncConfig, userId)
      syncMap.value = newSyncMap

      // Setup event listeners for sync status
      newSyncMap.forEach((sync, dbName) => {
        sync.on('change', (info: any) => {
          console.log(`Sync change for ${dbName}:`, info)
          lastSyncTime.value = new Date()
        })

        sync.on('paused', () => {
          console.log(`Sync paused for ${dbName}`)
          syncStatus.value = 'idle'
        })

        sync.on('active', () => {
          console.log(`Sync active for ${dbName}`)
          syncStatus.value = 'connected'
        })

        sync.on('error', (err: any) => {
          console.error(`Sync error for ${dbName}:`, err)
          syncError.value = err.message
          syncStatus.value = 'error'
        })
      })

      syncStatus.value = 'connected'
      lastSyncTime.value = new Date()
    } catch (error: any) {
      console.error('Failed to initialize sync:', error)
      syncError.value = error.message
      syncStatus.value = 'error'
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * Stop sync for current user
   */
  const stopSync = () => {
    if (syncMap.value.size > 0) {
      stopUserSync(syncMap.value)
      syncStatus.value = 'idle'
      lastSyncTime.value = null
      syncError.value = null
    }
  }

  /**
   * Get sync statistics
   */
  const getSyncStats = () => {
    return {
      isSyncing: isSyncing.value,
      status: syncStatus.value,
      lastSyncTime: lastSyncTime.value,
      error: syncError.value,
      activeSyncs: syncMap.value.size
    }
  }

  /**
   * Manual sync trigger
   */
  const triggerSync = async () => {
    if (syncMap.value.size === 0) {
      throw new Error('No active sync sessions')
    }

    // Trigger a manual sync for all databases
    const syncPromises = Array.from(syncMap.value.values()).map(sync => {
      return new Promise((resolve, reject) => {
        sync.once('change', resolve)
        sync.once('error', reject)
        // Trigger sync by making a small change
        sync.cancel()
        sync.resume()
      })
    })

    try {
      await Promise.all(syncPromises)
      lastSyncTime.value = new Date()
      return true
    } catch (error: any) {
      syncError.value = error.message
      throw error
    }
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    stopSync()
  })

  return {
    // State
    isSyncing: readonly(isSyncing),
    syncStatus: readonly(syncStatus),
    lastSyncTime: readonly(lastSyncTime),
    syncError: readonly(syncError),

    // Methods
    initializeSync,
    stopSync,
    getSyncStats,
    triggerSync
  }
}