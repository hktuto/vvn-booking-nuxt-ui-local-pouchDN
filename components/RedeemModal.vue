<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('booking.redeem.title') }}
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
      <div class="space-y-4">
        <!-- Student Info -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div class="flex items-center space-x-3">
            <UIcon name="i-heroicons-user" class="text-gray-500" />
            <div>
              <p class="font-medium">{{ student?.name }}</p>
              <p class="text-sm text-gray-500">{{ student?.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="space-y-3">
          <label class="text-sm font-medium">{{ $t('booking.redeem.paymentMethod') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <UButton
              :variant="form.paymentMethod === 'credit' ? 'solid' : 'outline'"
              :color="form.paymentMethod === 'credit' ? 'primary' : 'neutral'"
              @click="form.paymentMethod = 'credit'"
              class="justify-start"
            >
              <UIcon name="i-heroicons-credit-card" class="mr-2" />
              {{ $t('booking.redeem.credit') }}
            </UButton>
            <UButton
              :variant="form.paymentMethod === 'cash' ? 'solid' : 'outline'"
              :color="form.paymentMethod === 'cash' ? 'primary' : 'neutral'"
              @click="form.paymentMethod = 'cash'"
              class="justify-start"
            >
              <UIcon name="i-heroicons-banknotes" class="mr-2" />
              {{ $t('booking.redeem.cash') }}
            </UButton>
          </div>
        </div>

        <!-- Credit Payment Section -->
        <div v-if="form.paymentMethod === 'credit'" class="space-y-4">
          <!-- Active Packages -->
          <div v-if="activePackages.length > 0" class="space-y-3">
            <label class="text-sm font-medium">{{ $t('booking.redeem.selectPackage') }}</label>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="pkg in activePackages"
                :key="pkg.id"
                class="border rounded-lg p-3 cursor-pointer transition-colors"
                :class="form.selectedPackages.includes(pkg.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
                @click="togglePackageSelection(pkg.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="font-medium">{{ pkg.package_name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ $t('booking.redeem.remainingCredits', { credits: pkg.credits_remaining }) }}
                    </p>
                  </div>
                  <UCheckbox
                    :model-value="form.selectedPackages.includes(pkg.id)"
                    @update:model-value="togglePackageSelection(pkg.id)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- No Active Packages -->
          <div v-else class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p class="font-medium text-yellow-800 dark:text-yellow-200">
                  {{ $t('booking.redeem.noActivePackages') }}
                </p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {{ $t('booking.redeem.buyPackagePrompt') }}
                </p>
                <UButton
                  size="sm"
                  color="warning"
                  variant="outline"
                  class="mt-2"
                  @click="showBuyPackageModal = true"
                >
                  {{ $t('booking.redeem.buyPackage') }}
                </UButton>
              </div>
            </div>
          </div>

          <!-- Credits to Use -->
          <div v-if="form.selectedPackages.length > 0" class="space-y-2">
            <label class="text-sm font-medium">{{ $t('booking.redeem.creditsToUse') }}</label>
            <UInput
              v-model="form.creditsToUse"
              type="number"
              :min="1"
              :max="maxAvailableCredits"
              :placeholder="$t('booking.redeem.enterCredits')"
            />
            <p class="text-xs text-gray-500">
              {{ $t('booking.redeem.availableCredits', { credits: maxAvailableCredits }) }}
            </p>
          </div>
        </div>

        <!-- Cash Payment Section -->
        <div v-if="form.paymentMethod === 'cash'" class="space-y-3">
          <div class="space-y-2">
            <label class="text-sm font-medium">{{ $t('booking.redeem.cashAmount') }}</label>
            <UInput
              v-model="form.cashAmount"
              type="number"
              :min="0.01"
              :step="0.01"
              :placeholder="$t('booking.redeem.enterAmount')"
              class="font-mono"
            >
              <template #leading>
                <span class="text-gray-500">$</span>
              </template>
            </UInput>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">{{ $t('booking.redeem.paymentMethod') }}</label>
            <USelect
              v-model="form.selectedPaymentMethod"
              :options="paymentMethods"
              option-attribute="label"
              value-attribute="value"
              :placeholder="$t('booking.redeem.selectPaymentMethod')"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ $t('common.notes') }}</label>
          <UTextarea
            v-model="form.notes"
            :placeholder="$t('booking.redeem.notesPlaceholder')"
            :rows="2"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton @click="closeModal" variant="soft">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton @click="handleSubmit" :loading="submitting" :disabled="!canSubmit">
          {{ $t('booking.redeem.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Buy Package Modal -->
  <UModal v-model="showBuyPackageModal">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ $t('booking.redeem.buyPackage') }}
      </h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <p>{{ $t('booking.redeem.buyPackageDescription') }}</p>
        <div class="space-y-2">
          <label class="text-sm font-medium">{{ $t('booking.redeem.selectPackageToBuy') }}</label>
          <USelect
            v-model="packageToBuy"
            :options="availablePackages"
            option-attribute="name"
            value-attribute="id"
            :placeholder="$t('booking.redeem.selectPackage')"
          />
        </div>
        <div v-if="packageToBuy" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div class="flex justify-between items-center">
            <span class="font-medium">{{ selectedPackageInfo?.name }}</span>
            <span class="text-lg font-bold">${{ selectedPackageInfo?.price }}</span>
          </div>
          <p class="text-sm text-gray-500">{{ selectedPackageInfo?.credits }} {{ $t('common.credits') }}</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton @click="showBuyPackageModal = false" variant="soft">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton @click="handleBuyPackage" :loading="buyPackageLoading" :disabled="!packageToBuy">
          {{ $t('booking.redeem.buyAndRedeem') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  student: any
  classInfo: any
  bookingId?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'redeem-completed', data: any): void
  (e: 'package-purchased', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getActivePackagesForStudent, addPackageToStudent, useCreditsFromPackages } = useStudentPackages()
const { createTransaction } = useTransactions()
const { packages } = usePackages()

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showBuyPackageModal = ref(false)
const submitting = ref(false)
const buyPackageLoading = ref(false)
const packageToBuy = ref('')

// Form data
const form = reactive({
  paymentMethod: 'credit' as 'credit' | 'cash',
  selectedPackages: [] as string[],
  creditsToUse: 1,
  cashAmount: 0,
  selectedPaymentMethod: 'cash',
  notes: ''
})

// Computed
const activePackages = computed(() => {
  if (!props.student) return []
  return getActivePackagesForStudent(props.student.id)
})

const maxAvailableCredits = computed(() => {
  return form.selectedPackages.reduce((total, packageId) => {
    const pkg = activePackages.value.find(p => p.id === packageId)
    return total + (pkg?.credits_remaining || 0)
  }, 0)
})

const canSubmit = computed(() => {
  if (form.paymentMethod === 'credit') {
    return form.selectedPackages.length > 0 && form.creditsToUse > 0 && form.creditsToUse <= maxAvailableCredits.value
  } else {
    return form.cashAmount > 0 && form.selectedPaymentMethod
  }
})

const availablePackages = computed(() => {
  return packages.value.filter(p => p.active && !p.is_custom)
})

const selectedPackageInfo = computed(() => {
  return availablePackages.value.find(p => p.id === packageToBuy.value)
})

const paymentMethods = [
  { label: t('payment.cash'), value: 'cash' },
  { label: t('payment.payme'), value: 'payme' },
  { label: t('payment.wechat'), value: 'wechat' },
  { label: t('payment.alipay'), value: 'alipay' },
  { label: t('payment.fps'), value: 'fps' },
  { label: t('payment.creditCard'), value: 'credit_card' }
]

// Methods
const togglePackageSelection = (packageId: string) => {
  const index = form.selectedPackages.indexOf(packageId)
  if (index > -1) {
    form.selectedPackages.splice(index, 1)
  } else {
    form.selectedPackages.push(packageId)
  }
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  form.paymentMethod = 'credit'
  form.selectedPackages = []
  form.creditsToUse = 1
  form.cashAmount = 0
  form.selectedPaymentMethod = 'cash'
  form.notes = ''
  packageToBuy.value = ''
  showBuyPackageModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    if (form.paymentMethod === 'credit') {
      await handleCreditPayment()
    } else {
      await handleCashPayment()
    }
    
    emit('redeem-completed', {
      paymentMethod: form.paymentMethod,
      amount: form.paymentMethod === 'credit' ? form.creditsToUse : form.cashAmount
    })
    
    closeModal()
  } catch (error) {
    console.error('Error processing payment:', error)
  } finally {
    submitting.value = false
  }
}

const handleCreditPayment = async () => {
  // Use credits from selected packages
  await useCreditsFromPackages(props.student.id, form.creditsToUse, form.selectedPackages)

  // Create transaction for credit usage
  await createTransaction({
    student_id: props.student.id,
    transaction_type: 'credit_usage',
    status: 'completed',
    amount: 0, // Credit usage doesn't have monetary amount
    currency: 'HKD',
    class_id: props.classInfo.id,
    booking_id: props.bookingId,
    description: `Credit usage: ${props.classInfo.name} (${form.creditsToUse} credits)`,
    notes: form.notes
  })
}

const handleCashPayment = async () => {
  await createTransaction({
    student_id: props.student.id,
    transaction_type: 'cash_payment',
    status: 'completed',
    amount: form.cashAmount,
    currency: 'HKD',
    class_id: props.classInfo.id,
    booking_id: props.bookingId,
    description: `Cash payment: ${props.classInfo.name}`,
    payment_method: form.selectedPaymentMethod as any,
    notes: form.notes
  })
}

const handleBuyPackage = async () => {
  buyPackageLoading.value = true
  
  try {
    const newStudentPackage = await addPackageToStudent(
      props.student.id,
      packageToBuy.value,
      form.notes
    )
    
    emit('package-purchased', newStudentPackage)
    showBuyPackageModal.value = false
    
    // Auto-select the newly purchased package
    form.selectedPackages = [newStudentPackage.id]
  } catch (error) {
    console.error('Error buying package:', error)
  } finally {
    buyPackageLoading.value = false
  }
}

// Watch for modal open to auto-select packages
watch(() => isOpen.value, (newValue) => {
  if (newValue && activePackages.value.length === 1) {
    // Auto-select if only one active package
    form.selectedPackages = [activePackages.value[0].id]
  }
})
</script> 