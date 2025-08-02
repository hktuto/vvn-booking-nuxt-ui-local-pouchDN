<template>
  <UCard>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ location.name }}
          </h3>
          <UBadge
            :color="location.active ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
          >
            {{ location.active ? t('common.active') : t('common.inactive') }}
          </UBadge>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{{ location.address }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-phone" class="w-4 h-4 flex-shrink-0" />
            <span>{{ location.phone }}</span>
          </div>
          
          <div v-if="location.email" class="flex items-center gap-2">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4 flex-shrink-0" />
            <span>{{ location.email }}</span>
          </div>
          
          <div v-if="location.website" class="flex items-center gap-2">
            <UIcon name="i-heroicons-globe-alt" class="w-4 h-4 flex-shrink-0" />
            <a 
              :href="location.website" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {{ location.website }}
            </a>
          </div>
        </div>
      </div>
      
      <UDropdownMenu :items="getLocationActions()">
        <UButton
          variant="soft"
          size="sm"
          icon="i-heroicons-ellipsis-vertical"
          :aria-label="t('common.actions')"
        />
      </UDropdownMenu>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deletePopoverOpen">
      <template #title>
        {{ t('location.deleteLocation') }}
      </template>
      <template #description>
        {{ t('location.deleteLocationMessage', { name: location.name }) }}
      </template>
      <template #footer>
        <UButton @click="deletePopoverOpen = false" variant="soft" size="sm">
          {{ t('common.cancel') }}
        </UButton>
        <UButton @click="confirmDelete" color="error" variant="soft" size="sm">
          {{ t('common.delete') }}
        </UButton>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  location: {
    id: string
    name: string
    address: string
    phone: string
    email: string
    website: string
    active: boolean
    created_at: string
    updated_at: string
  }
}

interface Emits {
  (e: 'edit', location: Props['location']): void
  (e: 'delete', location: Props['location']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

const deletePopoverOpen = ref(false)

const getLocationActions = () => [
  [{
    label: t('common.edit'),
    icon: 'i-heroicons-pencil-square',
    onSelect: () => emit('edit', props.location)
  }],
  [{
    label: t('common.delete'),
    icon: 'i-heroicons-trash',
    onSelect: () => {
      deletePopoverOpen.value = true
    }
  }]
]

const confirmDelete = () => {
  emit('delete', props.location)
  deletePopoverOpen.value = false
}
</script> 