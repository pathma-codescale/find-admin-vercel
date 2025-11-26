<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSeekerStore } from '@/store/seeker/useSeekerStore'
import { storeToRefs } from 'pinia'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import CandidatesTable from '@/components/CandidatesTable.vue'
import CandidateFilterModal from '@/components/CandidateFilter.vue'
import SweetAlert from '@/utils/sweetAlert'

const router = useRouter()
const { t } = useI18n()

const seekerStore = useSeekerStore()
const { candidates, loading, pagination, currentPage } = storeToRefs(seekerStore)

const isLoading = loading
const email = ref('')
const showFilters = ref(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

type CandidateStatus = 'active' | 'suspended' | 'flagged' | 'all' | 'hidden'

const filters = ref<{
  sortBy: string
  status: CandidateStatus[]
  dateRange: {
    startDate: string
    endDate: string
  }
}>({
  sortBy: 'newest',
  status: [],
  dateRange: {
    startDate: '',
    endDate: '',
  },
})

const mappedCandidates = computed(() => {
  return candidates.value.map((candidate) => ({
    ...candidate,
    isBanned: candidate.status === 'SUSPENDED',
  }))
})

watch(email, async (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!newValue || newValue.length < 2) {
    if (!newValue) {
      if (hasActiveFilters.value) {
        await applyFiltersToApi(filters.value)
      } else {
        await seekerStore.fetchAllCandidates({ limit: 10, page: 1 })
      }
    }
    return
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      await applyFiltersToApi({
        ...filters.value,
        email: newValue,
      })
    } catch (error) {
      console.error('Error searching candidates:', error)
    }
  }, 300)
})

const convertFiltersForApi = (filterOptions: any) => {
  const apiFilters: Record<string, any> = {}

  if (filterOptions.sortBy && filterOptions.sortBy !== 'newest') {
    const sortConfig = mapSortBy(filterOptions.sortBy)
    apiFilters.sortBy = sortConfig.sortBy
    apiFilters.sortOrder = sortConfig.sortOrder
  }

  if (
    filterOptions.status &&
    filterOptions.status.length > 0 &&
    !filterOptions.status.includes('all')
  ) {
    apiFilters.status = filterOptions.status.map(toTitleCase).join(',')
  }
  if (filterOptions.dateRange?.startDate) {
    apiFilters.dateJoinedFrom = formatDateToISO(filterOptions.dateRange.startDate)
  }
  if (filterOptions.dateRange?.endDate) {
    apiFilters.dateJoinedTo = formatDateToISO(filterOptions.dateRange.endDate)
  }

  if (filterOptions.email) {
    apiFilters.email = filterOptions.email
  }

  return apiFilters
}

const applyFiltersToApi = async (filterOptions: any) => {
  try {
    const apiFilters = convertFiltersForApi(filterOptions)
    apiFilters.limit = 10

    seekerStore.resetPagination()
    seekerStore.isFiltering = true
    seekerStore.activeFilters = apiFilters

    await seekerStore.filterCandidates(apiFilters)

    console.log('Filters applied:', apiFilters)
  } catch (error) {
    console.error('Error applying filters:', error)
    SweetAlert.error(t('common.error'), 'Failed to apply filters. Please try again.')
  }
}

const applyFilters = async (newFilters: any) => {
  filters.value = { ...newFilters }
  showFilters.value = false

  await applyFiltersToApi({
    ...newFilters,
    email: email.value || undefined,
  })
}

const clearSearch = async () => {
  email.value = ''

  if (hasActiveFilters.value) {
    await applyFiltersToApi(filters.value)
  } else {
    await seekerStore.fetchAllCandidates({ limit: 10, page: 1 })
  }
}

const clearAllFilters = async () => {
  filters.value = {
    sortBy: 'newest',
    status: [],
    dateRange: {
      startDate: '',
      endDate: '',
    },
  }

  email.value = ''

  seekerStore.resetPagination()

  await seekerStore.fetchAllCandidates({ limit: 10, page: 1 })
}

const hasActiveFilters = computed(() => {
  return (
    filters.value.status.length > 0 ||
    filters.value.dateRange.startDate ||
    filters.value.dateRange.endDate ||
    filters.value.sortBy !== 'newest'
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status.length > 0) count += filters.value.status.length
  if (filters.value.dateRange.startDate || filters.value.dateRange.endDate) count += 1
  if (filters.value.sortBy !== 'newest') count += 1
  return count
})

// Format date to ISO string
const formatDateToISO = (dateStr: string) => {
  if (!dateStr) return ''

  try {
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1
      const day = parseInt(parts[1])
      const year = parseInt(parts[2])

      const date = new Date(year, month, day)
      return date.toISOString()
    }
    return ''
  } catch (e) {
    return ''
  }
}

const toTitleCase = (str: string) => str.toUpperCase()
const mapSortBy = (sortBy: string) => {
  switch (sortBy) {
    case 'newest':
      return { sortBy: 'createdAt', sortOrder: 'desc' }
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' }
    case 'name-asc':
      return { sortBy: 'firstName', sortOrder: 'asc' }
    case 'name-desc':
      return { sortBy: 'firstName', sortOrder: 'desc' }
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' }
  }
}

const handlePageChange = async (page: number) => {
  const currentPageValue = currentPage.value

  if (page > currentPageValue) {
    await seekerStore.loadNextPage()
  } else if (page < currentPageValue) {
    await seekerStore.loadPreviousPage()
  }
}

const resetFilters = () => {
  filters.value = {
    sortBy: 'newest',
    status: [],
    dateRange: {
      startDate: '',
      endDate: '',
    },
  }
}

const removeStatusFilter = async (status: string) => {
  filters.value.status = filters.value.status.filter((s) => s !== status)

  seekerStore.resetPagination()

  await applyFiltersToApi(filters.value)
}

const removeDateFilter = async () => {
  filters.value.dateRange = { startDate: '', endDate: '' }

  seekerStore.resetPagination()

  await applyFiltersToApi(filters.value)
}

const formatDateRange = (startDate: string, endDate: string) => {
  const formatDate = (date: string) => {
    if (!date) return ''
    const parts = date.split('.')
    if (parts.length === 3) {
      return new Date(`${parts[0]}/${parts[1]}/${parts[2]}`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return date
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else if (startDate) {
    return `From ${formatDate(startDate)}`
  } else if (endDate) {
    return `Until ${formatDate(endDate)}`
  }
  return ''
}

const addNewCandidate = () => {
  router.push('/manage-users/createCandidate')
}

const handleBanCandidate = async (candidateId: string, isBanned: boolean) => {
  try {
    const isSuspending = isBanned

    const actionText = isSuspending ? 'Suspend' : 'Activate'
    const confirmText = isSuspending
      ? t('candidate.descriptions.suspendAccount')
      : t('candidate.actions.reactivateAccount')

    const result = await SweetAlert.confirm(
      `${actionText} Account`,
      confirmText,
      t('common.yes'),
      t('common.cancel'),
    )

    if (!result.isConfirmed) return

    if (!candidateId) {
      SweetAlert.error('Missing Data', 'Candidate ID is missing.')
      return
    }

    if (isSuspending) {
      await seekerStore.suspendCandidate(candidateId)
    } else {
      await seekerStore.activateCandidate(candidateId)
    }

    // Refresh candidates list
    if (hasActiveFilters.value) {
      await applyFiltersToApi(filters.value)
    } else {
      await seekerStore.fetchAllCandidates({ limit: 10, page: currentPage.value })
    }

    SweetAlert.success(
      t('common.success'),
      isSuspending ? t('alerts.success.accountSuspended') : t('alerts.success.accountReactivated'),
    )
  } catch (err) {
    console.error('Error toggling suspension:', err)
    SweetAlert.error(t('common.error'), t('enterprise.alerts.suspendFailed'))
  }
}

const handleViewCandidate = (candidateId: string | number) => {
  router.push({
    path: `/manage-users/candidates/${candidateId}/view`,
  })
}

const handleEditCandidate = (candidateId: string) => {
  router.push(`/manage-users/editCandidate/${candidateId}`)
}

const confirmDeleteCandidate = async (candidateId: string) => {
  const result = await SweetAlert.confirm(
    t('candidate.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete this candidate account. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
  )

  if (finalConfirm.isConfirmed) {
    await handleDeleteCandidate(candidateId)
  }
}

const handleDeleteCandidate = async (candidateId: string) => {
  if (!candidateId) {
    SweetAlert.error(t('common.error'), 'Candidate ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))

    await seekerStore.deleteCandidateById(candidateId)

    // Refresh candidates list
    if (hasActiveFilters.value) {
      await applyFiltersToApi(filters.value)
    } else {
      await seekerStore.fetchAllCandidates({ limit: 10, page: currentPage.value })
    }

    SweetAlert.success(t('common.success'), 'Account deleted successfully!')
  } catch (error: unknown) {
    SweetAlert.error(t('common.error'), 'Failed to delete account.')
  }
}

onMounted(async () => {
  // Make sure the store has a resetPagination method
  if (!seekerStore.resetPagination) {
    seekerStore.resetPagination = () => {
      seekerStore.pagination.lastEvaluatedKey = null
      seekerStore.pagination.hasMore = true
      seekerStore.pages = {}
      seekerStore.currentPage = 1
      seekerStore.isFiltering = false
      seekerStore.activeFilters = {}
    }
  }

  await seekerStore.fetchAllCandidates({ limit: 10, page: 1 })
})
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div class="w-full mb-2">
        <DashboardHeader class="border-l border-r border-b border-borderPrimary" />
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Search and Actions Bar -->
        <div
          class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0"
        >
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              v-model="email"
              type="text"
              placeholder="Search for Candidates"
              class="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            />
            <div v-if="email" class="absolute inset-y-0 right-0 flex items-center">
              <button
                @click="clearSearch"
                class="pr-3 text-gray-400 hover:text-white"
                type="button"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <!-- Search loading indicator -->
            <div
              v-if="loading && email"
              class="absolute right-10 top-1/2 transform -translate-y-1/2"
            >
              <div
                class="w-4 h-4 border-2 border-gray-400 border-t-primary rounded-full animate-spin"
              ></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <button
              @click="showFilters = true"
              class="flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              :class="{ 'bg-primary border-primary': hasActiveFilters }"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                ></path>
              </svg>
              Filters
              <span
                v-if="activeFiltersCount > 0"
                class="ml-2 px-2 py-1 bg-white text-gray-800 rounded-full text-xs"
              >
                {{ activeFiltersCount }}
              </span>
            </button>
            <button
              @click="addNewCandidate"
              class="flex items-center px-4 py-2 bg-primary hover:bg-primaryDark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Add Candidate
            </button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-400">Active filters:</span>

          <!-- Status Filters -->
          <div
            v-for="status in filters.status"
            :key="status"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white capitalize">{{ status }}</span>
            <button @click="removeStatusFilter(status)" class="ml-2 text-gray-400 hover:text-white">
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Date Range Filter -->
          <div
            v-if="filters.dateRange.startDate || filters.dateRange.endDate"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white">
              {{ formatDateRange(filters.dateRange.startDate, filters.dateRange.endDate) }}
            </span>
            <button @click="removeDateFilter" class="ml-2 text-gray-400 hover:text-white">
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Clear All Filters -->
          <button @click="clearAllFilters" class="text-sm text-primary hover:text-primaryDark">
            Clear all
          </button>
        </div>

        <!-- Candidates Table -->
        <CandidatesTable
          :candidates="mappedCandidates"
          :loading="isLoading"
          :items-per-page="10"
          :total-count="candidates.length"
          :current-page="currentPage"
          :has-next-page="pagination.hasMore"
          @ban="handleBanCandidate"
          @view="handleViewCandidate"
          @edit="handleEditCandidate"
          @delete="confirmDeleteCandidate"
          @page-change="handlePageChange"
        />
      </div>

      <!-- Router View for nested routes -->
      <div class="p-4">
        <RouterView />
      </div>
    </div>

    <!-- Filter Modal -->
    <CandidateFilterModal
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </div>
</template>
