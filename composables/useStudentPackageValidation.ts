import { z } from 'zod'

// Add package to student form validation schema
export const addPackageToStudentSchema = z.object({
  package_type: z.enum(['existing', 'custom'], {
    errorMap: () => ({ message: 'validation.packageType.required' })
  }),
  package_id: z.string()
    .min(1, 'validation.package.required')
    .optional()
    .or(z.literal('')),
  custom_price: z.number()
    .min(0, 'validation.customPrice.negative')
    .max(99999.99, 'validation.customPrice.maxExceeded')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  notes: z.string()
    .max(1000, 'validation.notes.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  // Custom package fields
  custom_package_price: z.number()
    .min(0, 'validation.customPrice.negative')
    .max(99999.99, 'validation.customPrice.maxExceeded')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  custom_package_credits: z.number()
    .min(1, 'validation.customCredits.min')
    .max(99999, 'validation.customCredits.maxExceeded')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  custom_package_duration: z.number()
    .min(1, 'validation.customDuration.min')
    .max(3650, 'validation.customDuration.maxExceeded')
    .optional()
    .or(z.literal(''))
    .transform(val => val || '')
}).refine((data) => {
  if (data.package_type === 'existing') {
    return data.package_id && data.package_id.length > 0
  }
  return true
}, {
  message: 'validation.package.required',
  path: ["package_id"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_price && data.custom_package_price > 0
  }
  return true
}, {
  message: 'validation.customPrice.required',
  path: ["custom_package_price"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_credits && data.custom_package_credits > 0
  }
  return true
}, {
  message: 'validation.customCredits.required',
  path: ["custom_package_credits"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_duration && data.custom_package_duration > 0
  }
  return true
}, {
  message: 'validation.customDuration.required',
  path: ["custom_package_duration"]
})

// Type exports
export type AddPackageToStudentForm = z.infer<typeof addPackageToStudentSchema>

// Composable function
export const useStudentPackageValidation = () => {
  return {
    addPackageToStudentSchema
  }
}