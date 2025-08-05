<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('student.information') }}</h2>
        <UButton
          @click="$emit('edit')"
          variant="ghost"
          size="sm"
          icon="i-heroicons-pencil-square"
        >
          {{ t('common.edit') }}
        </UButton>
      </div>
    </template>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.name') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student?.name }}</p>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.phone') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student?.country_code }} {{ student?.phone }}</p>
        </div>
        
        <div v-if="student?.email">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.email') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student.email }}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.credits') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student?.credits }}</p>
        </div>
        
        <div v-if="student?.address">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.address') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student.address }}</p>
        </div>
        
        <div v-if="student?.notes">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.notes') }}
          </label>
          <p class="text-gray-900 dark:text-white">{{ student.notes }}</p>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('student.tags') }}
          </label>
          <div v-if="student?.tags && student.tags.length > 0" class="flex flex-wrap gap-2 mt-1">
            <UBadge
              v-for="tag in student.tags"
              :key="tag"
              color="secondary"
              variant="soft"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ t('student.noTags') }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  student: any
}

defineProps<Props>()
defineEmits<{
  edit: []
}>()

const { t } = useI18n()
</script> 