import type { StudentDocument, PackageDocument } from '~/composables/usePouchDB'
import { createBaseDocument } from '~/composables/usePouchDB'
import type PouchDB from 'pouchdb'

// Sample students data
export const sampleStudents: Omit<StudentDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>[] = [
  {
    type: 'student',
    name: 'John Doe',
    phone: '1234567890',
    country_code: '+1',
    email: 'john@example.com',
    address: '123 Main St, City',
    credits: 5,
    notes: 'Regular student, prefers morning classes',
    registered: true,
    password_hash: ''
  },
  {
    type: 'student',
    name: 'Jane Smith',
    phone: '1234567891',
    country_code: '+1',
    email: 'jane@example.com',
    address: '456 Oak Ave, City',
    credits: 3,
    notes: 'New student, very enthusiastic',
    registered: false,
    password_hash: ''
  },
  {
    type: 'student',
    name: 'Mike Johnson',
    phone: '1234567892',
    country_code: '+1',
    email: 'mike@example.com',
    address: '789 Pine St, City',
    credits: 8,
    notes: 'Advanced student, helps with demonstrations',
    registered: true,
    password_hash: ''
  }
]

// Sample packages data
export const samplePackages: Omit<PackageDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>[] = [
  {
    type: 'package',
    name: 'Basic Package',
    description: '5 classes valid for 30 days - Perfect for beginners',
    price: 100,
    credits: 5,
    duration_days: 30,
    active: true
  },
  {
    type: 'package',
    name: 'Premium Package',
    description: '10 classes valid for 60 days - Great value for regular students',
    price: 180,
    credits: 10,
    duration_days: 60,
    active: true
  },
  {
    type: 'package',
    name: 'Ultimate Package',
    description: '20 classes valid for 90 days - Best for dedicated practitioners',
    price: 320,
    credits: 20,
    duration_days: 90,
    active: true
  },
  {
    type: 'package',
    name: 'Trial Package',
    description: '2 classes valid for 14 days - Try before you commit',
    price: 50,
    credits: 2,
    duration_days: 14,
    active: false
  }
]

// Function to seed sample data
export const seedSampleData = async (studentsDB: PouchDB.Database, packagesDB: PouchDB.Database) => {
  try {
    // Check if data already exists
    const existingStudents = await studentsDB.find({ selector: { type: 'student' } })
    const existingPackages = await packagesDB.find({ selector: { type: 'package' } })
    
    // Only seed if databases are empty
    if (existingStudents.docs.length === 0) {
      console.log('Seeding sample students...')
      for (const studentData of sampleStudents) {
        const doc = {
          ...createBaseDocument('student'),
          ...studentData
        }
        await studentsDB.put(doc)
      }
      console.log(`Seeded ${sampleStudents.length} students`)
    }
    
    if (existingPackages.docs.length === 0) {
      console.log('Seeding sample packages...')
      for (const packageData of samplePackages) {
        const doc = {
          ...createBaseDocument('package'),
          ...packageData
        }
        await packagesDB.put(doc)
      }
      console.log(`Seeded ${samplePackages.length} packages`)
    }
    
  } catch (error) {
    console.error('Error seeding sample data:', error)
  }
}