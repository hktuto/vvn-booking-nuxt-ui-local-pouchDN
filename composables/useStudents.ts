import type { StudentDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'

// Transform PouchDB document to display format
const transformStudentDoc = (doc: StudentDocument) => ({
  id: doc._id,
  name: doc.name,
  phone: doc.phone,
  country_code: doc.country_code,
  email: doc.email,
  address: doc.address,
  credits: doc.credits,
  notes: doc.notes,
  password_hash: doc.password_hash,
  tags: doc.tags || [],
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const useStudents = () => {
  const { students: studentsDB } = usePouchDB()
  const studentsCRUD = usePouchCRUD<StudentDocument>(studentsDB)
  
  // Reactive students list
  const students = ref<ReturnType<typeof transformStudentDoc>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load all students
  const loadStudents = async () => {
    loading.value = true
    error.value = null
    
    try {
      const docs = await studentsCRUD.findAll('student')
      students.value = docs
        .map(transformStudentDoc)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err: any) {
      error.value = err.message || 'Failed to load students'
      console.error('Error loading students:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new student
  const addStudent = async (studentData: {
    name: string
    phone: string
    country_code: string
    email: string
    address: string
    credits: number
    notes: string
    password_hash: string
    tags: string[]
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const doc = await studentsCRUD.create({
        type: 'student',
        ...studentData
      })
      
      const student = transformStudentDoc(doc)
      students.value.unshift(student) // Add to beginning for newest first
      
      return student
    } catch (err: any) {
      error.value = err.message || 'Failed to add student'
      console.error('Error adding student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update student
  const updateStudent = async (id: string, updates: Partial<{
    name: string
    phone: string
    country_code: string
    email: string
    address: string
    credits: number
    notes: string
    password_hash: string
    tags: string[]
  }>) => {
    loading.value = true
    error.value = null
    
    try {
      const doc = await studentsCRUD.update(id, updates)
      const student = transformStudentDoc(doc)
      
      // Update in reactive array
      const index = students.value.findIndex(s => s.id === id)
      if (index !== -1) {
        students.value[index] = student
      }
      console.log('student', student)
      return student
    } catch (err: any) {
      error.value = err.message || 'Failed to update student'
      console.error('Error updating student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete student
  const deleteStudent = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const success = await studentsCRUD.remove(id)
      
      if (success) {
        // Remove from reactive array
        const index = students.value.findIndex(s => s.id === id)
        if (index !== -1) {
          students.value.splice(index, 1)
        }
      }
      
      return success
    } catch (err: any) {
      error.value = err.message || 'Failed to delete student'
      console.error('Error deleting student:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get student by ID
  const getStudentById = async (id: string) => {
    try {
      const doc = await studentsCRUD.findById(id)
      return doc ? transformStudentDoc(doc) : null
    } catch (err: any) {
      console.error('Error getting student by ID:', err)
      return null
    }
  }

  // Search students
  const searchStudents = async (query: string) => {
    loading.value = true
    error.value = null
    
    try {
      const docs = await studentsCRUD.findWhere({
        type: 'student',
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { phone: { $regex: new RegExp(query, 'i') } },
          { email: { $regex: new RegExp(query, 'i') } }
        ]
      })
      
      return docs.map(transformStudentDoc)
    } catch (err: any) {
      error.value = err.message || 'Failed to search students'
      console.error('Error searching students:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get all unique tags from students
  const getAllTags = () => {
    const allTags = new Set<string>()
    students.value.forEach(student => {
      student.tags.forEach(tag => allTags.add(tag))
    })
    return Array.from(allTags).sort()
  }

  // Filter students by tags
  const filterStudentsByTags = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      return students.value
    }
    return students.value.filter(student => 
      selectedTags.some(tag => student.tags.includes(tag))
    )
  }

  // Initialize - load students on first use
  onMounted(() => {
    loadStudents()
  })

  return {
    students: readonly(students),
    loading: readonly(loading),
    error: readonly(error),
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    searchStudents,
    loadStudents,
    transformStudentDoc,
    getAllTags,
    filterStudentsByTags
  }
}