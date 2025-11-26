<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { SweetAlert } from '@/utils/sweetAlert'
import { useJobStore } from '@/store/job/useJobStore'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import JobsTable from '@/components/JobsTable.vue'
import JobsFilter from '@/components/JobsFilter.vue'

const { t } = useI18n()
const router = useRouter()
const jobStore = useJobStore()
const { jobs, pagination, totalCount, currentPage, loading } = storeToRefs(jobStore)

interface JobData {
  id: string
  jobTitle: string
  company: string
  location: {
    locationName: string
  }
  datePosted: string | Date
  contractTypes: string[]
  status: 'active' | 'suspended' | 'hidden'
  isBanned?: boolean
  isViewed?: boolean
  image?: string
}

interface FilterOptions {
  sortBy: string
  status: string[]
  startDate: string
  endDate: string
  contractTypes: string[]
}

// Reactive data
const searchQuery = ref('')
const showFilters = ref(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const filters = ref<FilterOptions>({
  sortBy: 'datePosted-desc',
  status: [],
  startDate: '',
  endDate: '',
  contractTypes: [],
})

const transformedJobs = computed((): JobData[] => {
  return jobs.value.map((job): JobData => {
    let status: 'active' | 'suspended' | 'hidden' = 'active'

    if (job.status === 'SUSPENDED') {
      status = 'suspended'
    } else if (job.status === 'VISIBLE') {
      status = 'active'
    } else if (job.status === 'HIDDEN') {
      status = 'hidden'
    }

    return {
      id: job.jobId,
      jobTitle: job.jobTitle,
      company: job.companyName,
      location: {
        locationName: job.location?.locationName || 'N/A',
      },
      datePosted: job.createdAt,
      contractTypes: job.contract || [],
      status,
      isBanned: job.status === 'SUSPENDED',
      isViewed: false,
      image: job.companyLogo || undefined,
    }
  })
})

// Computed properties
const filteredJobs = computed(() => {
  return transformedJobs.value
})

const hasActiveFilters = computed(() => {
  return (
    filters.value.status.length > 0 ||
    filters.value.contractTypes.length > 0 ||
    filters.value.startDate ||
    filters.value.endDate ||
    filters.value.sortBy !== 'datePosted-desc'
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status.length > 0) count += filters.value.status.length
  if (filters.value.contractTypes.length > 0) count += filters.value.contractTypes.length
  if (filters.value.startDate || filters.value.endDate) count += 1
  if (filters.value.sortBy !== 'datePosted-desc') count += 1
  return count
})

// Watch for search query changes with debounce
watch(searchQuery, async (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!newValue || newValue.length < 2) {
    if (!newValue) {
      if (hasActiveFilters.value) {
        await applyFiltersToApi(filters.value)
      } else {
        await jobStore.getAllJobs({ page: 1 })
      }
    }
    return
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      await applyFiltersToApi({
        ...filters.value,
        jobTitle: newValue,
      })
    } catch (error) {
      console.error('Error searching jobs:', error)
    }
  }, 300)
})

// Helper function to convert filter format
const convertFiltersForApi = (filterOptions: FilterOptions & { jobTitle?: string }) => {
  const apiFilters: any = {}

  // Convert status
  if (filterOptions.status.length > 0) {
    apiFilters.status = filterOptions.status.map((s) => s.toUpperCase())
  }

  // Convert contract types
  if (filterOptions.contractTypes.length > 0) {
    apiFilters.contract = filterOptions.contractTypes
  }

  // Add date range - dates should already be in ISO format from the filter component
  if (filterOptions.startDate) {
    apiFilters.startDate = filterOptions.startDate
  }
  if (filterOptions.endDate) {
    apiFilters.endDate = filterOptions.endDate
  }

  // Convert sortBy format
  const sortMapping: Record<string, string> = {
    'datePosted-desc': 'datePosted-newest',
    'datePosted-asc': 'datePosted-oldest',
    'title-asc': 'jobTitle-asc',
    'title-desc': 'jobTitle-desc',
  }
  apiFilters.sortBy = sortMapping[filterOptions.sortBy] || 'datePosted-newest'

  // Add search query if exists
  if (filterOptions.jobTitle) {
    apiFilters.jobTitle = filterOptions.jobTitle
  }

  return apiFilters
}

// Build filter parameters for pagination
const buildFilterParams = () => {
  const params: Record<string, any> = {}

  if (filters.value.sortBy !== 'datePosted-desc') {
    const sortMapping: Record<string, string> = {
      'datePosted-desc': 'datePosted-newest',
      'datePosted-asc': 'datePosted-oldest',
      'title-asc': 'jobTitle-asc',
      'title-desc': 'jobTitle-desc',
    }
    params.sortBy = sortMapping[filters.value.sortBy] || 'datePosted-newest'
  }

  if (filters.value.status.length > 0) {
    params.status = filters.value.status.map((s) => s.toUpperCase())
  }

  if (filters.value.contractTypes.length > 0) {
    params.contract = filters.value.contractTypes
  }

  if (filters.value.startDate) {
    params.startDate = filters.value.startDate
  }

  if (filters.value.endDate) {
    params.endDate = filters.value.endDate
  }

  if (searchQuery.value) {
    params.jobTitle = searchQuery.value
  }

  return params
}

// Apply filters to API
const applyFiltersToApi = async (filterOptions: FilterOptions & { jobTitle?: string }) => {
  try {
    const apiFilters = convertFiltersForApi(filterOptions)

    // Reset pagination when applying new filters
    jobStore.resetPagination()

    await jobStore.filterJobs(apiFilters)
    console.log('Filters applied:', apiFilters)
  } catch (error) {
    console.error('Error applying filters:', error)
    SweetAlert.error(t('common.error'), 'Failed to apply filters. Please try again.')
  }
}

// Clear search method
const clearSearch = async () => {
  searchQuery.value = ''

  if (hasActiveFilters.value) {
    await applyFiltersToApi(filters.value)
  } else {
    await jobStore.getAllJobs({ page: 1 })
  }
}

// Methods
const addNewJob = () => {
  router.push('/manage-jobs/create')
}

const applyFilters = async (newFilters: FilterOptions) => {
  filters.value = { ...newFilters }
  showFilters.value = false

  // Reset pagination when applying new filters
  jobStore.resetPagination()

  // Apply filters to API with search query if it exists
  await applyFiltersToApi({
    ...newFilters,
    jobTitle: searchQuery.value || undefined,
  })
}

const resetFilters = async () => {
  filters.value = {
    sortBy: 'datePosted-desc',
    status: [],
    startDate: '',
    endDate: '',
    contractTypes: [],
  }
  searchQuery.value = ''

  // Reset pagination
  jobStore.resetPagination()

  // Load all jobs without filters
  await jobStore.getAllJobs({ page: 1 })
}

const clearAllFilters = async () => {
  await resetFilters()
}

const removeStatusFilter = async (status: string) => {
  filters.value.status = filters.value.status.filter((s) => s !== status)

  // Reset pagination
  jobStore.resetPagination()

  await applyFiltersToApi({
    ...filters.value,
    jobTitle: searchQuery.value || undefined,
  })
}

const removeContractTypeFilter = async (type: string) => {
  filters.value.contractTypes = filters.value.contractTypes.filter((t) => t !== type)

  // Reset pagination
  jobStore.resetPagination()

  await applyFiltersToApi({
    ...filters.value,
    jobTitle: searchQuery.value || undefined,
  })
}

const removeDateFilter = async () => {
  filters.value.startDate = ''
  filters.value.endDate = ''

  // Reset pagination
  jobStore.resetPagination()

  await applyFiltersToApi({
    ...filters.value,
    jobTitle: searchQuery.value || undefined,
  })
}

const formatDateRange = (startDate: string, endDate: string) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (e) {
      return dateStr
    }
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

const handleBanJob = async (email: string, jobId: string, isBanned: boolean) => {
  try {
    if (!isBanned) {
      await jobStore.EnableJob(jobId)
    } else {
      await jobStore.DisableJob(jobId)
    }

    if (hasActiveFilters.value || searchQuery.value) {
      await applyFiltersToApi({
        ...filters.value,
        jobTitle: searchQuery.value || undefined,
      })
    } else {
      await jobStore.getAllJobs({ page: currentPage.value })
    }

    SweetAlert.success(
      t('common.success'),
      isBanned ? 'Job suspended successfully!' : 'Job reactivated successfully!',
    )
  } catch (error) {
    console.error('Error updating job status:', error)
    SweetAlert.error(t('common.error'), 'Failed to update job status. Please try again.')
  }
}

const handleViewJob = async (jobId: string | number) => {
  router.push({ name: 'viewJob', params: { id: jobId } })
}

const handleEditJob = async (jobId: string) => {
  router.push(`/manage-jobs/edit-job/${jobId}`)
}

const handleDeleteJob = async (jobId: string) => {
  const result = await SweetAlert.confirm(
    'Delete Job?',
    'Are you sure you want to delete this job? This action cannot be undone.',
    'Yes, Delete',
    'Cancel',
  )

  if (result.isConfirmed) {
    try {
      await jobStore.deleteJob(jobId)

      // Reload jobs with current filters and page
      if (hasActiveFilters.value || searchQuery.value) {
        await applyFiltersToApi({
          ...filters.value,
          jobTitle: searchQuery.value || undefined,
        })
      } else {
        await jobStore.getAllJobs({ page: currentPage.value })
      }

      SweetAlert.success(t('common.success'), 'Job deleted successfully!')
    } catch (error) {
      console.error('Error deleting job:', error)
      SweetAlert.error(t('common.error'), 'Failed to delete job. Please try again.')
    }
  }
}

// Handle page change
const handlePageChange = async (page: number) => {
  const currentPageValue = currentPage.value

  if (page > currentPageValue) {
    await jobStore.loadNextPage(buildFilterParams())
  } else if (page < currentPageValue) {
    await jobStore.loadPreviousPage()
  }
}

// Lifecycle
onMounted(async () => {
  await jobStore.getAllJobs({ page: 1 })
})
</script>

<template>
  <div class="flex min-h-screen text-white">
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
              v-model="searchQuery"
              type="text"
              placeholder="Search for Jobs"
              class="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            />
            <div v-if="searchQuery" class="absolute inset-y-0 right-0 flex items-center">
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
              v-if="loading && searchQuery"
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
              @click="addNewJob"
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
              Add Job
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

          <!-- Contract Type Filters -->
          <div
            v-for="type in filters.contractTypes"
            :key="type"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white capitalize">{{ type.replace('-', ' ') }}</span>
            <button
              @click="removeContractTypeFilter(type)"
              class="ml-2 text-gray-400 hover:text-white"
            >
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
            v-if="filters.startDate || filters.endDate"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white">
              {{ formatDateRange(filters.startDate, filters.endDate) }}
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

        <!-- Jobs Table -->
        <JobsTable
          :jobs="filteredJobs"
          :loading="loading"
          :items-per-page="10"
          :total-count="totalCount"
          :current-page="currentPage"
          :has-next-page="pagination.hasMore"
          @ban="handleBanJob"
          @view="handleViewJob"
          @edit="handleEditJob"
          @delete="handleDeleteJob"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Filter Component -->
    <JobsFilter
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </div>
</template>
