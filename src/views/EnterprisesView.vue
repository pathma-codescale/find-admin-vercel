<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEnterpriseStore } from '@/store/enterprise/useEnterpriseStore'
import { storeToRefs } from 'pinia'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import EnterprisesTable from '@/components/EnterprisesTable.vue'
import EnterpriseFilterModal from '@/components/EnterpriseFilter.vue'
import SweetAlert from '@/utils/sweetAlert'

const enterpriseStore = useEnterpriseStore()
const { enterprises, loading, totalCount, currentPage, pagination } = storeToRefs(enterpriseStore)

const router = useRouter()
const { t } = useI18n()

interface EnterpriseData {
  enterpriseId: string
  email: string
  logo?: string
  brand_name?: string
  activeJobs?: number
  businessLocation: {
    locationName: string
  }
  businessSector: string[]
  subscription: 'subscribed' | 'expired' | 'trial'
  subscriptionStatus: string | ''
  isBanned?: boolean
  isViewed?: boolean
  dateJoined?: string
}

const isLoading = loading
const email = ref('')
const showFilters = ref(false)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const filters = ref({
  sortBy: 'newest',
  subscription: [] as string[],
  businessSector: [] as string[],
  dateRange: {
    startDate: '',
    endDate: '',
  },
  email: '',
})

const mappedEnterprises = computed<EnterpriseData[]>(() => {
  return enterprises.value.map((e) => ({
    enterpriseId: e.enterpriseId,
    email: e.email || '',
    logo: e.logo || '',
    brand_name: e.brand_name || '',
    activeJobs: e.jobsCount?.active || 0,
    businessLocation: {
      locationName: e.businessLocation?.locationName || '',
    },
    businessSector: e.businessSector || [],
    subscription: (e.subscriptionStatus as 'subscribed' | 'expired' | 'trial') || 'trial',
    subscriptionStatus: e.subscriptionStatus || '',
    dateJoined: e.created_at || '',
    isBanned: e.status === 'SUSPENDED',
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
        await enterpriseStore.getAllEnterprises({ page: 1 })
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
      console.error('Error searching enterprises:', error)
    }
  }, 300)
})

const convertFiltersForApi = (filterOptions: any) => {
  const apiFilters: Record<string, any> = {}

  if (filterOptions.sortBy && filterOptions.sortBy !== 'newest') {
    apiFilters.sortBy = filterOptions.sortBy
  }

  if (filterOptions.subscription && filterOptions.subscription.length > 0) {
    apiFilters.subscription = filterOptions.subscription[0]
  }

  if (filterOptions.businessSector && filterOptions.businessSector.length > 0) {
    apiFilters.businessSector = filterOptions.businessSector[0]
  }

  if (filterOptions.dateRange?.startDate) {
    apiFilters.dateFrom = convertDateToISO(filterOptions.dateRange.startDate)
  }
  if (filterOptions.dateRange?.endDate) {
    apiFilters.dateTo = convertDateToISO(filterOptions.dateRange.endDate)
  }

  if (filterOptions.email) {
    apiFilters.email = filterOptions.email
  }

  return apiFilters
}

// Apply filters to API
const applyFiltersToApi = async (filterOptions: any) => {
  try {
    const apiFilters = convertFiltersForApi(filterOptions)

    enterpriseStore.resetPagination()

    await enterpriseStore.filterEnterprises(apiFilters)

    console.log('Filters applied:', apiFilters)
  } catch (error) {
    console.error('Error applying filters:', error)
    SweetAlert.error(t('common.error'), 'Failed to apply filters. Please try again.')
  }
}

// Clear search method
const clearSearch = async () => {
  email.value = ''

  if (hasActiveFilters.value) {
    await applyFiltersToApi(filters.value)
  } else {
    await enterpriseStore.getAllEnterprises({ page: 1 })
  }
}

// Update filteredEnterprises to use data directly from store
const filteredEnterprises = computed(() => {
  return mappedEnterprises.value
})

// Computed properties for filter state
const hasActiveFilters = computed(() => {
  return (
    filters.value.subscription.length > 0 ||
    filters.value.businessSector.length > 0 ||
    filters.value.dateRange.startDate ||
    filters.value.dateRange.endDate ||
    filters.value.sortBy !== 'newest'
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.subscription.length > 0) count += filters.value.subscription.length
  if (filters.value.businessSector.length > 0) count += 1
  if (filters.value.dateRange.startDate || filters.value.dateRange.endDate) count += 1
  if (filters.value.sortBy !== 'newest') count += 1
  return count
})

// Format date to ISO string
const convertDateToISO = (dateStr: string) => {
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

// Build filter parameters
const buildFilterParams = () => {
  const params: Record<string, any> = {}

  if (filters.value.sortBy !== 'newest') {
    params.sortBy = filters.value.sortBy
  }

  if (filters.value.subscription.length > 0) {
    params.subscription = filters.value.subscription[0]
  }

  if (filters.value.businessSector.length > 0) {
    params.businessSector = filters.value.businessSector[0]
  }

  if (filters.value.dateRange.startDate) {
    params.dateFrom = convertDateToISO(filters.value.dateRange.startDate)
  }

  if (filters.value.dateRange.endDate) {
    params.dateTo = convertDateToISO(filters.value.dateRange.endDate)
  }

  return params
}

const handlePageChange = async (page: number) => {
  const currentPageValue = currentPage.value

  if (page > currentPageValue) {
    await enterpriseStore.loadNextPage(buildFilterParams())
  } else if (page < currentPageValue) {
    await enterpriseStore.loadPreviousPage()
  }
}

// Filter methods
const applyFilters = async (newFilters: any) => {
  filters.value = { ...newFilters }

  await applyFiltersToApi(newFilters)
  // enterpriseStore.resetPagination()

  // await enterpriseStore.getAllEnterprises({
  //   page: 1,
  //   ...buildFilterParams(),
  // })
}

const resetFilters = async () => {
  filters.value = {
    sortBy: 'newest',
    subscription: [],
    businessSector: [],
    dateRange: {
      startDate: '',
      endDate: '',
    },
  }

  enterpriseStore.resetPagination()

  await enterpriseStore.getAllEnterprises({ page: 1 })
}

const clearAllFilters = async () => {
  await resetFilters()
}

const removeSubscriptionFilter = async (subscription: string) => {
  filters.value.subscription = filters.value.subscription.filter((s) => s !== subscription)

  enterpriseStore.resetPagination()

  await enterpriseStore.getAllEnterprises({
    page: 1,
    ...buildFilterParams(),
  })
}

const removeBusinessSectorFilters = async () => {
  filters.value.businessSector = []

  enterpriseStore.resetPagination()

  await enterpriseStore.getAllEnterprises({
    page: 1,
    ...buildFilterParams(),
  })
}

const removeDateFilter = async () => {
  filters.value.dateRange = {
    startDate: '',
    endDate: '',
  }

  enterpriseStore.resetPagination()

  await enterpriseStore.getAllEnterprises({
    page: 1,
    ...buildFilterParams(),
  })
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

const addNewEnterprise = () => {
  router.push('/manage-users/createEnterprise')
}

const handleBanEnterprise = async (enterpriseId: string, isBanned: boolean) => {
  try {
    const isSuspending = isBanned

    const actionText = isSuspending ? 'Suspend' : 'Activate'
    const confirmText = isSuspending
      ? t('alerts.confirm.suspendAccount')
      : t('alerts.confirm.reactivateAccount')

    const result = await SweetAlert.confirm(
      `${actionText} Account`,
      confirmText,
      t('common.yes'),
      t('common.cancel'),
    )

    if (!result.isConfirmed) return

    if (!enterpriseId) {
      SweetAlert.error('Missing Data', 'Enterprise  ID is missing.')
      return
    }

    if (isSuspending) {
      await enterpriseStore.disableEnterprise(enterpriseId)
      isBanned = true
      // formData.status = 'suspended'
    } else {
      await enterpriseStore.enableEnterprise(enterpriseId)
      isBanned = false
      // formData.status = 'active'
    }
    await enterpriseStore.getAllEnterprises()

    SweetAlert.success(
      t('common.success'),
      isSuspending ? t('alerts.success.accountSuspended') : t('alerts.success.accountReactivated'),
    )
  } catch (err) {
    console.error('Error toggling suspension:', err)
    SweetAlert.error(t('common.error'), t('alerts.error.suspendingAccount'))
  }
}

const handleViewEnterprise = (enterpriseId: string) => {
  router.push(`/manage-users/enterprises/${enterpriseId}/view`)
}

const handleEditEnterprise = (enterpriseId: string | number) => {
  router.push(`/manage-users/enterprises/${enterpriseId}/edit`)
}

const confirmDeleteAccount = async (enterpriseId: string) => {
  const result = await SweetAlert.confirm(
    t('enterprise.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete this admin account. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
  )

  if (finalConfirm.isConfirmed) {
    await handleDeleteEnterprise(enterpriseId)
  }
}

const handleDeleteEnterprise = async (enterpriseId: string) => {
  if (!enterpriseId) {
    SweetAlert.error(t('common.error'), 'Admin ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))

    await enterpriseStore.deleteEnterprise(enterpriseId)

    await enterpriseStore.getAllEnterprises()

    SweetAlert.success(t('common.success'), 'Account deleted successfully!')
  } catch (error: unknown) {
    SweetAlert.error(t('common.error'), 'Failed to delete account.')
  }
}

onMounted(async () => {
  await enterpriseStore.getAllEnterprises({ page: 1 })
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
              placeholder="Search for Enterprises"
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
              @click="addNewEnterprise"
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
              Add Enterprise
            </button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-400">Active filters:</span>

          <!-- Subscription Filters -->
          <div
            v-for="subscription in filters.subscription"
            :key="subscription"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white capitalize">{{ subscription }}</span>
            <button
              @click="removeSubscriptionFilter(subscription)"
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

          <!-- Business Sector Filter -->
          <div
            v-if="filters.businessSector.length > 0"
            class="flex items-center bg-gray-700 rounded-full px-3 py-1"
          >
            <span class="text-sm text-white">
              {{ filters.businessSector.length }} sector{{
                filters.businessSector.length > 1 ? 's' : ''
              }}
            </span>
            <button
              @click="removeBusinessSectorFilters"
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

        <!-- Enterprises Table -->
        <EnterprisesTable
          :enterprises="filteredEnterprises"
          :loading="isLoading"
          :items-per-page="10"
          :total-count="totalCount"
          :current-page="currentPage"
          :has-next-page="pagination.hasMore"
          @ban="handleBanEnterprise"
          @view="handleViewEnterprise"
          @edit="handleEditEnterprise"
          @delete="confirmDeleteAccount"
          @page-change="handlePageChange"
        />
      </div>

      <!-- Router View for nested routes -->
      <div class="p-4">
        <RouterView />
      </div>
    </div>

    <!-- Filter Modal -->
    <EnterpriseFilterModal
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </div>
</template>
