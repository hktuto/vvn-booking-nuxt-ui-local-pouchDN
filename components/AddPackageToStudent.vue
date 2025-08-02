<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('student.addPackageToStudent', { name: student?.name }) }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <!-- Package Type Toggle -->
        <div class="flex gap-4 mb-4">
          <UButton
            @click="form.package_type = 'existing'"
            :variant="form.package_type === 'existing' ? 'solid' : 'ghost'"
            size="sm"
          >
            {{ t('student.existingPackage') }}
          </UButton>
          <UButton
            @click="form.package_type = 'custom'"
            :variant="form.package_type === 'custom' ? 'solid' : 'ghost'"
            size="sm"
          >
            {{ t('student.customPackage') }}
          </UButton>
        </div>

        <!-- Existing Package Selection -->
        <UFormField
          v-if="form.package_type === 'existing'"
          name="package_id"
          :label="t('student.selectPackage')"
          required
        >
          <USelect
            v-model="form.package_id"
            class="w-full"
            :placeholder="t('student.selectPackagePlaceholder')"
            :items="packageOptions"
            :loading="packagesLoading"
            :error="errors.package_id"
          />
        </UFormField>

        <!-- Custom Package Form -->
        <div v-if="form.package_type === 'custom'" class="space-y-4">
          <!-- Auto-generated package name preview -->
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {{ t('student.packageNamePreview') }}:
            </div>
            <div class="font-medium text-gray-900 dark:text-white">
              {{ generatedPackageName }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField
              name="custom_package_duration"
              :label="t('package.durationDays')"
              required
            >
              <UInput
                v-model.number="form.custom_package_duration"
                type="number"
                class="w-full"
                :placeholder="t('package.durationDaysPlaceholder')"
                min="1"
                :error="errors.custom_package_duration"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                name="custom_package_price"
                :label="t('package.price')"
                required
              >
                <UInput
                  v-model.number="form.custom_package_price"
                  type="number"
                  class="w-full"
                  :placeholder="t('package.pricePlaceholder')"
                  min="0"
                  step="0.01"
                  :error="errors.custom_package_price"
                >
                  <template #leading>
                    $
                  </template>
                </UInput>
              </UFormField>

              <UFormField
                name="custom_package_credits"
                :label="t('package.credits')"
                required
              >
                <UInput
                  v-model.number="form.custom_package_credits"
                  type="number"
                  class="w-full"
                  :placeholder="t('package.creditsPlaceholder')"
                  min="1"
                  :error="errors.custom_package_credits"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Custom Price Override (for existing packages) -->
        <UFormField
          v-if="form.package_type === 'existing' && selectedPackage"
          name="custom_price"
          :label="t('student.customPrice')"
        >
          <UInput
            v-model.number="form.custom_price"
            type="number"
            class="w-full"
            :placeholder="t('student.customPricePlaceholder')"
            min="0"
            step="0.01"
            :error="errors.custom_price"
          >
            <template #leading>
              $
            </template>
          </UInput>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ t('student.originalPrice', { price: selectedPackage.price }) }}
          </div>
        </UFormField>

        <!-- Package Preview -->
        <div v-if="selectedPackage || form.package_type === 'custom'" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">
            {{ t('student.packagePreview') }}
          </h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('package.name') }}:</span>
              <span class="font-medium">{{ form.package_type === 'existing' ? selectedPackage?.name : generatedPackageName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('package.price') }}:</span>
              <span class="font-medium">${{ form.package_type === 'existing' ? (form.custom_price || selectedPackage?.price) : form.custom_package_price }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('package.credits') }}:</span>
              <span class="font-medium">{{ form.package_type === 'existing' ? selectedPackage?.credits : form.custom_package_credits }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('package.durationDays') }}:</span>
              <span class="font-medium">{{ form.package_type === 'existing' ? selectedPackage?.duration_days : form.custom_package_duration }} {{ t('common.days') }}</span>
            </div>
            <div v-if="form.package_type === 'existing' && expiryDate" class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ t('student.expiryDate') }}:</span>
              <span class="font-medium">{{ expiryDate.toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <UFormField
          name="notes"
          :label="t('student.notes')"
        >
          <UTextarea
            v-model="form.notes"
            class="w-full"
            :placeholder="t('student.notesPlaceholder')"
            :rows="3"
            :error="errors.notes"
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
          {{ t('student.addPackage') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { PackageDocument } from '~/composables/usePouchDB'

interface Props {
  student?: {
    id: string
    name: string
    phone: string
    country_code: string
    email: string
    address: string
    credits: number
    notes: string
    created_at: string
    updated_at: string
  }
}

interface Emits {
  (e: 'saved', studentPackage: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { t } = useI18n()
const { packages, loading: packagesLoading } = usePackages()
const { addPackageToStudent } = useStudentPackages()

const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive({
  package_type: 'existing' as 'existing' | 'custom',
  package_id: '',
  custom_price: null as number | null,
  notes: '',
  // Custom package fields
  custom_package_price: null as number | null,
  custom_package_credits: null as number | null,
  custom_package_duration: null as number | null
})

const selectedPackage = computed(() => {
  if (!form.package_id) return null
  return packages.value.find(p => p.id === form.package_id)
})

const expiryDate = computed(() => {
  if (!selectedPackage.value) return null
  const date = new Date()
  date.setDate(date.getDate() + selectedPackage.value.duration_days)
  return date
})

const packageOptions = computed(() => {
  return packages.value
    .filter(p => p.active)
    .map(p => ({
      label: `${p.name} - $${p.price} (${p.credits} ${t('package.credits')})`,
      value: p.id
    }))
})

const generatedPackageName = computed(() => {
  if (!props.student || !form.custom_package_price) return ''
  
  const studentName = props.student.name
  const price = form.custom_package_price
  const date = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  return `${studentName} - $${price} - ${date}`
})

// Reset form when modal opens/closes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

const resetForm = () => {
  form.package_type = 'existing'
  form.package_id = ''
  form.custom_price = null
  form.notes = ''
  // Reset custom package fields
  form.custom_package_price = null
  form.custom_package_credits = null
  form.custom_package_duration = null
  errors.value = {}
}

const formatDate = (date: Date | null) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const handleSubmit = async () => {
  if (!props.student) return

  submitting.value = true
  errors.value = {}
  
  try {
    // Validate form based on package type
    if (form.package_type === 'existing' && !form.package_id) {
      errors.value.package_id = 'Please select a package'
      return
    }

    if (form.package_type === 'custom') {
      if (!form.custom_package_price) {
        errors.value.custom_package_price = 'Price is required'
      }
      if (!form.custom_package_credits) {
        errors.value.custom_package_credits = 'Credits are required'
      }
      if (!form.custom_package_duration) {
        errors.value.custom_package_duration = 'Duration is required'
      }
      
      if (Object.keys(errors.value).length > 0) {
        return
      }
    }

    let packageId = form.package_id
    let customPrice: number | undefined = form.custom_price || undefined

    // If custom package, create it first
    if (form.package_type === 'custom') {
      const { addPackage } = usePackages()
      const customPackage = await addPackage({
        name: generatedPackageName.value,
        description: '', // Custom packages don't need description, use notes field instead
        price: form.custom_package_price!,
        credits: form.custom_package_credits!,
        duration_days: form.custom_package_duration!,
        active: true,
        is_custom: true // Flag to identify custom packages
      })
      packageId = customPackage.id
      // For custom packages, use the package price as the final price (no additional custom price)
      customPrice = undefined
    }

    const studentPackage = await addPackageToStudent(
      props.student.id,
      packageId,
      form.notes,
      customPrice || undefined
    )
    
    emit('saved', studentPackage)
    modelValue.value = false
  } catch (err: any) {
    console.error('Error adding package to student:', err)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script> 