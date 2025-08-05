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
      <UForm :state="form" :schema="classTypeSchema" class="space-y-4" @submit="saveClassType" ref="formRef">
        <UFormField name="name" :label="$t('classes.name')" required>
          <UInput
            v-model="form.name"
            :placeholder="$t('classes.enterClassName')"
          />
        </UFormField>

        <UFormField name="description" :label="$t('classes.description')">
          <UTextarea
            v-model="form.description"
            :placeholder="$t('classes.enterDescription')"
            rows="3"
          />
        </UFormField>

        <UFormField name="default_credit_cost" :label="$t('classes.defaultCreditCost')" required>
          <UInput
            v-model.number="form.default_credit_cost"
            type="number"
            min="0"
            step="0.5"
            :placeholder="$t('classes.enterCreditCost')"
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
import type { ClassTypeForm } from '~/composables/useClassTypeValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const { classTypeSchema } = useClassTypeValidation()

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

const formRef = ref()

const saving = ref(false)

const form = reactive<ClassTypeForm>({
  name: '',
  description: '',
  default_credit_cost: 1,
  active: true
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.classType) {
      // Edit mode
      form.name = props.classType.name
      form.description = props.classType.description || ''
      form.default_credit_cost = props.classType.default_credit_cost
      form.active = props.classType.active
    } else {
      // Add mode
      form.name = ''
      form.description = ''
      form.default_credit_cost = 1
      form.active = true
    }
  }
})

const saveClassType = async (event: FormSubmitEvent<ClassTypeForm>) => {
  saving.value = true
  
  try {
    const classTypeData = {
      id: props.classType?.id || crypto.randomUUID(),
      ...event.data,
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