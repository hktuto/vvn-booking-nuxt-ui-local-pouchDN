<template>
  <UNavigationMenu :items="menuItems" />
</template>

<script setup lang="ts">
const { t } = useI18n()

const menuItems = [
  {
    label: t('class.classes'),
    icon: 'i-heroicons-calendar',
    to: '/classes'
  },
  {
    label: t('location.locations'),
    icon: 'i-heroicons-map-pin',
    to: '/locations'
  },
  {
    label: t('booking.bookings'),
    icon: 'i-heroicons-calendar',
    to: '/bookings'
  }
]

</script>