import type { ClassDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'

const transformClassDoc = (doc: ClassDocument) => ({
  id: doc._id,
  name: doc.name,
  description: doc.description,
  location_id: doc.location_id,
  max_students: doc.max_students,
  price: doc.price,
  credits: doc.credits,
  duration_minutes: doc.duration_minutes,
  schedule_type: doc.schedule_type, // 'one-time', 'recurring', 'series'
  start_date: doc.start_date,
  end_date: doc.end_date,
  start_time: doc.start_time,
  end_time: doc.end_time,
  days_of_week: doc.days_of_week, // For recurring classes
  total_sessions: doc.total_sessions, // For series classes
  current_session: doc.current_session,
  status: doc.status, // 'active', 'inactive', 'cancelled', 'completed'
  tags: doc.tags || [],
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const useClasses = () => {
  const { classes: classesDB } = usePouchDB()
  const classesCRUD = usePouchCRUD<ClassDocument>(classesDB)
  
  const classes = ref<ReturnType<typeof transformClassDoc>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadClasses = async () => {
    loading.value = true
    error.value = null
    
    try {
      const result = await classesDB.find({
        selector: { type: 'class' }
      })
      
      classes.value = result.docs.map((doc: any) => transformClassDoc(doc))
    } catch (err) {
      console.error('Error loading classes:', err)
      error.value = 'Failed to load classes'
    } finally {
      loading.value = false
    }
  }

  const addClass = async (classData: {
    name: string
    description: string
    location_id: string
    max_students: number
    price: number
    credits: number
    duration_minutes: number
    schedule_type: 'one-time' | 'recurring' | 'series'
    start_date: string
    end_date?: string
    start_time: string
    end_time: string
    days_of_week?: string[]
    total_sessions?: number
    current_session?: number
    status: 'active' | 'inactive' | 'cancelled' | 'completed'
    tags: string[]
  }) => {
    try {
      const doc = {
        ...classData,
        type: 'class' as const,
        current_session: classData.current_session || 1,
        tags: classData.tags || []
      }
      
      const newClass = await classesCRUD.create(doc)
      await loadClasses()
      return newClass
    } catch (err) {
      console.error('Error adding class:', err)
      throw new Error('Failed to add class')
    }
  }

  const updateClass = async (id: string, updates: Partial<{
    name: string
    description: string
    location_id: string
    location_name: string
    instructor: string
    max_students: number
    price: number
    duration_minutes: number
    schedule_type: 'one-time' | 'recurring' | 'series'
    start_date: string
    end_date: string
    start_time: string
    end_time: string
    days_of_week: string[]
    total_sessions: number
    current_session: number
    status: 'active' | 'inactive' | 'cancelled' | 'completed'
    tags: string[]
  }>) => {
    try {
      const updatedClass = await classesCRUD.update(id, updates)
      await loadClasses()
      return updatedClass
    } catch (err) {
      console.error('Error updating class:', err)
      throw new Error('Failed to update class')
    }
  }

  const deleteClass = async (id: string) => {
    try {
      await classesCRUD.remove(id)
      await loadClasses()
    } catch (err) {
      console.error('Error deleting class:', err)
      throw new Error('Failed to delete class')
    }
  }

  const getClassById = async (id: string) => {
    try {
      const doc = await classesCRUD.findById(id)
      return doc ? transformClassDoc(doc) : null
    } catch (err) {
      console.error('Error getting class by ID:', err)
      return null
    }
  }

  const getActiveClasses = () => {
    return classes.value.filter(class_ => class_.status === 'active')
  }

  const getClassesByLocation = (locationId: string) => {
    return classes.value.filter(class_ => class_.location_id === locationId)
  }



  const getAllTags = () => {
    const allTags = new Set<string>()
    classes.value.forEach(class_ => {
      class_.tags.forEach(tag => allTags.add(tag))
    })
    return Array.from(allTags).sort()
  }

  const filterClassesByTags = (selectedTags: string[]) => {
    if (selectedTags.length === 0) return classes.value
    return classes.value.filter(class_ => 
      selectedTags.some(tag => class_.tags.includes(tag))
    )
  }

  return {
    classes: readonly(classes),
    loading: readonly(loading),
    error: readonly(error),
    loadClasses,
    addClass,
    updateClass,
    deleteClass,
    getClassById,
    getActiveClasses,
    getClassesByLocation,
    getAllTags,
    filterClassesByTags
  }
} 