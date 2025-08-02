import { z } from 'zod'

// Class type form validation schema
export const classTypeSchema = z.object({
  name: z.string()
    .min(1, 'validation.classTypeName.required')
    .max(100, 'validation.classTypeName.maxLength'),
  description: z.string()
    .max(500, 'validation.description.maxLength')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  default_credit_cost: z.number()
    .min(0, 'validation.defaultCreditCost.negative')
    .max(1000, 'validation.defaultCreditCost.maxExceeded'),
  active: z.boolean()
})

// Type exports
export type ClassTypeForm = z.infer<typeof classTypeSchema>

// Composable function
export const useClassTypeValidation = () => {
  return {
    classTypeSchema
  }
}