<template>
  <div class="space-y-6">
    <!-- Search and Add Button -->
    <div class="flex flex-row sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          :placeholder="t('class.searchPlaceholder')"
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </div>
      <UButton @click="addNewClass" color="primary" icon="i-heroicons-plus">
        {{ t('class.addClass') }}
      </UButton>
    </div>

    <!-- Tag Filter -->
    <div v-if="availableTags.length > 0">
      <UFormField name="tagFilter" :label="t('class.filterByTags')">
        <div class="flex flex-wrap gap-2">
          <UButton 
            v-for="tag in availableTags" 
            :key="tag" 
            :variant="selectedTags.includes(tag) ? 'solid' : 'soft'" 
            :color="selectedTags.includes(tag) ? 'primary' : 'neutral'" 
            size="sm" 
            @click="toggleTag(tag)"
          >
            {{ tag }} 
            <UIcon v-if="selectedTags.includes(tag)" name="i-heroicons-check" />
          </UButton>
        </div>
      </UFormField>
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
      <ClassCard 
        v-for="class_ in filteredClasses" 
        :key="class_.id" 
        :class_="class_" 
        @view="viewClass"
        @edit="editClass" 
        @delete="confirmDelete" 
      />
    </div>

    <div v-if="filteredClasses.length === 0 && !loading" class="text-center py-12">
      <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('class.noClasses') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ t('class.getStartedMessage') }}
      </p>
      <UButton @click="addNewClass" color="primary">
        {{ t('class.addFirstClass') }}
      </UButton>
    </div>

    <ClassForm 
      v-model="showAddModal" 
      :class_="editingClass" 
      @saved="handleClassSaved" 
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { classes, loading, error, loadClasses, deleteClass, getAllTags, updateClass, addClass } = useClasses()

// Reactive state
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const showAddModal = ref(false)
const editingClass = ref<any>(null)

// Computed properties
const availableTags = computed(() => {
  const allTags = getAllTags()
  return allTags
})


const filteredClasses = computed(() => {
  let filtered = [...classes.value]

  // Apply tag filter
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(class_ => 
      selectedTags.value.some(tag => class_.tags.includes(tag))
    )
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(class_ =>
      class_.name.toLowerCase().includes(query) ||
      class_.description.toLowerCase().includes(query) ||
      class_.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Methods
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const addNewClass = () => {
  editingClass.value = null
  showAddModal.value = true
}

const editClass = (class_: any) => {
  editingClass.value = class_
  showAddModal.value = true
}

const viewClass = (class_: any) => {
  // Navigate to class detail page
  navigateTo(`/classes/${class_.id}`)
}

const confirmDelete = async (class_: any) => {
  try {
    await deleteClass(class_.id)
  } catch (err) {
    console.error('Error deleting class:', err)
  }
}

const handleClassSaved = async (classData: any) => {
  try {
    console.log('handleClassSaved called with:', classData)
    console.log('editingClass.value:', editingClass.value)
    
    if (editingClass.value) {
      // Editing existing class
      console.log('Updating existing class:', editingClass.value.id)
      await updateClass(editingClass.value.id, classData)
    } else {
      // Creating new class
      console.log('Creating new class')
      const newClass = await addClass(classData)
      console.log('New class created:', newClass)
    }
  } catch (err) {
    console.error('Error saving class:', err)
  }
}

// Load classes on mount
onMounted(() => {
  loadClasses()
})
</script> 