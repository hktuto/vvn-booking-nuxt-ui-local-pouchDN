<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('student.students') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your students and their information
          </p>
        </div>
        <UButton 
          @click="addNewStudent"
          icon="i-heroicons-plus"
          size="sm"
        >
          {{ $t('student.addStudent') }}
        </UButton>
      </div>
    </template>

    <div class="p-6">

    <!-- Search Bar -->
    <div class="mb-6">
      <UFormField name="search" :label="$t('common.search')">
        <UInput
          v-model="searchQuery"
          :placeholder="$t('student.searchPlaceholder')"
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Students Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <StudentCard
        v-for="student in filteredStudents"
        :key="student.id"
        :student="student"
        @edit="editStudent"
        @delete="confirmDelete"
        @addPackage="addPackageToStudent"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredStudents.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-users" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ searchQuery ? $t('student.noSearchResults') : $t('student.noStudents') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ searchQuery ? $t('student.tryDifferentSearch') : $t('student.getStartedMessage') }}
      </p>
      <UButton v-if="!searchQuery" @click="addNewStudent" icon="i-heroicons-plus">
        {{ $t('student.addStudent') }}
      </UButton>
    </div>

    <!-- Student Form Modal -->
    <StudentForm
      v-model="showAddModal"
      :student="editingStudent"
      @saved="handleStudentSaved"
    />

    <!-- Add Package to Student Modal -->
    <AddPackageToStudent
      v-model="showAddPackageModal"
      :student="selectedStudent"
      @saved="handlePackageAdded"
    />
  </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { StudentForm } from '~/composables/useTranslatedValidation'

const { students, addStudent, updateStudent, deleteStudent, loadStudents } = useStudents()
const { t } = useI18n()

const showAddModal = ref(false)
const editingStudent = ref<any>(null)
const searchQuery = ref('')
const showAddPackageModal = ref(false)
const selectedStudent = ref<any>(null)

// Computed property for filtered students
const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) {
    return students.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return students.value.filter(student => 
    student.name.toLowerCase().includes(query) ||
    student.phone.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query) ||
    student.address.toLowerCase().includes(query) ||
    student.notes.toLowerCase().includes(query)
  )
})

definePageMeta({
  middleware: 'auth'
})



const addNewStudent = () => {
  editingStudent.value = null
  showAddModal.value = true
}

const editStudent = (student: any) => {
  editingStudent.value = student
  showAddModal.value = true
}

const handleStudentSaved = async (studentData: any) => {
  try {
    if (editingStudent.value) {
      // Update existing student
      await updateStudent(editingStudent.value.id, studentData)
      editingStudent.value = null
    } else {
      // Add new student
      const studentWithHash = {
        ...studentData,
        password_hash: '' // Empty for now, can be set later if needed
      }
      await addStudent(studentWithHash)
    }
  } catch (error) {
    console.error('Error saving student:', error)
  }
}

const confirmDelete = async (student: any) => {
  try {
    await deleteStudent(student.id)
  } catch (error) {
    console.error('Error deleting student:', error)
  }
}

const addPackageToStudent = (student: any) => {
  selectedStudent.value = student
  showAddPackageModal.value = true
}

const handlePackageAdded = async (studentPackage: any) => {
  try {
    // Refresh the students list to show updated credits
    await loadStudents()
  } catch (error) {
    console.error('Error refreshing students:', error)
  }
}
</script>