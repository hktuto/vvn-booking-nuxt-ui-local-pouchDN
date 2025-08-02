# Form Validation Rule

## Overview
All forms in this project must follow a standardized validation pattern that displays field-specific errors directly on input components for better user experience.

## Required Validation Structure

### 1. Field-Specific Error Display
Every form input must include an `:error` prop that displays validation errors directly on the field:

```vue
<UInput
  v-model="form.fieldName"
  :placeholder="$t('form.fieldPlaceholder')"
  :error="errors.fieldName"
/>
```

### 2. Error State Management
Use a reactive `errors` object to store field-specific validation errors:

```vue
<script setup lang="ts">
const errors = ref<Record<string, string>>({})
</script>
```

### 3. Validation Error Handling
Map validation errors to specific fields using the error path:

```vue
const handleSubmit = async () => {
  errors.value = {} // Clear previous errors
  
  try {
    const validatedData = schema.parse(form)
    // Handle successful validation
  } catch (err: any) {
    if (err.name === 'ZodError') {
      // Map validation errors to specific fields
      err.errors.forEach((error: any) => {
        errors.value[error.path[0]] = error.message
      })
    } else {
      console.error('Form error:', err)
    }
  }
}
```

## Required Components

### 1. Input Fields with Error Display
```vue
<UFormField name="fieldName" :label="$t('form.fieldLabel')" required>
  <UInput
    v-model="form.fieldName"
    class="w-full"
    :placeholder="$t('form.fieldPlaceholder')"
    :error="errors.fieldName"
  />
</UFormField>
```

### 2. Textarea Fields with Error Display
```vue
<UFormField name="fieldName" :label="$t('form.fieldLabel')">
  <UTextarea
    v-model="form.fieldName"
    class="w-full"
    :placeholder="$t('form.fieldPlaceholder')"
    :rows="3"
    :error="errors.fieldName"
  />
</UFormField>
```

### 3. Select Fields with Error Display
```vue
<UFormField name="fieldName" :label="$t('form.fieldLabel')" required>
  <USelect
    v-model="form.fieldName"
    class="w-full"
    :items="options"
    :placeholder="$t('form.fieldPlaceholder')"
    :error="errors.fieldName"
  />
</UFormField>
```

### 4. Number Input Fields with Error Display
```vue
<UFormField name="fieldName" :label="$t('form.fieldLabel')">
  <UInput
    v-model.number="form.fieldName"
    type="number"
    min="0"
    class="w-full"
    :placeholder="'0'"
    :error="errors.fieldName"
  />
</UFormField>
```

## Form Reset Function
Always include a reset function that clears both form data and errors:

```vue
const resetForm = () => {
  form.field1 = ''
  form.field2 = ''
  // ... reset all form fields
  errors.value = {} // Clear all errors
}
```

## Validation Schema Requirements

### 1. Use Zod for Validation
```typescript
import { z } from 'zod'

export const formSchema = z.object({
  fieldName: z.string()
    .min(1, 'Field is required')
    .max(32, 'Field must be less than 32 characters'),
  // ... other fields
})
```

### 2. Proper Error Messages
- Use clear, user-friendly error messages
- Include field names in error messages when appropriate
- Use consistent message formatting

### 3. Field-Specific Validation Rules
```typescript
// Text fields
name: z.string()
  .min(1, 'Name is required')
  .max(32, 'Name must be less than 32 characters'),

// Email fields
email: z.string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''))
  .transform(val => val || ''),

// Number fields
credits: z.number()
  .min(0, 'Credits cannot be negative')
  .max(9999, 'Credits cannot exceed 9999'),

// Optional text fields
notes: z.string()
  .max(500, 'Notes must be less than 500 characters')
  .optional()
  .or(z.literal(''))
  .transform(val => val || '')
```

## Complete Form Example

```vue
<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? $t('item.editItem') : $t('item.addItem') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <UFormField name="name" :label="$t('item.name')" required>
          <UInput
            v-model="form.name"
            class="w-full"
            :placeholder="$t('item.namePlaceholder')"
            :error="errors.name"
          />
        </UFormField>

        <UFormField name="email" :label="$t('item.email')">
          <UInput
            v-model="form.email"
            type="email"
            class="w-full"
            :placeholder="$t('item.emailPlaceholder')"
            :error="errors.email"
          />
        </UFormField>

        <UFormField name="description" :label="$t('item.description')">
          <UTextarea
            v-model="form.description"
            class="w-full"
            :placeholder="$t('item.descriptionPlaceholder')"
            :rows="3"
            :error="errors.description"
          />
        </UFormField>

        <UFormField name="credits" :label="$t('item.credits')">
          <UInput
            v-model.number="form.credits"
            type="number"
            min="0"
            class="w-full"
            :placeholder="'0'"
            :error="errors.credits"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton @click="handleCancel" variant="ghost">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton @click="() => formRef?.submit()" :loading="submitting" color="primary">
          {{ isEditing ? $t('common.save') : $t('common.add') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormData } from '~/composables/useFormValidation'

interface Props {
  item?: any
}

interface Emits {
  (e: 'saved', item: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { formSchema } = useFormValidation()

const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive<FormData>({
  name: '',
  email: '',
  description: '',
  credits: 0
})

const isEditing = computed(() => !!props.item)

// Reset form when modal opens/closes or item changes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    resetForm()
    if (props.item) {
      // Populate form with existing item data
      form.name = props.item.name || ''
      form.email = props.item.email || ''
      form.description = props.item.description || ''
      form.credits = props.item.credits || 0
    }
  }
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.description = ''
  form.credits = 0
  errors.value = {}
}

const handleSubmit = async () => {
  submitting.value = true
  errors.value = {}
  
  try {
    // Validate form data
    const validatedData = formSchema.parse(form)
    
    // Emit the validated data to parent
    emit('saved', validatedData)
    
    // Close modal
    modelValue.value = false
  } catch (err: any) {
    if (err.name === 'ZodError') {
      // Map validation errors to specific fields
      err.errors.forEach((error: any) => {
        errors.value[error.path[0]] = error.message
      })
    } else {
      console.error('Form error:', err)
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script>
```

## Migration Checklist

When updating existing forms to follow this validation pattern:

1. **Add `:error` props** to all input components
2. **Replace single error state** with `errors` object
3. **Update validation logic** to map errors to specific fields
4. **Remove general error alerts** (errors now show on fields)
5. **Update reset functions** to clear errors object
6. **Test all validation scenarios** to ensure proper error display

## Common Mistakes to Avoid

1. **Don't** use general error alerts for field-specific validation
2. **Don't** forget to clear errors when resetting forms
3. **Don't** forget to add `:error` props to all input components
4. **Don't** use inconsistent error message formatting
5. **Don't** forget to handle both Zod validation errors and other errors
6. **Don't** forget to clear errors before each validation attempt

## Testing Checklist

- [ ] Field-specific errors display correctly
- [ ] Errors clear when form is reset
- [ ] Errors clear when validation passes
- [ ] Multiple field errors display simultaneously
- [ ] Error messages are user-friendly and clear
- [ ] Form submission works correctly with valid data
- [ ] Form submission fails gracefully with invalid data
- [ ] Error display works on all input types (text, textarea, select, number)

## Related Files

This rule applies to all forms in the project:
- `components/StudentForm.vue`
- `components/PackageForm.vue`
- `components/AddPackageToStudent.vue`
- `components/ScheduleModal.vue`
- `components/ClassTypeModal.vue`
- `components/LocationModal.vue`
- Any future form components