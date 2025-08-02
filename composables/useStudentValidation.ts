import { z } from 'zod'

// Student form validation schema
export const studentSchema = z.object({
  name: z.string()
    .min(1, 'validation.name.required')
    .max(100, 'validation.name.maxLength'),
  phone: z.string()
    .min(1, 'validation.phone.required')
    .regex(/^[0-9+\-\s()]+$/, 'validation.phone.invalid'),
  country_code: z.string()
    .min(1, 'validation.countryCode.required'),
  email: z.string()
    .email('validation.email.invalid')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  address: z.string()
    .max(500, 'validation.address.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  credits: z.number()
    .min(0, 'validation.credits.negative')
    .max(99999, 'validation.credits.maxExceeded'),
  notes: z.string()
    .max(1000, 'validation.notes.maxLength')
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