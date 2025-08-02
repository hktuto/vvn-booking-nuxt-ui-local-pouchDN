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
  const { t } = useI18n()

  // Create schema with translated messages
  const translatedStudentSchema = z.object({
    name: z.string()
      .min(1, t('validation.name.required'))
      .max(100, t('validation.name.maxLength')),
    phone: z.string()
      .min(1, t('validation.phone.required'))
      .regex(/^[0-9+\-\s()]+$/, t('validation.phone.invalid')),
    country_code: z.string()
      .min(1, t('validation.countryCode.required')),
    email: z.string()
      .email(t('validation.email.invalid'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    address: z.string()
      .max(500, t('validation.address.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    credits: z.number()
      .min(0, t('validation.credits.negative'))
      .max(99999, t('validation.credits.maxExceeded')),
    notes: z.string()
      .max(1000, t('validation.notes.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || '')
  })

  return {
    studentSchema: translatedStudentSchema
  }
} 