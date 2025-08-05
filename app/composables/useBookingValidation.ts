import { z } from 'zod'

export const useBookingValidation = () => {
  const { t } = useI18n()

  const studentBookingSchema = z.object({
    student_id: z.string().min(1, t('validation.student.required')),
    student_name: z.string().min(1, t('validation.studentName.required')),
    status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']),
    credits_used: z.number().min(1, t('validation.credits.min')),
    notes: z.string().max(500, t('validation.notes.maxLength')).optional().or(z.literal('')),
    booked_at: z.string().min(1, t('validation.bookedAt.required'))
  })

  const translatedBookingSchema = z.object({
    class_id: z.string().min(1, t('validation.class.required')),
    class_date: z.string().min(1, t('validation.classDate.required')),
    class_time: z.string().min(1, t('validation.classTime.required')),
    bookings: z.array(studentBookingSchema).min(1, t('validation.bookings.min')),
    total_booked: z.number().min(0, t('validation.totalBooked.min')),
    max_capacity: z.number().min(1, t('validation.maxCapacity.min')),
    is_virtual: z.boolean()
  }).refine((data) => {
    return data.total_booked <= data.max_capacity
  }, {
    message: t('validation.booking.capacityExceeded'),
    path: ['total_booked']
  })

  return { bookingSchema: translatedBookingSchema }
}

export type BookingForm = z.infer<ReturnType<typeof useBookingValidation>['bookingSchema']> 