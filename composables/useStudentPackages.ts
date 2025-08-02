import type { StudentPackageDocument, StudentDocument, PackageDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'

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
  const { studentPackages: studentPackagesDB, students: studentsDB, packages: packagesDB } = usePouchDB()
  const studentPackagesCRUD = usePouchCRUD<StudentPackageDocument>(studentPackagesDB)
  
  // Reactive student packages list
  const studentPackages = ref<Awaited<ReturnType<typeof transformStudentPackageDoc>>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all student packages
  const loadStudentPackages = async () => {
    loading.value = true
    error.value = null
    
    try {
      const docs = await studentPackagesCRUD.findAll('student_package')
      const transformedDocs = await Promise.all(
        docs.map(doc => transformStudentPackageDoc(doc, packagesDB))
      )
      studentPackages.value = transformedDocs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load student packages'
      console.error('Error loading student packages:', err)
    } finally {
      loading.value = false
    }
  }

  // Load student packages by student ID
  const loadStudentPackagesByStudent = async (studentId: string) => {
    loading.value = true
    error.value = null
    
    try {
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
      // Get the package details
      const packageDoc = await packagesDB.get(packageId) as PackageDocument
      if (!packageDoc) {
        throw new Error('Package not found')
      }

      // Calculate expiry date
      const purchaseDate = new Date()
      const expiryDate = new Date(purchaseDate)
      expiryDate.setDate(expiryDate.getDate() + packageDoc.duration_days)

      // Create student package record
      const studentPackageDoc = await studentPackagesCRUD.create({
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

      // Update student's total credits
      const studentDoc = await studentsDB.get(studentId) as StudentDocument
      await studentsDB.put({
        ...studentDoc,
        credits: studentDoc.credits + packageDoc.credits,
        updated_at: new Date().toISOString()
      })

      const studentPackage = await transformStudentPackageDoc(studentPackageDoc, packagesDB)
      studentPackages.value.unshift(studentPackage) // Add to beginning for newest first
      
      return studentPackage
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
      const doc = await studentPackagesCRUD.update(id, updates)
      const studentPackage = await transformStudentPackageDoc(doc, packagesDB)
      
      // Update in reactive array
      const index = studentPackages.value.findIndex(sp => sp.id === id)
      if (index !== -1) {
        studentPackages.value[index] = studentPackage
      }
      
      return studentPackage
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
      const success = await studentPackagesCRUD.remove(id)
      
      if (success) {
        // Remove from reactive array
        const index = studentPackages.value.findIndex(sp => sp.id === id)
        if (index !== -1) {
          studentPackages.value.splice(index, 1)
        }
      }
      
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
      const doc = await studentPackagesCRUD.findById(id)
      return doc ? await transformStudentPackageDoc(doc, packagesDB) : null
    } catch (err: any) {
      console.error('Error getting student package:', err)
      return null
    }
  }

  // Check if package is expired
  const isPackageExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  // Get active packages for a student
  const getActivePackagesForStudent = (studentId: string) => {
    return studentPackages.value.filter(sp => 
      sp.student_id === studentId && 
      sp.status === 'active' && 
      sp.credits_remaining > 0 &&
      !isPackageExpired(sp.expiry_date)
    )
  }

  return {
    studentPackages: readonly(studentPackages),
    loading: readonly(loading),
    error: readonly(error),
    loadStudentPackages,
    loadStudentPackagesByStudent,
    addPackageToStudent,
    updateStudentPackage,
    deleteStudentPackage,
    getStudentPackageById,
    isPackageExpired,
    getActivePackagesForStudent
  }
} 