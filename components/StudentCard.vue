<template>
  <UCard>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            <NuxtLink 
              :to="`/students/${student.id}`"
              class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {{ student.name }}
            </NuxtLink>
          </h3>
          <UBadge
            :color="student.credits > 0 ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
          >
            {{ student.credits }} {{ $t('student.credits') }}
          </UBadge>
        </div>
        
        <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            <span>{{ student.country_code }} {{ student.phone }}</span>
          </div>
          
          <div v-if="student.email" class="flex items-center gap-2">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            <span>{{ student.email }}</span>
          </div>
          
          <div v-if="student.address" class="flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            <span>{{ student.address }}</span>
          </div>
          
          <div v-if="student.notes" class="flex items-start gap-2">
            <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4 mt-0.5" />
            <span class="line-clamp-2">{{ student.notes }}</span>
          </div>
        </div>
      </div>
      <UDropdownMenu :items="getStudentActions()">
        <UButton
          variant="soft"
          size="sm"
          icon="i-heroicons-ellipsis-vertical"
          :aria-label="$t('common.actions')"
        />
      </UDropdownMenu>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deletePopoverOpen">
      <template #title>
        {{ $t('student.deleteStudent') }}
      </template>
      <template #description>
        {{ $t('student.deleteStudentMessage', { name: props.student.name }) }}
      </template>
      <template #footer>
        <UButton @click="deletePopoverOpen = false" variant="soft" size="sm">{{ $t('common.cancel') }}</UButton>
        <UButton @click="confirmDelete" color="error" variant="soft" size="sm">{{ $t('common.delete') }}</UButton>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  student: {
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
  (e: 'edit', student: Props['student']): void
  (e: 'delete', student: Props['student']): void
  (e: 'addPackage', student: Props['student']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const deletePopoverOpen = ref(false)

const getStudentActions = () => [
  [{
    label: $t('common.detail'),
    icon: 'i-heroicons-eye',
    onSelect: () => navigateTo(`/students/${props.student.id}`)
  }],
  [{
    label: $t('student.addPackage'),
    icon: 'i-heroicons-plus-circle',
    onSelect: () => emit('addPackage', props.student)
  }],
  [{
    label: $t('common.edit'),
    icon: 'i-heroicons-pencil-square',
    onSelect: () => emit('edit', props.student)
  }],
  [{
    label: $t('common.delete'),
    icon: 'i-heroicons-trash',
    onSelect: () => {
      deletePopoverOpen.value = true
    }
  }]
]

const confirmDelete = () => {
  emit('delete', props.student)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 