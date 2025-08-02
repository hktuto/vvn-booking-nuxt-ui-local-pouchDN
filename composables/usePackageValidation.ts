import { z } from 'zod'

// Package form validation schema
export const packageSchema = z.object({
  name: z.string()
    .min(1, 'validation.name.required')
    .max(100, 'validation.name.maxLength'),
  description: z.string()
    .max(500, 'validation.description.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  price: z.number()
    .min(0, 'validation.price.negative')
    .max(99999.99, 'validation.price.maxExceeded'),
  credits: z.number()
    .min(1, 'validation.packageCredits.min')
    .max(99999, 'validation.packageCredits.maxExceeded'),
  duration_days: z.number()
    .min(1, 'validation.duration.min')
    .max(3650, 'validation.duration.maxExceeded'),
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