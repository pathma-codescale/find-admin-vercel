<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface FilterOptions {
  sortBy: string
  status: string[]
  startDate: string | null
  endDate: string | null
  contractTypes: string[]
}

const props = defineProps<{
  isOpen: boolean
  filters: {
    status: string[]
    contractTypes: string[]
    startDate: string | null
    endDate: string | null
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', filters: FilterOptions): void
  (e: 'reset'): void
}>()

// Create a local copy of filters to work with
const localFilters = reactive({
  sortBy: 'newest',
  status: [...props.filters.status],
  channels: [...props.filters.contractTypes], // Renamed to channels for alerts context
  startDate: props.filters.startDate,
  endDate: props.filters.endDate,
})

// Reference to the filter panel element for click outside detection
const filterPanelRef = ref<HTMLElement | null>(null)

// Status options
const statusOptions = [
  { value: 'sent', label: 'Sent' },
  { value: 'draft', label: 'Draft' },
]

// Channel options
const channelOptions = [
  { value: 'email', label: 'Email' },
  { value: 'notifications', label: 'In-App Notifications' },
  { value: 'sms', label: 'SMS' },
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'a-z', label: 'Title (A-Z)' },
  { value: 'z-a', label: 'Title (Z-A)' },
]

// Date range presets
const datePresets = [
  { label: 'Last 7 days', start: -7, end: 0 },
  { label: 'Last 30 days', start: -30, end: 0 },
  { label: 'Last 90 days', start: -90, end: 0 },
  { label: 'Last 12 months', start: -365, end: 0 },
  { label: 'All time', start: null, end: null },
]

// Handle status toggle
const toggleStatus = (status: string) => {
  const index = localFilters.status.indexOf(status)
  if (index === -1) {
    localFilters.status.push(status)
  } else {
    localFilters.status.splice(index, 1)
  }
}

// Handle channel toggle
const toggleChannel = (channel: string) => {
  const index = localFilters.channels.indexOf(channel)
  if (index === -1) {
    localFilters.channels.push(channel)
  } else {
    localFilters.channels.splice(index, 1)
  }
}

// Apply date preset
const applyDatePreset = (start: number | null, end: number | null) => {
  if (start === null || end === null) {
    localFilters.startDate = null
    localFilters.endDate = null
    return
  }

  const today = new Date()

  // Calculate start date
  const startDate = new Date(today)
  startDate.setDate(today.getDate() + start)
  localFilters.startDate = startDate.toISOString().split('T')[0]

  // Calculate end date
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + end)
  localFilters.endDate = endDate.toISOString().split('T')[0]
}

// Apply filters
const applyFilters = () => {
  emit('apply', {
    sortBy: localFilters.sortBy,
    status: localFilters.status,
    contractTypes: localFilters.channels, // Map back to parent's expected property name
    startDate: localFilters.startDate,
    endDate: localFilters.endDate,
  })
  emit('close')
}

// Reset filters
const resetFilters = () => {
  localFilters.sortBy = 'newest'
  localFilters.status = []
  localFilters.channels = []
  localFilters.startDate = null
  localFilters.endDate = null
  emit('reset')
  emit('close')
}

// Watch for changes in props to update local state
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.status = [...newFilters.status]
    localFilters.channels = [...newFilters.contractTypes]
    localFilters.startDate = newFilters.startDate
    localFilters.endDate = newFilters.endDate
  },
  { deep: true },
)

// // Format date for display
// const formatDate = (dateString: string | null) => {
//   if (!dateString) return ''
//   const date = new Date(dateString)
//   return date.toLocaleDateString()
// }

// Check if a date preset is active
const isDatePresetActive = (start: number | null, end: number | null) => {
  if (start === null && end === null) {
    return localFilters.startDate === null && localFilters.endDate === null
  }

  if (!localFilters.startDate || !localFilters.endDate) return false

  const today = new Date()

  const startDate = new Date(today)
  startDate.setDate(today.getDate() + (start || 0))
  const expectedStart = startDate.toISOString().split('T')[0]

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + (end || 0))
  const expectedEnd = endDate.toISOString().split('T')[0]

  return localFilters.startDate === expectedStart && localFilters.endDate === expectedEnd
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
  >
    <div
      ref="filterPanelRef"
      class="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h3 class="text-lg font-medium text-white">Filter Alerts</h3>
        <button @click="emit('close')" class="text-gray-400 hover:text-white">
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

      <!-- Filter Content -->
      <div class="px-6 py-4">
        <!-- Sort By -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Sort By</h4>
          <div class="space-y-2">
            <div v-for="option in sortOptions" :key="option.value" class="flex items-center">
              <button
                @click="localFilters.sortBy = option.value"
                class="w-5 h-5 rounded-full border mr-3 flex items-center justify-center"
                :class="
                  localFilters.sortBy === option.value
                    ? 'bg-primary border-primary'
                    : 'border-gray-500 hover:border-gray-300'
                "
              >
                <div
                  v-if="localFilters.sortBy === option.value"
                  class="h-2 w-2 rounded-full bg-white"
                ></div>
              </button>
              <label
                class="text-sm text-white cursor-pointer"
                @click="localFilters.sortBy = option.value"
              >
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Alert Status</h4>
          <div class="space-y-2">
            <div v-for="option in statusOptions" :key="option.value" class="flex items-center">
              <button
                @click="toggleStatus(option.value)"
                class="w-5 h-5 rounded border mr-3 flex items-center justify-center"
                :class="
                  localFilters.status.includes(option.value)
                    ? 'bg-primary border-primary'
                    : 'border-gray-500 hover:border-gray-300'
                "
              >
                <svg
                  v-if="localFilters.status.includes(option.value)"
                  class="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
              <label class="text-sm text-white cursor-pointer" @click="toggleStatus(option.value)">
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Channel Filter -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Alert Channels</h4>
          <div class="space-y-2">
            <div v-for="option in channelOptions" :key="option.value" class="flex items-center">
              <button
                @click="toggleChannel(option.value)"
                class="w-5 h-5 rounded border mr-3 flex items-center justify-center"
                :class="
                  localFilters.channels.includes(option.value)
                    ? 'bg-primary border-primary'
                    : 'border-gray-500 hover:border-gray-300'
                "
              >
                <svg
                  v-if="localFilters.channels.includes(option.value)"
                  class="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
              <label class="text-sm text-white cursor-pointer" @click="toggleChannel(option.value)">
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-300 mb-3">Date Range</h4>

          <!-- Date Presets -->
          <div class="space-y-2 mb-4">
            <div v-for="preset in datePresets" :key="preset.label" class="flex items-center">
              <button
                @click="applyDatePreset(preset.start, preset.end)"
                class="w-5 h-5 rounded-full border mr-3 flex items-center justify-center"
                :class="
                  isDatePresetActive(preset.start, preset.end)
                    ? 'bg-primary border-primary'
                    : 'border-gray-500 hover:border-gray-300'
                "
              >
                <div
                  v-if="isDatePresetActive(preset.start, preset.end)"
                  class="h-2 w-2 rounded-full bg-white"
                ></div>
              </button>
              <label
                class="text-sm text-white cursor-pointer"
                @click="applyDatePreset(preset.start, preset.end)"
              >
                {{ preset.label }}
              </label>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Start Date</label>
              <input
                v-model="localFilters.startDate"
                type="date"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">End Date</label>
              <input
                v-model="localFilters.endDate"
                type="date"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end px-6 py-4 border-t border-gray-700 space-x-3">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm text-gray-300 hover:text-white focus:outline-none"
        >
          Reset
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 text-sm bg-primary hover:bg-primaryDark text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>
