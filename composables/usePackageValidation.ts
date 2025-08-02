import { z } from 'zod'

// Package form validation schema
export const packageSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(99999.99, 'Price cannot exceed $99,999.99'),
  credits: z.number()
    .min(1, 'Credits must be at least 1')
    .max(99999, 'Credits cannot exceed 99999'),
  duration_days: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(3650, 'Duration cannot exceed 10 years'),
  active: z.boolean()
})

// Type exports
export type PackageForm = z.infer<typeof packageSchema>

// Composable function
export const usePackageValidation = () => {
  return {
    packageSchema
  }
} 