/**
 * Cleanup utility to delete all old IndexedDB databases
 * This script helps clean up old database instances during development
 * or when migrating to the new user-specific database system
 */

// Helper function to logout user and redirect
const logoutAndRedirect = async () => {
  try {
    // Clear any cached state
    const { auth } = useAuth()
    if (auth.value.isAuthenticated) {
      await auth.value.logout()
    }
    
    // Clear any remaining state
    await navigateTo('/')
  } catch (error) {
    console.error('Error during logout:', error)
    // Force redirect even if logout fails
    await navigateTo('/')
  }
}

export const cleanupOldDatabases = async () => {
  console.log('🧹 Starting database cleanup...')
  
  try {
    // Get all database names from IndexedDB
    const databases = await window.indexedDB.databases()
    
    if (!databases || databases.length === 0) {
      console.log('✅ No databases found to clean up')
      return { success: true, deletedCount: 0 }
    }
    
    console.log(`📋 Found ${databases.length} databases to check:`)
    databases.forEach(db => {
      console.log(`  - ${db.name} (version: ${db.version})`)
    })
    
    let deletedCount = 0
    const errors: string[] = []
    
    // Delete each database
    for (const dbInfo of databases) {
      try {
        console.log(`🗑️  Deleting database: ${dbInfo.name}`)
        
        // Close any existing connections
        const request = window.indexedDB.open(dbInfo.name)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          db.close()
          
          // Delete the database
          const deleteRequest = window.indexedDB.deleteDatabase(dbInfo.name)
          deleteRequest.onsuccess = () => {
            console.log(`✅ Successfully deleted: ${dbInfo.name}`)
            deletedCount++
          }
          deleteRequest.onerror = () => {
            const error = `Failed to delete ${dbInfo.name}`
            console.error(`❌ ${error}`)
            errors.push(error)
          }
        }
        request.onerror = () => {
          const error = `Failed to open ${dbInfo.name} for deletion`
          console.error(`❌ ${error}`)
          errors.push(error)
        }
        
        // Wait a bit for the deletion to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        const errorMsg = `Error deleting ${dbInfo.name}: ${error}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }
    
    // Wait for all deletions to complete
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} databases`)
    
    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} errors occurred during cleanup:`)
      errors.forEach(error => console.warn(`  - ${error}`))
    }
    
    // Logout user and redirect after cleanup
    await logoutAndRedirect()
    
    return {
      success: errors.length === 0,
      deletedCount,
      errors
    }
    
  } catch (error) {
    console.error('❌ Failed to cleanup databases:', error)
    return {
      success: false,
      deletedCount: 0,
      errors: [error.toString()]
    }
  }
}

/**
 * Cleanup specific database types
 * Useful for cleaning up only certain types of databases
 */
export const cleanupSpecificDatabases = async (databaseNames: string[]) => {
  console.log(`🧹 Starting cleanup of specific databases: ${databaseNames.join(', ')}`)
  
  try {
    const databases = await window.indexedDB.databases()
    const targetDatabases = databases.filter(db => 
      databaseNames.some(name => db.name.includes(name))
    )
    
    if (targetDatabases.length === 0) {
      console.log('✅ No matching databases found')
      return { success: true, deletedCount: 0 }
    }
    
    console.log(`📋 Found ${targetDatabases.length} matching databases:`)
    targetDatabases.forEach(db => {
      console.log(`  - ${db.name}`)
    })
    
    let deletedCount = 0
    const errors: string[] = []
    
    for (const dbInfo of targetDatabases) {
      try {
        console.log(`🗑️  Deleting: ${dbInfo.name}`)
        
        const deleteRequest = window.indexedDB.deleteDatabase(dbInfo.name)
        deleteRequest.onsuccess = () => {
          console.log(`✅ Deleted: ${dbInfo.name}`)
          deletedCount++
        }
        deleteRequest.onerror = () => {
          const error = `Failed to delete ${dbInfo.name}`
          console.error(`❌ ${error}`)
          errors.push(error)
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        const errorMsg = `Error deleting ${dbInfo.name}: ${error}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`🎉 Specific cleanup completed! Deleted ${deletedCount} databases`)
    
    // Logout user and redirect after cleanup
    await logoutAndRedirect()
    
    return {
      success: errors.length === 0,
      deletedCount,
      errors
    }
    
  } catch (error) {
    console.error('❌ Failed to cleanup specific databases:', error)
    return {
      success: false,
      deletedCount: 0,
      errors: [error.toString()]
    }
  }
}

/**
 * Cleanup old PouchDB databases specifically
 * Deletes databases that match the old naming pattern
 */
export const cleanupOldPouchDBDatabases = async () => {
  console.log('🧹 Cleaning up old PouchDB databases...')
  
  const oldDatabaseNames = [
    'users',
    'students', 
    'packages',
    'student_packages',
    'class_types',
    'classes',
    'bookings',
    'transactions',
    'locations',
    'schedules'
  ]
  
  return await cleanupSpecificDatabases(oldDatabaseNames)
}

/**
 * Cleanup user-specific databases
 * Deletes databases that match the new user-specific naming pattern
 */
export const cleanupUserSpecificDatabases = async (userId?: string) => {
  console.log('🧹 Cleaning up user-specific databases...')
  
  if (userId) {
    // Clean up specific user's databases
    const userDatabaseNames = [
      `${userId}_students`,
      `${userId}_packages`,
      `${userId}_student_packages`,
      `${userId}_class_types`,
      `${userId}_classes`,
      `${userId}_bookings`,
      `${userId}_transactions`,
      `${userId}_locations`
    ]
    
    return await cleanupSpecificDatabases(userDatabaseNames)
  } else {
    // Clean up all user-specific databases (any database with underscore)
    try {
      const databases = await window.indexedDB.databases()
      const userDatabases = databases.filter(db => 
        db.name.includes('_') && !db.name.startsWith('_')
      )
      
      if (userDatabases.length === 0) {
        console.log('✅ No user-specific databases found')
        return { success: true, deletedCount: 0 }
      }
      
      console.log(`📋 Found ${userDatabases.length} user-specific databases:`)
      userDatabases.forEach(db => {
        console.log(`  - ${db.name}`)
      })
      
      let deletedCount = 0
      const errors: string[] = []
      
      for (const dbInfo of userDatabases) {
        try {
          console.log(`🗑️  Deleting: ${dbInfo.name}`)
          
          const deleteRequest = window.indexedDB.deleteDatabase(dbInfo.name)
          deleteRequest.onsuccess = () => {
            console.log(`✅ Deleted: ${dbInfo.name}`)
            deletedCount++
          }
          deleteRequest.onerror = () => {
            const error = `Failed to delete ${dbInfo.name}`
            console.error(`❌ ${error}`)
            errors.push(error)
          }
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          const errorMsg = `Error deleting ${dbInfo.name}: ${error}`
          console.error(`❌ ${errorMsg}`)
          errors.push(errorMsg)
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`🎉 User-specific cleanup completed! Deleted ${deletedCount} databases`)
      
      // Logout user and redirect after cleanup
      await logoutAndRedirect()
      
      return {
        success: errors.length === 0,
        deletedCount,
        errors
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup user-specific databases:', error)
      return {
        success: false,
        deletedCount: 0,
        errors: [error.toString()]
      }
    }
  }
}

/**
 * List all databases without deleting them
 * Useful for inspection before cleanup
 */
export const listAllDatabases = async () => {
  console.log('📋 Listing all IndexedDB databases...')
  
  try {
    const databases = await window.indexedDB.databases()
    
    if (!databases || databases.length === 0) {
      console.log('✅ No databases found')
      return []
    }
    
    console.log(`📋 Found ${databases.length} databases:`)
    databases.forEach((db, index) => {
      console.log(`  ${index + 1}. ${db.name} (version: ${db.version})`)
    })
    
    return databases
    
  } catch (error) {
    console.error('❌ Failed to list databases:', error)
    return []
  }
}

// Export all cleanup functions
export default {
  cleanupOldDatabases,
  cleanupSpecificDatabases,
  cleanupOldPouchDBDatabases,
  cleanupUserSpecificDatabases,
  listAllDatabases
} 