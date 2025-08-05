import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

// Add plugins to PouchDB
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
// Database state management with useState
export const useUserState = () => useState<PouchDB.Database | null>('userDB', () => null)
export const useStudentState = () => useState<PouchDB.Database | null>('studentDB', () => null)
export const usePackageState = () => useState<PouchDB.Database | null>('packageDB', () => null)
export const useStudentPackageState = () => useState<PouchDB.Database | null>('studentPackageDB', () => null)
export const useClassTypeState = () => useState<PouchDB.Database | null>('classTypeDB', () => null)
export const useClassState = () => useState<PouchDB.Database | null>('classDB', () => null)
export const useBookingState = () => useState<PouchDB.Database | null>('bookingDB', () => null)
export const useTransactionState = () => useState<PouchDB.Database | null>('transactionDB', () => null)
export const useLocationState = () => useState<PouchDB.Database | null>('locationDB', () => null)

// Index definitions for each database
const DB_INDEXES = {
  users: [
    { fields: ['type', 'username', 'created_at'] }
  ],
  students: [
    { fields: ['type', 'name'] },
    { fields: ['type', 'phone'] },
    { fields: ['type', 'created_at'] }
  ],
  packages: [
    { fields: ['type', 'name'] },
    { fields: ['type', 'active', 'created_at'] }
  ],
  student_packages: [
    { fields: ['type', 'student_id'] },
    { fields: ['type', 'package_id'] },
    { fields: ['type', 'status', 'expiry_date'] }
  ],
  class_types: [
    { fields: ['type', 'name', 'created_at'] }
  ],
  classes: [
    { fields: ['type', 'location_id'] },
    { fields: ['type', 'instructor'] },
    { fields: ['type', 'schedule_type', 'status'] },
    { fields: ['type', 'start_date', 'start_time'] },
    { fields: ['type', 'status', 'created_at'] }
  ],
  bookings: [
    { fields: ['type', 'class_id', 'class_date', 'class_time'] }
  ],
  transactions: [
    { fields: ['type', 'student_id'] },
    { fields: ['type', 'transaction_type'] },
    { fields: ['type', 'created_at'] },
    { fields: ['type', 'class_id'] },
    { fields: ['type', 'package_id'] }
  ],
  locations: [
    { fields: ['type', 'name', 'created_at'] }
  ]
}

// Helper to get/init database with automatic index creation
export const useDatabase = (dbName: keyof typeof DB_INDEXES, requireAuth: boolean = true) => {
  const { auth } = useAuth()
  const dbState = useState<PouchDB.Database | null>(`${dbName}DB`, () => null)
  const indexesCreated = useState<boolean>(`${dbName}IndexesCreated`, () => false)
  
  const getDB = async () => {
    // Check authentication if required
    if (requireAuth && (!auth.value.isAuthenticated || !auth.value.user)) {
      throw new Error('Authentication required')
    }
    
    // For user database, use a shared database name since it's for registration
    // For other databases, use user-specific naming
    const dbNameToUse = dbName === 'users' ? 'users' : `${auth.value.user?.id || 'anonymous'}_${dbName}`
    
    // Initialize if needed
    if (!dbState.value) {
      dbState.value = new PouchDB(dbNameToUse)
      
    }
    
    // Create indexes if not already created
    if (!indexesCreated.value) {
      try {
        const indexes = DB_INDEXES[dbName]
        for (const index of indexes) {
          await dbState.value.createIndex({ index })
        }
        indexesCreated.value = true
        console.log('indexesCreated.value', indexesCreated.value)
      } catch (error) {
        // Index might already exist, that's okay
        console.warn(`Some indexes for ${dbName} might already exist:`, error)
        indexesCreated.value = true
      }
    }
    return dbState.value
  }
  
  return { getDB, dbState }
}

// Specific database helpers
export const useUserDB = () => useDatabase('users', false) // No auth required for user registration
export const useStudentDB = () => useDatabase('students')
export const usePackageDB = () => useDatabase('packages')
export const useStudentPackageDB = () => useDatabase('student_packages')
export const useClassTypeDB = () => useDatabase('class_types')
export const useClassDB = () => useDatabase('classes')
export const useBookingDB = () => useDatabase('bookings')
export const useTransactionDB = () => useDatabase('transactions')
export const useLocationDB = () => useDatabase('locations') 