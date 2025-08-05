<template>
  <UCard :class="`border-[${class_.color}]`">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex flex-col justify-start items-start gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ class_.name }}</h3>
          <div class="flex items-center gap-2">
            <UBadge :color="getStatusColor(class_.status)" variant="soft" size="sm">
              {{ t(`class.${class_.status}`) }}
            </UBadge>
            <UBadge :color="getScheduleTypeColor(class_.schedule_type)" variant="soft" size="sm">
              {{ t(`class.${class_.schedule_type.replace('-', '')}`) }}
            </UBadge>
          </div>
        </div>
        
        <div class="flex flex-row flex-wrap justify-start items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div v-if="class_.description" class="flex items-start gap-2">
            <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4 mt-0.5" />
            <span class="line-clamp-2">{{ class_.description }}</span>
          </div> 
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <span>{{ formatSchedule(class_) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            <span>{{ getLocationName(class_.location_id) }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-users" class="w-4 h-4" />
            <span>{{ t('common.students') }}: {{ class_.max_students }}</span>
          </div>
          

            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
              <span>{{ class_.credits }} {{ t('common.credits') }}</span>
          </div>
      
          <!-- Color indicator -->
          <div class="flex items-center gap-2">
            <div 
              class="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
              :style="{ backgroundColor: class_.color || '#3B82F6' }"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('class.color') }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="w-4 h-4" />
            <span>{{ class_.duration_minutes }} {{ t('common.minutes') }}</span>
          </div>
          

          
          <div v-if="class_.tags && class_.tags.length > 0" class="flex items-start gap-2">
            <UIcon name="i-heroicons-tag" class="w-4 h-4 mt-0.5" />
            <div class="flex flex-wrap gap-1">
              <UBadge v-for="tag in class_.tags" :key="tag" color="secondary" variant="soft" size="xs">
                {{ tag }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
      
      <UDropdownMenu :items="getClassActions()">
        <UButton variant="soft" size="sm" icon="i-heroicons-ellipsis-vertical" :aria-label="t('common.actions')" />
      </UDropdownMenu>
    </div>
    
    <UModal v-model:open="deletePopoverOpen">
      <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('common.delete') }} {{ t('class.classes') }}
            </h3>
          </div>
        </template>
        
        <template #body>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('class.deleteClassMessage', { name: class_.name }) }}
          </p>
        </template>
        
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton @click="deletePopoverOpen = false" variant="ghost">
              {{ t('common.cancel') }}
            </UButton>
            <UButton @click="confirmDelete" color="error" :loading="deleting">
              {{ t('common.delete') }}
            </UButton>
          </div>
        </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  class_: {
    id: string
    name: string
    description: string
    location_id: string
    max_students: number
    price: number
    credits: number
    duration_minutes: number
    schedule_type: 'one-time' | 'recurring' | 'series'
    start_date?: string
    end_date?: string
    start_time: string
    end_time: string
    days_of_week?: string[]
    total_sessions?: number
    current_session?: number
    status: 'active' | 'inactive' | 'cancelled' | 'completed'
    tags: readonly string[]
    color: string
    created_at: string
    updated_at: string
  }
}

interface Emits {
  (e: 'view', class_: Props['class_']): void
  (e: 'edit', class_: Props['class_']): void
  (e: 'delete', class_: Props['class_']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()
const { locations, loadLocations } = useLocations()

const deletePopoverOpen = ref(false)
const deleting = ref(false)

const getLocationName = (locationId: string) => {
  const location = locations.value.find(loc => loc.id === locationId)
  return location ? location.name : 'Unknown Location'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'primary'
    case 'inactive': return 'neutral'
    case 'cancelled': return 'warning'
    case 'completed': return 'error'
    default: return 'neutral'
  }
}

const getScheduleTypeColor = (scheduleType: string) => {
  switch (scheduleType) {
    case 'one-time': return 'primary'
    case 'recurring': return 'secondary'
    case 'series': return 'info'
    default: return 'neutral'
  }
}

const formatSchedule = (class_: Props['class_']) => {
  if(!class_.start_date && !class_.end_date) return class_.start_time + ' - ' + class_.end_time

  const startDate = class_.start_date
  const startTime = class_.start_time
  const endTime = class_.end_time
  
  let schedule = `${startDate} ${startTime}-${endTime}`
  
  if (class_.schedule_type === 'recurring' && class_.days_of_week && class_.days_of_week.length > 0) {
    const days = class_.days_of_week.map(day => t(`common.${day}`)).join(', ')
    schedule = `${days} ${startTime}-${endTime}`
  } else if (class_.schedule_type === 'series' && class_.total_sessions) {
    schedule = `${startDate} (${class_.current_session}/${class_.total_sessions}) ${startTime}-${endTime}`
  }
  
  return schedule
}

const getClassActions = () => [
  {
    label: t('common.edit'),
    icon: 'i-heroicons-pencil-square',
    onSelect: () => emit('edit', props.class_)
  },
  {
    label: t('common.delete'),
    icon: 'i-heroicons-trash',
    onSelect: () => {
      deletePopoverOpen.value = true
    }
  }
]

const confirmDelete = async () => {
  deleting.value = true
  try {
    emit('delete', props.class_)
    deletePopoverOpen.value = false
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadLocations()
})
</script> 