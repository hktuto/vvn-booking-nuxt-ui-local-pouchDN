<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const props = defineProps<{
  class: string
}>()
const modelValue = defineModel<string>()
const formatter = new DateFormatter('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});


const emit = defineEmits(['update:modelValue'])
const localModelValue = computed({
  get: () =>{ 
    // modelValue is a yyyy-mm-dd string
    return modelValue.value ? new CalendarDate(parseInt(modelValue.value.split('-')[0]), parseInt(modelValue.value.split('-')[1]), parseInt(modelValue.value.split('-')[2])) : null
  },
  set: (value:any) => {
    // set value is a CalendarDate
    console.log(value)
    const updatedValue = value ? formatter.format(value.toDate()) : null
    emit('update:modelValue', updatedValue)
  }
})


</script>

<template>
  <UPopover>
    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar" :class="class">
      {{ modelValue }}
    </UButton>

    <template #content>
      <UCalendar v-model="localModelValue" class="p-2" />
    </template>
  </UPopover>
</template>