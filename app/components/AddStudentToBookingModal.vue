<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('booking.manageStudents') }}
      </h3>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Class Info -->
        <div v-if="booking" class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">
            {{ getClassInfo(booking)?.name }}
          </h4>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <div>{{ formatDate(booking.class_date) }} at {{ booking.class_time }}</div>
            <div>{{ t('booking.requiredCredits') }}: {{ getClassInfo(booking)?.credits || 0 }}</div>
            <div>{{ t('booking.capacity') }}: {{ booking.total_booked || 0 }}/{{ booking.max_capacity }}</div>
          </div>
        </div>

        <!-- Add Students Section -->
        <div class="space-y-4">
          <h5 class="font-medium text-gray-900 dark:text-white">
            {{ t('booking.addStudents') }}
          </h5>
          
          <!-- Student Selection -->
          <UFormField name="students" :label="t('booking.selectStudents')">
            <USelect
              v-model="selectedStudents"
              :items="availableStudents"
              :placeholder="t('booking.selectStudentsPlaceholder')"
              searchable
              multiple
              class="w-full"
              @update:model-value="handleStudentSelection"
            />
          </UFormField>

          <!-- Credits Used -->
          <UFormField name="credits" :label="t('booking.creditsUsed')" required>
            <UInput
              v-model.number="creditsUsed"
              type="number"
              :min="getClassInfo(booking)?.credits || 1"
              :max="getClassInfo(booking)?.credits || 1"
              class="w-full"
            />
          </UFormField>

          <!-- Notes -->
          <UFormField name="notes" :label="t('booking.notes')">
            <UTextarea
              v-model="notes"
              :placeholder="t('booking.notesPlaceholder')"
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <!-- Add Button -->
          
        </div>


        
      </div>
    </template>

    <template #footer>
      <div class="flex  gap-3">
        <UButton
          @click="handleCancel"
          variant="ghost"
        >
          {{ t('common.close') }}
        </UButton>
        <UButton
            @click="handleAddStudents"
            :loading="submitting"
            :disabled="!selectedStudents.length || !creditsUsed"
            color="primary"
            class="flex-1"
          >
            {{ t('booking.addStudents') }}
          </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  booking?: any
}

interface Emits {
  (e: 'student-added', bookingId: string, studentId: string, creditsUsed: number, notes: string): void
  (e: 'student-removed', bookingId: string, studentId: string): void
  (e: 'refresh-needed'): void
  (e: 'virtual-booking-conversion', bookingId: string, studentIds: string[], creditsUsed: number, notes: string): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { students, loadStudents } = useStudents()
const { classes, loadClasses } = useClasses()

const submitting = ref(false)
const selectedStudents = ref<any[]>([])
const creditsUsed = ref<number>(0)
const notes = ref('')

// Get available students (those not already booked)
const availableStudents = computed(() => {
  if (!props.booking) return []
  
  const bookedStudentIds = props.booking.bookings?.map((b: { student_id: string }) => b.student_id) || []
  
  return students.value
    .filter(student => !bookedStudentIds.includes(student.id))
    .map(student => ({
      label: student.name,
      value: student.id
    }))
})

// Get class information
const getClassInfo = (booking: any) => {
  if (booking.class_info) return booking.class_info
  return classes.value.find(c => c.id === booking.class_id)
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Handle student selection
const handleStudentSelection = (selectedItems: any[]) => {
  selectedStudents.value = selectedItems.map(item => item.value || item).filter(Boolean)
}

// Handle adding multiple students
const handleAddStudents = async () => {
  if (!props.booking || !selectedStudents.value.length || !creditsUsed.value) return
  
  submitting.value = true
  
  try {
    if (props.booking.is_virtual) {
      // For virtual bookings, add all students at once to create a single real booking
      emit('virtual-booking-conversion', props.booking.id, selectedStudents.value, creditsUsed.value, notes.value)
    } else {
      // For real bookings, add each student individually
      for (const studentId of selectedStudents.value) {
        emit('student-added', props.booking.id, studentId, creditsUsed.value, notes.value)
      }
    }
    
    // Reset form
    selectedStudents.value = []
    notes.value = ''
    
    // Emit refresh event
    emit('refresh-needed')
  } catch (err) {
    console.error('Error adding students:', err)
  } finally {
    submitting.value = false
  }
}

// Handle removing a student
const handleRemoveStudent = (studentId: string) => {
  if (!props.booking) return
  
  emit('student-removed', props.booking.id, studentId)
  emit('refresh-needed')
}

// Handle cancel
const handleCancel = () => {
  modelValue.value = false
  resetForm()
}

// Watch for modal close to reset form
watch(() => modelValue.value, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

// Reset form
const resetForm = () => {
  selectedStudents.value = []
  creditsUsed.value = 0
  notes.value = ''
}

// Watch for modal open/close
watch(() => modelValue.value, (newValue) => {
  if (newValue && props.booking) {
    creditsUsed.value = getClassInfo(props.booking)?.credits || 1
    loadStudents()
  } else {
    resetForm()
  }
})
loadClasses()
</script> 