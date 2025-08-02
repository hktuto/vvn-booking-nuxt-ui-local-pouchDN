<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ location ? $t('classes.editLocation') : $t('classes.addLocation') }}
          </h3>
          <UButton
            @click="closeModal"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="sm"
          />
        </div>
      </template>

      <form @submit.prevent="saveLocation" class="space-y-4">
        <UFormGroup :label="$t('classes.name')" required>
          <UInput
            v-model="form.name"
            :placeholder="$t('classes.enterLocationName')"
            :error="errors.name"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.address')" required>
          <UTextarea
            v-model="form.address"
            :placeholder="$t('classes.enterAddress')"
            rows="2"
            :error="errors.address"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.phone')" required>
          <UInput
            v-model="form.phone"
            :placeholder="$t('classes.enterPhone')"
            :error="errors.phone"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.email')">
          <UInput
            v-model="form.email"
            type="email"
            :placeholder="$t('classes.enterEmail')"
            :error="errors.email"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.website')">
          <UInput
            v-model="form.website"
            type="url"
            :placeholder="$t('classes.enterWebsite')"
            :error="errors.website"
          />
        </UFormGroup>

        <UFormGroup>
          <UCheckbox
            v-model="form.active"
            :label="$t('common.active')"
          />
        </UFormGroup>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            @click="closeModal"
            variant="soft"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            @click="saveLocation"
            :loading="saving"
            :disabled="!isFormValid"
          >
            {{ $t('common.save') }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()

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

const saving = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  active: true
})

const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.address.trim() && 
         form.value.phone.trim()
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.location) {
      // Edit mode
      form.value = {
        name: props.location.name,
        address: props.location.address,
        phone: props.location.phone,
        email: props.location.email || '',
        website: props.location.website || '',
        active: props.location.active
      }
    } else {
      // Add mode
      form.value = {
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        active: true
      }
    }
    errors.value = {}
  }
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = t('validation.required', { field: t('classes.name') })
  }
  
  if (!form.value.address.trim()) {
    errors.value.address = t('validation.required', { field: t('classes.address') })
  }
  
  if (!form.value.phone.trim()) {
    errors.value.phone = t('validation.required', { field: t('classes.phone') })
  }
  
  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = t('validation.invalidEmail')
  }
  
  if (form.value.website && !isValidUrl(form.value.website)) {
    errors.value.website = t('validation.invalidUrl')
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const saveLocation = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    const locationData = {
      id: props.location?.id || crypto.randomUUID(),
      name: form.value.name.trim(),
      address: form.value.address.trim(),
      phone: form.value.phone.trim(),
      email: form.value.email.trim() || null,
      website: form.value.website.trim() || null,
      active: form.value.active,
      created_at: props.location?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // TODO: Replace with actual composable call
    // await useLocations().addLocation(locationData)
    
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