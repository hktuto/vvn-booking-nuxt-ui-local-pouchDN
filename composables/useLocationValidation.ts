import { z } from 'zod'

// Location form validation schema
export const locationSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  active: z.boolean()
})

// Type exports
export type LocationForm = z.infer<typeof locationSchema>

// Composable function
export const useLocationValidation = () => {
  return {
    locationSchema
  }
}