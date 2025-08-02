# Modal Forms Setup Rule

## Overview
When creating modals with forms in this project, always use the proper structure to ensure the form content is scrollable on short screens and action buttons are always accessible.

## Required Structure

### 1. Modal Container
```vue
<UModal v-model:open="modelValue">
  <template #content>
    <UCard class="max-h-[90vh] flex flex-col">
      <!-- Header, Content, Footer structure -->
    </UCard>
  </template>
</UModal>
```

### 2. Card Structure with Three Sections
```vue
<UCard class="max-h-[90vh] flex flex-col">
  <!-- Header - Always visible -->
  <template #header>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ modalTitle }}
    </h3>
  </template>

  <!-- Scrollable Content Area -->
  <div class="flex-1 overflow-y-auto">
    <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
      <!-- Form fields go here -->
    </UForm>
  </div>

  <!-- Footer - Always visible with action buttons -->
  <template #footer>
    <div class="flex justify-end gap-3">
      <UButton @click="handleCancel" variant="ghost">
        {{ $t('common.cancel') }}
      </UButton>
      <UButton @click="() => formRef?.submit()" :loading="submitting" color="primary">
        {{ $t('common.save') }}
      </UButton>
    </div>
  </template>
</UCard>
```

## Key CSS Classes

- `max-h-[90vh]` - Limits modal height to 90% of viewport
- `flex flex-col` - Enables vertical flexbox layout
- `flex-1` - Makes content area take remaining space
- `overflow-y-auto` - Enables vertical scrolling when content overflows

## Script Setup Requirements

### 1. Form Reference
```vue
<script setup lang="ts">
const formRef = ref()
// ... other code
</script>
```

### 2. Form Submission Handling
```vue
// Use formRef to submit the form from footer buttons
<UButton @click="() => formRef?.submit()" :loading="submitting" color="primary">
  {{ $t('common.save') }}
</UButton>
```

## Best Practices

### 1. Always Use This Structure
- Never put forms directly in the card body without the scrollable wrapper
- Always separate header, content, and footer sections
- Always use the footer template for action buttons

### 2. Form Validation
- Use `UForm` component with proper state management
- Include error handling with `UAlert` components
- Validate form data before submission

### 3. Responsive Design
- Use `space-y-4` for consistent spacing between form fields
- Use `grid` layouts for responsive field arrangements
- Test on different screen sizes

### 4. Accessibility
- Include proper labels for all form fields
- Use semantic HTML structure
- Ensure keyboard navigation works properly

## Example Implementation

```vue
<template>
  <UModal v-model:open="modelValue">
    <template #content>
      <UCard class="max-h-[90vh] flex flex-col">
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? $t('item.editItem') : $t('item.addItem') }}
          </h3>
        </template>

        <div class="flex-1 overflow-y-auto">
          <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
            <UFormField name="name" :label="$t('item.name')" required>
              <UInput v-model="form.name" class="w-full" :placeholder="$t('item.namePlaceholder')" />
            </UFormField>

            <UFormField name="description" :label="$t('item.description')">
              <UTextarea v-model="form.description" class="w-full" :placeholder="$t('item.descriptionPlaceholder')" :rows="3" />
            </UFormField>

            <UAlert v-if="error" color="error" variant="soft" :title="$t('common.error')" :description="error" />
          </UForm>
        </div>

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
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const modelValue = defineModel<boolean>()
const formRef = ref()
const submitting = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  description: ''
})

const handleSubmit = async () => {
  // Form submission logic
}

const handleCancel = () => {
  modelValue.value = false
}
</script>
```

## Common Mistakes to Avoid

1. **Don't** put forms directly in card body without scrollable wrapper
2. **Don't** put action buttons inside the scrollable content area
3. **Don't** forget to add `formRef` for form submission
4. **Don't** use fixed heights that might break on different screen sizes
5. **Don't** forget to handle form validation and error states

## Testing Checklist

- [ ] Modal opens and closes properly
- [ ] Form content scrolls when screen is short
- [ ] Action buttons are always visible
- [ ] Form validation works correctly
- [ ] Error messages display properly
- [ ] Modal works on mobile devices
- [ ] Keyboard navigation works
- [ ] Form submission works from footer buttons

## Related Components

This rule applies to all modal forms in the project:
- `StudentForm.vue`
- `PackageForm.vue`
- `AddPackageToStudent.vue`
- `ScheduleModal.vue`
- Any future modal forms