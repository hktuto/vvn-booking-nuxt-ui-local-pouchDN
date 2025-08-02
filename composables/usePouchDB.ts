import PouchDB from 'pouchdb'

// Document types with PouchDB metadata
export interface PouchDocument {
  _id: string
  _rev?: string
  type: string
  created_at: string
  updated_at: string
}

export interface StudentDocument extends PouchDocument {
  type: 'student'
  name: string
  phone: string
  country_code: string
  email: string
  address: string
  credits: number
  notes: string
  password_hash: string
}

export interface PackageDocument extends PouchDocument {
  type: 'package'
  name: string
  description: string
  price: number
  credits: number
  duration_days: number
  active: boolean
  is_custom?: boolean
}

export interface ClassTypeDocument extends PouchDocument {
  type: 'class_type'
  name: string
  description: string
  duration_minutes: number
  active: boolean
}

export interface ClassDocument extends PouchDocument {
  type: 'class'
  name: string
  description: string
  class_type_id: string
  location_id: string
  start_time: string
  end_time: string
  max_students: number
  price: number
  active: boolean
}

export interface BookingDocument extends PouchDocument {
  type: 'booking'
  student_id: string
  class_id: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  credits_used: number
  notes: string
}

export interface StudentPackageDocument extends PouchDocument {
  type: 'student_package'
  student_id: string
  package_id: string
  credits_purchased: number
  credits_remaining: number
  purchase_date: string
  expiry_date: string
  status: 'active' | 'expired' | 'completed'
  notes: string
  custom_price?: number
}

export interface TransactionDocument extends PouchDocument {
  type: 'transaction'
  student_id: string
  amount: number
  transaction_type: 'payment' | 'refund' | 'credit_purchase' | 'credit_usage'
  payment_method: 'cash' | 'bank_transfer' | 'credit'
  transaction_date: string
  description: string
}

export interface LocationDocument extends PouchDocument {
  type: 'location'
  name: string
  address: string
  active: boolean
}

export interface ScheduleDocument extends PouchDocument {
  type: 'schedule'
  class_type_id: string
  location_id: string
  day_of_week: number
  start_time: string
  end_time: string
  max_students: number
  active: boolean
}

export interface UserDocument extends PouchDocument {
  type: 'user'
  username: string
  password_hash: string
  email?: string
  phone: string
  country_code: string
  role: 'teacher' | 'admin'
  display_name: string
  settings: {
    language: 'en' | 'zh-Hant'
    timezone: string
    currency: string
  }
}

// Helper function to generate IDs
export function generateId(type: string): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to create base document
export function createBaseDocument(type: string): Pick<PouchDocument, '_id' | 'type' | 'created_at' | 'updated_at'> {
  const now = new Date().toISOString()
  return {
    _id: generateId(type),
    type,
    created_at: now,
    updated_at: now
  }
}

// Helper function to update document timestamps
export function updateDocumentTimestamp<T extends PouchDocument>(doc: T): T {
  return {
    ...doc,
    updated_at: new Date().toISOString()
  }
}

export const usePouchDB = () => {
  const { $pouchdb } = useNuxtApp()
  
  if (!$pouchdb) {
    throw new Error('PouchDB not initialized. Make sure the PouchDB plugin is loaded.')
  }
  
  return {
    users: $pouchdb.users,
    students: $pouchdb.students,
    packages: $pouchdb.packages,
    studentPackages: $pouchdb.studentPackages,
    classTypes: $pouchdb.classTypes,
    classes: $pouchdb.classes,
    bookings: $pouchdb.bookings,
    transactions: $pouchdb.transactions,
    locations: $pouchdb.locations,
    schedules: $pouchdb.schedules
  }
}



// Generic CRUD operations
export const usePouchCRUD = <T extends PouchDocument>(db: PouchDB.Database) => {
  
  const create = async (data: Omit<T, '_id' | '_rev' | 'created_at' | 'updated_at'>): Promise<T> => {
    const doc = {
      ...createBaseDocument(data.type),
      ...data
    } as T

    const result = await db.put(doc)
    return {
      ...doc,
      _rev: result.rev
    }
  }

  const findById = async (id: string): Promise<T | null> => {
    try {
      const doc = await db.get(id) as T
      return doc
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  const findAll = async (type: string): Promise<T[]> => {
    const result = await db.find({
      selector: { type },
    })
    return result.docs as T[]
  }

  const update = async (id: string, updates: Partial<Omit<T, '_id' | 'type' | 'created_at'>>): Promise<T> => {
    const doc = await db.get(id) as T
    const updatedDoc = updateDocumentTimestamp({
      ...doc,
      ...updates
    })
    
    const result = await db.put(updatedDoc)
    return {
      ...updatedDoc,
      _rev: result.rev
    }
  }

  const remove = async (id: string): Promise<boolean> => {
    try {
      const doc = await db.get(id)
      await db.remove(doc)
      return true
    } catch (error: any) {
      if (error.status === 404) {
        return false
      }
      throw error
    }
  }

  const findWhere = async (selector: any): Promise<T[]> => {
    const result = await db.find({
      selector,
    })
    return result.docs as T[]
  }

  return {
    create,
    findById,
    findAll,
    update,
    remove,
    findWhere
  }
}