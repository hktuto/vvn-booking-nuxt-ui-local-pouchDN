<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('location.locations') }}
          </h1>
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <LocationTabContent ref="locationTabContentRef" />
    </UiPageContainer>

  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LocationTabContent } from '#components'



definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()
const locationTabContentRef = ref<InstanceType<typeof LocationTabContent>>()

const addNewLocation = () => {
  locationTabContentRef.value?.openAddLocationModal()
}

</script> 