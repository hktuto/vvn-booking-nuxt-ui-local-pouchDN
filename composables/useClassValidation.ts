import { z } from 'zod'

// Class form validation schema
export const classSchema = z.object({
  name: z.string()
    .min(1, 'validation.className.required')
    .min(2, 'validation.className.minLength')
    .max(100, 'validation.className.maxLength'),
  description: z.string()
    .max(500, 'validation.description.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  class_type_id: z.string()
    .min(1, 'validation.classType.required'),
  location_id: z.string()
    .min(1, 'validation.location.required'),
  max_students: z.number()
    .min(1, 'validation.maxStudents.min')
    .max(50, 'validation.maxStudents.maxExceeded'),
  price: z.number()
    .min(0, 'validation.price.negative')
    .max(99999, 'validation.price.maxExceededSimple'),
  active: z.boolean().default(true)
})

// Class Type form validation schema
export const classTypeSchema = z.object({
  name: z.string()
    .min(1, 'validation.classTypeName.required')
    .min(2, 'validation.classTypeName.minLength')
    .max(100, 'validation.classTypeName.maxLength'),
  description: z.string()
    .max(500, 'validation.description.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  duration_minutes: z.number()
    .min(15, 'validation.durationMinutes.min')
    .max(480, 'validation.durationMinutes.maxExceeded'),
  active: z.boolean().default(true)
})

// Type exports
export type ClassForm = z.infer<typeof classSchema>
export type ClassTypeForm = z.infer<typeof classTypeSchema>

// Composable function
export const useClassValidation = () => {
  return {
    classSchema,
    classTypeSchema
  }
} 