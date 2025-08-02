import { z } from 'zod'

// Composable function
export const useClassValidation = () => {
  const { t } = useI18n()

  // Create schemas with translated messages
  const classSchema = z.object({
    name: z.string()
      .min(1, t('validation.className.required'))
      .min(2, t('validation.className.minLength'))
      .max(100, t('validation.className.maxLength')),
    description: z.string()
      .max(500, t('validation.description.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    class_type_id: z.string()
      .min(1, t('validation.classType.required')),
    location_id: z.string()
      .min(1, t('validation.location.required')),
    max_students: z.number()
      .min(1, t('validation.maxStudents.min'))
      .max(50, t('validation.maxStudents.maxExceeded')),
    price: z.number()
      .min(0, t('validation.price.negative'))
      .max(99999, t('validation.price.maxExceededSimple')),
    active: z.boolean().default(true)
  })

  const classTypeSchema = z.object({
    name: z.string()
      .min(1, t('validation.classTypeName.required'))
      .min(2, t('validation.classTypeName.minLength'))
      .max(100, t('validation.classTypeName.maxLength')),
    description: z.string()
      .max(500, t('validation.description.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    duration_minutes: z.number()
      .min(15, t('validation.durationMinutes.min'))
      .max(480, t('validation.durationMinutes.maxExceeded')),
    active: z.boolean().default(true)
  })

  return {
    classSchema,
    classTypeSchema
  }
}

// Type exports
export type ClassForm = z.infer<ReturnType<typeof useClassValidation>['classSchema']>
export type ClassTypeForm = z.infer<ReturnType<typeof useClassValidation>['classTypeSchema']> 