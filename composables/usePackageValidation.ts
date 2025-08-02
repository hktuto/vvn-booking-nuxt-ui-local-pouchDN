import { z } from 'zod'

// Composable function
export const usePackageValidation = () => {
  const { t } = useI18n()

  // Create schema with translated messages
  const packageSchema = z.object({
    name: z.string()
      .min(1, t('validation.name.required'))
      .max(100, t('validation.name.maxLength')),
    description: z.string()
      .max(500, t('validation.description.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    price: z.number()
      .min(0, t('validation.price.negative'))
      .max(99999.99, t('validation.price.maxExceeded')),
    credits: z.number()
      .min(1, t('validation.packageCredits.min'))
      .max(99999, t('validation.packageCredits.maxExceeded')),
    duration_days: z.number()
      .min(1, t('validation.duration.min'))
      .max(3650, t('validation.duration.maxExceeded')),
    active: z.boolean()
  })

  return {
    packageSchema
  }
}

// Type exports
export type PackageForm = z.infer<ReturnType<typeof usePackageValidation>['packageSchema']> 