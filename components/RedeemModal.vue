<template>
  <UModal v-model:open="isOpen">
    <!-- Transaction Details Dialog -->
    
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('validation.booking.redeem.title') }}
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
          <label class="text-sm font-medium">{{ $t('validation.booking.redeem.paymentMethod') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <UButton
              :variant="form.paymentMethod === 'credit' ? 'solid' : 'outline'"
              :color="form.paymentMethod === 'credit' ? 'primary' : 'neutral'"
              @click="form.paymentMethod = 'credit'"
              class="justify-start"
            >
              <UIcon name="i-heroicons-credit-card" class="mr-2" />
              {{ $t('validation.booking.redeem.credit') }}
            </UButton>
            <UButton
              :variant="form.paymentMethod === 'cash' ? 'solid' : 'outline'"
              :color="form.paymentMethod === 'cash' ? 'primary' : 'neutral'"
              @click="form.paymentMethod = 'cash'"
              class="justify-start"
            >
              <UIcon name="i-heroicons-banknotes" class="mr-2" />
              {{ $t('validation.booking.redeem.cash') }}
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
                :class="form.selectedPackage === pkg.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
                @click="selectPackage(pkg.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="font-medium">{{ pkg.package_name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ $t('validation.booking.redeem.remainingCredits', { credits: pkg.credits_remaining }) }}
                    </p>
                    <p class="text-xs text-gray-400">
                      Unit Price: ${{ calculateUnitPrice(pkg)* form.creditsToUse }}
                    </p>
                  </div>
                  <URadio
                    :model-value="form.selectedPackage"
                    :value="pkg.id"
                    @update:model-value="selectPackage(pkg.id)"
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
                  {{ $t('validation.booking.redeem.noActivePackages') }}
                </p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {{ $t('validation.booking.redeem.buyPackagePrompt') }}
                </p>
                <UButton
                  size="sm"
                  color="warning"
                  variant="outline"
                  class="mt-2"
                  @click="showBuyPackageModal = true"
                >
                  {{ $t('validation.booking.redeem.buyPackage') }}
                </UButton>
              </div>
            </div>
          </div>

          <!-- Credits to Use -->
          <div v-if="form.selectedPackage" class="flex flex-col space-y-2">
            <label class="text-sm font-medium">{{ $t('validation.booking.redeem.creditsToUse') }}</label>
            <UInput
              v-model="form.creditsToUse"
              type="number"
              :min="1"
              :max="maxAvailableCredits"
              :placeholder="$t('validation.booking.redeem.enterCredits')"
            />
            <p class="text-xs text-gray-500">
              {{ $t('validation.booking.redeem.availableCredits', { credits: maxAvailableCredits }) }}
            </p>
            <p v-if="selectedPackageInfo" class="text-xs text-gray-500">
              Total Value: ${{ (selectedPackageInfo.package_price * form.creditsToUse).toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Cash Payment Section -->
        <div v-if="form.paymentMethod === 'cash'" class="space-y-3">
          <div class="flex flex-col space-y-2">
            <label class="text-sm font-medium">{{ $t('validation.booking.redeem.cashAmount') }}</label>
            <UInput
              v-model="form.cashAmount"
              type="number"
              :min="0.01"
              :step="0.01"
              :placeholder="$t('validation.booking.redeem.enterAmount')"
              class="font-mono"
            >
              <template #leading>
                <span class="text-gray-500">$</span>
              </template>
            </UInput>
          </div>

          <div class="flex flex-col space-y-2">
            <label class="text-sm font-medium">{{ $t('validation.booking.redeem.paymentMethod') }}</label>
            <USelect
              v-model="form.selectedPaymentMethod"
              :items="paymentMethods" 
              option-attribute="label"
              value-attribute="value"
              :placeholder="$t('validation.booking.redeem.selectPaymentMethod')"
            />
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col space-y-2">
          <label class="text-sm font-medium">{{ $t('common.notes') }}</label>
          <UTextarea
            v-model="form.notes"
            :placeholder="$t('validation.booking.redeem.notesPlaceholder')"
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
          {{ $t('validation.booking.redeem.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Buy Package Modal -->
  <AddPackageToStudent
    v-model="showBuyPackageModal"
    :student="student"
    @saved="handlePackagePurchased"
  />
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
const { student } = toRefs(props)
const { t } = useI18n()
const { useCreditsFromPackages, calculateUnitPrice, getActivePackagesForStudent } = useStudentPackages()
const { createTransaction } = useTransactions()
const { updateStudent } = useStudents()
const { updateStudentBookingAndPaymentStatus } = useBookings()

// Modal state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showBuyPackageModal = ref(false)
const submitting = ref(false)

// Form data - changed to single package selection
const form = reactive({
  paymentMethod: 'credit' as 'credit' | 'cash',
  selectedPackage: '' as string, // Single package selection
  creditsToUse: 1,
  cashAmount: 0,
  selectedPaymentMethod: 'cash',
  notes: ''
})

// Initialize form with class price when modal opens
watch(() => isOpen.value, (newValue) => {
  if (newValue && props.classInfo) {
    // Set default cash amount to class price
    form.cashAmount = props.classInfo.price || 0
    // Set default credits to use to class credits
    form.creditsToUse = props.classInfo.credits || 1
  }
})

function useStudentPackageLogic(form:any) {
  const activePackages = ref<any[]>([])
  const loading = ref(false)
  async function loadStudentPackages(studentId: string) {
    loading.value = true
    const packages = await getActivePackagesForStudent(studentId)
    activePackages.value = packages.filter(p => p.status === 'active')
    if(form.selectedPackage === '' && packages.length === 1) {
      form.selectedPackage = packages[0].id
    }
    loading.value = false
  }

  return {
    activePackages,
    loadStudentPackages,
    loading
  }
}
const { loading: packageLoading, activePackages, loadStudentPackages } = useStudentPackageLogic(form)

// Get selected package info
const selectedPackageInfo = computed(() => {
  if (!form.selectedPackage) return null
  return activePackages.value.find(p => p.id === form.selectedPackage)
})

const maxAvailableCredits = computed(() => {
  if (!form.selectedPackage) return 0
  const pkg = activePackages.value.find(p => p.id === form.selectedPackage)
  return pkg?.credits_remaining || 0
})

const canSubmit = computed(() => {
  if (form.paymentMethod === 'credit') {
    return form.selectedPackage && form.creditsToUse > 0 && form.creditsToUse <= maxAvailableCredits.value
  } else {
    return form.cashAmount > 0 && form.selectedPaymentMethod
  }
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
const selectPackage = (packageId: string) => {
  form.selectedPackage = packageId
}

const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  form.paymentMethod = 'credit'
  form.selectedPackage = ''
  form.creditsToUse = 1
  form.cashAmount = 0
  form.selectedPaymentMethod = 'cash'
  form.notes = ''
  showBuyPackageModal.value = false
}



const handleCreditPayment = async () => {
  if (!form.selectedPackage || !selectedPackageInfo.value) {
    throw new Error('No package selected')
  }

  // Use credits from selected package
  const updatedPackage = await useCreditsFromPackages(props.student.id, form.creditsToUse, form.selectedPackage)
  
  // Update student's total credits
  await updateStudent(props.student.id, {
    credits: props.student.credits - form.creditsToUse
  })

  // Update booking status and payment status
  if (props.bookingId) {
    await updateStudentBookingAndPaymentStatus(props.bookingId, props.student.id, 'completed', 'paid', form.creditsToUse)
  }

  // Create transaction for credit usage with dialog
  await createTransaction({
    student_id: props.student.id,
    transaction_type: 'credit_usage',
    status: 'completed',
    amount: calculateUnitPrice(selectedPackageInfo.value) * form.creditsToUse,
    currency: 'HKD',
    student_package_id: form.selectedPackage,
    package_id: selectedPackageInfo.value.package_id,
    class_id: props.classInfo.id,
    booking_id: props.bookingId,
    description: `Credit usage: ${props.classInfo.name} (${form.creditsToUse} credits)`,
    unit_price: selectedPackageInfo.value.package_price,
    total_amount: selectedPackageInfo.value.package_price * form.creditsToUse,
    notes: form.notes,
    showDetailsDialog: true,
    student: props.student,
    packageInfo: selectedPackageInfo.value,
    classInfo: props.classInfo,
    bookingInfo: {
      class_date: props.classInfo.start_date || new Date().toISOString().split('T')[0],
      class_time: props.classInfo.start_time || 'TBD'
    }
  })
}

const handleCashPayment = async () => {
  // Update booking status and payment status (for cash payment, credits_used should be 0)
  if (props.bookingId) {
    await updateStudentBookingAndPaymentStatus(props.bookingId, props.student.id, 'completed', 'paid', 0)
  }

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
    notes: form.notes,
    showDetailsDialog: true,
    student: props.student,
    packageInfo: null, // No package for cash payment
    classInfo: props.classInfo,
    bookingInfo: {
      class_date: props.classInfo.start_date || new Date().toISOString().split('T')[0],
      class_time: props.classInfo.start_time || 'TBD'
    }
  })
}

const handlePackagePurchased = async (studentPackage: any) => {
  // Package was purchased successfully
  emit('package-purchased', studentPackage)
  showBuyPackageModal.value = false
  
  // Auto-select the newly purchased package for redemption
  form.selectedPackage = studentPackage.id
  loadStudentPackages(props.student.id)
}

watch(student, (newValue) => {
  if(newValue) {
    loadStudentPackages(newValue.id)
  }
},{
  immediate: true
})

// Close modal after successful transaction
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
    
    // Close modal after successful transaction
    closeModal()
  } catch (error) {
    console.error('Error processing payment:', error)
  } finally {
    submitting.value = false
  }
}

</script> 