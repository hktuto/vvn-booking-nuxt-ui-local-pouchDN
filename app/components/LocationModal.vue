<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ location ? $t('location.editLocation') : $t('location.addLocation') }}
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
      <UForm :state="form" :schema="locationSchema" class="space-y-4" @submit="saveLocation" ref="formRef">
        <UFormField name="name" :label="$t('location.name')" required>
          <UInput
            v-model="form.name"
            :placeholder="$t('location.namePlaceholder')"
          />
        </UFormField>

        <UFormField name="address" :label="$t('location.address')" required>
          <UTextarea
            v-model="form.address"
            :placeholder="$t('location.addressPlaceholder')"
            rows="2"
          />
        </UFormField>

        <UFormField name="phone" :label="$t('location.phone')" required>
          <UInput
            v-model="form.phone"
            :placeholder="$t('location.phonePlaceholder')"
          />
        </UFormField>

        <UFormField name="email" :label="$t('location.email')">
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="$t('location.emailPlaceholder')"
          />
        </UFormField>

        <UFormField name="website" :label="$t('location.website')">
          <UInput
            v-model="form.website"
            type="url"
            :placeholder="$t('location.websitePlaceholder')"
          />
        </UFormField>

        <UFormField name="active">
          <UCheckbox
            v-model="form.active"
            :label="$t('common.active')"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          @click="closeModal"
          variant="soft"
        >
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          @click="() => formRef?.submit()"
          :loading="saving"
        >
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { LocationForm } from '~/composables/useLocationValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const { locationSchema } = useLocationValidation()

interface Props {
  open: boolean
  location?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', location: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const formRef = ref()

const saving = ref(false)

const form = reactive<LocationForm>({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  active: true
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.location) {
      // Edit mode
      form.name = props.location.name
      form.address = props.location.address
      form.phone = props.location.phone
      form.email = props.location.email || ''
      form.website = props.location.website || ''
      form.active = props.location.active
    } else {
      // Add mode
      form.name = ''
      form.address = ''
      form.phone = ''
      form.email = ''
      form.website = ''
      form.active = true
    }
  }
})

const saveLocation = async (event: FormSubmitEvent<LocationForm>) => {
  saving.value = true
  
  try {
    const locationData = {
      name: event.data.name,
      address: event.data.address,
      phone: event.data.phone,
      email: event.data.email || '',
      website: event.data.website || '',
      active: event.data.active
    }
    
    emit('saved', locationData)
    closeModal()
  } catch (error) {
    console.error('Error saving location:', error)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>