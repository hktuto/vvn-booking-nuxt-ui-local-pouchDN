<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('class.classes') }}</h1>
          
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <ClassTabContent />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

</script> 