import { z } from 'zod'

// Location form validation schema
export const locationSchema = z.object({
  name: z.string()
    .min(1, 'validation.name.required')
    .max(100, 'validation.name.maxLength'),
  address: z.string()
    .min(1, 'validation.address.required')
    .max(500, 'validation.address.maxLength'),
  phone: z.string()
    .min(1, 'validation.phone.required')
    .regex(/^[0-9+\-\s()]+$/, 'validation.phone.invalid'),
  email: z.string()
    .email('validation.email.invalid')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  website: z.string()
    .url('validation.website.invalid')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  active: z.boolean()
})

// Type exports
export type LocationForm = z.infer<typeof locationSchema>

// Composable function
export const useLocationValidation = () => {
  const { t } = useI18n()

  // Create schema with translated messages
  const translatedLocationSchema = z.object({
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
    locationSchema: translatedLocationSchema
  }
}