import { z } from 'zod'

// Schedule form validation schema
export const scheduleSchema = z.object({
  class_type_id: z.string()
    .min(1, 'Class type is required'),
  location_id: z.string()
    .min(1, 'Location is required'),
  weekly_days: z.array(z.string())
    .min(1, 'At least one day must be selected'),
  start_time: z.string()
    .min(1, 'Start time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  end_time: z.string()
    .min(1, 'End time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  start_date: z.string()
    .min(1, 'Start date is required'),
  end_date: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  max_capacity: z.number()
    .min(1, 'Maximum capacity must be at least 1')
    .max(1000, 'Maximum capacity cannot exceed 1000'),
  credit_cost: z.number()
    .min(0, 'Credit cost cannot be negative')
    .max(1000, 'Credit cost cannot exceed 1000'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
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
  message: "End time must be after start time",
  path: ["end_time"]
}).refine((data) => {
  if (data.start_date && data.end_date && data.end_date !== '') {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: "End date must be after or equal to start date",
  path: ["end_date"]
})

// Type exports
export type ScheduleForm = z.infer<typeof scheduleSchema>

// Composable function
export const useScheduleValidation = () => {
  return {
    scheduleSchema
  }
}