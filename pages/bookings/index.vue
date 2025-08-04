<template>
  <NuxtLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('booking.bookings') }}</h1>
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <BookingTabContent />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()
definePageMeta({
  middleware: 'auth'
})
</script>