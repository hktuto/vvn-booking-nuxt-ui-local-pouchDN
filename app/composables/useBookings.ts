import type { BookingDocument } from '~/composables/usePouchDB'
import { usePouchCRUD } from './usePouchDB'
import { useBookingDB, useClassDB } from '~/utils/dbStateHelper'

export const useBookings = () => {
  const { getDB: getBookingsDB } = useBookingDB()
  const { getDB: getClassesDB } = useClassDB()
  const { classes, loadClasses } = useClasses()
  const { students, loadStudents } = useStudents()

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

  const addBooking = async (bookingData: {
    class_id: string
    class_date: string
    class_time: string
    bookings: {
      student_id: string
      student_name: string
      status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      payment_status: 'unpaid' | 'paid' | 'refunded'
      credits_used: number
      notes: string
      booked_at: string
    }[]
    total_booked: number
    max_capacity: number
    is_virtual: boolean
  }) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      
      const newBooking = await bookingsCRUD.create({
        type: 'booking',
        ...bookingData
      })
      
      return newBooking
    } catch (err) {
      console.error('Error adding booking:', err)
      throw new Error('Failed to add booking')
    }
  }

  const updateBooking = async (id: string, updates: Partial<Omit<BookingDocument, '_id' | 'type' | 'created_at'>>) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      
      const updatedBooking = await bookingsCRUD.update(id, updates)
      return updatedBooking
    } catch (err) {
      console.error('Error updating booking:', err)
      throw new Error('Failed to update booking')
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      
      await bookingsCRUD.remove(id)
    } catch (err) {
      console.error('Error deleting booking:', err)
      throw new Error('Failed to delete booking')
    }
  }

  const getBookingById = async (id: string) => {
    try {
      // Check if this is a virtual booking ID
      if (id.startsWith('virtual-')) {
        return await getVirtualBookingById(id)
      }
      
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      
      const doc = await bookingsCRUD.findById(id)
      return doc ? transformBookingDoc(doc) : null
    } catch (err) {
      console.error('Error getting booking by ID:', err)
      return null
    }
  }

  // Get virtual booking by ID (parses virtual ID format)
  const getVirtualBookingById = async (virtualId: string) => {
    try {

      // Parse virtual ID format: virtual-{classId}-{date}
      const parts = virtualId.split('-') as any
      if (parts.length < 3) {
        throw new Error('Invalid virtual booking ID format')
      }
      
      const classId = parts[1]
      const date = parts[2].replace(/_/g, '-') // Handle dates with hyphens
      
      // Find the class
      const classesDB = await getClassesDB()
      const classesCRUD = usePouchCRUD<ClassDocument>(classesDB)
      const class_ = await classesCRUD.findById(classId)
      if (!class_) {
        throw new Error('Class not found')
      }
      
      // Create virtual booking object
      return {
        id: virtualId,
        class_id: classId,
        class_date: date,
        class_time: class_.start_time,
        bookings: [],
        total_booked: 0,
        max_capacity: class_.max_students,
        is_virtual: true,
        class_info: class_,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (err) {
      console.error('Error getting virtual booking by ID:', err)
      return null
    }
  }

  // Get virtual bookings for a specific date (scheduled classes without actual bookings)
  const getVirtualBookingsForDate = async(date: string) => {
    const virtualBookings: any[] = []
    // return if date is before today
    if (new Date(date) < new Date()) return virtualBookings
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
        const dayName = dayNames[dayOfWeek] as any
        
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
        const bookingsDB = await getBookingsDB()
        const findExistingBooking = await bookingsDB.find({
          selector: {
            class_id: class_.id,
            class_date: date,
            is_virtual: false
          }
        })
        if (!findExistingBooking.docs.length) {
          virtualBookings.push({
            id: `virtual-${class_.id}-${date.replace(/-/g, '_')}`,
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
    
    return virtualBookings
  }

  // Get all bookings (real + virtual) for a specific date
  const getBookingsForDate = async(date: string) => {
    try {
      await Promise.all([loadClasses(), loadStudents()])
      
      // Only load bookings for the specific date
      const bookingsDB = await getBookingsDB()
      const realBookings = await bookingsDB.find({
        selector: { 
          class_date: {
            $eq: date
          }
        }
      }).then((result: any) => {
        return result.docs.map((doc: any) => transformBookingDoc(doc as BookingDocument))
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

  // Get bookings for a specific student
  const getBookingsByStudent = async (studentId: string, limit?: number) => {
    try {
      await Promise.all([loadClasses(), loadStudents()])
      
      const bookingsDB = await getBookingsDB()
      const result = await bookingsDB.find({
        selector: { 
          type: 'booking'
        },
        limit: limit || 50
      })
      
      // Filter bookings that contain the student
      const bookingsWithStudent = result.docs
        .map((doc: any) => transformBookingDoc(doc as BookingDocument))
        .filter((booking: any) => 
          booking.bookings.some((studentBooking: any) => studentBooking.student_id === studentId)
        )
        .map((booking: any) => ({
          ...booking,
          studentBooking: booking.bookings.find((studentBooking: any) => studentBooking.student_id === studentId)
        }))
        .sort((a: any, b: any) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime())
        .slice(0, limit || 50)
      
      return bookingsWithStudent
    } catch (err) {
      console.error('Error getting bookings by student:', err)
      return []
    }
  }

  // Add student to a booking (convert virtual to real if needed)
  const addStudentToBooking = async (bookingId: string, studentId: string, creditsUsed: number, notes: string = '') => {
    try {
      let booking: any = null
      
      // Check if this is a virtual booking ID
      if (bookingId.startsWith('virtual-')) {
        booking = await getVirtualBookingById(bookingId)
      } else {
        // Fetch the booking from database
        booking = await getBookingById(bookingId)
      }
      
      if (!booking) throw new Error('Booking not found')
      
      const student = students.value.find((s: any) => s.id === studentId)
      if (!student) throw new Error('Student not found')
      
      const newBookingData = {
        student_id: studentId,
        student_name: student.name,
        status: 'confirmed' as const,
        payment_status: 'unpaid' as const,
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
        
        // Return the new real booking with its ID
        return {
          success: true,
          newBookingId: realBooking._id,
          isVirtualConversion: true,
          booking: transformBookingDoc(realBooking)
        }
      } else {
        // Add to existing real booking
        const updatedBookings = [...booking.bookings, newBookingData]
        await updateBooking(bookingId, {
          bookings: updatedBookings,
          total_booked: updatedBookings.length
        })
        
        return {
          success: true,
          newBookingId: bookingId,
          isVirtualConversion: false,
          booking: { ...booking, bookings: updatedBookings, total_booked: updatedBookings.length }
        }
      }
    } catch (err) {
      console.error('Error adding student to booking:', err)
      throw new Error('Failed to add student to booking')
    }
  }

  // Remove student from booking
  const removeStudentFromBooking = async (bookingId: string, studentId: string) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
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

  // Convert virtual booking to real booking with multiple students
  const convertVirtualBookingToReal = async (virtualBookingId: string, studentIds: string[], creditsUsed: number, notes: string = '') => {
    try {
      const virtualBooking = await getVirtualBookingById(virtualBookingId)
      if (!virtualBooking) throw new Error('Virtual booking not found')
      
      // Get all students
      const studentsToAdd = studentIds.map(studentId => {
        const student = students.value.find((s: any) => s.id === studentId)
        if (!student) throw new Error(`Student ${studentId} not found`)
        return student
      })
      
      // Create booking data for all students
      const bookingsData = studentsToAdd.map(student => ({
        student_id: student.id,
        student_name: student.name,
        status: 'confirmed' as const,
        payment_status: 'unpaid' as const,
        credits_used: creditsUsed,
        notes,
        booked_at: new Date().toISOString()
      }))
      
      // Create the real booking
      const realBooking = await addBooking({
        class_id: virtualBooking.class_id,
        class_date: virtualBooking.class_date,
        class_time: virtualBooking.class_time,
        bookings: bookingsData,
        total_booked: bookingsData.length,
        max_capacity: virtualBooking.max_capacity,
        is_virtual: false
      })
      console.log('realBooking', realBooking)
      return {
        success: true,
        newBookingId: realBooking._id,
        booking: transformBookingDoc(realBooking)
      }
    } catch (err) {
      console.error('Error converting virtual booking to real:', err)
      throw new Error('Failed to convert virtual booking to real')
    }
  }

  // Update student booking status and credits used
  const updateStudentBookingStatus = async (bookingId: string, studentId: string, status: 'confirmed' | 'cancelled' | 'completed' | 'no_show', creditsUsed: number) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      const existingBooking = await bookingsCRUD.findById(bookingId)
      if (!existingBooking) throw new Error('Booking not found')
      
      // Find and update the specific student's booking
      const updatedBookings = existingBooking.bookings.map((booking: any) => {
        if (booking.student_id === studentId) {
          return {
            ...booking,
            status,
            credits_used: creditsUsed,
            updated_at: new Date().toISOString()
          }
        }
        return booking
      })
      
      // Check if the student was found in the booking
      const studentBooking = updatedBookings.find((b: any) => b.student_id === studentId)
      if (!studentBooking) {
        throw new Error('Student not found in this booking')
      }
      
      // Update the booking
      await updateBooking(bookingId, {
        bookings: updatedBookings
      })
      
      return {
        success: true,
        booking: { ...existingBooking, bookings: updatedBookings }
      }
    } catch (err) {
      console.error('Error updating student booking status:', err)
      throw new Error('Failed to update student booking status')
    }
  }

  // Update student payment status
  const updateStudentPaymentStatus = async (bookingId: string, studentId: string, paymentStatus: 'unpaid' | 'paid' | 'refunded') => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      const existingBooking = await bookingsCRUD.findById(bookingId)
      if (!existingBooking) throw new Error('Booking not found')
      
      // Find and update the specific student's booking
      const updatedBookings = existingBooking.bookings.map((booking: any) => {
        if (booking.student_id === studentId) {
          return {
            ...booking,
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
          }
        }
        return booking
      })
      
      // Check if the student was found in the booking
      const studentBooking = updatedBookings.find((b: any) => b.student_id === studentId)
      if (!studentBooking) {
        throw new Error('Student not found in this booking')
      }
      
      // Update the booking
      await updateBooking(bookingId, {
        bookings: updatedBookings
      })
      
      return {
        success: true,
        booking: { ...existingBooking, bookings: updatedBookings }
      }
    } catch (err) {
      console.error('Error updating student payment status:', err)
      throw new Error('Failed to update student payment status')
    }
  }

  // Update both booking status and payment status
  const updateStudentBookingAndPaymentStatus = async (
    bookingId: string, 
    studentId: string, 
    status: 'confirmed' | 'cancelled' | 'completed' | 'no_show', 
    paymentStatus: 'unpaid' | 'paid' | 'refunded',
    creditsUsed: number
  ) => {
    try {
      const bookingsDB = await getBookingsDB()
      const bookingsCRUD = usePouchCRUD<BookingDocument>(bookingsDB)
      const existingBooking = await bookingsCRUD.findById(bookingId)
      if (!existingBooking) throw new Error('Booking not found')
      
      // Find and update the specific student's booking
      const updatedBookings = existingBooking.bookings.map((booking: any) => {
        if (booking.student_id === studentId) {
          return {
            ...booking,
            status,
            payment_status: paymentStatus,
            credits_used: creditsUsed,
            updated_at: new Date().toISOString()
          }
        }
        return booking
      })
      
      // Check if the student was found in the booking
      const studentBooking = updatedBookings.find((b: any) => b.student_id === studentId)
      if (!studentBooking) {
        throw new Error('Student not found in this booking')
      }
      
      // Update the booking
      await updateBooking(bookingId, {
        bookings: updatedBookings
      })
      
      return {
        success: true,
        booking: { ...existingBooking, bookings: updatedBookings }
      }
    } catch (err) {
      console.error('Error updating student booking and payment status:', err)
      throw new Error('Failed to update student booking and payment status')
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingById,
    getVirtualBookingById,
    getVirtualBookingsForDate,
    getBookingsForDate,
    getBookingsByStudent,
    addStudentToBooking,
    removeStudentFromBooking,
    convertVirtualBookingToReal,
    updateStudentBookingStatus,
    updateStudentPaymentStatus,
    updateStudentBookingAndPaymentStatus
  }
} 