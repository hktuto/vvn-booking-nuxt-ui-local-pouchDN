import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import PouchDBUpsert from 'pouchdb-upsert'

// Add plugins to PouchDB
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)

export default defineNuxtPlugin(async () => {
  // Initialize databases for each entity
  const usersDB = new PouchDB('users')
  const studentsDB = new PouchDB('students')
  const packagesDB = new PouchDB('packages')
  const studentPackagesDB = new PouchDB('student_packages')
  const classTypesDB = new PouchDB('class_types')
  const classesDB = new PouchDB('classes')
  const bookingsDB = new PouchDB('bookings')
  const transactionsDB = new PouchDB('transactions')
  const locationsDB = new PouchDB('locations')
  const schedulesDB = new PouchDB('schedules')

  // Create indexes for efficient queries
  try {
    // Users indexes
    await usersDB.createIndex({
      index: { fields: ['type', 'username', 'created_at'] }
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
      index: { fields: ['type', 'location_id'] }
    })
    await classesDB.createIndex({
      index: { fields: ['type', 'instructor'] }
    })
    await classesDB.createIndex({
      index: { fields: ['type', 'schedule_type', 'status'] }
    })
    await classesDB.createIndex({
      index: { fields: ['type', 'start_date', 'start_time'] }
    })
    await classesDB.createIndex({
      index: { fields: ['type', 'status', 'created_at'] }
    })

    // Bookings indexes
    const bookingsIndex = await bookingsDB.createIndex({
      index: { fields: ['type', 'class_id', 'class_date', 'class_time'] }
    })

    // Transactions indexes
    await transactionsDB.createIndex({
      index: { fields: ['type', 'student_id'] }
    })
    await transactionsDB.createIndex({
      index: { fields: ['type', 'transaction_type'] }
    })
    await transactionsDB.createIndex({
      index: { fields: ['type', 'created_at'] }
    })
    await transactionsDB.createIndex({
      index: { fields: ['type', 'class_id'] }
    })
    await transactionsDB.createIndex({
      index: { fields: ['type', 'package_id'] }
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

    console.log('PouchDB indexes created successfully')
    
  } catch (error) {
    console.warn('Some PouchDB indexes already exist:', error)
  }
   finally{
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
          schedules: schedulesDB
        }
      }
    }
  }

  // Note: Sample data seeding moved to user registration process

  // Provide databases globally
  
})