<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Database Cleanup Utility</h1>
    
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            ⚠️ Warning: This will permanently delete databases
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>This utility will permanently delete IndexedDB databases. This action cannot be undone. Make sure you have backed up any important data before proceeding.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Database List -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Current Databases</h2>
      <UButton @click="refreshDatabases" :loading="loading" class="mb-4">
        🔄 Refresh Database List
      </UButton>
      
      <div v-if="databases.length === 0" class="text-gray-500">
        No databases found
      </div>
      
      <div v-else class="space-y-2">
        <div v-for="(db, index) in databases" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <span class="font-medium">{{ db.name }}</span>
            <span class="text-sm text-gray-500 ml-2">(v{{ db.version }})</span>
          </div>
          <UButton 
            @click="deleteSingleDatabase(db.name)" 
            color="error" 
            variant="outline" 
            size="sm"
            :loading="deleting === db.name"
          >
            Delete
          </UButton>
        </div>
      </div>
    </div>

    <!-- Cleanup Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Cleanup All -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">🧹 Cleanup All Databases</h3>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          Delete all IndexedDB databases. This will remove all data from the application.
        </p>
        <UButton 
          @click="cleanupAll" 
          color="error" 
          :loading="loading"
          block
        >
          Delete All Databases
        </UButton>
      </UCard>

      <!-- Cleanup Old PouchDB -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">🗑️ Cleanup Old PouchDB</h3>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          Delete only the old PouchDB databases (users, students, packages, etc.).
        </p>
        <UButton 
          @click="cleanupOldPouchDB" 
          color="warning" 
          :loading="loading"
          block
        >
          Delete Old PouchDB
        </UButton>
      </UCard>

      <!-- Cleanup User Specific -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">👤 Cleanup User Databases</h3>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          Delete user-specific databases (format: userId_database).
        </p>
        <div class="space-y-3">
          <UInput 
            v-model="userId" 
            placeholder="Enter user ID (optional)"
            class="mb-3"
          />
          <UButton 
            @click="cleanupUserSpecific" 
            color="primary" 
            :loading="loading"
            block
          >
            Delete User Databases
          </UButton>
        </div>
      </UCard>

      <!-- Cleanup Specific -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">🎯 Cleanup Specific</h3>
        </template>
        <p class="text-sm text-gray-600 mb-4">
          Delete databases containing specific names.
        </p>
        <div class="space-y-3">
          <UInput 
            v-model="specificNames" 
            placeholder="Enter database names (comma separated)"
            class="mb-3"
          />
          <UButton 
            @click="cleanupSpecific" 
            color="primary" 
            :loading="loading"
            block
          >
            Delete Specific
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Results -->
    <div v-if="result" class="mt-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">📊 Cleanup Results</h3>
        </template>
        <div class="space-y-2">
          <div class="flex items-center">
            <span class="font-medium">Status:</span>
            <UBadge 
              :color="result.success ? 'primary' : 'error'" 
              class="ml-2"
            >
              {{ result.success ? 'Success' : 'Failed' }}
            </UBadge>
          </div>
          <div>
            <span class="font-medium">Deleted:</span>
            <span class="ml-2">{{ result.deletedCount }} databases</span>
          </div>
          <div v-if="result.errors && result.errors.length > 0">
            <span class="font-medium text-red-600">Errors:</span>
            <ul class="mt-1 ml-4 text-sm text-red-600">
              <li v-for="(error, index) in result.errors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false // Allow access without authentication for cleanup
})

const loading = ref(false)
const deleting = ref<string | null>(null)
const databases = ref<any[]>([])
const result = ref<any>(null)
const userId = ref('')
const specificNames = ref('')

// Import cleanup utilities
const { 
  cleanupOldDatabases, 
  cleanupSpecificDatabases, 
  cleanupOldPouchDBDatabases, 
  cleanupUserSpecificDatabases, 
  listAllDatabases 
} = await import('~/utils/cleanupOldDatabases')

// Refresh database list
const refreshDatabases = async () => {
  loading.value = true
  try {
    databases.value = await listAllDatabases()
  } catch (error) {
    console.error('Failed to refresh databases:', error)
  } finally {
    loading.value = false
  }
}

// Delete single database
const deleteSingleDatabase = async (dbName: string) => {
  deleting.value = dbName
  try {
    const result = await cleanupSpecificDatabases([dbName])
    if (result.success) {
      await refreshDatabases()
    }
  } catch (error) {
    console.error('Failed to delete database:', error)
  } finally {
    deleting.value = null
  }
}

// Cleanup all databases
const cleanupAll = async () => {
  if (!confirm('Are you sure you want to delete ALL databases? This action cannot be undone.')) {
    return
  }
  
  loading.value = true
  try {
    result.value = await cleanupOldDatabases()
    // Note: User will be logged out and redirected automatically
    // No need to refresh databases as user will be redirected
  } catch (error) {
    console.error('Failed to cleanup all databases:', error)
    loading.value = false
  }
}

// Cleanup old PouchDB databases
const cleanupOldPouchDB = async () => {
  if (!confirm('Are you sure you want to delete old PouchDB databases?')) {
    return
  }
  
  loading.value = true
  try {
    result.value = await cleanupOldPouchDBDatabases()
    // Note: User will be logged out and redirected automatically
    // No need to refresh databases as user will be redirected
  } catch (error) {
    console.error('Failed to cleanup old PouchDB databases:', error)
    loading.value = false
  }
}

// Cleanup user-specific databases
const cleanupUserSpecific = async () => {
  const message = userId.value 
    ? `Are you sure you want to delete databases for user "${userId.value}"?`
    : 'Are you sure you want to delete ALL user-specific databases?'
    
  if (!confirm(message)) {
    return
  }
  
  loading.value = true
  try {
    result.value = await cleanupUserSpecificDatabases(userId.value || undefined)
    // Note: User will be logged out and redirected automatically
    // No need to refresh databases as user will be redirected
  } catch (error) {
    console.error('Failed to cleanup user-specific databases:', error)
    loading.value = false
  }
}

// Cleanup specific databases
const cleanupSpecific = async () => {
  if (!specificNames.value.trim()) {
    alert('Please enter database names to delete')
    return
  }
  
  const names = specificNames.value.split(',').map(name => name.trim()).filter(name => name)
  
  if (!confirm(`Are you sure you want to delete databases containing: ${names.join(', ')}?`)) {
    return
  }
  
  loading.value = true
  try {
    result.value = await cleanupSpecificDatabases(names)
    // Note: User will be logged out and redirected automatically
    // No need to refresh databases as user will be redirected
  } catch (error) {
    console.error('Failed to cleanup specific databases:', error)
    loading.value = false
  }
}

// Load databases on page load
onMounted(() => {
  refreshDatabases()
})
</script> 