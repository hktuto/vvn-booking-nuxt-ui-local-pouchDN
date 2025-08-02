import { z } from 'zod'

// Class form validation schema
export const classSchema = z.object({
  name: z.string()
    .min(1, 'Class name is required')
    .min(2, 'Class name must be at least 2 characters')
    .max(100, 'Class name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  class_type_id: z.string()
    .min(1, 'Class type is required'),
  location_id: z.string()
    .min(1, 'Location is required'),
  max_students: z.number()
    .min(1, 'Maximum students must be at least 1')
    .max(50, 'Maximum students cannot exceed 50'),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(99999, 'Price cannot exceed 99999'),
  active: z.boolean().default(true)
})

// Class Type form validation schema
export const classTypeSchema = z.object({
  name: z.string()
    .min(1, 'Class type name is required')
    .min(2, 'Class type name must be at least 2 characters')
    .max(100, 'Class type name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  duration_minutes: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
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