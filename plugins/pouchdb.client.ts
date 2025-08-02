import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

// Add plugins to PouchDB
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

// Helper function to get current user context
function getCurrentUserContext(): string {
  // This should be replaced with your actual authentication logic
  // For now, return a default user or get from localStorage/sessionStorage
  const currentUser = localStorage.getItem('currentUserId')
  if (!currentUser) {
    throw new Error('No authenticated user found')
  }
  return currentUser
}

// Helper function to create user-specific database name
function createUserDbName(userId: string, dbType: string): string {
  // Sanitize userId to ensure valid database names
  const sanitizedUserId = userId.replace(/[^a-z0-9_$()+-]/gi, '_').toLowerCase()
  return `${sanitizedUserId}_${dbType}`
}

export default defineNuxtPlugin(async () => {
  // Get current user context
  let currentUserId: string
  
  try {
    currentUserId = getCurrentUserContext()
  } catch (error) {
    // If no user is authenticated, use a default/guest context
    // In production, you might want to redirect to login instead
    currentUserId = 'guest'
    console.warn('No authenticated user found, using guest context')
  }

  // Initialize user-specific databases
  const usersDB = new PouchDB(createUserDbName(currentUserId, 'users'))
  const studentsDB = new PouchDB(createUserDbName(currentUserId, 'students'))
  const packagesDB = new PouchDB(createUserDbName(currentUserId, 'packages'))
  const studentPackagesDB = new PouchDB(createUserDbName(currentUserId, 'student_packages'))
  const classTypesDB = new PouchDB(createUserDbName(currentUserId, 'class_types'))
  const classesDB = new PouchDB(createUserDbName(currentUserId, 'classes'))
  const bookingsDB = new PouchDB(createUserDbName(currentUserId, 'bookings'))
  const transactionsDB = new PouchDB(createUserDbName(currentUserId, 'transactions'))
  const locationsDB = new PouchDB(createUserDbName(currentUserId, 'locations'))
  const schedulesDB = new PouchDB(createUserDbName(currentUserId, 'schedules'))

  // Create indexes for efficient queries
  try {
    // Users indexes
    await usersDB.createIndex({
      index: { fields: ['type', 'username'] }
    })
    await usersDB.createIndex({
      index: { fields: ['type', 'created_at'] }
    })

    // Students indexes
    await studentsDB.createIndex({
      index: { fields: ['type', 'name'] }
    })
    await studentsDB.createIndex({
      index: { fields: ['type', 'phone'] }
    })
    await studentsDB.createIndex({
      index: { fields: ['type', 'created_at'] }
    })

    // Packages indexes
    await packagesDB.createIndex({
      index: { fields: ['type', 'name'] }
    })
    await packagesDB.createIndex({
      index: { fields: ['type', 'active', 'created_at'] }
    })

    // Student Packages indexes
    await studentPackagesDB.createIndex({
      index: { fields: ['type', 'student_id'] }
    })
    await studentPackagesDB.createIndex({
      index: { fields: ['type', 'package_id'] }
    })
    await studentPackagesDB.createIndex({
      index: { fields: ['type', 'status', 'expiry_date'] }
    })
    

    // Classes indexes
    await classesDB.createIndex({
      index: { fields: ['type', 'class_type_id'] }
    })
    await classesDB.createIndex({
      index: { fields: ['type', 'start_time', 'created_at'] }
    })

    // Bookings indexes
    await bookingsDB.createIndex({
      index: { fields: ['type', 'student_id'] }
    })
    await bookingsDB.createIndex({
      index: { fields: ['type', 'class_id'] }
    })
    await bookingsDB.createIndex({
      index: { fields: ['type', 'status', 'created_at'] }
    })

    // Transactions indexes
    await transactionsDB.createIndex({
      index: { fields: ['type', 'student_id'] }
    })
    await transactionsDB.createIndex({
      index: { fields: ['type', 'transaction_date', 'created_at'] }
    })

    // Class Types indexes
    await classTypesDB.createIndex({
      index: { fields: ['type', 'name', 'created_at'] }
    })

    // Locations indexes
    await locationsDB.createIndex({
      index: { fields: ['type', 'name', 'created_at'] }
    })

    // Schedules indexes
    await schedulesDB.createIndex({
      index: { fields: ['type', 'class_type_id', 'created_at'] }
    })

    console.log('PouchDB indexes created successfully for user:', currentUserId)
  } catch (error) {
    console.warn('Some PouchDB indexes already exist:', error)
  }

  // Note: Sample data seeding moved to user registration process

  // Provide databases globally with user context
  return {
    provide: {
      pouchdb: {
        users: usersDB,
        students: studentsDB,
        packages: packagesDB,
        studentPackages: studentPackagesDB,
        classTypes: classTypesDB,
        classes: classesDB,
        bookings: bookingsDB,
        transactions: transactionsDB,
        locations: locationsDB,
        schedules: schedulesDB,
        // Add utility functions
        getCurrentUserId: () => currentUserId,
        createUserDbName,
        switchUser: async (newUserId: string) => {
          // Function to switch to a different user's databases
          localStorage.setItem('currentUserId', newUserId)
          // Note: This would typically require a page reload or re-initialization
          console.log('User context switched to:', newUserId)
        }
      }
    }
  }
})