<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('student.recentTransactions') }}</h2>
        <UButton
          @click="$emit('refresh')"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="loading"
        >
          {{ t('common.refresh') }}
        </UButton>
      </div>
    </template>
    
    <div v-if="studentTransactions.length > 0" class="space-y-3">
      <div
        v-for="transaction in studentTransactions"
        :key="transaction.id"
        class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ transaction.description }}
              </h3>
              <UBadge
                :color="getTransactionStatusColor(transaction.status)"
                variant="soft"
                size="sm"
              >
                {{ t(`transaction.status.${transaction.status}`) }}
              </UBadge>
              <UBadge
                :color="getTransactionTypeColor(transaction.transaction_type)"
                variant="soft"
                size="sm"
              >
                {{ t(`transaction.type.${transaction.transaction_type}`) }}
              </UBadge>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span class="font-medium">{{ t('transactions.amount') }}:</span>
                ${{ transaction.amount.toFixed(2) }}
              </div>
              <div>
                <span class="font-medium">{{ t('transactions.date') }}:</span>
                {{ formatDate(transaction.created_at) }}
              </div>
              <div v-if="transaction.payment_method">
                <span class="font-medium">{{ t('transactions.paymentMethod') }}:</span>
                {{ t(`payment.${transaction.payment_method}`) }}
              </div>
              <div v-if="transaction.unit_price">
                <span class="font-medium">{{ t('transactions.unitPrice') }}:</span>
                ${{ transaction.unit_price.toFixed(2) }}
              </div>
            </div>
            
            <div v-if="transaction.notes" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span class="font-medium">{{ t('common.notes') }}:</span>
              {{ transaction.notes }}
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <UButton
              @click="$emit('view-transaction', transaction)"
              variant="ghost"
              size="sm"
              icon="i-heroicons-eye"
              :aria-label="t('common.view')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <UIcon name="i-heroicons-credit-card" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('student.noTransactions') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('student.noTransactionsMessage') }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  studentTransactions: any[]
  loading?: boolean
}

interface Emits {
  (e: 'refresh'): void
  (e: 'view-transaction', transaction: any): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Methods
const getTransactionStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'refunded': return 'info'
    default: return 'neutral'
  }
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'package_purchase': return 'primary'
    case 'credit_usage': return 'success'
    case 'cash_payment': return 'warning'
    case 'refund': return 'info'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script> 