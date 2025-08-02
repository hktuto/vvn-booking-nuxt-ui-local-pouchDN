import { z } from 'zod'

// Composable function
export const useStudentPackageValidation = () => {
  const { t } = useI18n()

  // Create schema with translated messages
  const addPackageToStudentSchema = z.object({
    package_type: z.enum(['existing', 'custom']),
    package_id: z.string()
      .min(1, t('validation.package.required'))
      .optional()
      .or(z.literal('')),
    custom_price: z.number()
      .min(0, t('validation.customPrice.negative'))
      .max(99999.99, t('validation.customPrice.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    notes: z.string()
      .max(1000, t('validation.notes.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    // Custom package fields
    custom_package_price: z.number()
      .min(0, t('validation.customPrice.negative'))
      .max(99999.99, t('validation.customPrice.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || 0),
    custom_package_credits: z.number()
      .min(1, t('validation.customCredits.min'))
      .max(99999, t('validation.customCredits.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || 0),
    custom_package_duration: z.number()
      .min(1, t('validation.customDuration.min'))
      .max(3650, t('validation.customDuration.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || 0)
  }).refine((data) => {
    if (data.package_type === 'existing') {
      return data.package_id && data.package_id.length > 0
    }
    return true
  }, {
    message: t('validation.package.required'),
    path: ["package_id"]
  }).refine((data) => {
    if (data.package_type === 'custom') {
      return data.custom_package_price && data.custom_package_price > 0
    }
    return true
  }, {
    message: t('validation.customPrice.required'),
    path: ["custom_package_price"]
  }).refine((data) => {
    if (data.package_type === 'custom') {
      return data.custom_package_credits && data.custom_package_credits > 0
    }
    return true
  }, {
    message: t('validation.customCredits.required'),
    path: ["custom_package_credits"]
  }).refine((data) => {
    if (data.package_type === 'custom') {
      return data.custom_package_duration && data.custom_package_duration > 0
    }
    return true
  }, {
    message: t('validation.customDuration.required'),
    path: ["custom_package_duration"]
  })

  return {
    addPackageToStudentSchema
  }
}

// Type exports
export type AddPackageToStudentForm = z.infer<ReturnType<typeof useStudentPackageValidation>['addPackageToStudentSchema']>