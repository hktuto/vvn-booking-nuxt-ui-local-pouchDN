import type { BookingDocument } from '~/composables/usePouchDB'

export const useBookings = () => {
  const { bookings: bookingsDB } = usePouchDB()
  const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
  const { classes, loadClasses } = useClasses()
  const { students, loadStudents } = useStudents()

  const bookings = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const transformBookingDoc = (doc: BookingDocument) => ({
    id: doc._id,
    class_id: doc.class_id,
    class_date: doc.class_date,
    class_time: doc.class_time,
    bookings: doc.bookings || [],
    total_booked: doc.total_booked || 0,
    max_capacity: doc.max_capacity,
    is_virtual: doc.is_virtual,
    created_at: doc.created_at,
    updated_at: doc.updated_at
  })

  const loadBookings = async () => {
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([loadClasses(), loadStudents()])
      
      // Use find query instead of view query
      const result = await bookingsDB.find({
        selector: { type: 'booking' },
      })
      
      console.log('Loaded bookings:', result.docs.length)
      bookings.value = result.docs.map(doc => transformBookingDoc(doc as BookingDocument))
    } catch (err) {
      console.error('Error loading bookings:', err)
      error.value = 'Failed to load bookings'
    } finally {
      loading.value = false
    }
  }


  const addBooking = async (bookingData: {
    class_id: string
    class_date: string
    class_time: string
    bookings: {
      student_id: string
      student_name: string
      status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      credits_used: number
      notes: string
      booked_at: string
    }[]
    total_booked: number
    max_capacity: number
    is_virtual: boolean
  }) => {
    try {
      const newBooking = await bookingsCRUD.create({
        type: 'booking',
        ...bookingData
      })
      
      // Don't call loadBookings() here - let the calling function handle refresh
      return newBooking
    } catch (err) {
      console.error('Error adding booking:', err)
      throw new Error('Failed to add booking')
    }
  }

  const updateBooking = async (id: string, updates: Partial<Omit<BookingDocument, '_id' | 'type' | 'created_at'>>) => {
    try {
      const updatedBooking = await bookingsCRUD.update(id, updates)
      console.log('updatedBooking', updatedBooking)
      // Don't call loadBookings() here - let the calling function handle refresh
      return updatedBooking
    } catch (err) {
      console.error('Error updating booking:', err)
      throw new Error('Failed to update booking')
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      await bookingsCRUD.remove(id)
      // Don't call loadBookings() here - let the calling function handle refresh
    } catch (err) {
      console.error('Error deleting booking:', err)
      throw new Error('Failed to delete booking')
    }
  }

  const getBookingById = async (id: string) => {
    try {
      const doc = await bookingsCRUD.findById(id)
      return doc ? transformBookingDoc(doc) : null
    } catch (err) {
      console.error('Error getting booking by ID:', err)
      return null
    }
  }

  // Get virtual bookings for a specific date (scheduled classes without actual bookings)
  const getVirtualBookingsForDate = async(date: string) => {
    const virtualBookings: any[] = []
    
    for (const class_ of classes.value) {
      if (class_.status !== 'active') continue
      // Check if class is scheduled for this date
      let isScheduledForDate = false
      
      if (class_.schedule_type === 'one-time') {
        isScheduledForDate = class_.start_date === date
      } else if (class_.schedule_type === 'recurring') {

        const targetDate = new Date(date)
        const dayOfWeek = targetDate.getDay()
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayName = dayNames[dayOfWeek]
        
        isScheduledForDate = !!(class_.days_of_week?.includes(dayName))
      } else if (class_.schedule_type === 'series') {
        // For series, check if this date falls within the series period
        const classDate = new Date(class_.start_date)
        const targetDate = new Date(date)
        const endDate = class_.end_date ? new Date(class_.end_date) : 
                       new Date(classDate.getTime() + (class_.total_sessions || 1) * 7 * 24 * 60 * 60 * 1000)
        
        isScheduledForDate = targetDate >= classDate && targetDate <= endDate
      }
      
      if (isScheduledForDate) {
        // Check if there's already a real booking for this class on this date
        const findExistingBooking = await bookingsDB.find({
          selector: {
            class_id: class_.id,
            class_date: date,
            is_virtual: false
          }
        })
        console.log('findExistingBooking', findExistingBooking.docs)
        if (!findExistingBooking.docs.length) {
          virtualBookings.push({
            id: `virtual-${class_.id}-${date}`,
            class_id: class_.id,
            class_date: date,
            class_time: class_.start_time,
            bookings: [],
            total_booked: 0,
            max_capacity: class_.max_students,
            is_virtual: true,
            class_info: class_,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }
    }
    console.log('Virtual bookings:', virtualBookings.length)
    
    return virtualBookings
  }

  // Get all bookings (real + virtual) for a specific date
  const getBookingsForDate = async(date: string) => {
    try {
      await Promise.all([loadClasses(), loadStudents()])
      
      // Only load bookings for the specific date
      const realBookings = await bookingsDB.find({
        selector: { 
          class_date: {
            $eq: date
          }
        }
      }).then(result => {
        console.log('Loaded bookings for date:', result.docs.length)
        return result.docs.map(doc => transformBookingDoc(doc as BookingDocument))
      })
      const virtualBookings = await getVirtualBookingsForDate(date)
      
      return [...realBookings, ...virtualBookings].sort((a: any, b: any) => 
        a.class_time.localeCompare(b.class_time)
      )
    } catch (err) {
      console.error('Error getting bookings for date:', err)
      return []
    }
  }

  // Add student to a booking (convert virtual to real if needed)
  const addStudentToBooking = async (bookingId: string, studentId: string, creditsUsed: number, notes: string = '') => {
    try {
      const booking = bookings.value.find((b: any) => b.id === bookingId)
      if (!booking) throw new Error('Booking not found')
      
      const student = students.value.find((s: any) => s.id === studentId)
      if (!student) throw new Error('Student not found')
      
      const newBookingData = {
        student_id: studentId,
        student_name: student.name,
        status: 'confirmed' as const,
        credits_used: creditsUsed,
        notes,
        booked_at: new Date().toISOString()
      }
      
      if (booking.is_virtual) {
        // Convert virtual booking to real booking
        const realBooking = await addBooking({
          class_id: booking.class_id,
          class_date: booking.class_date,
          class_time: booking.class_time,
          bookings: [newBookingData],
          total_booked: 1,
          max_capacity: booking.max_capacity,
          is_virtual: false
        })
        
        
        return realBooking
      } else {
        // Add to existing real booking
        const updatedBookings = [...booking.bookings, newBookingData]
        await updateBooking(bookingId, {
          bookings: updatedBookings,
          total_booked: updatedBookings.length
        })
        
        return booking
      }
    } catch (err) {
      console.error('Error adding student to booking:', err)
      throw new Error('Failed to add student to booking')
    }
  }

  // Remove student from booking
  const removeStudentFromBooking = async (bookingId: string, studentId: string) => {
    try {
      console.log('removeStudentFromBooking', bookingId, studentId)
      const existingBooking = await bookingsCRUD.findById(bookingId)
      if (!existingBooking) throw new Error('Booking not found')
        
        const updatedBookings = existingBooking.bookings.filter((b: any) => b.student_id !== studentId)
        console.log('existingBooking', existingBooking, updatedBookings)
      
        console.log('updateBooking', bookingId, updatedBookings)
        // Update the booking
        await updateBooking(bookingId, {
          bookings: updatedBookings,
          total_booked: updatedBookings.length
        })
      
    } catch (err) {
      console.error('Error removing student from booking:', err)
      throw new Error('Failed to remove student from booking')
    }
  }

  return {
    bookings: readonly(bookings),
    loading: readonly(loading),
    error: readonly(error),
    loadBookings,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    getVirtualBookingsForDate,
    getBookingsForDate,
    addStudentToBooking,
    removeStudentFromBooking
  }
} 