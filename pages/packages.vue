<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('package.packages') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('package.managePackages') }}
          </p>
        </div>
        <UButton
          @click="addNewPackage"
          icon="i-heroicons-plus"
          size="sm"
        >
          {{ $t('package.addPackage') }}
        </UButton>
      </div>
    </template>

    <div class="p-6">

    <!-- Search Bar -->
    <div class="mb-6">
      <UFormField name="search" :label="$t('common.search')">
        <UInput
          v-model="searchQuery"
          :placeholder="$t('package.searchPlaceholder')"
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-500" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      :title="$t('common.error')"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Packages Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <PackageCard
        v-for="package_ in filteredPackages"
        :key="package_.id"
        :package_="package_"
        @edit="editPackage"
        @delete="confirmDelete"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredPackages.length === 0"
      class="text-center py-12"
    >
      <UIcon name="i-heroicons-book-open" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ searchQuery ? $t('package.noSearchResults') : $t('package.noPackages') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ searchQuery ? $t('package.tryDifferentSearch') : $t('package.noPackagesDescription') }}
      </p>
      <UButton
        v-if="!searchQuery"
        @click="addNewPackage"
        icon="i-heroicons-plus"
        color="primary"
      >
        {{ $t('package.addFirstPackage') }}
      </UButton>
    </div>

    <!-- Package Form Modal -->
    <PackageForm
      v-model="showAddModal"
      :package_="editingPackage"
      @saved="handlePackageSaved"
    />
  </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { PackageForm } from '~/composables/useTranslatedValidation'

definePageMeta({
  middleware: 'auth'
})

const { packages, loading, error, addPackage, updatePackage, deletePackage } = usePackages()

const showAddModal = ref(false)
const editingPackage = ref<any>(null)
const searchQuery = ref('')

// Computed property for filtered packages
const filteredPackages = computed(() => {
  if (!searchQuery.value.trim()) {
    return packages.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return packages.value.filter(package_ => 
    package_.name.toLowerCase().includes(query) ||
    package_.description.toLowerCase().includes(query) ||
    package_.price.toString().includes(query) ||
    package_.credits.toString().includes(query) ||
    package_.duration_days.toString().includes(query)
  )
})

const addNewPackage = () => {
  editingPackage.value = null
  showAddModal.value = true
}

const editPackage = (package_: any) => {
  editingPackage.value = package_
  showAddModal.value = true
}

const confirmDelete = async (package_: any) => {
  try {
    await deletePackage(package_.id)
  } catch (error) {
    console.error('Error deleting package:', error)
  }
}

const handlePackageSaved = async (packageData: any) => {
  try {
    if (editingPackage.value) {
      await updatePackage(editingPackage.value.id, packageData)
      editingPackage.value = null
    } else {
      await addPackage(packageData)
    }
  } catch (error) {
    console.error('Error saving package:', error)
  }
}
</script> 