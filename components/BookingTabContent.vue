<template>
  <div class="space-y-4">
    <!-- Date Navigation -->
    

    <!-- Vue-Cal Calendar -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative">
      <div v-if="loading" class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-10">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-gray-500" />
          <span class="text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</span>
        </div>
      </div>
      <vue-cal
        ref="vuecalRef"
        :time-from="9 * 60"
        :time-to="23 * 60"
        :time-step="60"
        :views="['day', 'week', 'month']"
        view="week"
        :events="calendarEvents"
        :locale="locale === 'zh-Hant' ? 'zh-hk' : 'en-us'"
        :time-format="'HH:mm'"
        :time-cell-height="60"
        :cell-height="60"
        @event-click="onEventClick"
        :dark="isDark"
        :editable-events="{
          delete: false,
          create: false,
          draggable: false,
          resizable: false
        }"
        start-week-on-sunday
        sm
        @view-change="onViewChange"
        @ready="onViewChange"
        style="height: 100dvh;"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { stringToDate, countDays, addDays, VueCal, addDatePrototypes } from 'vue-cal'
addDatePrototypes()
import 'vue-cal/style'
const { isDark } = useDarkMode()
const { t } = useI18n()
const { getBookingsForDate, addStudentToBooking, removeStudentFromBooking, addBooking } = useBookings()
const { students } = useStudents()

// Date management
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showAddStudentModal = ref(false)
const selectedBooking = ref<any>(null)
const { locale } = useI18n()

// Calendar events
const calendarEvents = ref<any[]>([])
const loading = ref(false)
const vuecalRef = ref<any>(null)


async function onViewChange(view: any) {
  let _view;
  if(view.config){
    
    _view = view.view
  }else{
    _view = view
  }
  const start = stringToDate(_view.start.format())
  const end = stringToDate(_view.end.format())
  const days = countDays(_view.start.format(), _view.end.format(), true)
  let result:any[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(_view.start, i).format()
    const bookings = await getBookingsForDate(date)
    result.push(...bookings)
    
  }
  calendarEvents.value = convertBookingsToEvents(result)
}
// Convert bookings to Vue-Cal events
const convertBookingsToEvents = (bookings: any[]) => {
  return bookings.map(booking => {
    const startTime = new Date(`${booking.class_date}T${booking.class_time}`)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour duration
    const classInfo = getClassInfo(booking)

    return {
      id: booking.id,
      title: classInfo?.name || 'Unknown Class',
      start: startTime,
      end: endTime,
      class: booking.is_virtual ? 'virtual-booking' : 'real-booking',
      customData: {
        booking,
        isVirtual: booking.is_virtual,
        classInfo
      },
      // Add subtitle for additional info
      content: booking.is_virtual 
        ? `${t('booking.virtual')} - ${booking.total_booked}/${booking.max_capacity} ${t('booking.students')}`
        : `${booking.total_booked}/${booking.max_capacity} ${t('booking.students')} - ${classInfo?.credits || 0} ${t('common.credits')}`,
      // Use class color or default colors
      backgroundColor: booking.is_virtual 
          ? (classInfo?.color || '#3B82F6') + '80' // Add transparency for virtual
          : (classInfo?.color || '#3B82F6'),
      color: '#ffffff'
    }
  })
}

// Get class information
const { classes } = useClasses()

const getClassInfo = (booking: any) => {
  if (booking.class_info) return booking.class_info
  return classes.value.find(c => c.id === booking.class_id)
}

// Event handlers
const onEventClick = ({event}: any) => {
  console.log(event)
  const booking = event.customData?.booking
  if (booking) {
    selectedBooking.value = booking
    showAddStudentModal.value = true
  }
}


// Handle student added
const handleStudentAdded = async (bookingId: string, studentId: string, creditsUsed: number, notes: string) => {
  try {
    // Check if this is a virtual booking
    const booking = calendarEvents.value.find(event => event.id === bookingId)
    if (booking?.customData?.isVirtual) {
      // For virtual bookings, we need to create the booking first
      const virtualBooking = booking.customData.booking
      const newBooking = await addBooking({
        class_id: virtualBooking.class_id,
        class_date: virtualBooking.class_date,
        class_time: virtualBooking.class_time,
        bookings: [{
          student_id: studentId,
          student_name: students.value.find((s: any) => s.id === studentId)?.name || 'Unknown Student',
          status: 'confirmed',
          credits_used: creditsUsed,
          notes,
          booked_at: new Date().toISOString()
        }],
        total_booked: 1,
        max_capacity: virtualBooking.max_capacity,
        is_virtual: false
      })
    } else {
      // For real bookings, just add the student
      await addStudentToBooking(bookingId, studentId, creditsUsed, notes)
    }
    
    // Refresh the calendar
    await refreshCalendar()
  } catch (err) {
    console.error('Error adding student:', err)
  }
}

// Handle student removed
const handleStudentRemoved = async (bookingId: string, studentId: string) => {
  try {
    await removeStudentFromBooking(bookingId, studentId)
    
    // Refresh the calendar
    await refreshCalendar()
  } catch (err) {
    console.error('Error removing student:', err)
  }
}

// Refresh calendar data
const refreshCalendar = async () => {
  try {
    // Get current view from vuecal
    const vuecal = vuecalRef.value
    if (vuecal) {
      const currentView = vuecal.view
      console.log('Refreshing calendar with view:', currentView)
      
      // Re-fetch data for the current view
      if (currentView && currentView.start && currentView.end) {
        const start = stringToDate(currentView.start.format())
        const end = stringToDate(currentView.end.format())
        const days = countDays(currentView.start.format(), currentView.end.format(), true)
        
        let result: any[] = []
        for (let i = 0; i < days; i++) {
          const date = addDays(currentView.start, i).format()
          const bookings = await getBookingsForDate(date)
          result.push(...bookings)
        }
        
        calendarEvents.value = convertBookingsToEvents(result)
      }

      // check if selectedBooking is still in the calendarEvents
      if(selectedBooking.value ){
        const booking = calendarEvents.value.find((event: any) => event.id === selectedBooking.value.id)
        if(booking){
          selectedBooking.value = booking.customData.booking
        }else{
          selectedBooking.value = null
        }
      }
    }
  } catch (err) {
    console.error('Error refreshing calendar:', err)
  }
}

// Handle modal close
const handleModalClose = async (isOpen: boolean) => {
  // Refresh calendar when modal closes
  if (!isOpen) {
    await refreshCalendar()
  }
}

// Watch for modal state changes
watch(showAddStudentModal, async (newValue, oldValue) => {
  // Refresh calendar when modal closes
  if (oldValue && !newValue) {
    console.log('Modal closed, refreshing calendar...')
    await refreshCalendar()
  }
})

// Expose refresh method for external use
defineExpose({
  refreshCalendar
})

</script>

<style lang="scss">
/* Custom styles for Vue-Cal */
.vuecal{
--vuecal-primary-color:var(--ui-primary);
--vuecal-secondary-color:var(--ui-color-secondary-500);
--vuecal-base-color:#ffffff;
--vuecal-contrast-color:#000000;
--vuecal-border-color:color-mix(in srgb, var(--vuecal-base-color) 8%, transparent);
--vuecal-header-color:var(--vuecal-base-color);
--vuecal-event-color:var(--vuecal-base-color);
--vuecal-event-border-color:currentColor;
--vuecal-border-radius:6px;
--vuecal-height:500px;
--vuecal-min-schedule-width:0px;
--vuecal-min-cell-width:0px;
--vuecal-transition-duration:0.25s;
}

.vuecal__event{

  &.virtual-booking{
    border-style: dashed;
  }
}
.vuecal--default-theme.vuecal--dark{
  --vuecal-primary-color: var(--ui-color-primary-900);
  --vuecal-secondary-color: var(--color-gray-800);
  --vuecal-base-color: #fff;
  --vuecal-contrast-color: #000;
  --vuecal-border-color: color-mix(in srgb, var(--vuecal-base-color) 8%, transparent);
  --vuecal-header-color: var(--vuecal-base-color);
  --vuecal-event-color: var(--vuecal-base-color);
  --vuecal-event-border-color: color-mix(in srgb, var(--vuecal-base-color) 50%, transparent);
}
</style> 