<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ classType ? $t('classes.editClassType') : $t('classes.addClassType') }}
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
      <form @submit.prevent="saveClassType" class="space-y-4">
        <UFormGroup :label="$t('classes.name')" required>
          <UInput
            v-model="form.name"
            :placeholder="$t('classes.enterClassName')"
            :error="errors.name"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.description')">
          <UTextarea
            v-model="form.description"
            :placeholder="$t('classes.enterDescription')"
            rows="3"
            :error="errors.description"
          />
        </UFormGroup>

        <UFormGroup :label="$t('classes.defaultCreditCost')" required>
          <UInput
            v-model.number="form.default_credit_cost"
            type="number"
            min="0"
            step="0.5"
            :placeholder="$t('classes.enterCreditCost')"
            :error="errors.default_credit_cost"
          />
        </UFormGroup>

        <UFormGroup>
          <UCheckbox
            v-model="form.active"
            :label="$t('common.active')"
          />
        </UFormGroup>
      </form>
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
          @click="saveClassType"
          :loading="saving"
          :disabled="!isFormValid"
        >
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  open: boolean
  classType?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', classType: any): void
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
  description: '',
  default_credit_cost: 1,
  active: true
})

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.default_credit_cost > 0
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.classType) {
      // Edit mode
      form.value = {
        name: props.classType.name,
        description: props.classType.description || '',
        default_credit_cost: props.classType.default_credit_cost,
        active: props.classType.active
      }
    } else {
      // Add mode
      form.value = {
        name: '',
        description: '',
        default_credit_cost: 1,
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
  
  if (!form.value.default_credit_cost || form.value.default_credit_cost <= 0) {
    errors.value.default_credit_cost = t('validation.positiveNumber', { field: t('classes.defaultCreditCost') })
  }
  
  return Object.keys(errors.value).length === 0
}

const saveClassType = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    const classTypeData = {
      id: props.classType?.id || crypto.randomUUID(),
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      default_credit_cost: form.value.default_credit_cost,
      active: form.value.active,
      created_at: props.classType?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // TODO: Replace with actual composable call
    // await useClassTypes().addClassType(classTypeData)
    
    emit('saved', classTypeData)
    closeModal()
  } catch (error) {
    console.error('Error saving class type:', error)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>