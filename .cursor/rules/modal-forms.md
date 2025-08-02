# Modal Forms Setup Rule

## Overview
When creating modals with forms in this project, always use Nuxt UI's modal slot structure to ensure proper responsive behavior and prevent content cropping on small screens.

## Required Structure

### 1. Modal Container with Proper Slots
```vue
<UModal v-model:open="modelValue">
  <template #header>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {{ modalTitle }}
    </h3>
  </template>

  <template #body>
    <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
      <!-- Form fields go here -->
    </UForm>
  </template>

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
</UModal>
```

## Key Principles

### 1. Use Modal Slots, Not Card Slots
- **Header slot**: For modal title
- **Body slot**: For form content (automatically scrollable)
- **Footer slot**: For action buttons (always visible)

### 2. Responsive Design
- Modal automatically handles height constraints
- Body content scrolls when needed
- Footer buttons remain accessible
- No manual height calculations required

### 3. Form Structure
- Use `UForm` component with proper state management
- Include error handling with `UAlert` components
- Use consistent spacing with `space-y-4`

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

### 1. Always Use Modal Slots
- Never use card inside modal with custom slots
- Let Nuxt UI handle the responsive behavior
- Use the built-in header, body, and footer slots

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
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? $t('item.editItem') : $t('item.addItem') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <UFormField name="name" :label="$t('item.name')" required>
          <UInput v-model="form.name" class="w-full" :placeholder="$t('item.namePlaceholder')" />
        </UFormField>

        <UFormField name="description" :label="$t('item.description')">
          <UTextarea v-model="form.description" class="w-full" :placeholder="$t('item.descriptionPlaceholder')" :rows="3" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="soft" :title="$t('common.error')" :description="error" />
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

1. **Don't** use card inside modal with custom slots
2. **Don't** manually set height constraints on modal content
3. **Don't** put action buttons inside the body slot
4. **Don't** forget to add `formRef` for form submission
5. **Don't** use fixed heights that might break on different screen sizes
6. **Don't** forget to handle form validation and error states

## Testing Checklist

- [ ] Modal opens and closes properly
- [ ] Form content scrolls when screen is short
- [ ] Action buttons are always visible
- [ ] Form validation works correctly
- [ ] Error messages display properly
- [ ] Modal works on mobile devices
- [ ] Keyboard navigation works
- [ ] Form submission works from footer buttons

## Migration from Card-Based Modals

If you have existing modals using card slots, migrate them to use modal slots:

### Before (Card-based):
```vue
<UModal v-model:open="modelValue">
  <template #content>
    <UCard class="max-h-[90vh] flex flex-col">
      <template #header>...</template>
      <div class="flex-1 overflow-y-auto">...</div>
      <template #footer>...</template>
    </UCard>
  </template>
</UModal>
```

### After (Modal slots):
```vue
<UModal v-model:open="modelValue">
  <template #header>...</template>
  <template #body>...</template>
  <template #footer>...</template>
</UModal>
```

## Related Components

This rule applies to all modal forms in the project:
- `StudentForm.vue`
- `PackageForm.vue`
- `AddPackageToStudent.vue`
- `ScheduleModal.vue`
- Any future modal forms