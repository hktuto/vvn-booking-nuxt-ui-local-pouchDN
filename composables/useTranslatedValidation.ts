import { z } from 'zod'

// Create base schemas without translations for type inference
const baseLoginSchema = z.object({
  username: z.string().min(1).min(3).max(50),
  password: z.string().min(1).min(6)
})

const baseRegisterSchema = z.object({
  display_name: z.string().min(1).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().optional().or(z.literal('')).transform(val => val || ''),
  country_code: z.string().min(1),
  phone: z.string().min(1).regex(/^[0-9+\-\s()]+$/),
  password: z.string().min(6).max(128),
  confirmPassword: z.string().min(1),
  language: z.enum(['en', 'zh-Hant'])
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"]
})

const baseStudentSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).regex(/^[0-9+\-\s()]+$/),
  country_code: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')).transform(val => val || ''),
  address: z.string().max(500).optional().or(z.literal('')).transform(val => val || ''),
  credits: z.number().min(0).max(99999),
  notes: z.string().max(1000).optional().or(z.literal('')).transform(val => val || '')
})

const basePackageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal('')).transform(val => val || ''),
  price: z.number().min(0).max(99999.99),
  credits: z.number().min(1).max(99999),
  duration_days: z.number().min(1).max(3650),
  active: z.boolean()
})

const baseScheduleSchema = z.object({
  class_type_id: z.string().min(1),
  location_id: z.string().min(1),
  weekly_days: z.array(z.string()).min(1),
  start_time: z.string().min(1).regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().min(1).regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  start_date: z.string().min(1),
  end_date: z.string().optional().or(z.literal('')).transform(val => val || ''),
  max_capacity: z.number().min(1).max(1000),
  credit_cost: z.number().min(0).max(1000),
  description: z.string().max(1000).optional().or(z.literal('')).transform(val => val || ''),
  active: z.boolean()
})

const baseClassSchema = z.object({
  name: z.string().min(1).min(2).max(100),
  description: z.string().max(500).optional().or(z.literal('')).transform(val => val || ''),
  class_type_id: z.string().min(1),
  location_id: z.string().min(1),
  max_students: z.number().min(1).max(50),
  price: z.number().min(0).max(99999),
  active: z.boolean().default(true)
})

const baseClassTypeSchema = z.object({
  name: z.string().min(1).min(2).max(100),
  description: z.string().max(500).optional().or(z.literal('')).transform(val => val || ''),
  duration_minutes: z.number().min(15).max(480),
  active: z.boolean().default(true)
})

const baseLocationSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  phone: z.string().min(1).regex(/^[0-9+\-\s()]+$/),
  email: z.string().email().optional().or(z.literal('')).transform(val => val || ''),
  website: z.string().url().optional().or(z.literal('')).transform(val => val || ''),
  active: z.boolean()
})

const baseAddPackageToStudentSchema = z.object({
  package_type: z.enum(['existing', 'custom']),
  package_id: z.string().min(1).optional().or(z.literal('')),
  custom_price: z.number().min(0).max(99999.99).optional().or(z.literal('')).transform(val => val || ''),
  notes: z.string().max(1000).optional().or(z.literal('')).transform(val => val || ''),
  custom_package_price: z.number().min(0).max(99999.99).optional().or(z.literal('')).transform(val => val || ''),
  custom_package_credits: z.number().min(1).max(99999).optional().or(z.literal('')).transform(val => val || ''),
  custom_package_duration: z.number().min(1).max(3650).optional().or(z.literal('')).transform(val => val || '')
})

// Type exports
export type LoginForm = z.infer<typeof baseLoginSchema>
export type RegisterForm = z.infer<typeof baseRegisterSchema>
export type StudentForm = z.infer<typeof baseStudentSchema>
export type PackageForm = z.infer<typeof basePackageSchema>
export type ScheduleForm = z.infer<typeof baseScheduleSchema>
export type ClassForm = z.infer<typeof baseClassSchema>
export type ClassTypeForm = z.infer<typeof baseClassTypeSchema>
export type LocationForm = z.infer<typeof baseLocationSchema>
export type AddPackageToStudentForm = z.infer<typeof baseAddPackageToStudentSchema>

// Create validation schemas with translated error messages
export const useTranslatedValidation = () => {
  const { t } = useI18n()

  // Login form validation schema
  const loginSchema = z.object({
    username: z.string()
      .min(1, t('validation.username.required'))
      .min(3, t('validation.username.minLength'))
      .max(50, t('validation.username.maxLength')),
    password: z.string()
      .min(1, t('validation.password.required'))
      .min(6, t('validation.password.minLength'))
  })

  // Registration form validation schema
  const registerSchema = z.object({
    display_name: z.string()
      .min(1, t('validation.displayName.required'))
      .max(100, t('validation.displayName.maxLength')),
    username: z.string()
      .min(3, t('validation.username.minLength'))
      .max(50, t('validation.username.maxLength'))
      .regex(/^[a-zA-Z0-9_]+$/, t('validation.username.format')),
    email: z.string()
      .email(t('validation.email.invalid'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    country_code: z.string()
      .min(1, t('validation.countryCode.required')),
    phone: z.string()
      .min(1, t('validation.phone.required'))
      .regex(/^[0-9+\-\s()]+$/, t('validation.phone.invalid')),
    password: z.string()
      .min(6, t('validation.password.minLength'))
      .max(128, t('validation.password.maxLength')),
    confirmPassword: z.string()
      .min(1, t('validation.password.confirm')),
    language: z.enum(['en', 'zh-Hant'], {
      errorMap: () => ({ message: t('validation.language.invalid') })
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.password.mismatch'),
    path: ["confirmPassword"]
  })

  // Student form validation schema
  const studentSchema = z.object({
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

  // Package form validation schema
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

  // Schedule form validation schema
  const scheduleSchema = z.object({
    class_type_id: z.string()
      .min(1, t('validation.classType.required')),
    location_id: z.string()
      .min(1, t('validation.location.required')),
    weekly_days: z.array(z.string())
      .min(1, t('validation.weeklyDays.required')),
    start_time: z.string()
      .min(1, t('validation.startTime.required'))
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, t('validation.startTime.invalid')),
    end_time: z.string()
      .min(1, t('validation.endTime.required'))
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, t('validation.endTime.invalid')),
    start_date: z.string()
      .min(1, t('validation.startDate.required')),
    end_date: z.string()
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    max_capacity: z.number()
      .min(1, t('validation.maxCapacity.min'))
      .max(1000, t('validation.maxCapacity.maxExceeded')),
    credit_cost: z.number()
      .min(0, t('validation.creditCost.negative'))
      .max(1000, t('validation.creditCost.maxExceeded')),
    description: z.string()
      .max(1000, t('validation.notes.maxLength'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    active: z.boolean()
  }).refine((data) => {
    if (data.start_time && data.end_time) {
      return data.start_time < data.end_time
    }
    return true
  }, {
    message: t('validation.endTimeAfterStart'),
    path: ["end_time"]
  }).refine((data) => {
    if (data.start_date && data.end_date && data.end_date !== '') {
      return new Date(data.start_date) <= new Date(data.end_date)
    }
    return true
  }, {
    message: t('validation.endDate.afterStart'),
    path: ["end_date"]
  })

  // Class form validation schema
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

  // Class Type form validation schema
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

  // Location form validation schema
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

  // Add package to student form validation schema
  const addPackageToStudentSchema = z.object({
    package_type: z.enum(['existing', 'custom'], {
      errorMap: () => ({ message: t('validation.packageType.required') })
    }),
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
      .transform(val => val || ''),
    custom_package_credits: z.number()
      .min(1, t('validation.customCredits.min'))
      .max(99999, t('validation.customCredits.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    custom_package_duration: z.number()
      .min(1, t('validation.customDuration.min'))
      .max(3650, t('validation.customDuration.maxExceeded'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || '')
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
    loginSchema,
    registerSchema,
    studentSchema,
    packageSchema,
    scheduleSchema,
    classSchema,
    classTypeSchema,
    locationSchema,
    addPackageToStudentSchema
  }
}