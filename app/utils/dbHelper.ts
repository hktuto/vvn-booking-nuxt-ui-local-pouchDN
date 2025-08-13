// Function to clear all data from all databases
export const clearAllData = async () => {
  const { auth } = useAuth()
  console.log('auth', auth.value)
  if (!auth.value.isAuthenticated || !auth.value.user) {
    throw new Error('Authentication required to clear data')
  }
  
  const userId = auth.value.user.id
  
  // Get all database helpers
  const { getDB: getUserDB } = useUserDB()
  const { getDB: getStudentDB } = useStudentDB()
  const { getDB: getPackageDB } = usePackageDB()
  const { getDB: getStudentPackageDB } = useStudentPackageDB()
  const { getDB: getClassTypeDB } = useClassTypeDB()
  const { getDB: getClassDB } = useClassDB()
  const { getDB: getBookingDB } = useBookingDB()
  const { getDB: getTransactionDB } = useTransactionDB()
  const { getDB: getLocationDB } = useLocationDB()
  
  const databaseHelpers = [
    { name: 'users', getDB: getUserDB },
    { name: 'students', getDB: getStudentDB },
    { name: 'packages', getDB: getPackageDB },
    { name: 'student_packages', getDB: getStudentPackageDB },
    { name: 'class_types', getDB: getClassTypeDB },
    { name: 'classes', getDB: getClassDB },
    { name: 'bookings', getDB: getBookingDB },
    { name: 'transactions', getDB: getTransactionDB },
    { name: 'locations', getDB: getLocationDB }
  ]
  
  try {
    for (const { name, getDB } of databaseHelpers) {
      try {
        const db = await getDB()
        await db.destroy()
        console.log(`✅ Destroyed database: ${name}`)
      } catch (error) {
        console.warn(`⚠️  Could not destroy database ${name}:`, error)
      }
    }
    // Sweep year-sharded DBs for bookings and transactions
    try {
      if (process.client && (window.indexedDB as any)?.databases) {
        const dbs: Array<{ name?: string }> = await (window.indexedDB as any).databases()
        const prefixes = [`${userId}_bookings_`, `${userId}_transactions_`]
        for (const dbInfo of dbs) {
          const name = dbInfo.name || ''
          if (prefixes.some(p => name.startsWith(p))) {
            console.log(`🗑️  Deleting shard database: ${name}`)
            const delReq = window.indexedDB.deleteDatabase(name)
            delReq.onsuccess = () => console.log(`✅ Deleted shard database: ${name}`)
            delReq.onerror = () => console.warn(`⚠️  Failed to delete shard database: ${name}`)
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        }
      }
    } catch (e) {
      console.warn('Failed to sweep shard databases:', e)
    }
    
    console.log('All data cleared successfully')
    // Reload the page to reinitialize databases
    window.location.reload()
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  }
}