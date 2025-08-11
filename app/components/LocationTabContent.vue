<template>
  <div class="space-y-6">
    <!-- Search and Add Button -->
    <div class="flex flex-row sm:flex-row gap-4 justify-between items-start sm:items-center w-full">
      <div class="flex-1 max-w-md">
        <UInput
          v-model="searchQuery"
          :placeholder="t('location.searchPlaceholder')"
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </div>
      <UButton @click="addNewLocation" color="primary" icon="i-heroicons-plus">
        {{ t('location.addLocation') }}
      </UButton>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-500" />
    </div>

    <UAlert 
      v-else-if="error" 
      color="error" 
      variant="soft" 
      :title="t('common.error')" 
      :description="error" 
      icon="i-heroicons-exclamation-triangle" 
    />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <LocationCard 
        v-for="location in filteredLocations" 
        :key="location.id" 
        :location="location" 
        @edit="editLocation" 
        @delete="confirmDelete" 
      />
    </div>

    <div v-if="filteredLocations.length === 0 && !loading" class="text-center py-12">
      <UIcon name="i-heroicons-map-pin" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('location.noLocations') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ t('location.getStartedMessage') }}
      </p>
      <UButton @click="addNewLocation" color="primary">
        {{ t('location.addFirstLocation') }}
      </UButton>
    </div>

    <LocationForm 
      v-model="showAddModal" 
      :location="editingLocation" 
      @saved="handleLocationSaved" 
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { locations, loading, error, loadLocations, addLocation, updateLocation, deleteLocation } = useLocations()

// Reactive state
const searchQuery = ref('')
const showAddModal = ref(false)
const editingLocation = ref<any>(null)

// Computed properties
const filteredLocations = computed(() => {
  if (!searchQuery.value.trim()) {
    return locations.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return locations.value.filter(location =>
    location.name.toLowerCase().includes(query) ||
    location.address.toLowerCase().includes(query) ||
    location.phone.toLowerCase().includes(query) ||
    location.email.toLowerCase().includes(query)
  )
})

// Methods
const addNewLocation = () => {
  editingLocation.value = null
  showAddModal.value = true
}

const editLocation = (location: any) => {
  console.log('editLocation', location)
  editingLocation.value = location
  showAddModal.value = true
}

const confirmDelete = async (location: any) => {
  try {
    await deleteLocation(location.id)
  } catch (err) {
    console.error('Error deleting location:', err)
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

// Load locations on mount
onMounted(() => {
  loadLocations()
})

defineExpose({
  openAddLocationModal: addNewLocation
})

</script> 