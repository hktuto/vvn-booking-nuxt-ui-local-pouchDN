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
        :views="{
          day: { cols: 1, rows: 1 },
          days: { cols: 3, rows: 1 },
          week: { cols: 7, rows: 1 },// Arbitrary range of quarters of century (25y).
        }"
        :view="initialView"
        :selected-date="initialDate"
        :view-date="initialDate"
        :events="calendarEvents"
        :locale="locale === 'zh-Hant' ? 'zh-hk' : 'en-us'"
        :time-format="'HH:mm'"
        :time-cell-height="60"
        :cell-height="60"
        :cell-width="120"
        @event-click="onEventClick"
        :dark="isDark"
        start-week-on-sunday
        sm
        @view-change="onViewChange"
        @ready="onViewChange"
        style="height: calc(100dvh - 120px);"
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
const { getBookingsForDate } = useBookings()


// Date management
const showAddStudentModal = ref(false)
const selectedBooking = ref<any>(null)
const { locale } = useI18n()
const route = useRoute()



const initialDate = useState('calendarDate', () => route.query.date ? new Date(route.query.date as string) : new Date())
const initialView = useState('calendarView', () => route.query.view as string || 'day')
// Calendar events
const calendarEvents = ref<any[]>([])
const loading = ref(false)
const vuecalRef = ref<any>(null)
const router = useRouter()

async function onViewChange(view: any) {
  let _view;
  if(view.config){

    _view = view.view
  }else{
    _view = view
  }
  
  // Update URL query parameters
  await updateQueryParams(_view)
  const days = countDays(_view.start.format(), _view.end.format(), true)
  let result:any[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(_view.start, i).format()
    const bookings = await getBookingsForDate(date)
    result.push(...bookings)
  }
  calendarEvents.value = convertBookingsToEvents(result)
}

// Update URL query parameters
const updateQueryParams = async (view: any) => {
  try {
    const currentDate = view.start.format('YYYY-MM-DD')
    const currentView = view.id || 'day'
    initialView.value = currentView
    initialDate.value = new Date(currentDate)
  } catch (err) {
    console.error('Error updating query params:', err)
  }
}

// Navigate to specific date and view
const navigateToDate = async (date: Date, view: string = 'day') => {
  try {
    const dateString = date.toISOString().split('T')[0]
    
    await router.push({
      query: {
        ...route.query,
        date: dateString,
        view: view
      }
    })
  } catch (err) {
    console.error('Error navigating to date:', err)
  }
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

  const booking = event.customData?.booking
  if (booking) {
    router.push(`/bookings/${booking.id}`)
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

// Watch for modal state changes
watch(showAddStudentModal, async (newValue, oldValue) => {
  // Refresh calendar when modal closes
  if (oldValue && !newValue) {
    console.log('Modal closed, refreshing calendar...')
    await refreshCalendar()
  }
})

// // Watch for route query changes
// watch(() => route.query, async (newQuery, oldQuery) => {
//   // Only update if date or view changed
//   if (newQuery.date !== oldQuery?.date || newQuery.view !== oldQuery?.view) {
//     console.log('Query params changed, updating calendar...')
    
//     // Update calendar view and date
//     const vuecal = vuecalRef.value
//     if (vuecal) {
//       const newDate = newQuery.date ? new Date(newQuery.date as string) : new Date()
//       const newView = (newQuery.view as string) || 'day'
      
//       // Update vuecal view and date
//       vuecal.switchView(newView)
//       vuecal.setDate(newDate)
      
//       // Refresh calendar data
//       await refreshCalendar()
//     }
//   }
// }, { deep: true })

// Expose refresh method for external use
defineExpose({
  refreshCalendar,
  updateQueryParams,
  navigateToDate
})

</script>

<style lang="scss">
/* Custom styles for Vue-Cal */
.vuecal{
--vuecal-primary-color:var(--ui-primary);
--vuecal-secondary-color:var(--color-gray-150);
--vuecal-base-color:var(--color-gray-1000);
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