import { z } from 'zod'

// Package form validation schema
export const packageSchema = z.object({
  name: z.string()
    .min(1, 'Package name is required')
    .min(2, 'Package name must be at least 2 characters')
    .max(100, 'Package name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(99999, 'Price cannot exceed 99999'),
  credits: z.number()
    .min(1, 'Credits must be at least 1')
    .max(999, 'Credits cannot exceed 999'),
  duration_days: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  active: z.boolean().default(true)
})

// Type exports
export type PackageForm = z.infer<typeof packageSchema>

// Composable function
export const usePackageValidation = () => {
  return {
    packageSchema
  }
} 