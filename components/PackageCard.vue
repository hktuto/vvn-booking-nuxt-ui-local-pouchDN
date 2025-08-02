<template>
  <UCard>
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ package_.name }}
          </h3>
          <UBadge
            :color="package_.active ? 'primary' : 'neutral'"
            variant="soft"
            size="sm"
          >
            {{ package_.active ? $t('common.active') : $t('common.inactive') }}
          </UBadge>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p class="text-gray-700 dark:text-gray-300">
            {{ package_.description }}
          </p>
          
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-credit-card" class="w-4 h-4" />
              <span class="font-medium">${{ package_.price }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
              <span>{{ package_.credits }} {{ $t('package.credits') }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              <span>{{ package_.duration_days }} {{ $t('package.days') }}</span>
            </div>
          </div>
        </div>
      </div>
      
            <UModal v-model:open="deletePopoverOpen">
        <template #title>
          {{ $t('package.deletePackage') }}
        </template>
        <template #description>
          {{ $t('package.deletePackageMessage', { name: props.package_.name }) }}
        </template>
        <template #footer>
          <UButton @click="deletePopoverOpen = false" variant="soft" size="sm">{{ $t('common.cancel') }}</UButton>
          <UButton @click="confirmDelete" color="error" variant="soft" size="sm">{{ $t('common.delete') }}</UButton>
        </template>
      </UModal>
      <UDropdownMenu :items="getPackageActions()">
        <UButton
          variant="soft"
          size="sm"
          icon="i-heroicons-ellipsis-vertical"
          :aria-label="$t('common.actions')"
        />
      </UDropdownMenu>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  package_: {
    id: string
    name: string
    description: string
    price: number
    credits: number
    duration_days: number
    active: boolean
    created_at: string
    updated_at: string
  }
}

interface Emits {
  (e: 'edit', package_: Props['package_']): void
  (e: 'delete', package_: Props['package_']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const deletePopoverOpen = ref(false)

const getPackageActions = () => [
  [{
    label: $t('common.edit'),
    icon: 'i-heroicons-pencil-square',
    onSelect: () => emit('edit', props.package_)
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
  emit('delete', props.package_)
  deletePopoverOpen.value = false
}
</script> 