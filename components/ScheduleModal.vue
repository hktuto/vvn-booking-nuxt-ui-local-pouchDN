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
      <UForm :state="form" :schema="scheduleSchema" class="space-y-4" @submit="saveSchedule" ref="formRef">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="class_type_id" :label="$t('classes.classType')" required>
            <USelect
              v-model="form.class_type_id"
              :items="classTypeOptions"
              :placeholder="$t('classes.selectClassType')"
            />
          </UFormField>

          <UFormField name="location_id" :label="$t('classes.location')" required>
            <USelect
              v-model="form.location_id"
              :items="locationOptions"
              :placeholder="$t('classes.selectLocation')"
            />
          </UFormField>
        </div>

        <UFormField name="weekly_days" :label="$t('classes.weeklyDays')" required>
          <div class="grid grid-cols-4 gap-2">
            <UCheckbox
              v-for="day in weekDays"
              :key="day.value"
              v-model="form.weekly_days"
              :value="day.value"
              :label="day.label"
            />
          </div>
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="start_time" :label="$t('classes.startTime')" required>
            <UInput
              v-model="form.start_time"
              type="time"
            />
          </UFormField>

          <UFormField name="end_time" :label="$t('classes.endTime')" required>
            <UInput
              v-model="form.end_time"
              type="time"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="start_date" :label="$t('classes.startDate')" required>
            <UInput
              v-model="form.start_date"
              type="date"
            />
          </UFormField>

          <UFormField name="end_date" :label="$t('classes.endDate')">
            <UInput
              v-model="form.end_date"
              type="date"
              :min="form.start_date"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField name="max_capacity" :label="$t('classes.maxCapacity')" required>
            <UInput
              v-model.number="form.max_capacity"
              type="number"
              min="1"
              :placeholder="$t('classes.enterCapacity')"
            />
          </UFormField>

          <UFormField name="credit_cost" :label="$t('classes.creditCost')" required>
            <UInput
              v-model.number="form.credit_cost"
              type="number"
              min="0"
              step="0.5"
              :placeholder="$t('classes.enterCreditCost')"
            />
          </UFormField>
        </div>

        <UFormField name="description" :label="$t('classes.description')">
          <UTextarea
            v-model="form.description"
            :placeholder="$t('classes.enterDescription')"
            rows="3"
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
import type { ScheduleForm } from '~/composables/useScheduleValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

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

const formRef = ref()
const { scheduleSchema } = useScheduleValidation()

const saving = ref(false)

const form = reactive<ScheduleForm>({
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

// Initialize form when modal opens
watch(() => props.open, (open) => {
  if (open) {
    if (props.schedule) {
      // Edit mode
      form.class_type_id = props.schedule.class_type_id
      form.location_id = props.schedule.location_id
      form.weekly_days = [...props.schedule.weekly_days]
      form.start_time = props.schedule.start_time
      form.end_time = props.schedule.end_time
      form.start_date = props.schedule.start_date
      form.end_date = props.schedule.end_date || ''
      form.max_capacity = props.schedule.max_capacity
      form.credit_cost = props.schedule.credit_cost
      form.description = props.schedule.description || ''
      form.active = props.schedule.active
    } else {
      // Add mode
      form.class_type_id = ''
      form.location_id = ''
      form.weekly_days = []
      form.start_time = ''
      form.end_time = ''
      form.start_date = ''
      form.end_date = ''
      form.max_capacity = 10
      form.credit_cost = 1
      form.description = ''
      form.active = true
    }
  }
})

const saveSchedule = async (event: FormSubmitEvent<ScheduleForm>) => {
  saving.value = true
  
  try {
    const scheduleData = {
      id: props.schedule?.id || crypto.randomUUID(),
      ...event.data,
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