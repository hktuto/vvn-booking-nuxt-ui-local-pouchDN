import { z } from 'zod'

// Student form validation schema
export const studentSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  country_code: z.string()
    .min(1, 'Country code is required'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  credits: z.number()
    .min(0, 'Credits cannot be negative')
    .max(99999, 'Credits cannot exceed 99999'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || '')
})

// Type exports
export type StudentForm = z.infer<typeof studentSchema>

// Composable function
export const useStudentValidation = () => {
  return {
    studentSchema
  }
} 