<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('transactions.detailsTitle') }}
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
      <div v-if="transaction" class="space-y-4">
        <!-- Student Information -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3">
            {{ t('transactions.studentInfo') }}
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
            {{ t('transactions.packageInfo') }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('package.name') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ packageInfo.package_name || packageInfo.name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('package.credits') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ transaction.total_amount || packageInfo.credits }}</p>
            </div>
            <div v-if="transaction.unit_price">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transactions.unitPrice') }}:
              </span>
              <p class="text-gray-900 dark:text-white">${{ transaction.unit_price.toFixed(2) }}</p>
            </div>
            <div v-if="transaction.total_amount">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transactions.totalAmount') }}:
              </span>
              <p class="text-gray-900 dark:text-white">${{ transaction.amount.toFixed(2) }}</p>
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
                {{ t('transactions.date') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatDate(bookingInfo?.class_date) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('classes.time') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatTime(bookingInfo?.class_time) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('transactions.transactionDate') }}:
              </span>
              <p class="text-gray-900 dark:text-white">{{ formatDate(transaction.created_at) }}</p>
            </div>
          </div>
        </div>



        <!-- WhatsApp Message Preview -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 class="font-medium text-green-900 dark:text-green-100 mb-3">
            {{ t('transactions.whatsappPreview') }}
          </h4>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <UButton
              :variant="messageLanguage === 'en' ? 'solid' : 'outline'"
              :color="messageLanguage === 'en' ? 'primary' : 'neutral'"
              @click="changeMessageLanguage('en')"
              class="justify-start"
            >
              <UIcon name="i-twemoji-flag-united-kingdom" class="mr-2" />
              English
            </UButton>
            <UButton
              :variant="messageLanguage === 'zh-Hant' ? 'solid' : 'outline'"
              :color="messageLanguage === 'zh-Hant' ? 'primary' : 'neutral'"
              @click="changeMessageLanguage('zh-Hant')"
              class="justify-start"
            >
              <UIcon name="i-twemoji-flag-hong-kong-sar-china" class="mr-2" />
              繁體中文
            </UButton>
          </div>
          <UTextarea
              v-model="finalWhatsappMessage"
              :rows="6"
              class="font-mono w-full"
            />
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
  transaction: any
  student: any
  packageInfo: any
  classInfo?: any
  bookingInfo?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Reactive state for message customization
const messageLanguage = ref<'en' | 'zh-Hant'>('en')
const useCustomMessage = ref(false)
const customMessageText = ref('')

// Computed
const isOpen = ref(false);

const sendingMessage = ref(false)

function changeMessageLanguage(language: 'en' | 'zh-Hant') {
  messageLanguage.value = language
  console.log(messageLanguage.value)
  finalWhatsappMessage.value = generateWhatsappMessage()
}

function generateWhatsappMessage() {
  if (!props.student || !props.transaction) return ''
  
  const studentName = props.student.name
  
  // Determine payment amount and type
  let paymentInfo = ''
  switch(props.transaction.transaction_type){
    case 'credit_usage':
      paymentInfo = `Credit: ${props.transaction.total_amount} credits`
      break
    case 'package_purchase':
      paymentInfo = `${props.transaction.payment_method}: $${props.transaction.amount.toFixed(2)}`
      break
    case 'cash_payment':
      paymentInfo = `${props.transaction.payment_method}: $${props.transaction.amount.toFixed(2)}`
      break
    case 'refund':
      paymentInfo = `${props.transaction.payment_method}: -$${props.transaction.amount.toFixed(2)}`
      break
    default:
      paymentInfo = 'Credit: 0 credits'
  }
  if(props.classInfo){
    // class booking message
    const className = props.classInfo?.name || 'Class'
    const classDateTime = formatDate(props.bookingInfo?.class_date) + ' ' + formatTime(props.bookingInfo?.class_time)
    
    // Get remaining credits (student's current total credits)
    const remainingCredits = props.student.credits || 0

    console.log(paymentInfo, props.transaction)
    return t('transactions.' + messageLanguage.value + '.classBookingMessage', {
      studentName,
      className,
      classDateTime,
      paymentInfo,
      remainingCredits
    })
  }else if(props.packageInfo){
    // package purchase message
    return t('transactions.' + messageLanguage.value + '.packagePurchaseMessage', {
      studentName,
      purchaseDate: formatDate(props.transaction.created_at),
      packageName: props.packageInfo.name,
      packageCredits: props.packageInfo.credits,
      packagePrice: props.packageInfo.price,
      remainingCredits: props.student.credits
    })
  }
}

const defaultMessageText = ref();
// Generate default WhatsApp message

const finalWhatsappMessage = ref(defaultMessageText.value)


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

onMounted(() => {
  defaultMessageText.value = generateWhatsappMessage()
  finalWhatsappMessage.value = defaultMessageText.value
})

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
    const encodedMessage = encodeURIComponent(finalWhatsappMessage.value)
    
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