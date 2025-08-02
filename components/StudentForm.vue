<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? $t('student.editStudent') : $t('student.addStudent') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <UFormField
          name="name"
          :label="$t('student.name')"
          required
        >
          <UInput
            v-model="form.name"
            class="w-full"
            :placeholder="$t('student.namePlaceholder')"
            :error="errors.name"
          />
        </UFormField>

        <UFormField
          name="phone"
          :label="$t('student.phone')"
          required
        >
          <div class="flex gap-2">
            <USelect
              v-model="form.country_code"
              class="w-32"
              :items="countryCodeOptions"
              :placeholder="$t('auth.countryCodePlaceholder')"
            />
            <UInput
              v-model="form.phone"
              type="tel"
              class="flex-1"
              :placeholder="$t('student.phonePlaceholder')"
              :error="errors.phone"
            />
          </div>
        </UFormField>

        <UFormField
          name="email"
          :label="$t('student.email')"
        >
          <UInput
            v-model="form.email"
            type="email"
            class="w-full"
            :placeholder="$t('student.emailPlaceholder')"
            :error="errors.email"
          />
        </UFormField>

        <UFormField
          name="address"
          :label="$t('student.address')"
        >
          <UTextarea
            v-model="form.address"
            class="w-full"
            :placeholder="$t('student.addressPlaceholder')"
            :rows="3"
            :error="errors.address"
          />
        </UFormField>

        <UFormField
          name="credits"
          :label="$t('student.credits')"
        >
          <UInput
            v-model.number="form.credits"
            type="number"
            min="0"
            class="w-full"
            :placeholder="'0'"
            :error="errors.credits"
          />
        </UFormField>

        <UFormField
          name="notes"
          :label="$t('student.notes')"
        >
          <UTextarea
            v-model="form.notes"
            class="w-full"
            :placeholder="$t('student.notesPlaceholder')"
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
import type { StudentForm } from '~/composables/useStudentValidation'

interface Props {
  student?: any
}

interface Emits {
  (e: 'saved', student: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()

const { studentSchema } = useStudentValidation()

const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive<StudentForm>({
  name: '',
  phone: '',
  country_code: '+852', // Default to Hong Kong
  email: '',
  address: '',
  credits: 0,
  notes: ''
})

const countryCodeOptions = [
  { label: '🇭🇰 +852', value: '+852' },
  { label: '🇨🇳 +86', value: '+86' },
  { label: '🇹🇼 +886', value: '+886' },
  { label: '🇺🇸 +1', value: '+1' },
  { label: '🇬🇧 +44', value: '+44' },
  { label: '🇯🇵 +81', value: '+81' },
  { label: '🇰🇷 +82', value: '+82' },
  { label: '🇸🇬 +65', value: '+65' },
  { label: '🇲🇾 +60', value: '+60' },
  { label: '🇹🇭 +66', value: '+66' },
  { label: '🇦🇺 +61', value: '+61' },
  { label: '🇨🇦 +1', value: '+1' }
]

const isEditing = computed(() => !!props.student)

// Reset form when modal opens/closes or student changes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    resetForm()
    if (props.student) {
      // Populate form with existing student data
      form.name = props.student.name || ''
      form.phone = props.student.phone || ''
      form.country_code = props.student.country_code || '+852'
      form.email = props.student.email || ''
      form.address = props.student.address || ''
      form.credits = props.student.credits || 0
      form.notes = props.student.notes || ''
    }
  }
})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.country_code = '+852'
  form.email = ''
  form.address = ''
  form.credits = 0
  form.notes = ''
  errors.value = {}
}

const handleSubmit = async () => {
  submitting.value = true
  errors.value = {}
  
  try {
    // Validate form data
    const validatedData = studentSchema.parse(form)
    
    // Emit the validated data to parent
    emit('saved', validatedData)
    
    // Close modal
    modelValue.value = false
  } catch (err: any) {
    if (err.name === 'ZodError') {
      // Map validation errors to specific fields
      err.errors.forEach((error: any) => {
        errors.value[error.path[0]] = error.message
      })
    } else {
      console.error('Student form error:', err)
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script> 