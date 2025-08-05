import { z } from 'zod'

// Composable function
export const useLocationValidation = () => {
  const { t } = useI18n()

  // Create schema with translated messages
  const locationSchema = z.object({
    name: z.string()
      .min(1, t('validation.name.required'))
      .max(100, t('validation.name.maxLength')),
    address: z.string()
      .max(500, t('validation.address.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    phone: z.string()
      .optional()
      .or(z.literal(''))
      .transform(val => val || '')
      .refine((val) => !val || /^[0-9+\-\s()]+$/.test(val), {
        message: t('validation.phone.invalid')
      }),
    email: z.string()
      .optional()
      .or(z.literal(''))
      .transform(val => val || '')
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: t('validation.email.invalid')
      }),
    website: z.string()
      .optional()
      .or(z.literal(''))
      .transform(val => val || '')
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: t('validation.website.invalid')
      }),
    active: z.boolean()
  })

  return {
    locationSchema
  }
}

// Type exports
export type LocationForm = z.infer<ReturnType<typeof useLocationValidation>['locationSchema']>