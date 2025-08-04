<template>
  <UModal v-model:open="modelValue">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ class_ ? t('class.editClass') : t('class.addClass') }}
      </h3>
    </template>

    <template #body>
      <UForm :state="form" :schema="classSchema" class="space-y-6" ref="formRef" >
        <!-- Basic Information -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('class.basicInfo') }}
          </h4>
          
          <UFormField name="name" :label="t('class.name')" required>
            <UInput
              v-model="form.name"
              :placeholder="t('class.namePlaceholder')"
              class="w-full"
            />
          </UFormField>

          <UFormField name="description" :label="t('class.description')">
            <UTextarea
              v-model="form.description"
              :placeholder="t('class.descriptionPlaceholder')"
              :rows="3"
              class="w-full"
            />
          </UFormField>



          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField name="max_students" :label="t('class.maxStudents')" required>
              <UInput
                v-model.number="form.max_students"
                type="number"
                min="1"
                max="100"
                class="w-full"
                :placeholder="'10'"
              />
            </UFormField>

            <UFormField name="price" :label="t('class.price')" required>
              <UInput
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
                :placeholder="t('class.pricePlaceholder')"
              >
                <template #leading>
                  <span class="text-gray-500">$</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField name="credits" :label="t('class.credits')" required>
              <UInput
                v-model.number="form.credits"
                type="number"
                min="1"
                max="100"
                class="w-full"
                :placeholder="t('class.creditsPlaceholder')"
              />
            </UFormField>
          </div>

          <UFormField name="duration_minutes" :label="t('class.duration')" required>
            <UInput
              v-model.number="form.duration_minutes"
              type="number"
              min="15"
              max="480"
              class="w-full"
              :placeholder="'60'"
              @update:model-value="updateEndTimeFromDuration"
            />
          </UFormField>
        </div>

        <!-- Location Information -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('class.locationInfo') }}
          </h4>
          
          <UFormField name="location_id" :label="t('class.location')" required>
            <USelect
              v-model="form.location_id"
              :items="locationOptions"
              :placeholder="t('class.selectLocation')"
              class="w-full"
              searchable
            />
          </UFormField>
        </div>

        <!-- Schedule Information -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('class.scheduleInfo') }}
          </h4>
          
          <UFormField name="schedule_type" :label="t('class.scheduleType')" required>
            <USelect
              v-model="form.schedule_type"
              :items="scheduleTypeOptions"
              :placeholder="t('class.scheduleType')"
              class="w-full"
            />
          </UFormField>

          <div v-if="form.schedule_type !== 'recurring'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField name="start_date" :label="t('class.startDate')" required>
              <UInput
                v-model="form.start_date"
                type="date"
                class="w-full"
              />
            </UFormField>

            <UFormField name="end_date" :label="t('class.endDate')">
              <UInput
                v-model="form.end_date"
                type="date"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField name="start_time" :label="t('class.startTime')" required>
              <UInput
                v-model="form.start_time"
                type="time"
                class="w-full"
                @update:model-value="updateEndTimeFromStart"
              />
            </UFormField>

            <UFormField name="end_time" :label="t('class.endTime')" required>
              <UInput
                v-model="form.end_time"
                type="time"
                class="w-full"
                @update:model-value="updateDurationFromTimes"
              />
            </UFormField>
          </div>

          <!-- Conditional fields based on schedule type -->
          <div v-if="form.schedule_type === 'recurring'" class="space-y-4">
            <UFormField name="days_of_week" :label="t('class.daysOfWeek')" required>
              <div class="flex flex-wrap gap-2">
                <UCheckboxGroup
                  :items="dayOptions"
                  v-model="form.days_of_week"
                  :value-attribute="'value'"
                  :label-attribute="'label'"
                />
              </div>
            </UFormField>
          </div>

          <div v-if="form.schedule_type === 'series'" class="space-y-4">
            <UFormField name="total_sessions" :label="t('class.totalSessions')" required>
              <UInput
                v-model.number="form.total_sessions"
                type="number"
                min="1"
                class="w-full"
                :placeholder="'8'"
              />
            </UFormField>

            <UFormField name="current_session" :label="t('class.currentSession')" required>
              <UInput
                v-model.number="form.current_session"
                type="number"
                min="1"
                :max="form.total_sessions || 1"
                class="w-full"
                :placeholder="'1'"
              />
            </UFormField>
          </div>

          <UFormField name="status" :label="t('class.status')" required>
            <USelect
              v-model="form.status"
              :items="statusOptions"
              :placeholder="t('class.status')"
            />
          </UFormField>
        </div>

        <!-- Color -->
        <UFormField name="color" :label="t('class.color')">
          <div class="flex items-center gap-3">
            <input
              v-model="form.color"
              type="color"
              class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <UInput
              v-model="form.color"
              :placeholder="t('class.colorPlaceholder')"
              class="flex-1"
            />
          </div>
        </UFormField>

        <!-- Tags -->
        <UFormField name="tags" :label="t('class.tags')">
          <div class="space-y-2">
            <USelectMenu
              v-model="selectedTag"
              class="w-full"
              :items="availableTagOptions"
              :placeholder="t('class.selectTagPlaceholder')"
              searchable
              multiple
              create-item
              @create="onCreateTag"
              @update:model-value="handleTagSelection"
            />
            
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in form.tags"
                :key="tag"
                color="primary"
                variant="soft"
                class="cursor-pointer"
                @click="removeTag(tag)"
              >
                {{ tag }}
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3 ml-1" />
              </UBadge>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('class.tagsHelp') }}
            </p>
          </div>
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
          type="submit"
          :loading="submitting"
          color="primary"
          @click="handleSubmit"
          
        >
          {{ isEditing ? t('common.save') : t('common.add') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ClassForm } from '~/composables/useClassValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  class_?: any
}

interface Emits {
  (e: 'saved', class_: any): void
}

const modelValue = defineModel<boolean>()
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const { t } = useI18n()
const { classSchema } = useClassValidation()
const { locations, loadLocations } = useLocations()
const { getAllTags } = useClasses()

const submitting = ref(false)
const selectedTag = ref<string[]>([])
const customTag = ref<string[]>([])

const form = reactive<ClassForm>({
  name: '',
  description: '',
  location_id: '',
  max_students: 10,
  price: 0,
  credits: 1,
  duration_minutes: 60,
  schedule_type: 'one-time',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  color: '#3B82F6',
  days_of_week: [],
  total_sessions: undefined,
  current_session: 1,
  status: 'active',
  tags: []
})

// Options for select menus
const locationOptions = computed(() => 
  locations.value.map(location => ({
    label: location.name,
    value: location.id
  }))
)

const scheduleTypeOptions = [
  { label: t('class.oneTime'), value: 'one-time' , onSelect: () => {
    form.schedule_type = 'one-time'
  }},
  { label: t('class.recurring'), value: 'recurring' , onSelect: () => {
    form.schedule_type = 'recurring'
  }},
  { label: t('class.series'), value: 'series' , onSelect: () => {
    form.schedule_type = 'series'
  }},
]

const statusOptions = [
  { label: t('class.active'), value: 'active', onSelect: () => {
    form.status = 'active'
  }},
  { label: t('class.inactive'), value: 'inactive', onSelect: () => {
    form.status = 'inactive'
  }},
  { label: t('class.cancelled'), value: 'cancelled', onSelect: () => {
    form.status = 'cancelled'
  }},
  { label: t('class.completed'), value: 'completed', onSelect: () => {
    form.status = 'completed'
  }}
]

const dayOptions = [
  { label: t('common.monday'), value: 'monday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'monday'])]
  }},
  { label: t('common.tuesday'), value: 'tuesday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'tuesday'])]
  }},
  { label: t('common.wednesday'), value: 'wednesday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'wednesday'])]
  }},
  { label: t('common.thursday'), value: 'thursday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'thursday'])]
  }},
  { label: t('common.friday'), value: 'friday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'friday'])]
  }},
  { label: t('common.saturday'), value: 'saturday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'saturday'])]
  }},
  { label: t('common.sunday'), value: 'sunday', onSelect: () => {
    form.days_of_week = [...new Set([...form.days_of_week, 'sunday'])]
  }}
]

// Get available tags for the select menu
const availableTagOptions = computed(() => {
  const allTags = getAllTags()
  return [...allTags, ...customTag.value]
})

const isEditing = computed(() => !!props.class_)

// Reset form when modal opens/closes or class changes
watch(() => modelValue.value, (newValue) => {
  if (newValue) {
    loadLocations()
    resetForm()
    if (props.class_) {
      // Populate form with existing class data
      form.name = props.class_.name || ''
      form.description = props.class_.description || ''
      form.location_id = props.class_.location_id || ''
      form.max_students = props.class_.max_students || 10
      form.price = props.class_.price || 0
      form.credits = props.class_.credits || 1
      form.duration_minutes = props.class_.duration_minutes || 60
      form.schedule_type = props.class_.schedule_type || 'one-time'
      form.start_date = props.class_.start_date || ''
      form.end_date = props.class_.end_date || ''
      form.start_time = props.class_.start_time || ''
      form.end_time = props.class_.end_time || ''
      form.days_of_week = props.class_.days_of_week || []
      form.total_sessions = props.class_.total_sessions
      form.current_session = props.class_.current_session || 1
      form.status = props.class_.status || 'active'
          form.color = props.class_.color || '#3B82F6'
    form.tags = props.class_.tags || []
    selectedTag.value = [...form.tags]
    }
  }
})

// Auto-select location when there's only one option available
watch(() => locations.value, (newLocations) => {
  if (newLocations.length === 1 && !form.location_id && !props.class_) {
    // Auto-select the only available location for new classes
    form.location_id = newLocations[0].id
  }
}, { immediate: true })

const resetForm = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  form.name = ''
  form.description = ''
  form.location_id = ''
  form.max_students = 10
  form.price = 0
  form.credits = 1
  form.duration_minutes = 60
  form.schedule_type = 'one-time'
  form.start_date = tomorrow.toISOString().split('T')[0] // Tomorrow's date
  form.end_date = ''
  form.start_time = '09:00'
  form.end_time = '10:00'
  form.days_of_week = []
  form.total_sessions = undefined
  form.current_session = 1
  form.status = 'active'
  form.color = '#3B82F6'
  form.tags = []
  selectedTag.value = []
  customTag.value = []
}

const handleTagSelection = (selectedTags: any[]) => {
  // Extract the tag values from the selected items
  const tagValues = selectedTags.map(item => item.value || item).filter(Boolean)
  form.tags = tagValues
}

const removeTag = (tagToRemove: string) => {
  const index = form.tags.indexOf(tagToRemove)
  if (index > -1) {
    form.tags.splice(index, 1)
    selectedTag.value = [...form.tags]
  }
}

const onCreateTag = (tag: string) => {
  customTag.value.push(tag)
}

// Time calculation functions
const updateEndTimeFromStart = () => {
  if (form.start_time && form.duration_minutes) {
    const startDate = new Date(`2000-01-01T${form.start_time}`)
    const endDate = new Date(startDate.getTime() + form.duration_minutes * 60000)
    form.end_time = endDate.toTimeString().slice(0, 5)
  }
}

const updateEndTimeFromDuration = () => {
  if (form.start_time && form.duration_minutes) {
    const startDate = new Date(`2000-01-01T${form.start_time}`)
    const endDate = new Date(startDate.getTime() + form.duration_minutes * 60000)
    form.end_time = endDate.toTimeString().slice(0, 5)
  }
}

const updateDurationFromTimes = () => {
  if (form.start_time && form.end_time) {
    const startDate = new Date(`2000-01-01T${form.start_time}`)
    const endDate = new Date(`2000-01-01T${form.end_time}`)
    
    // Check if end time is before start time (next day)
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1)
    }
    
    const durationMs = endDate.getTime() - startDate.getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    
    // Only update if the calculated duration is different and within valid range
    if (durationMinutes !== form.duration_minutes && durationMinutes >= 15 && durationMinutes <= 480) {
      form.duration_minutes = durationMinutes
    }
  }
}

const handleSubmit = async () => {
  submitting.value = true
  const data = JSON.parse(JSON.stringify(form))
  try {
    console.log('Form submitted with data:', data)
    // Emit the validated data to parent
    emit('saved', data)
    
    // Close modal
    modelValue.value = false
  } catch (err) {
    console.error('Error saving class:', err)
  } finally {
    submitting.value = false
    customTag.value = []
  }
}

const handleCancel = () => {
  modelValue.value = false
  customTag.value = []
}
</script> 