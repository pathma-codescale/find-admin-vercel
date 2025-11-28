<script setup lang="ts">
// import { RouterView } from 'vue-router'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import AlertsTable from '@/components/AlertsTable.vue'
import AlertFilter from '@/components/AlertFilter.vue'

const router = useRouter()

interface AlertData {
  alertId: string
  alertTitle: string
  audience: string
  dateSent?: string
  channels: string[]
  alertStatus: 'sent' | 'draft'
  isBanned?: boolean
  isViewed?: boolean
}

interface FilterOptions {
  sortBy: string
  status: string[]
  startDate: string | null
  endDate: string | null
  contractTypes: string[]
}

// Search functionality
const searchQuery = ref('')

// Filter functionality
const showFilters = ref(false)

const filters = ref({
  sortBy: 'newest',
  status: [] as string[],
  contractTypes: [] as string[],
  startDate: null as string | null,
  endDate: null as string | null,
})

const hasActiveFilters = computed(() => {
  return (
    filters.value.status.length > 0 ||
    filters.value.contractTypes.length > 0 ||
    filters.value.startDate !== null ||
    filters.value.endDate !== null
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  count += filters.value.status.length
  count += filters.value.contractTypes.length
  if (filters.value.startDate || filters.value.endDate) count += 1
  return count
})

// Filter functions
const removeStatusFilter = (status: string) => {
  filters.value.status = filters.value.status.filter((s) => s !== status)
  filterAndSearchAlerts()
}

const removeContractTypeFilter = (type: string) => {
  filters.value.contractTypes = filters.value.contractTypes.filter((t) => t !== type)
  filterAndSearchAlerts()
}

const removeDateFilter = () => {
  filters.value.startDate = null
  filters.value.endDate = null
  filterAndSearchAlerts()
}

const clearAllFilters = () => {
  filters.value = {
    sortBy: 'newest',
    status: [],
    contractTypes: [],
    startDate: null,
    endDate: null,
  }
  filterAndSearchAlerts()
}

const applyFilters = (newFilters: FilterOptions) => {
  filters.value = { ...newFilters }
  filterAndSearchAlerts()
}

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else if (startDate) {
    return `After ${formatDate(startDate)}`
  } else if (endDate) {
    return `Before ${formatDate(endDate)}`
  }
  return ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Add new job function
const addNewAlert = () => {
  console.log('Add new alert')
  router.push('/manage-alerts/create')
}

const alertsData = ref<AlertData[]>([])
const filteredAlertsData = ref<AlertData[]>([])
const isLoading = ref(true)

// Mock data
const mockAlerts: AlertData[] = [
  {
    alertId: '1',
    alertTitle: 'New Feature Announcement',
    audience: 'Amazon and 10 others',
    dateSent: '2025-01-15',
    channels: ['email'],
    alertStatus: 'draft',
    isBanned: true,
    isViewed: true,
  },
  {
    alertId: '2',
    alertTitle: 'System Maintenance Notification',
    audience: 'All Users',
    dateSent: '2025-02-05',
    channels: ['email', 'notifications'],
    alertStatus: 'sent',
    isBanned: false,
    isViewed: true,
  },
  {
    alertId: '3',
    alertTitle: 'Security Alert',
    audience: 'Admins',
    dateSent: '2025-02-20',
    channels: ['email'],
    alertStatus: 'sent',
    isBanned: false,
    isViewed: false,
  },
  {
    alertId: '4',
    alertTitle: 'Weekly Newsletter',
    audience: 'Subscribers',
    channels: ['notifications'],
    alertStatus: 'draft',
    isBanned: true,
    isViewed: false,
  },
  {
    alertId: '5',
    alertTitle: 'Product Update',
    audience: 'Beta Testers',
    dateSent: '2025-03-01',
    channels: ['email'],
    alertStatus: 'sent',
    isBanned: false,
    isViewed: true,
  },
  {
    alertId: '6',
    alertTitle: 'Maintenance Reminder',
    audience: 'Developers',
    dateSent: '2025-03-10',
    channels: ['notifications'],
    alertStatus: 'draft',
    isBanned: false,
    isViewed: false,
  },
  {
    alertId: '7',
    alertTitle: 'Security Patch Released',
    audience: 'All Users',
    dateSent: '2025-03-15',
    channels: ['email'],
    alertStatus: 'sent',
    isBanned: true,
    isViewed: true,
  },
  {
    alertId: '8',
    alertTitle: 'Policy Update',
    audience: 'Managers',
    dateSent: '2025-04-01',
    channels: ['notifications'],
    alertStatus: 'draft',
    isBanned: false,
    isViewed: true,
  },
  {
    alertId: '9',
    alertTitle: 'Feature Deprecation Notice',
    audience: 'Admins and Devs',
    dateSent: '2025-04-05',
    channels: ['email'],
    alertStatus: 'sent',
    isBanned: false,
    isViewed: false,
  },
  {
    alertId: '10',
    alertTitle: 'Monthly Newsletter',
    audience: 'Subscribers',
    channels: ['notifications', 'email'],
    alertStatus: 'draft',
    isBanned: true,
    isViewed: false,
  },
]

// Filter and search alerts
const filterAndSearchAlerts = () => {
  let results = [...alertsData.value]

  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(
      (alert) =>
        alert.alertTitle.toLowerCase().includes(query) ||
        alert.audience.toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (filters.value.status.length > 0) {
    results = results.filter((alert) => filters.value.status.includes(alert.alertStatus))
  }

  // Apply channel filter
  if (filters.value.contractTypes.length > 0) {
    results = results.filter((alert) =>
      alert.channels.some((channel) => filters.value.contractTypes.includes(channel)),
    )
  }

  // Apply date filters
  if (filters.value.startDate) {
    results = results.filter(
      (alert) => alert.dateSent && new Date(alert.dateSent) >= new Date(filters.value.startDate!),
    )
  }

  if (filters.value.endDate) {
    results = results.filter(
      (alert) => alert.dateSent && new Date(alert.dateSent) <= new Date(filters.value.endDate!),
    )
  }

  // Apply sorting
  if (filters.value.sortBy) {
    switch (filters.value.sortBy) {
      case 'newest':
        results.sort((a, b) => {
          const dateA = a.dateSent ? new Date(a.dateSent).getTime() : 0
          const dateB = b.dateSent ? new Date(b.dateSent).getTime() : 0
          return dateB - dateA
        })
        break
      case 'oldest':
        results.sort((a, b) => {
          const dateA = a.dateSent ? new Date(a.dateSent).getTime() : 0
          const dateB = b.dateSent ? new Date(b.dateSent).getTime() : 0
          return dateA - dateB
        })
        break
      case 'a-z':
        results.sort((a, b) => a.alertTitle.localeCompare(b.alertTitle))
        break
      case 'z-a':
        results.sort((a, b) => b.alertTitle.localeCompare(a.alertTitle))
        break
    }
  }

  filteredAlertsData.value = results
}

// Watch for changes in search query or filters
watch(
  [searchQuery, filters],
  () => {
    filterAndSearchAlerts()
  },
  { deep: true },
)

onMounted(() => {
  setTimeout(() => {
    alertsData.value = mockAlerts
    filteredAlertsData.value = mockAlerts
    isLoading.value = false
  }, 1000)
})

const handleBanAlert = (alertId: string | number, isBanned: boolean) => {
  console.log(`Alert ${alertId} ban subscription changed to:`, isBanned)

  const alertIndex = alertsData.value.findIndex((alert) => alert.alertId === alertId)
  if (alertIndex !== -1) {
    alertsData.value[alertIndex].isBanned = isBanned
    filterAndSearchAlerts() // Re-apply filters and search
  }

  // Call API: updateAlertStatus(alertId, { isBanned })
}

const handleViewAlert = (alertId: string) => {
  // Call API: updateAlertStatus(alertId, { isViewed })
}

const handleEditAlert = (alertId: string | number) => {
  console.log(`Edit alert ${alertId}`)
  router.push(`/manage-alerts/edit-alert/${alertId}`)
}

const handleDeleteAlert = (alertId: string | number) => {
  console.log(`Delete alert ${alertId}`)

  if (confirm('Are you sure you want to delete this alert?')) {
    // Remove from array
    alertsData.value = alertsData.value.filter((alert) => alert.alertId !== alertId)
    filterAndSearchAlerts() // Re-apply filters and search

    // Call API: deleteAlert(alertId)
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div>
        <DashboardHeader
          class="border-l border-r border-b border-borderPrimary dark:text-white text-black"
        />
      </div>

      <div class="flex-1 px-4 py-6 z-10">
        <!-- Search and Action Buttons -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md w-full">
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
              placeholder="Search for Alerts"
              class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3 w-full md:w-auto">
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
              @click="addNewAlert"
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
              Add Alert
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

        <!-- Alerts Table -->
        <AlertsTable
          :alerts="filteredAlertsData"
          :loading="isLoading"
          :items-per-page="10"
          @ban="handleBanAlert"
          @view="handleViewAlert"
          @edit="handleEditAlert"
          @delete="handleDeleteAlert"
        />
      </div>

      <!-- <div class="flex-1 p-4">
        <RouterView />
      </div> -->
    </div>
    <!-- Filter Component -->
    <AlertFilter
      :is-open="showFilters"
      :filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="clearAllFilters"
    />
  </div>
</template>
