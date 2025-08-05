import type { StudentPackageDocument, StudentDocument, PackageDocument } from './usePouchDB'
import { usePouchCRUD } from './usePouchDB'
import { useStudentPackageDB, usePackageDB } from '~/utils/dbStateHelper'

// Transform PouchDB document to display format
const transformStudentPackageDoc = async (doc: StudentPackageDocument, packagesDB?: any) => {
  let package_name = 'Unknown Package'
  let package_price = 0
  let is_custom = false
  
  // Try to get package details if packagesDB is provided
  if (packagesDB) {
    try {
      const packageDoc = await packagesDB.get(doc.package_id)
      if (packageDoc) {
        package_name = packageDoc.name
        package_price = packageDoc.price
        is_custom = packageDoc.is_custom || false
      }
    } catch (err) {
      console.error('Error getting package details:', err)
    }
  }
  
  return {
    id: doc._id,
    student_id: doc.student_id,
    package_id: doc.package_id,
    package_name,
    package_price,
    credits_purchased: doc.credits_purchased,
    credits_remaining: doc.credits_remaining,
    purchase_date: doc.purchase_date,
    expiry_date: doc.expiry_date,
    status: doc.status,
    notes: doc.notes,
    custom_price: doc.custom_price,
    is_custom,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  }
}

export const useStudentPackages = () => {
  const { getDB: getStudentPackagesDB } = useStudentPackageDB()
  const { getDB: getPackagesDB } = usePackageDB()
  
  // Only keep loading and error states for individual operations
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all student packages (now returns data directly instead of storing in global array)
  const loadStudentPackages = async () => {
    loading.value = true
    error.value = null
    
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      const docs = await studentPackagesCRUD.findAll('student_package')
      const transformedDocs = await Promise.all(
        docs.map(doc => transformStudentPackageDoc(doc, packagesDB))
      )
      return transformedDocs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load student packages'
      console.error('Error loading student packages:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getPackageByStudentId(studentId: string) {
    const studentPackagesDB = await getStudentPackagesDB()
    const packagesDB = await getPackagesDB()
    const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
    
    const docs = await studentPackagesCRUD.findWhere({
      type: 'student_package',
      student_id: studentId
    })
    return Promise.all( docs.map(doc => transformStudentPackageDoc(doc, packagesDB)) )
  }

  // Load student packages by student ID
  const loadStudentPackagesByStudent = async (studentId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      const docs = await studentPackagesCRUD.findWhere({
        type: 'student_package',
        student_id: studentId
      })
      const transformedDocs = await Promise.all(
        docs.map(doc => transformStudentPackageDoc(doc, packagesDB))
      )
      return transformedDocs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load student packages'
      console.error('Error loading student packages:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Add package to student
  const addPackageToStudent = async (studentId: string, packageId: string, notes?: string, customPrice?: number) => {
    loading.value = true
    error.value = null
    
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      // Get package details
      const packageDoc = await packagesDB.get(packageId) as PackageDocument
      if (!packageDoc) {
        throw new Error('Package not found')
      }
      
      // Calculate expiry date
      const purchaseDate = new Date()
      const expiryDate = new Date(purchaseDate)
      expiryDate.setDate(expiryDate.getDate() + packageDoc.duration_days)
      
      // Create student package
      const studentPackage = await studentPackagesCRUD.create({
        type: 'student_package',
        student_id: studentId,
        package_id: packageId,
        credits_purchased: packageDoc.credits,
        credits_remaining: packageDoc.credits,
        purchase_date: purchaseDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        status: 'active',
        notes: notes || '',
        custom_price: customPrice
      })
      // also update student's credits
      const { getStudentById, updateStudent } = useStudents()
      const student = await getStudentById(studentId)
      if (student) {
        student.credits += packageDoc.credits
        await updateStudent(studentId, student)
      }
      // create a transaction
      const { createTransaction } = useTransactions()
      await createTransaction({
        student_id: studentId,
        transaction_type: 'package_purchase',
        amount: packageDoc.price,
        currency: 'HKD',
        package_id: packageId,
        student_package_id: studentPackage._id,
        status: 'completed',
        description: `Package purchase: ${packageDoc.name}`,
        showDetailsDialog: true,
        packageInfo: packageDoc,
        
      })
      return await transformStudentPackageDoc(studentPackage, packagesDB)
    } catch (err: any) {
      error.value = err.message || 'Failed to add package to student'
      console.error('Error adding package to student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update student package
  const updateStudentPackage = async (id: string, updates: Partial<{
    credits_remaining: number
    status: 'active' | 'expired' | 'completed'
    notes: string
  }>) => {
    loading.value = true
    error.value = null
    
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      const doc = await studentPackagesCRUD.update(id, updates)
      return await transformStudentPackageDoc(doc, packagesDB)
    } catch (err: any) {
      error.value = err.message || 'Failed to update student package'
      console.error('Error updating student package:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete student package
  const deleteStudentPackage = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      const success = await studentPackagesCRUD.remove(id)
      return success
    } catch (err: any) {
      error.value = err.message || 'Failed to delete student package'
      console.error('Error deleting student package:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get student package by ID
  const getStudentPackageById = async (id: string) => {
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      const doc = await studentPackagesCRUD.findById(id)
      return doc ? await transformStudentPackageDoc(doc, packagesDB) : null
    } catch (err: any) {
      console.error('Error getting student package by ID:', err)
      return null
    }
  }

  // Check if package is expired
  const isPackageExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  // Get active packages for a student
  const getActivePackagesForStudent = async (studentId: string) => {
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const packagesDB = await getPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      const docs = await studentPackagesCRUD.findWhere({
        type: 'student_package',
        student_id: studentId,
        status: 'active'
      })
      
      const transformedDocs = await Promise.all(
        docs.map(doc => transformStudentPackageDoc(doc, packagesDB))
      )
      
      return transformedDocs.filter(sp => !isPackageExpired(sp.expiry_date))
    } catch (err: any) {
      console.error('Error getting active packages for student:', err)
      return []
    }
  }

  function calculateUnitPrice(sp: any) {
    return (sp.custom_price || sp.package_price) / sp.credits_purchased
  }

  // Use credits from packages
  const useCreditsFromPackages = async (studentId: string, creditsToUse: number, packageId: string) => {
    try {
      const studentPackagesDB = await getStudentPackagesDB()
      const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
      
      // Get the specific package
      const packageDoc = await studentPackagesCRUD.findById(packageId)
      if (!packageDoc || packageDoc.student_id !== studentId) {
        throw new Error('Package not found or does not belong to student')
      }
      
      if (packageDoc.credits_remaining < creditsToUse) {
        throw new Error('Insufficient credits')
      }
      
      // Update credits
      const updatedPackage = await studentPackagesCRUD.update(packageId, {
        credits_remaining: packageDoc.credits_remaining - creditsToUse,
        status: packageDoc.credits_remaining - creditsToUse === 0 ? 'completed' : 'active'
      })
      
      return updatedPackage
    } catch (err: any) {
      console.error('Error using credits from packages:', err)
      throw err
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    loadStudentPackages,
    getPackageByStudentId,
    loadStudentPackagesByStudent,
    addPackageToStudent,
    updateStudentPackage,
    deleteStudentPackage,
    getStudentPackageById,
    isPackageExpired,
    getActivePackagesForStudent,
    calculateUnitPrice,
    useCreditsFromPackages
  }
} 