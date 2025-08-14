<template>
  <UiPageContainer>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t('inviteCodes.title') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('inviteCodes.description') }}
          </p>
        </div>
        <UButton
          @click="generateInviteCodes"
          :loading="generating"
          icon="i-heroicons-plus"
        >
          {{ $t('inviteCodes.generateNew') }}
        </UButton>
      </div>
    </template>

    <UCard>
      <div class="space-y-4">
        <!-- Generate new codes section -->
        <div v-if="showGenerateForm" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 class="text-lg font-medium mb-3">{{ $t('inviteCodes.generateForm.title') }}</h3>
          <div class="flex gap-4 items-end">
            <UFormField
              name="count"
              :label="$t('inviteCodes.generateForm.count')"
            >
              <UInput
                v-model="generateForm.count"
                type="number"
                min="1"
                max="10"
                class="w-32"
              />
            </UFormField>
            <UButton
              @click="confirmGenerate"
              :loading="generating"
              color="primary"
            >
              {{ $t('inviteCodes.generateForm.generate') }}
            </UButton>
            <UButton
              @click="showGenerateForm = false"
              variant="ghost"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </div>
        </div>

        <!-- Invite codes list -->
        <div v-if="loading" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8" />
        </div>

        <div v-else-if="inviteCodes.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-ticket" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('inviteCodes.noCodes') }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ $t('inviteCodes.noCodesDescription') }}
          </p>
          <div class="mt-6">
            <UButton
              @click="showGenerateForm = true"
              icon="i-heroicons-plus"
            >
              {{ $t('inviteCodes.generateFirst') }}
            </UButton>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">{{ $t('inviteCodes.listTitle') }}</h3>
            <UButton
              @click="showGenerateForm = true"
              variant="ghost"
              size="sm"
              icon="i-heroicons-plus"
            >
              {{ $t('inviteCodes.addMore') }}
            </UButton>
          </div>

          <UTable
            :rows="inviteCodes"
            :columns="columns"
            :loading="loading"
          >
            <template #status-data="{ row }">
              <UBadge
                :color="row.status === 'active' ? 'green' : 'gray'"
                variant="subtle"
              >
                {{ $t(`inviteCodes.status.${row.status}`) }}
              </UBadge>
            </template>

            <template #created_at-data="{ row }">
              {{ formatDate(row.created_at) }}
            </template>

            <template #used_at-data="{ row }">
              {{ row.used_at ? formatDate(row.used_at) : '-' }}
            </template>

            <template #actions-data="{ row }">
              <UButton
                v-if="row.status === 'active'"
                @click="copyCode(row.code)"
                variant="ghost"
                size="sm"
                icon="i-heroicons-clipboard"
                :title="$t('inviteCodes.copyCode')"
              />
            </template>
          </UTable>
        </div>
      </div>
    </UCard>
  </UiPageContainer>
</template>

<script setup lang="ts">
// Use default layout and require auth
definePageMeta({
  auth: true
})

const { t } = useI18n()

const loading = ref(false)
const generating = ref(false)
const showGenerateForm = ref(false)
const inviteCodes = ref<any[]>([])

const generateForm = reactive({
  count: 1
})

const columns = [
  {
    key: 'code',
    label: t('inviteCodes.columns.code')
  },
  {
    key: 'status',
    label: t('inviteCodes.columns.status')
  },
  {
    key: 'created_at',
    label: t('inviteCodes.columns.createdAt')
  },
  {
    key: 'used_at',
    label: t('inviteCodes.columns.usedAt')
  },
  {
    key: 'used_by',
    label: t('inviteCodes.columns.usedBy')
  },
  {
    key: 'actions',
    label: t('inviteCodes.columns.actions')
  }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const loadInviteCodes = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/invite-codes')
    inviteCodes.value = response.inviteCodes
  } catch (error) {
    console.error('Error loading invite codes:', error)
  } finally {
    loading.value = false
  }
}

const generateInviteCodes = () => {
  showGenerateForm.value = true
}

const confirmGenerate = async () => {
  generating.value = true
  try {
    const response = await $fetch('/api/auth/invite-codes', {
      method: 'POST',
      body: {
        count: generateForm.count,
        created_by: 'admin'
      }
    })
    
    // Reload the list
    await loadInviteCodes()
    
    // Reset form
    generateForm.count = 1
    showGenerateForm.value = false
    
    // Show success message
    const { toast } = useToast()
    toast.add({
      title: t('inviteCodes.generatedSuccess'),
      description: t('inviteCodes.generatedCount', { count: response.inviteCodes.length }),
      color: 'green'
    })
  } catch (error: any) {
    console.error('Error generating invite codes:', error)
    const { toast } = useToast()
    toast.add({
      title: t('inviteCodes.generationError'),
      description: error.message,
      color: 'red'
    })
  } finally {
    generating.value = false
  }
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    const { toast } = useToast()
    toast.add({
      title: t('inviteCodes.copied'),
      description: t('inviteCodes.copiedDescription'),
      color: 'green'
    })
  } catch (error) {
    console.error('Error copying code:', error)
  }
}

// Load invite codes on page mount
onMounted(() => {
  loadInviteCodes()
})
</script>
