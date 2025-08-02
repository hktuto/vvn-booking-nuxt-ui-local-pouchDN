import { z } from 'zod'

// Add package to student form validation schema
export const addPackageToStudentSchema = z.object({
  package_type: z.enum(['existing', 'custom'], {
    errorMap: () => ({ message: 'Please select a package type' })
  }),
  package_id: z.string()
    .min(1, 'Please select a package')
    .optional()
    .or(z.literal('')),
  custom_price: z.number()
    .min(0, 'Custom price cannot be negative')
    .max(99999.99, 'Custom price cannot exceed $99,999.99')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  // Custom package fields
  custom_package_price: z.number()
    .min(0, 'Price cannot be negative')
    .max(99999.99, 'Price cannot exceed $99,999.99')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  custom_package_credits: z.number()
    .min(1, 'Credits must be at least 1')
    .max(99999, 'Credits cannot exceed 99999')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  custom_package_duration: z.number()
    .min(1, 'Duration must be at least 1 day')
    .max(3650, 'Duration cannot exceed 10 years')
    .optional()
    .or(z.literal(''))
    .transform(val => val || '')
}).refine((data) => {
  if (data.package_type === 'existing') {
    return data.package_id && data.package_id.length > 0
  }
  return true
}, {
  message: "Please select a package",
  path: ["package_id"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_price && data.custom_package_price > 0
  }
  return true
}, {
  message: "Price is required for custom packages",
  path: ["custom_package_price"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_credits && data.custom_package_credits > 0
  }
  return true
}, {
  message: "Credits are required for custom packages",
  path: ["custom_package_credits"]
}).refine((data) => {
  if (data.package_type === 'custom') {
    return data.custom_package_duration && data.custom_package_duration > 0
  }
  return true
}, {
  message: "Duration is required for custom packages",
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