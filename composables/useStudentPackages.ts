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
  
  // Only keep loading and error states for individual operations
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all student packages (now returns data directly instead of storing in global array)
  const loadStudentPackages = async () => {
    loading.value = true
    error.value = null
    
    try {
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

      // Create transaction for package purchase
      const { createTransaction } = useTransactions()
      await createTransaction({
        student_id: studentId,
        transaction_type: 'package_purchase',
        status: 'completed',
        amount: customPrice || packageDoc.price,
        currency: 'HKD',
        package_id: packageId,
        description: `Package purchase: ${packageDoc.name} (${packageDoc.credits} credits)`,
        payment_method: 'cash', // Default, can be updated later
        notes: notes || ''
      })

      return await transformStudentPackageDoc(studentPackageDoc, packagesDB)
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
      if(updates.credits_remaining === 0 || updates.credits_remaining && updates.credits_remaining <= 0) {
        updates.status = 'completed'
      }
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
      return await studentPackagesCRUD.remove(id)
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

  // Get active packages for a student (now fetches data directly)
  const getActivePackagesForStudent = async (studentId: string) => {
    try {
      const packages = await loadStudentPackagesByStudent(studentId)
      return packages.filter(sp => 
        sp.status === 'active' && 
        sp.credits_remaining > 0 &&
        !isPackageExpired(sp.expiry_date)
      )
    } catch (err) {
      console.error('Error getting active packages for student:', err)
      return []
    }
  }

  function calculateUnitPrice(sp: any) {
    const price = sp.custom_price || sp.package_price
    const credits = sp.credits_purchased
    return price / credits
  }

  // Use credits from student packages
  const useCreditsFromPackages = async (studentId: string, creditsToUse: number, packageId: string) => {
    loading.value = true
    error.value = null
    
    try {
      let remainingCredits = creditsToUse

      // Get current packages for the student
      
      const packageFormDb = await studentPackagesCRUD.findById(packageId)
      
      // Sort packages by expiry date (earliest first) to use oldest credits first
      if(!packageFormDb) {
        throw new Error('package not found')
      }
      const packageObj = await transformStudentPackageDoc(packageFormDb, packagesDB)
      const creditsFromThisPackage = Math.min(remainingCredits, packageObj.credits_remaining)
      const newRemainingCredits = packageObj.credits_remaining - creditsFromThisPackage
      const newStatus = newRemainingCredits === 0 ? 'completed' : 'active'

      // Update the student package
      const updatedPackage = await updateStudentPackage(packageObj.id, {
        credits_remaining: newRemainingCredits,
        status: newStatus
      })

      remainingCredits -= creditsFromThisPackage

      if (remainingCredits > 0) {
        throw new Error(`Not enough credits available. Need ${creditsToUse} but only have ${creditsToUse - remainingCredits}`)
      }

      return updatedPackage
    } catch (err: any) {
      error.value = err.message || 'Failed to use credits from packages'
      console.error('Error using credits from packages:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    loadStudentPackages,
    loadStudentPackagesByStudent,
    addPackageToStudent,
    updateStudentPackage,
    deleteStudentPackage,
    getStudentPackageById,
    isPackageExpired,
    getActivePackagesForStudent,
    useCreditsFromPackages,
    getPackageByStudentId,
    // utils
    calculateUnitPrice
  }
} 