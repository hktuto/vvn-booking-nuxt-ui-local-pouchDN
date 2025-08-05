<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('booking.editBooking') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" :schema="bookingSchema" class="space-y-4" @submit="handleSubmit" ref="formRef">
        <!-- Class Date -->
        <UFormField name="class_date" :label="t('booking.classDate')" required>
          <UInput
            v-model="form.class_date"
            type="date"
            class="w-full"
          />
        </UFormField>

        <!-- Class Time -->
        <UFormField name="class_time" :label="t('booking.classTime')" required>
          <UInput
            v-model="form.class_time"
            type="time"
            class="w-full"
          />
        </UFormField>

        <!-- Max Capacity -->
        <UFormField name="max_capacity" :label="t('booking.maxCapacity')" required>
          <UInput
            v-model.number="form.max_capacity"
            type="number"
            :min="booking?.total_booked || 1"
            class="w-full"
          />
          <template #help>
            <span class="text-sm text-gray-500">
              {{ t('booking.minCapacityHelp', { min: booking?.total_booked || 1 }) }}
            </span>
          </template>
        </UFormField>

        <!-- Notes -->
        <UFormField name="notes" :label="t('booking.notes')">
          <UTextarea
            v-model="form.notes"
            :placeholder="t('booking.notesPlaceholder')"
            :rows="3"
            class="w-full"
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
          {{ t('common.save') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

interface Props {
  booking?: any
}

interface Emits {
  (e: 'saved', bookingId: string, updates: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const formRef = ref()
const submitting = ref(false)

// Validation schema
const bookingSchema = z.object({
  class_date: z.string().min(1, t('validation.classDate.required')),
  class_time: z.string().min(1, t('validation.classTime.required')),
  max_capacity: z.number().min(1, t('validation.maxCapacity.min')),
  notes: z.string().max(500, t('validation.notes.maxLength')).optional().or(z.literal(''))
})

const form = reactive({
  class_date: '',
  class_time: '',
  max_capacity: 10,
  notes: ''
})

// Reset form when modal opens/closes
watch(() => modelValue.value, (newValue) => {
  if (newValue && props.booking) {
    resetForm()
  }
})

// Watch for booking prop changes to populate form
watch(() => props.booking, (newBooking) => {
  if (newBooking) {
    form.class_date = newBooking.class_date
    form.class_time = newBooking.class_time
    form.max_capacity = newBooking.max_capacity
    form.notes = newBooking.notes || ''
  }
}, { immediate: true })

const resetForm = () => {
  if (props.booking) {
    form.class_date = props.booking.class_date
    form.class_time = props.booking.class_time
    form.max_capacity = props.booking.max_capacity
    form.notes = props.booking.notes || ''
  }
}

const handleSubmit = async (event: FormSubmitEvent<any>) => {
  submitting.value = true
  
  try {
    const updates = {
      class_date: event.data.class_date,
      class_time: event.data.class_time,
      max_capacity: event.data.max_capacity,
      notes: event.data.notes || ''
    }
    
    emit('saved', props.booking.id, updates)
    modelValue.value = false
  } catch (err: any) {
    console.error('Error saving booking:', err)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}
</script> 