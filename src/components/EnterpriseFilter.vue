<script setup lang="ts">
import { ref, watch, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  filters: {
    type: Object,
    required: true,
    default: () => ({
      sortBy: 'newest',
      subscription: [],
      businessSector: [],
      dateRange: {
        startDate: '',
        endDate: '',
      },
    }),
  },
})

const emit = defineEmits(['close', 'apply', 'reset'])

// Create a local copy of filters to work with
const localFilters = reactive({
  sortBy: props.filters.sortBy || 'newest',
  subscription: [...(props.filters.subscription || [])],
  businessSector: [...(props.filters.businessSector || [])],
  dateRange: {
    startDate: props.filters.dateRange?.startDate || '',
    endDate: props.filters.dateRange?.endDate || '',
  },
})

// Update local filters when props change
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.sortBy = newFilters.sortBy || 'newest'
    localFilters.subscription = [...(newFilters.subscription || [])]
    localFilters.businessSector = [...(newFilters.businessSector || [])]
    localFilters.dateRange = {
      startDate: newFilters.dateRange?.startDate || '',
      endDate: newFilters.dateRange?.endDate || '',
    }
  },
  { deep: true },
)

// Sort options
const sortOptions = [
  { id: 'newest', label: t('filters.sort.newestFirst') },
  { id: 'oldest', label: t('filters.sort.oldestFirst') },
  { id: 'name-asc', label: t('filters.sort.brandNameAZ') },
  { id: 'jobs-desc', label: t('filters.sort.mostActiveJobs') },
]

// Subscription options
const subscriptionOptions = [
  { id: 'all', label: t('filters.subscription.all') },
  { id: 'subscribed', label: t('filters.subscription.subscribed') },
  { id: 'expired', label: t('filters.subscription.expired') },
  { id: 'trial', label: t('filters.subscription.trial') },
]

// Business sector options (dynamically generated from all available sectors)
const businessSectorOptions = ref([
  { id: 'all', label: 'All Sectors' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Software', label: 'Software' },
  { id: 'Consulting', label: 'Consulting' },
  { id: 'Restaurant', label: 'Restaurant' },
  { id: 'Catering', label: 'Catering' },
  { id: 'Food Delivery', label: 'Food Delivery' },
  { id: 'Bakery', label: 'Bakery' },
  { id: 'Healthcare', label: 'Healthcare' },
  { id: 'Medical Equipment', label: 'Medical Equipment' },
  { id: 'Ambulance', label: 'Ambulance' },
])

// Handle subscription selection
const toggleSubscription = (subscription: string) => {
  if (subscription === 'all') {
    // If 'All Subscriptions' is selected, clear other selections
    localFilters.subscription = localFilters.subscription.includes('all') ? [] : ['all']
  } else {
    // Remove 'all' if it's selected
    if (localFilters.subscription.includes('all')) {
      localFilters.subscription = localFilters.subscription.filter((s) => s !== 'all')
    }

    // Toggle the selected subscription
    const index = localFilters.subscription.indexOf(subscription)
    if (index === -1) {
      localFilters.subscription.push(subscription)
    } else {
      localFilters.subscription.splice(index, 1)
    }
  }
}

// Handle business sector selection
const toggleBusinessSector = (sector: string) => {
  if (sector === 'all') {
    // If 'All Sectors' is selected, clear other selections
    localFilters.businessSector = localFilters.businessSector.includes('all') ? [] : ['all']
  } else {
    // Remove 'all' if it's selected
    if (localFilters.businessSector.includes('all')) {
      localFilters.businessSector = localFilters.businessSector.filter((s) => s !== 'all')
    }

    // Toggle the selected sector
    const index = localFilters.businessSector.indexOf(sector)
    if (index === -1) {
      localFilters.businessSector.push(sector)
    } else {
      localFilters.businessSector.splice(index, 1)
    }
  }
}

// Date picker functionality
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const currentMonth = ref(new Date())

// Get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

// Generate calendar days
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days = []

  // Add empty spaces for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', isCurrentMonth: false })
  }

  // Add days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true })
  }

  return days
})

// Format date for display (MM.DD.YYYY)
const formatDateForDisplay = (dateStr: string) => {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    return `${month}.${day}.${year}`
  } catch (e) {
    return dateStr
  }
}

// Select a date from the calendar
const selectDate = (day: number, pickerType: 'start' | 'end') => {
  if (!day) return

  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const selectedDate = new Date(year, month, day)
  const formattedDate = formatDateForDisplay(selectedDate.toISOString())

  if (pickerType === 'start') {
    localFilters.dateRange.startDate = formattedDate
    showStartDatePicker.value = false
  } else {
    localFilters.dateRange.endDate = formattedDate
    showEndDatePicker.value = false
  }
}

// Navigate between months
const changeMonth = (increment: number) => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + increment)
  currentMonth.value = newMonth
}

// Format date input (MM.DD.YYYY)
const formatDate = (event: Event, field: 'startDate' | 'endDate') => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 0) {
    // Format as MM.DD.YYYY
    if (value.length > 4) {
      value =
        value.substring(0, 2) +
        '.' +
        value.substring(2, 4) +
        '.' +
        value.substring(4, Math.min(8, value.length))
    } else if (value.length > 2) {
      value = value.substring(0, 2) + '.' + value.substring(2, Math.min(4, value.length))
    }
  }

  localFilters.dateRange[field] = value
}

// Month names for calendar from translations
const monthNames = computed(() => {
  return Array.from({ length: 12 }, (_, i) => t(`filters.calendar.months[${i}]`))
})

// Weekday names from translations
const weekdayNames = computed(() => {
  return Array.from({ length: 7 }, (_, i) => t(`filters.calendar.weekdays.short[${i}]`))
})

// Apply filters
const applyFilters = () => {
  emit('apply', {
    sortBy: localFilters.sortBy,
    subscription: localFilters.subscription,
    businessSector: localFilters.businessSector,
    dateRange: localFilters.dateRange,
  })
  emit('close')
}

// Reset filters
const resetFilters = () => {
  localFilters.sortBy = 'newest'
  localFilters.subscription = []
  localFilters.businessSector = []
  localFilters.dateRange = {
    startDate: '',
    endDate: '',
  }
  emit('reset')
}

// Close modal
const closeModal = () => {
  emit('close')
}

// Handle click outside
const modalRef = ref<HTMLDivElement | null>(null)
const startDatePickerRef = ref<HTMLDivElement | null>(null)
const endDatePickerRef = ref<HTMLDivElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (modalRef.value && !modalRef.value.contains(event.target as Node)) {
    emit('close')
  }

  // Close date pickers when clicking outside
  if (
    showStartDatePicker.value &&
    startDatePickerRef.value &&
    !startDatePickerRef.value.contains(event.target as Node)
  ) {
    showStartDatePicker.value = false
  }

  if (
    showEndDatePicker.value &&
    endDatePickerRef.value &&
    !endDatePickerRef.value.contains(event.target as Node)
  ) {
    showEndDatePicker.value = false
  }
}

// Lifecycle hooks
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

// Initialize current month to today
onMounted(() => {
  currentMonth.value = new Date()
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div ref="modalRef" class="w-full max-w-md bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <!-- Header with close button -->
      <div class="flex justify-between items-center p-4 border-b border-gray-700">
        <div class="flex items-center">
          <svg
            class="w-5 h-5 mr-2 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            ></path>
          </svg>
          <h3 class="text-lg font-medium text-white">{{ t('filters.enterpriseTitle') }}</h3>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-white">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Modal content -->
      <div class="p-4 max-h-[70vh] overflow-y-auto">
        <!-- Sort options -->
        <div class="mb-6">
          <div class="flex items-center mb-3">
            <svg
              class="w-5 h-5 mr-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              ></path>
            </svg>
            <h4 class="text-md font-medium text-white">{{ t('filters.sortBy') }}</h4>
          </div>

          <div class="space-y-2 pl-7">
            <label
              v-for="option in sortOptions"
              :key="option.id"
              class="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                :value="option.id"
                v-model="localFilters.sortBy"
                class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
              />
              <span class="ml-2 text-white">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Subscription filter -->
        <div class="mb-6">
          <div class="flex items-center mb-3">
            <svg
              class="w-5 h-5 mr-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              ></path>
            </svg>
            <h4 class="text-md font-medium text-white">{{ t('filters.filterBySubscription') }}</h4>
          </div>

          <div class="space-y-2 pl-7">
            <label
              v-for="option in subscriptionOptions"
              :key="option.id"
              class="flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="localFilters.subscription.includes(option.id)"
                @change="toggleSubscription(option.id)"
                class="form-checkbox h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
              />
              <span class="ml-2 text-white">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Business Sector filter -->
        <div class="mb-6">
          <div class="flex items-center mb-3">
            <svg
              class="w-5 h-5 mr-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            <h4 class="text-md font-medium text-white">
              {{ t('filters.filterByBusinessSector') }}
            </h4>
          </div>

          <div class="space-y-2 pl-7 max-h-40 overflow-y-auto">
            <label
              v-for="option in businessSectorOptions"
              :key="option.id"
              class="flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="localFilters.businessSector.includes(option.id)"
                @change="toggleBusinessSector(option.id)"
                class="form-checkbox h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
              />
              <span class="ml-2 text-white">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Date filter -->
        <div class="mb-6">
          <div class="flex items-center mb-3">
            <svg
              class="w-5 h-5 mr-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <h4 class="text-md font-medium text-white">{{ t('filters.filterByDateJoined') }}</h4>
          </div>

          <div class="pl-7">
            <div class="flex items-center space-x-2">
              <!-- Start Date Picker -->
              <div class="relative">
                <input
                  type="text"
                  :placeholder="t('filters.dateFormat')"
                  :value="localFilters.dateRange.startDate"
                  @input="(e) => formatDate(e, 'startDate')"
                  @focus="showStartDatePicker = true"
                  maxlength="10"
                  class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-10"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  @click="showStartDatePicker = !showStartDatePicker"
                >
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>

                <!-- Start Date Calendar -->
                <div
                  v-if="showStartDatePicker"
                  ref="startDatePickerRef"
                  class="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 w-64"
                >
                  <div class="flex justify-between items-center mb-2">
                    <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-700 rounded">
                      <svg
                        class="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <div class="text-white font-medium">
                      {{ monthNames[currentMonth.getMonth()] }} {{ currentMonth.getFullYear() }}
                    </div>
                    <button @click="changeMonth(1)" class="p-1 hover:bg-gray-700 rounded">
                      <svg
                        class="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                    <div v-for="(day, index) in weekdayNames" :key="index">{{ day }}</div>
                  </div>

                  <div class="grid grid-cols-7 gap-1">
                    <div
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      class="h-8 flex items-center justify-center text-sm"
                    >
                      <button
                        v-if="day.isCurrentMonth"
                        @click="selectDate(day.day, 'start')"
                        class="w-8 h-8 rounded-full hover:bg-primary hover:text-white flex items-center justify-center"
                        :class="{
                          'bg-primary text-white':
                            day.day ===
                            parseInt(localFilters.dateRange.startDate?.split('.')[1] || '0'),
                        }"
                      >
                        {{ day.day }}
                      </button>
                      <span v-else></span>
                    </div>
                  </div>
                </div>
              </div>

              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>

              <!-- End Date Picker -->
              <div class="relative">
                <input
                  type="text"
                  :placeholder="t('filters.dateFormat')"
                  :value="localFilters.dateRange.endDate"
                  @input="(e) => formatDate(e, 'endDate')"
                  @focus="showEndDatePicker = true"
                  maxlength="10"
                  class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 pr-10"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  @click="showEndDatePicker = !showEndDatePicker"
                >
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>

                <!-- End Date Calendar -->
                <div
                  v-if="showEndDatePicker"
                  ref="endDatePickerRef"
                  class="absolute z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 w-64"
                >
                  <div class="flex justify-between items-center mb-2">
                    <button @click="changeMonth(-1)" class="p-1 hover:bg-gray-700 rounded">
                      <svg
                        class="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <div class="text-white font-medium">
                      {{ monthNames[currentMonth.getMonth()] }} {{ currentMonth.getFullYear() }}
                    </div>
                    <button @click="changeMonth(1)" class="p-1 hover:bg-gray-700 rounded">
                      <svg
                        class="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                    <div v-for="(day, index) in weekdayNames" :key="index">{{ day }}</div>
                  </div>

                  <div class="grid grid-cols-7 gap-1">
                    <div
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      class="h-8 flex items-center justify-center text-sm"
                    >
                      <button
                        v-if="day.isCurrentMonth"
                        @click="selectDate(day.day, 'end')"
                        class="w-8 h-8 rounded-full hover:bg-primary hover:text-white flex items-center justify-center"
                        :class="{
                          'bg-primary text-white':
                            day.day ===
                            parseInt(localFilters.dateRange.endDate?.split('.')[1] || '0'),
                        }"
                      >
                        {{ day.day }}
                      </button>
                      <span v-else></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with action buttons -->
      <div class="flex justify-between p-4 border-t border-gray-700">
        <button
          @click="resetFilters"
          class="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <svg
            class="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          {{ t('filters.reset') }}
        </button>
        <button
          @click="applyFilters"
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {{ t('filters.applyFilters') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for checkboxes and radio buttons */
input[type='checkbox'],
input[type='radio'] {
  accent-color: var(--color-primary, #e91e63);
}
</style>
