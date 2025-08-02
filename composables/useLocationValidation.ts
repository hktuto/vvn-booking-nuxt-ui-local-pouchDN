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
      .min(1, t('validation.address.required'))
      .max(500, t('validation.address.maxLength')),
    phone: z.string()
      .min(1, t('validation.phone.required'))
      .regex(/^[0-9+\-\s()]+$/, t('validation.phone.invalid')),
    email: z.string()
      .email(t('validation.email.invalid'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    website: z.string()
      .url(t('validation.website.invalid'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    active: z.boolean()
  })

  return {
    locationSchema
  }
}

// Type exports
export type LocationForm = z.infer<ReturnType<typeof useLocationValidation>['locationSchema']>