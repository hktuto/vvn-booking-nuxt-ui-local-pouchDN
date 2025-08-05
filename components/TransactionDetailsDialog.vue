<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('transaction.detailsTitle') }}
        </h3>
        <UButton
          @click="closeDialog"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
        />
      </div>
    </template>

    <template #body>
      <div v-if="transaction" class="space-y-6">
        <!-- Student Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3">
            {{ t('transaction.studentInfo') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('student.name') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ student?.name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('student.phone') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ student?.country_code }} {{ student?.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Package Information -->
        <div v-if="packageInfo" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3">
            {{ t('transaction.packageInfo') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('package.name') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ packageInfo.name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('package.credits') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ transaction.credits_used || 0 }}</p>
            </div>
            <div v-if="transaction.unit_price">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transaction.unitPrice') }}:
              </span>
              <p class="text-gray-900 dark:text-white">${{ transaction.unit_price.toFixed(2) }}</p>
            </div>
            <div v-if="transaction.total_amount">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transaction.totalAmount') }}:
              </span>
              <p class="text-gray-900 dark:text-white">${{ transaction.total_amount.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Class Information -->
        <div v-if="classInfo" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3">
            {{ t('transaction.classInfo') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('class.name') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ classInfo.name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('booking.date') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatDate(bookingInfo?.class_date) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('booking.time') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatTime(bookingInfo?.class_time) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transaction.transactionDate') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatDate(transaction.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Transaction Summary -->
        <div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <h4 class="font-medium text-primary-900 dark:text-primary-100 mb-3">
            {{ t('transaction.summary') }}
          </h4>
          <div class="space-y-2">
            <p class="text-sm text-primary-800 dark:text-primary-200">
              {{ t('transaction.summaryText', {
                studentName: student?.name,
                packageName: packageInfo?.name,
                creditsUsed: transaction.credits_used || 0,
                className: classInfo?.name,
                classDate: formatDate(bookingInfo?.class_date),
                classTime: formatTime(bookingInfo?.class_time)
              }) }}
            </p>
          </div>
        </div>

        <!-- WhatsApp Message Preview -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 class="font-medium text-green-900 dark:text-green-100 mb-3">
            {{ t('transaction.whatsappPreview') }}
          </h4>
          <div class="bg-white dark:bg-gray-800 rounded border p-3 text-sm">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ whatsappMessage }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          @click="closeDialog"
          variant="ghost"
          color="neutral"
        >
          {{ t('common.close') }}
        </UButton>
        <UButton
          @click="sendWhatsAppMessage"
          variant="solid"
          color="success"
          icon="i-simple-icons-whatsapp"
          :loading="sendingMessage"
        >
          {{ t('transaction.sendWhatsApp') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  transaction: any
  student: any
  packageInfo: any
  classInfo: any
  bookingInfo: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const sendingMessage = ref(false)

// Generate WhatsApp message
const whatsappMessage = computed(() => {
  if (!props.student || !props.transaction) return ''
  
  const studentName = props.student.name
  const className = props.classInfo?.name || 'Class'
  const classDateTime = formatDate(props.bookingInfo?.class_date) + ' ' + formatTime(props.bookingInfo?.class_time)
  
  // Determine payment amount and type
  let paymentInfo = ''
  if (props.transaction.credits_used && props.transaction.credits_used > 0) {
    paymentInfo = `Credit: ${props.transaction.credits_used} credits`
  } else if (props.transaction.total_amount) {
    paymentInfo = `Cash: $${props.transaction.total_amount.toFixed(2)}`
  } else {
    paymentInfo = 'Credit: 0 credits'
  }
  
  // Get remaining credits (student's current total credits)
  const remainingCredits = props.student.credits || 0
  
  return t('transaction.whatsappMessage', {
    studentName,
    className,
    classDateTime,
    paymentInfo,
    remainingCredits
  })
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (timeString: string) => {
  if (!timeString) return ''
  return timeString
}

const closeDialog = () => {
  isOpen.value = false
  emit('close')
}

const sendWhatsAppMessage = async () => {
  if (!props.student?.phone) {
    // Show error message
    return
  }
  
  try {
    sendingMessage.value = true
    
    // Format phone number for WhatsApp (remove spaces, add country code if needed)
    let phoneNumber = props.student.phone.replace(/\s+/g, '')
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = (props.student.country_code || '+852') + phoneNumber
    }
    
    // Remove any non-digit characters except +
    phoneNumber = phoneNumber.replace(/[^\d+]/g, '')
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage.value)
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank')
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
  } finally {
    sendingMessage.value = false
  }
}
</script> 