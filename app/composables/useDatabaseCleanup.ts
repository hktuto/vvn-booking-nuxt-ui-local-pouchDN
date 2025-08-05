/**
 * Composable for database cleanup utilities
 * Provides easy access to cleanup functions throughout the application
 */

export const useDatabaseCleanup = () => {
  const loading = ref(false)
  const result = ref<any>(null)

  // Import cleanup utilities
  const cleanupUtils = ref<any>(null)

  // Lazy load cleanup utilities
  const loadCleanupUtils = async () => {
    if (!cleanupUtils.value) {
      cleanupUtils.value = await import('~/app/utils/cleanupOldDatabases')
    }
    return cleanupUtils.value
  }

  // List all databases
  const listDatabases = async () => {
    const utils = await loadCleanupUtils()
    return await utils.listAllDatabases()
  }

  // Cleanup all databases
  const cleanupAll = async () => {
    loading.value = true
    try {
      const utils = await loadCleanupUtils()
      result.value = await utils.cleanupOldDatabases()
      return result.value
    } catch (error) {
      console.error('Failed to cleanup all databases:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cleanup old PouchDB databases
  const cleanupOldPouchDB = async () => {
    loading.value = true
    try {
      const utils = await loadCleanupUtils()
      result.value = await utils.cleanupOldPouchDBDatabases()
      return result.value
    } catch (error) {
      console.error('Failed to cleanup old PouchDB databases:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cleanup user-specific databases
  const cleanupUserSpecific = async (userId?: string) => {
    loading.value = true
    try {
      const utils = await loadCleanupUtils()
      result.value = await utils.cleanupUserSpecificDatabases(userId)
      return result.value
    } catch (error) {
      console.error('Failed to cleanup user-specific databases:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cleanup specific databases
  const cleanupSpecific = async (databaseNames: string[]) => {
    loading.value = true
    try {
      const utils = await loadCleanupUtils()
      result.value = await utils.cleanupSpecificDatabases(databaseNames)
      return result.value
    } catch (error) {
      console.error('Failed to cleanup specific databases:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cleanup current user's databases
  const cleanupCurrentUser = async () => {
    const { auth } = useAuth()
    if (!auth.value.user?.id) {
      throw new Error('No authenticated user found')
    }
    return await cleanupUserSpecific(auth.value.user.id)
  }

  // Quick cleanup for development
  const quickCleanup = async () => {
    console.log('🧹 Quick cleanup for development...')
    
    // First cleanup old PouchDB databases
    await cleanupOldPouchDB()
    
    // Then cleanup any user-specific databases
    await cleanupUserSpecific()
    
    console.log('✅ Quick cleanup completed')
    // Note: User will be logged out and redirected automatically
  }

  // Manual logout and redirect helper
  const logoutAndRedirect = async () => {
    try {
      const { auth } = useAuth()
      if (auth.value.isAuthenticated) {
        await auth.value.logout()
      }
      await navigateTo('/')
    } catch (error) {
      console.error('Error during logout:', error)
      await navigateTo('/')
    }
  }

  // Reset application data (nuclear option)
  const resetApplication = async () => {
    if (!confirm('This will delete ALL application data. Are you sure?')) {
      return
    }
    
    console.log('🚨 Nuclear reset - deleting all databases...')
    const result = await cleanupAll()
    
    // Note: User will be logged out and redirected automatically by cleanupAll()
    return result
  }

  return {
    // State
    loading: readonly(loading),
    result: readonly(result),
    
    // Actions
    listDatabases,
    cleanupAll,
    cleanupOldPouchDB,
    cleanupUserSpecific,
    cleanupSpecific,
    cleanupCurrentUser,
    quickCleanup,
    resetApplication,
    logoutAndRedirect
  }
} 