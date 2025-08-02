import { z } from 'zod'

// Class type form validation schema
export const classTypeSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  default_credit_cost: z.number()
    .min(0, 'Default credit cost cannot be negative')
    .max(1000, 'Default credit cost cannot exceed 1000'),
  active: z.boolean()
})

// Type exports
export type ClassTypeForm = z.infer<typeof classTypeSchema>

// Composable function
export const useClassTypeValidation = () => {
  return {
    classTypeSchema
  }
}