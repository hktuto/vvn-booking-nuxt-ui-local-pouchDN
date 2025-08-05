<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? $t('package.editPackage') : $t('package.addPackage') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" :schema="packageSchema" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <UFormField
          name="name"
          :label="$t('package.name')"
          required
        >
          <UInput
            v-model="form.name"
            class="w-full"
            :placeholder="$t('package.namePlaceholder')"
          />
        </UFormField>

        <UFormField
          name="description"
          :label="$t('package.description')"
        >
          <UTextarea
            v-model="form.description"
            class="w-full"
            :placeholder="$t('package.descriptionPlaceholder')"
            :rows="3"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              name="price"
              :label="$t('package.price')"
              required
            >
              <UInput
                v-model.number="form.price"
                type="number"
                class="w-full"
                :placeholder="$t('package.pricePlaceholder')"
                min="0"
                step="0.01"
              >
                <template #leading>
                  $
                </template>
              </UInput>
              <div v-if="form.price > 0 && form.credits > 0" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ $t('package.creditUnitPrice', { price: (form.price / form.credits).toFixed(2) }) }}
              </div>
            </UFormField>

            <UFormField
              name="credits"
              :label="$t('package.credits')"
              required
            >
              <UInput
                v-model.number="form.credits"
                type="number"
                class="w-full"
                :placeholder="$t('package.creditsPlaceholder')"
                min="1"
              />
            </UFormField>
          </div>

          <UFormField
            name="duration_days"
            :label="$t('package.durationDays')"
            required
          >
            <UInput
              v-model.number="form.duration_days"
              type="number"
              class="w-full"
              :placeholder="$t('package.durationDaysPlaceholder')"
              min="1"
            />
          </UFormField>
        </div>

        <UFormField name="active">
          <UCheckbox
            v-model="form.active"
            class="w-full"
            :label="$t('package.active')"
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
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          @click="() => formRef?.submit()"
          :loading="submitting"
          color="primary"
        >
          {{ isEditing ? $t('common.save') : $t('common.add') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { PackageForm } from '~/composables/usePackageValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  package_?: any
}

interface Emits {
  (e: 'saved', package_: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { t } = useI18n()
const { packageSchema } = usePackageValidation()

const submitting = ref(false)

const form = reactive<PackageForm>({
  name: '',
  description: '',
  price: 0,
  credits: 1,
  duration_days: 30,
  active: true
})

const isEditing = computed(() => !!props.package_)

// Reset form when modal opens/closes or package changes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    resetForm()
    if (props.package_) {
      // Populate form with existing package data
      form.name = props.package_.name || ''
      form.description = props.package_.description || ''
      form.price = props.package_.price || 0
      form.credits = props.package_.credits || 1
      form.duration_days = props.package_.duration_days || 30
      form.active = props.package_.active ?? true
    }
  }
})

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.price = 0
  form.credits = 1
  form.duration_days = 30
  form.active = true
}

const handleSubmit = async (event: FormSubmitEvent<PackageForm>) => {
  submitting.value = true
  
  try {
    // Emit the validated data to parent
    emit('saved', event.data)
    
    // Close modal
    modelValue.value = false
  } catch (err: any) {
    console.error('Package form error:', err)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script> 