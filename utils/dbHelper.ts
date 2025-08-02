// Function to clear all data from all databases
export const clearAllData = async () => {
  const { 
    users, students, packages, classTypes, classes, 
    bookings, transactions, locations, schedules 
  } = usePouchDB()
  
  const databases = [
    users, students, packages, classTypes, classes,
    bookings, transactions, locations, schedules
  ]
  
  try {
    for (const db of databases) {
      await db.destroy()
    }
    console.log('All data cleared successfully')
    // Reload the page to reinitialize databases
    window.location.reload()
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  }
}