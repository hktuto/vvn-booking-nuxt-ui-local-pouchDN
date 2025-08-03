<template>
  <NuxtLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Filters Demo
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            This page demonstrates how to use the transaction filters composable from other pages
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Current Filter State -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Current Filter State</h3>
        </template>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Start Date:</span> {{ filters.startDate }}
            </div>
            <div>
              <span class="font-medium">End Date:</span> {{ filters.endDate }}
            </div>
            <div>
              <span class="font-medium">Transaction Type:</span> {{ filters.transactionType || 'All' }}
            </div>
            <div>
              <span class="font-medium">Student ID:</span> {{ filters.studentId || 'All' }}
            </div>
          </div>
          <div class="mt-4">
            <UBadge :color="hasActiveFilters ? 'success' : 'neutral'">
              {{ hasActiveFilters ? 'Has Active Filters' : 'No Active Filters' }}
            </UBadge>
            <UBadge v-if="isDefaultDateRange" color="info" class="ml-2">
              Default Date Range
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Filter Controls -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Filter Controls</h3>
        </template>
        <div class="space-y-4">
          <!-- Date Range Controls -->
          <div>
            <h4 class="font-medium mb-2">Date Range</h4>
            <div class="flex gap-2">
              <UButton @click="setLastWeek" variant="outline" size="sm">
                Last Week
              </UButton>
              <UButton @click="setLastMonth" variant="outline" size="sm">
                Last Month
              </UButton>
              <UButton @click="setCurrentMonth" variant="outline" size="sm">
                Current Month
              </UButton>
              <UButton @click="resetToDefaultDates" variant="outline" size="sm">
                Reset to Default
              </UButton>
            </div>
          </div>

          <!-- Transaction Type Controls -->
          <div>
            <h4 class="font-medium mb-2">Transaction Type</h4>
            <div class="flex gap-2">
              <UButton @click="setTransactionType('package_purchase')" variant="outline" size="sm">
                Package Purchase
              </UButton>
              <UButton @click="setTransactionType('credit_usage')" variant="outline" size="sm">
                Credit Usage
              </UButton>
              <UButton @click="setTransactionType('cash_payment')" variant="outline" size="sm">
                Cash Payment
              </UButton>
              <UButton @click="setTransactionType('refund')" variant="outline" size="sm">
                Refund
              </UButton>
              <UButton @click="setTransactionType('')" variant="outline" size="sm">
                Clear Type
              </UButton>
            </div>
          </div>

          <!-- Student Controls -->
          <div>
            <h4 class="font-medium mb-2">Student</h4>
            <div class="flex gap-2">
              <UButton @click="setStudentId('student-1')" variant="outline" size="sm">
                Student 1
              </UButton>
              <UButton @click="setStudentId('student-2')" variant="outline" size="sm">
                Student 2
              </UButton>
              <UButton @click="setStudentId('')" variant="outline" size="sm">
                Clear Student
              </UButton>
            </div>
          </div>

          <!-- Clear All Filters -->
          <div>
            <UButton @click="clearAllFilters" variant="outline" color="red">
              Clear All Filters
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Navigation -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Navigation</h3>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Navigate to the transactions page to see the filters in action:
          </p>
          <UButton @click="goToTransactions" variant="solid">
            Go to Transactions Page
          </UButton>
        </div>
      </UCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { 
  filters, 
  hasActiveFilters, 
  isDefaultDateRange,
  setFilters,
  clearFilters,
  resetToDefaultDates,
  updateDateRange,
  updateTransactionType,
  updateStudentId
} = useTransactionFilters()

// Helper functions to set different date ranges
const setLastWeek = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  
  updateDateRange(
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  )
}

const setLastMonth = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(end.getMonth() - 1)
  
  updateDateRange(
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  )
}

const setCurrentMonth = () => {
  resetToDefaultDates()
}

const setTransactionType = (type: string) => {
  updateTransactionType(type)
}

const setStudentId = (id: string) => {
  updateStudentId(id)
}

const clearAllFilters = () => {
  clearFilters()
}

const goToTransactions = () => {
  navigateTo('/transactions')
}
</script>