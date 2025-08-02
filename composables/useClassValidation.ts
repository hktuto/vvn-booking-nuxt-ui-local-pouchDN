import { z } from 'zod'

export const useClassValidation = () => {
  const { t } = useI18n()

  const translatedClassSchema = z.object({
    name: z.string()
      .min(1, t('validation.name.required'))
      .max(100, t('validation.name.maxLength')),
    
    description: z.string()
      .max(500, t('validation.description.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    
    location_id: z.string()
      .min(1, t('validation.location.required')),
    
    max_students: z.number()
      .min(1, t('validation.maxStudents.min'))
      .max(100, t('validation.maxStudents.max')),
    
    price: z.number()
      .min(0, t('validation.price.min')),
    
    credits: z.number()
      .min(1, t('validation.credits.min'))
      .max(100, t('validation.credits.max')),
    
    duration_minutes: z.number()
      .min(15, t('validation.duration.min'))
      .max(480, t('validation.duration.max')), // 8 hours max
    
    schedule_type: z.enum(['one-time', 'recurring', 'series']),
    
    start_date: z.string()
      .min(1, t('validation.startDate.required')),
    
    end_date: z.string()
      .optional()
      .or(z.literal('')),
    
    start_time: z.string()
      .min(1, t('validation.startTime.required')),
    
    end_time: z.string()
      .min(1, t('validation.endTime.required')),
    
    days_of_week: z.array(z.string())
      .optional()
      .default([]),
    
    total_sessions: z.number()
      .min(1, t('validation.totalSessions.min'))
      .optional(),
    
    current_session: z.number()
      .min(1, t('validation.currentSession.min'))
      .optional()
      .default(1),
    
    status: z.enum(['active', 'inactive', 'cancelled', 'completed']),
    
    tags: z.array(z.string())
      .max(10, t('validation.tags.maxExceeded'))
      .optional()
      .default([])
  }).refine((data) => {
    // Validate that end_date is after start_date if provided
    if (data.end_date && data.start_date) {
      return new Date(data.end_date) >= new Date(data.start_date)
    }
    return true
  }, {
    message: t('validation.endDate.afterStartDate'),
    path: ['end_date']
  }).refine((data) => {
    // Validate that end_time is after start_time
    if (data.start_time && data.end_time) {
      return data.end_time > data.start_time
    }
    return true
  }, {
    message: t('validation.endTime.afterStartTime'),
    path: ['end_time']
  }).refine((data) => {
    // Validate days_of_week for recurring classes
    if (data.schedule_type === 'recurring' && (!data.days_of_week || data.days_of_week.length === 0)) {
      return false
    }
    return true
  }, {
    message: t('validation.daysOfWeek.required'),
    path: ['days_of_week']
  }).refine((data) => {
    // Validate total_sessions for series classes
    if (data.schedule_type === 'series' && (!data.total_sessions || data.total_sessions < 1)) {
      return false
    }
    return true
  }, {
    message: t('validation.totalSessions.required'),
    path: ['total_sessions']
  })

  return { classSchema: translatedClassSchema }
}

export type ClassForm = z.infer<ReturnType<typeof useClassValidation>['classSchema']> 