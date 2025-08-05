<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ transaction ? $t('transactions.editTransaction') : $t('transactions.addTransaction') }}
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
      <div class="p-6 text-center">
        <UIcon name="i-heroicons-banknotes" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h4>
        <p class="text-gray-600 dark:text-gray-400">
          Transaction functionality will be implemented in the next phase.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          @click="closeModal"
          variant="soft"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  open: boolean
  transaction?: any
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'saved', transaction: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const closeModal = () => {
  isOpen.value = false
}
</script>