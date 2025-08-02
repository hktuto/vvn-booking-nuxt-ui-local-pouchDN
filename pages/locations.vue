<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('location.locations') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ t('location.manageLocations') }}
          </p>
        </div>
        <UButton
          @click="addNewLocation"
          icon="i-heroicons-plus"
          size="sm"
        >
          {{ t('location.addLocation') }}
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Search Bar -->
      <div class="mb-6">
        <UFormField name="search" :label="t('common.search')">
          <UInput
            v-model="searchQuery"
            :placeholder="t('location.searchPlaceholder')"
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
        :title="t('common.error')"
        :description="error"
        icon="i-heroicons-exclamation-triangle"
      />

      <!-- Locations Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LocationCard
          v-for="location in filteredLocations"
          :key="location.id"
          :location="location"
          @edit="editLocation"
          @delete="confirmDelete"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredLocations.length === 0"
        class="text-center py-12"
      >
        <UIcon name="i-heroicons-map-pin" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ searchQuery ? t('location.noSearchResults') : t('location.noLocations') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ searchQuery ? t('location.tryDifferentSearch') : t('location.noLocationsDescription') }}
        </p>
        <UButton
          v-if="!searchQuery"
          @click="addNewLocation"
          icon="i-heroicons-plus"
          color="primary"
        >
          {{ t('location.addFirstLocation') }}
        </UButton>
      </div>

      <!-- Location Form Modal -->
      <LocationForm
        v-model="showAddModal"
        :location="editingLocation"
        @saved="handleLocationSaved"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LocationForm } from '~/composables/useLocationValidation'

definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()
const { locations, loading, error, addLocation, updateLocation, deleteLocation, loadLocations } = useLocations()

// Load locations on page mount
onMounted(() => {
  loadLocations()
})

const showAddModal = ref(false)
const editingLocation = ref<any>(null)
const searchQuery = ref('')

// Computed property for filtered locations
const filteredLocations = computed(() => {
  if (!searchQuery.value.trim()) {
    return locations.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return locations.value.filter(location => 
    location.name.toLowerCase().includes(query) ||
    location.address.toLowerCase().includes(query) ||
    location.phone.toLowerCase().includes(query) ||
    (location.email && location.email.toLowerCase().includes(query)) ||
    (location.website && location.website.toLowerCase().includes(query))
  )
})

const addNewLocation = () => {
  editingLocation.value = null
  showAddModal.value = true
}

const editLocation = (location: any) => {
  editingLocation.value = location
  showAddModal.value = true
}

const confirmDelete = async (location: any) => {
  try {
    await deleteLocation(location.id)
  } catch (error) {
    console.error('Error deleting location:', error)
  }
}

const handleLocationSaved = async (locationData: any) => {
  try {
    if (editingLocation.value) {
      await updateLocation(editingLocation.value.id, locationData)
      editingLocation.value = null
    } else {
      await addLocation(locationData)
    }
  } catch (error) {
    console.error('Error saving location:', error)
  }
}
</script> 