<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-lg' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ schedule ? $t('classes.editSchedule') : $t('classes.addSchedule') }}
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
      <form @submit.prevent="saveSchedule" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup :label="$t('classes.classType')" required>
            <USelect
              v-model="form.class_type_id"
              :options="classTypeOptions"
              option-attribute="label"
              value-attribute="value"
              :placeholder="$t('classes.selectClassType')"
              :error="errors.class_type_id"
            />
          </UFormGroup>

          <UFormGroup :label="$t('classes.location')" required>
            <USelect
              v-model="form.location_id"
              :options="locationOptions"
              option-attribute="label"
              value-attribute="value"
              :placeholder="$t('classes.selectLocation')"
              :error="errors.location_id"
            />
          </UFormGroup>
        </div>

        <UFormGroup :label="$t('classes.weeklyDays')" required>
          <div class="grid grid-cols-4 gap-2">
            <UCheckbox
              v-for="day in weekDays"
              :key="day.value"
              v-model="form.weekly_days"
              :value="day.value"
              :label="day.label"
            />
          </div>
          <p v-if="errors.weekly_days" class="text-red-500 text-sm mt-1">
            {{ errors.weekly_days }}
          </p>
        </UFormGroup>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup :label="$t('classes.startTime')" required>
            <UInput
              v-model="form.start_time"
              type="time"
              :error="errors.start_time"
            />
          </UFormGroup>

          <UFormGroup :label="$t('classes.endTime')" required>
            <UInput
              v-model="form.end_time"
              type="time"
              :error="errors.end_time"
            />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup :label="$t('classes.startDate')" required>
            <UInput
              v-model="form.start_date"
              type="date"
              :error="errors.start_date"
            />
          </UFormGroup>

          <UFormGroup :label="$t('classes.endDate')">
            <UInput
              v-model="form.end_date"
              type="date"
              :min="form.start_date"
            />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup :label="$t('classes.maxCapacity')" required>
            <UInput
              v-model.number="form.max_capacity"
              type="number"
              min="1"
              :placeholder="$t('classes.enterCapacity')"
              :error="errors.max_capacity"
            />
          </UFormGroup>

          <UFormGroup :label="$t('classes.creditCost')" required>
            <UInput
              v-model.number="form.credit_cost"
              type="number"
              min="0"
              step="0.5"
              :placeholder="$t('classes.enterCreditCost')"
              :error="errors.credit_cost"
            />
          </UFormGroup>
        </div>

        <UFormGroup :label="$t('classes.description')">
          <UTextarea
            v-model="form.description"
            :placeholder="$t('classes.enterDescription')"
            rows="3"
            :error="errors.description"
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
          @click="saveSchedule"
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
  schedule?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', schedule: any): void
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
  class_type_id: '',
  location_id: '',
  weekly_days: [] as string[],
  start_time: '',
  end_time: '',
  start_date: '',
  end_date: '',
  max_capacity: 10,
  credit_cost: 1,
  description: '',
  active: true
})

const weekDays = [
  { value: 'mon', label: t('common.monday') },
  { value: 'tue', label: t('common.tuesday') },
  { value: 'wed', label: t('common.wednesday') },
  { value: 'thu', label: t('common.thursday') },
  { value: 'fri', label: t('common.friday') },
  { value: 'sat', label: t('common.saturday') },
  { value: 'sun', label: t('common.sunday') }
]

// Mock data - replace with real composables
const classTypes = ref([
  { id: '1', name: 'Yoga Basics' },
  { id: '2', name: 'Advanced Yoga' }
])

const locations = ref([
  { id: '1', name: 'Studio A' },
  { id: '2', name: 'Studio B' }
])

const classTypeOptions = computed(() => 
  classTypes.value.map(ct => ({
    label: ct.name,
    value: ct.id
  }))
)

const locationOptions = computed(() => 
  locations.value.map(loc => ({
    label: loc.name,
    value: loc.id
  }))
)

const isFormValid = computed(() => {
  return form.value.class_type_id && 
         form.value.location_id && 
         form.value.weekly_days.length > 0 &&
         form.value.start_time &&
         form.value.end_time &&
         form.value.start_date &&
         form.value.max_capacity > 0 &&
         form.value.credit_cost >= 0
})

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.schedule) {
      // Edit mode
      form.value = {
        class_type_id: props.schedule.class_type_id,
        location_id: props.schedule.location_id,
        weekly_days: [...props.schedule.weekly_days],
        start_time: props.schedule.start_time,
        end_time: props.schedule.end_time,
        start_date: props.schedule.start_date,
        end_date: props.schedule.end_date || '',
        max_capacity: props.schedule.max_capacity,
        credit_cost: props.schedule.credit_cost,
        description: props.schedule.description || '',
        active: props.schedule.active
      }
    } else {
      // Add mode
      form.value = {
        class_type_id: '',
        location_id: '',
        weekly_days: [],
        start_time: '',
        end_time: '',
        start_date: '',
        end_date: '',
        max_capacity: 10,
        credit_cost: 1,
        description: '',
        active: true
      }
    }
    errors.value = {}
  }
})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.class_type_id) {
    errors.value.class_type_id = t('validation.required', { field: t('classes.classType') })
  }
  
  if (!form.value.location_id) {
    errors.value.location_id = t('validation.required', { field: t('classes.location') })
  }
  
  if (form.value.weekly_days.length === 0) {
    errors.value.weekly_days = t('validation.required', { field: t('classes.weeklyDays') })
  }
  
  if (!form.value.start_time) {
    errors.value.start_time = t('validation.required', { field: t('classes.startTime') })
  }
  
  if (!form.value.end_time) {
    errors.value.end_time = t('validation.required', { field: t('classes.endTime') })
  }
  
  if (!form.value.start_date) {
    errors.value.start_date = t('validation.required', { field: t('classes.startDate') })
  }
  
  if (!form.value.max_capacity || form.value.max_capacity <= 0) {
    errors.value.max_capacity = t('validation.positiveNumber', { field: t('classes.maxCapacity') })
  }
  
  if (form.value.credit_cost < 0) {
    errors.value.credit_cost = t('validation.positiveNumber', { field: t('classes.creditCost') })
  }
  
  if (form.value.start_time && form.value.end_time && form.value.start_time >= form.value.end_time) {
    errors.value.end_time = t('validation.endTimeAfterStart')
  }
  
  return Object.keys(errors.value).length === 0
}

const saveSchedule = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    const scheduleData = {
      id: props.schedule?.id || crypto.randomUUID(),
      class_type_id: form.value.class_type_id,
      location_id: form.value.location_id,
      weekly_days: form.value.weekly_days,
      start_time: form.value.start_time,
      end_time: form.value.end_time,
      start_date: form.value.start_date,
      end_date: form.value.end_date || null,
      max_capacity: form.value.max_capacity,
      credit_cost: form.value.credit_cost,
      description: form.value.description.trim(),
      active: form.value.active,
      created_at: props.schedule?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // TODO: Replace with actual composable call
    // await useSchedules().addSchedule(scheduleData)
    
    emit('saved', scheduleData)
    closeModal()
  } catch (error) {
    console.error('Error saving schedule:', error)
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
}
</script>