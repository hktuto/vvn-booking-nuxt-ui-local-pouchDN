<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ location ? t('location.editLocation') : t('location.addLocation') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" :schema="locationSchema" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <UFormField
          name="name"
          :label="t('location.name')"
          required
        >
          <UInput
            v-model="form.name"
            class="w-full"
            :placeholder="t('location.namePlaceholder')"
          />
        </UFormField>

        <UFormField
          name="address"
          :label="t('location.address')"
        >
          <UTextarea
            v-model="form.address"
            class="w-full"
            :placeholder="t('location.addressPlaceholder')"
            :rows="3"
          />
        </UFormField>

        <UFormField
          name="phone"
          :label="t('location.phone')"
        >
          <UInput
            v-model="form.phone"
            class="w-full"
            :placeholder="t('location.phonePlaceholder')"
          />
        </UFormField>

        <UFormField
          name="email"
          :label="t('location.email')"
        >
          <UInput
            v-model="form.email"
            type="email"
            class="w-full"
            :placeholder="t('location.emailPlaceholder')"
          />
        </UFormField>

        <UFormField
          name="website"
          :label="t('location.website')"
        >
          <UInput
            v-model="form.website"
            type="url"
            class="w-full"
            :placeholder="t('location.websitePlaceholder')"
          />
        </UFormField>

        <UFormField
          name="active"
          :label="t('location.active')"
        >
          <UCheckbox
            v-model="form.active"
            :label="t('location.activeDescription')"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          @click="handleCancel"
          variant="ghost"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          @click="() => formRef?.submit()"
          :loading="submitting"
          color="primary"
        >
          {{ location ? t('common.save') : t('location.addLocation') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { LocationForm } from '~/composables/useLocationValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  location?: {
    id: string
    name: string
    address: string
    phone: string
    email: string
    website: string
    active: boolean
    created_at: string
    updated_at: string
  }
}

interface Emits {
  (e: 'saved', location: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { t } = useI18n()
const { locationSchema } = useLocationValidation()

const submitting = ref(false)

const form = reactive<LocationForm>({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  active: true
})

// Reset form when modal opens/closes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

// Watch for location prop changes to populate form
watch(() => props.location, (newLocation) => {
  if (newLocation) {
    form.name = newLocation.name
    form.address = newLocation.address
    form.phone = newLocation.phone
    form.email = newLocation.email || ''
    form.website = newLocation.website || ''
    form.active = newLocation.active
  }
}, { immediate: true })

const resetForm = () => {
  form.name = ''
  form.address = ''
  form.phone = ''
  form.email = ''
  form.website = ''
  form.active = true
}

const handleSubmit = async (event: FormSubmitEvent<LocationForm>) => {
  submitting.value = true
  
  try {
    const locationData = {
      name: event.data.name,
      address: event.data.address || '',
      phone: event.data.phone || '',
      email: event.data.email || '',
      website: event.data.website || '',
      active: event.data.active
    }
    
    emit('saved', locationData)
    modelValue.value = false
  } catch (err: any) {
    console.error('Error saving location:', err)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script> 