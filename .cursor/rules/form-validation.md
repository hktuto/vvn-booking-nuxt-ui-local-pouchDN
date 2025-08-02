# Form Validation Rules

## Overview
All forms in the system must use Nuxt UI's `UForm` component with Zod schema validation. This provides consistent error handling, type safety, and a better developer experience.

## Required Validation Structure

### 1. Schema Definition
- Create validation schemas in dedicated composables under `composables/use*Validation.ts`
- Use Zod for schema definition with comprehensive validation rules
- Export both the schema and the inferred TypeScript type

### 2. Form Component Setup
```vue
<UForm :state="form" :schema="validationSchema" @submit="handleSubmit" ref="formRef">
  <UFormField name="fieldName" label="Field Label" required>
    <UInput v-model="form.fieldName" />
  </UFormField>
</UForm>
```

### 3. Form Submission Handler
```typescript
const handleSubmit = async (event: FormSubmitEvent<FormType>) => {
  // event.data contains validated form data
  const validatedData = event.data
  // Process the validated data
}
```

## Required Components

### Form Container
- Use `UForm` with `:state`, `:schema`, and `@submit` props
- Add `ref="formRef"` for programmatic submission

### Form Fields
- Use `UFormField` with `name` prop matching schema field names
- Remove `:error` props - Nuxt UI handles error display automatically

### Input Components
- `UInput` for text, email, number, url inputs
- `USelect` for dropdown selections
- `UTextarea` for multi-line text
- `UCheckbox` for boolean values

## Validation Schema Requirements

### Basic Field Types
```typescript
import { z } from 'zod'

export const exampleSchema = z.object({
  // Required string with length constraints
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  // Optional string with transformation
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  
  // Email validation
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  
  // Number with range validation
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(99999.99, 'Price cannot exceed $99,999.99'),
  
  // Enum with custom error message
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  
  // Boolean
  active: z.boolean()
})
```

### Advanced Validation
```typescript
// Cross-field validation
.refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"]
})

// Conditional validation
.refine((data) => {
  if (data.packageType === 'custom') {
    return data.customPrice && data.customPrice > 0
  }
  return true
}, {
  message: "Price is required for custom packages",
  path: ["customPrice"]
})

// Regex validation
phone: z.string()
  .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
```

## Complete Form Example

```vue
<template>
  <UForm :state="form" :schema="validationSchema" @submit="handleSubmit" ref="formRef">
    <UFormField name="name" label="Name" required>
      <UInput v-model="form.name" placeholder="Enter name" />
    </UFormField>
    
    <UFormField name="email" label="Email">
      <UInput v-model="form.email" type="email" placeholder="Enter email" />
    </UFormField>
    
    <UFormField name="active">
      <UCheckbox v-model="form.active" label="Active" />
    </UFormField>
  </UForm>
</template>

<script setup lang="ts">
import type { FormType } from '~/composables/useValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

const formRef = ref()
const { validationSchema } = useValidation()

const form = reactive<FormType>({
  name: '',
  email: '',
  active: true
})

const handleSubmit = async (event: FormSubmitEvent<FormType>) => {
  try {
    // event.data contains validated form data
    await saveData(event.data)
  } catch (error) {
    console.error('Form submission error:', error)
  }
}
</script>
```

## Migration Checklist

### ✅ Completed Migrations
- `pages/login.vue` - Login form with schema validation
- `pages/register.vue` - Registration form with enhanced validation
- `components/StudentForm.vue` - Student creation/editing modal
- `components/ScheduleModal.vue` - Class schedule modal
- `components/PackageForm.vue` - Package creation/editing modal
- `components/AddPackageToStudent.vue` - Add package to student modal
- `components/ClassTypeModal.vue` - Class type creation/editing modal
- `components/LocationModal.vue` - Location creation/editing modal

### ✅ Created Validation Composables
- `composables/useAuthValidation.ts` - Authentication forms
- `composables/useStudentValidation.ts` - Student forms
- `composables/useScheduleValidation.ts` - Schedule forms
- `composables/usePackageValidation.ts` - Package forms
- `composables/useStudentPackageValidation.ts` - Student package forms
- `composables/useClassTypeValidation.ts` - Class type forms
- `composables/useLocationValidation.ts` - Location forms

## Common Mistakes to Avoid

1. **Don't use `:error` props** - Nuxt UI handles error display automatically
2. **Don't manually validate** - Let the schema handle validation
3. **Don't use `errors` reactive object** - Remove manual error state management
4. **Don't use `UFormGroup`** - Use `UFormField` instead
5. **Don't forget `name` prop** - Each `UFormField` needs a `name` matching the schema
6. **Don't use `form.value`** - Use `reactive` instead of `ref` for form state

## Testing Checklist

- [ ] Form validation works with invalid data
- [ ] Error messages display correctly
- [ ] Form submission only occurs with valid data
- [ ] Cross-field validation works
- [ ] Optional fields handle empty values correctly
- [ ] Form resets properly when modal closes
- [ ] TypeScript types are correct

## Related Files

### Core Form Components
- `pages/login.vue`
- `pages/register.vue`
- `components/StudentForm.vue`
- `components/ScheduleModal.vue`
- `components/PackageForm.vue`
- `components/AddPackageToStudent.vue`
- `components/ClassTypeModal.vue`
- `components/LocationModal.vue`

### Validation Composables
- `composables/useAuthValidation.ts`
- `composables/useStudentValidation.ts`
- `composables/useScheduleValidation.ts`
- `composables/usePackageValidation.ts`
- `composables/useStudentPackageValidation.ts`
- `composables/useClassTypeValidation.ts`
- `composables/useLocationValidation.ts`

### Documentation
- `.cursor/rules/modal-forms.md`
- `.cursor/rules/form-validation.md`