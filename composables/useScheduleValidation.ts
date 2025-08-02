import { z } from 'zod'

// Schedule form validation schema
export const scheduleSchema = z.object({
  class_type_id: z.string()
    .min(1, 'validation.classType.required'),
  location_id: z.string()
    .min(1, 'validation.location.required'),
  weekly_days: z.array(z.string())
    .min(1, 'validation.weeklyDays.required'),
  start_time: z.string()
    .min(1, 'validation.startTime.required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'validation.startTime.invalid'),
  end_time: z.string()
    .min(1, 'validation.endTime.required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'validation.endTime.invalid'),
  start_date: z.string()
    .min(1, 'validation.startDate.required'),
  end_date: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  max_capacity: z.number()
    .min(1, 'validation.maxCapacity.min')
    .max(1000, 'validation.maxCapacity.maxExceeded'),
  credit_cost: z.number()
    .min(0, 'validation.creditCost.negative')
    .max(1000, 'validation.creditCost.maxExceeded'),
  description: z.string()
    .max(1000, 'validation.notes.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  active: z.boolean()
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.start_time < data.end_time
  }
  return true
}, {
  message: 'validation.endTimeAfterStart',
  path: ["end_time"]
}).refine((data) => {
  if (data.start_date && data.end_date && data.end_date !== '') {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: 'validation.endDate.afterStart',
  path: ["end_date"]
})

// Type exports
export type ScheduleForm = z.infer<typeof scheduleSchema>

// Composable function
export const useScheduleValidation = () => {
  const { t } = useI18n()

  // Create schema with translated messages
  const translatedScheduleSchema = z.object({
    class_type_id: z.string()
      .min(1, t('validation.classType.required')),
    location_id: z.string()
      .min(1, t('validation.location.required')),
    weekly_days: z.array(z.string())
      .min(1, t('validation.weeklyDays.required')),
    start_time: z.string()
      .min(1, t('validation.startTime.required'))
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, t('validation.startTime.invalid')),
    end_time: z.string()
      .min(1, t('validation.endTime.required'))
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, t('validation.endTime.invalid')),
    start_date: z.string()
      .min(1, t('validation.startDate.required')),
    end_date: z.string()
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    max_capacity: z.number()
      .min(1, t('validation.maxCapacity.min'))
      .max(1000, t('validation.maxCapacity.maxExceeded')),
    credit_cost: z.number()
      .min(0, t('validation.creditCost.negative'))
      .max(1000, t('validation.creditCost.maxExceeded')),
    description: z.string()
      .max(1000, t('validation.notes.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    active: z.boolean()
  }).refine((data) => {
    if (data.start_time && data.end_time) {
      return data.start_time < data.end_time
    }
    return true
  }, {
    message: t('validation.endTimeAfterStart'),
    path: ["end_time"]
  }).refine((data) => {
    if (data.start_date && data.end_date && data.end_date !== '') {
      return new Date(data.start_date) <= new Date(data.end_date)
    }
    return true
  }, {
    message: t('validation.endDate.afterStart'),
    path: ["end_date"]
  })

  return {
    scheduleSchema: translatedScheduleSchema
  }
}