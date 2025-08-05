# Modal Forms Rules

## Overview
Modal forms must use Nuxt UI's `UModal` component with `UForm` and Zod schema validation for consistent user experience and proper error handling.

## Required Structure

### 1. Modal Container
```vue
<UModal v-model:open="isOpen" >
  <template #header>
    <!-- Modal header content -->
  </template>
  
  <template #body>
    <!-- Form content -->
  </template>
  
  <template #footer>
    <!-- Action buttons -->
  </template>
</UModal>
```

### 2. Form Integration
```vue
<UForm :state="form" :schema="validationSchema" @submit="handleSubmit" ref="formRef">
  <UFormField name="fieldName" label="Field Label" required>
    <UInput v-model="form.fieldName" />
  </UFormField>
</UForm>
```

## Key Principles

1. **Schema-Based Validation**: Use Zod schemas for all form validation
2. **Automatic Error Handling**: Let Nuxt UI handle error display automatically
3. **Type Safety**: Use proper TypeScript types for form data
4. **Consistent UX**: Follow the same patterns across all modal forms
5. **No Manual Validation**: Remove manual validation logic and error state management

## Script Setup Requirements

```typescript
import type { FormType } from '~/composables/useValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  open: boolean
  item?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', item: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { validationSchema } = useValidation()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const form = reactive<FormType>({
  // Initialize form fields
})

const handleSubmit = async (event: FormSubmitEvent<FormType>) => {
  try {
    emit('saved', event.data)
    isOpen.value = false
  } catch (error) {
    console.error('Form submission error:', error)
  }
}
```

## Best Practices

1. **Form State Management**
   - Use `reactive` instead of `ref` for form state
   - Initialize all fields with proper default values
   - Use proper TypeScript typing

2. **Modal State Management**
   - Use computed property for `v-model` binding
   - Handle both add and edit modes in the same component
   - Reset form when modal opens/closes

3. **Form Submission**
   - Use `FormSubmitEvent` for type-safe data access
   - Access validated data via `event.data`
   - Handle errors gracefully

4. **User Experience**
   - Show loading state during submission
   - Provide clear success/error feedback
   - Allow easy cancellation

## Example Implementation

```vue
<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ item ? $t('item.editItem') : $t('item.addItem') }}
        </h3>
        <UButton
          @click="closeModal"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
        />
      </div>
    </template>

    <template #body>
      <UForm :state="form" :schema="validationSchema" @submit="handleSubmit" ref="formRef">
        <UFormField name="name" :label="$t('item.name')" required>
          <UInput v-model="form.name" :placeholder="$t('item.namePlaceholder')" />
        </UFormField>
        
        <UFormField name="description" :label="$t('item.description')">
          <UTextarea v-model="form.description" :placeholder="$t('item.descriptionPlaceholder')" rows="3" />
        </UFormField>
        
        <UFormField name="active">
          <UCheckbox v-model="form.active" :label="$t('common.active')" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton @click="closeModal" variant="soft">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton @click="() => formRef?.submit()" :loading="submitting">
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormType } from '~/composables/useValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()

interface Props {
  open: boolean
  item?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', item: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { validationSchema } = useValidation()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const submitting = ref(false)

const form = reactive<FormType>({
  name: '',
  description: '',
  active: true
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.item) {
      // Edit mode
      form.name = props.item.name
      form.description = props.item.description || ''
      form.active = props.item.active
    } else {
      // Add mode
      form.name = ''
      form.description = ''
      form.active = true
    }
  }
})

const handleSubmit = async (event: FormSubmitEvent<FormType>) => {
  submitting.value = true
  
  try {
    const itemData = {
      id: props.item?.id || crypto.randomUUID(),
      ...event.data,
      created_at: props.item?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    emit('saved', itemData)
    closeModal()
  } catch (error) {
    console.error('Error saving item:', error)
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>
```

## Common Mistakes to Avoid

1. **Don't use `UFormGroup`** - Use `UFormField` instead
2. **Don't add `:error` props** - Nuxt UI handles error display automatically
3. **Don't use manual validation** - Let the schema handle validation
4. **Don't forget `name` prop** - Each `UFormField` needs a `name` matching the schema
5. **Don't use `form.value`** - Use `reactive` instead of `ref` for form state
6. **Don't forget `ref="formRef"`** - Needed for programmatic submission
7. **Don't use `@click="handleSubmit"`** - Use `@click="() => formRef?.submit()"` on submit button

## Testing Checklist

- [ ] Modal opens and closes correctly
- [ ] Form validation works with invalid data
- [ ] Error messages display correctly
- [ ] Form submission only occurs with valid data
- [ ] Form resets properly when modal closes
- [ ] Edit mode populates form correctly
- [ ] Add mode starts with clean form
- [ ] Loading states work correctly
- [ ] TypeScript types are correct

## Related Components

### ✅ Completed Modal Forms
- `components/StudentForm.vue` - Student creation/editing modal
- `components/ScheduleModal.vue` - Class schedule modal
- `components/PackageForm.vue` - Package creation/editing modal
- `components/AddPackageToStudent.vue` - Add package to student modal
- `components/ClassTypeModal.vue` - Class type creation/editing modal
- `components/LocationModal.vue` - Location creation/editing modal

### Validation Composables
- `composables/useStudentValidation.ts`
- `composables/useScheduleValidation.ts`
- `composables/usePackageValidation.ts`
- `composables/useStudentPackageValidation.ts`
- `composables/useClassTypeValidation.ts`
- `composables/useLocationValidation.ts`

### Documentation
- `.cursor/rules/form-validation.md`
- `.cursor/rules/modal-forms.md`