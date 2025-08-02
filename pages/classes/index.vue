<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('class.classes') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ t('class.manageClasses') }}</p>
        </div>
        <UButton @click="addNewClass" icon="i-heroicons-plus" size="sm">{{ t('class.addClass') }}</UButton>
      </div>
    </template>

    <div class="p-6">
      <div class="mb-6 space-y-4">
        <!-- Search Bar -->
        <UFormField name="search" :label="t('common.search')">
          <UInput 
            v-model="searchQuery" 
            :placeholder="t('class.searchPlaceholder')" 
            icon="i-heroicons-magnifying-glass" 
            class="w-full" 
          />
        </UFormField>

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
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ClassForm } from '~/composables/useClassValidation'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { classes, loading, error, addClass, updateClass, deleteClass, loadClasses, getAllTags, filterClassesByTags } = useClasses()

const showAddModal = ref(false)
const editingClass = ref<any>(null)
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const selectedStatus = ref<string>('')
const selectedScheduleType = ref<string>('')

const sortBy = ref<string>('created_at_desc')

const availableTags = computed(() => getAllTags())


const filteredClasses = computed(() => {
  let filtered = [...classes.value]

  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(class_ => class_.status === selectedStatus.value)
  }

  // Apply schedule type filter
  if (selectedScheduleType.value) {
    filtered = filtered.filter(class_ => class_.schedule_type === selectedScheduleType.value)
  }



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

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_at_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'created_at_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'price_desc':
        return b.price - a.price

      default:
        return 0
    }
  })

  return filtered
})

const addNewClass = () => {
  editingClass.value = null
  showAddModal.value = true
}

const viewClass = (class_: any) => {
  // Navigate to class detail page (to be implemented)
  navigateTo(`/classes/${class_.id}`)
}

const editClass = (class_: any) => {
  editingClass.value = class_
  showAddModal.value = true
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
    if (editingClass.value) {
      await updateClass(editingClass.value.id, classData)
    } else {
      await addClass(classData)
    }
  } catch (err) {
    console.error('Error saving class:', err)
  }
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

onMounted(() => {
  loadClasses()
})
</script> 