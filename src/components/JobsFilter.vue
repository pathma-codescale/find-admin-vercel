<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface FilterOptions {
  sortBy: string
  status: string[]
  startDate: string
  endDate: string
  contractTypes: string[]
}

interface Props {
  isOpen: boolean
  filters: FilterOptions
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  filters: () => ({
    sortBy: 'datePosted-desc',
    status: [],
    startDate: '',
    endDate: '',
    contractTypes: [],
  }),
})

const emit = defineEmits<{
  close: []
  apply: [filters: FilterOptions]
  reset: []
}>()

// Local copy of filters for editing
const localFilters = ref<FilterOptions>({
  sortBy: 'datePosted-desc',
  status: [],
  startDate: '',
  endDate: '',
  contractTypes: [],
})

const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const currentMonth = ref(new Date())

// Watch for prop changes and update local filters
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters }
  },
  { immediate: true, deep: true },
)

// Watch for isOpen changes to reset local filters
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      localFilters.value = { ...props.filters }
    }
  },
)

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const days = []

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', isCurrentMonth: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true })
  }

  return days
})

const formatDateForDisplay = (isoDateStr: string) => {
  if (!isoDateStr) return ''

  try {
    const date = new Date(isoDateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    return `${month}.${day}.${year}`
  } catch (e) {
    return ''
  }
}

const displayStartDate = computed(() => {
  return formatDateForDisplay(localFilters.value.startDate)
})

const displayEndDate = computed(() => {
  return formatDateForDisplay(localFilters.value.endDate)
})

const selectDate = (day: number, pickerType: 'start' | 'end') => {
  if (!day) return

  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const selectedDate = new Date(year, month, day)
  const isoDate = selectedDate.toISOString().split('T')[0]

  if (pickerType === 'start') {
    localFilters.value.startDate = isoDate
    showStartDatePicker.value = false
  } else {
    localFilters.value.endDate = isoDate
    showEndDatePicker.value = false
  }
}

const changeMonth = (increment: number) => {
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + increment)
  currentMonth.value = newMonth
}

const monthNames = computed(() => {
  return Array.from({ length: 12 }, (_, i) => t(`filters.calendar.months[${i}]`))
})

const weekdayNames = computed(() => {
  return Array.from({ length: 7 }, (_, i) => t(`filters.calendar.weekdays.short[${i}]`))
})

const closeFilter = () => {
  emit('close')
}

const applyFilters = () => {
  emit('apply', { ...localFilters.value })
  emit('close')
}

const resetFilters = () => {
  localFilters.value = {
    sortBy: 'datePosted-desc',
    status: [],
    startDate: '',
    endDate: '',
    contractTypes: [],
  }
  emit('reset')
}

const modalRef = ref<HTMLDivElement | null>(null)
const startDatePickerRef = ref<HTMLDivElement | null>(null)
const endDatePickerRef = ref<HTMLDivElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
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

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  },
  { immediate: true },
)

onMounted(() => {
  currentMonth.value = new Date()
})
</script>

<template>
  <!-- Filter Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="closeFilter"
  >
    <!-- Filter Panel -->
    <div
      ref="modalRef"
      class="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-600">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            ></path>
          </svg>
          <h2 class="text-white text-lg font-semibold">{{ t('filters.title') }}</h2>
        </div>
        <button @click="closeFilter" class="text-gray-400 hover:text-white transition-colors">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="p-4 space-y-6">
        <!-- Sort by Section -->
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              ></path>
            </svg>
            <h3 class="text-white font-medium">{{ t('filters.sortBy') }}</h3>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.sortBy"
                type="radio"
                value="datePosted-desc"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('filters.sort.newestFirst') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.sortBy"
                type="radio"
                value="datePosted-asc"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('filters.sort.oldestFirst') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.sortBy"
                type="radio"
                value="title-asc"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.titleAZ') }}</span>
            </label>
          </div>
        </div>

        <!-- Filter by Status Section -->
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              ></path>
            </svg>
            <h3 class="text-white font-medium">{{ t('filters.filterByStatus') }}</h3>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.status"
                type="checkbox"
                value="all"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.allJobs') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.status"
                type="checkbox"
                value="visible"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('filters.status.visible') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.status"
                type="checkbox"
                value="suspended"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('filters.status.suspended') }}</span>
            </label>

            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.status"
                type="checkbox"
                value="hide"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('filters.status.hidden') }}</span>
            </label>
          </div>
        </div>

        <!-- Filter by Date Posted Section -->
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <h3 class="text-white font-medium">{{ t('jobs.filters.filterByDatePosted') }}</h3>
          </div>

          <div class="space-y-4">
            <!-- Start Date -->
            <div>
              <label class="block text-white text-sm mb-2">{{ t('jobs.filters.startDate') }}</label>
              <div class="relative">
                <input
                  :value="displayStartDate"
                  type="text"
                  :placeholder="t('filters.dateFormat')"
                  @focus="showStartDatePicker = true"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  readonly
                />
                <div
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  @click="showStartDatePicker = !showStartDatePicker"
                >
                  <svg
                    class="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                            localFilters.startDate &&
                            new Date(localFilters.startDate).getDate() === day.day &&
                            new Date(localFilters.startDate).getMonth() ===
                              currentMonth.getMonth() &&
                            new Date(localFilters.startDate).getFullYear() ===
                              currentMonth.getFullYear(),
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

            <!-- Arrow -->
            <div class="flex justify-center">
              <svg
                class="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-white text-sm mb-2">{{ t('jobs.filters.endDate') }}</label>
              <div class="relative">
                <input
                  :value="displayEndDate"
                  type="text"
                  :placeholder="t('filters.dateFormat')"
                  @focus="showEndDatePicker = true"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  readonly
                />
                <div
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  @click="showEndDatePicker = !showEndDatePicker"
                >
                  <svg
                    class="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                            localFilters.endDate &&
                            new Date(localFilters.endDate).getDate() === day.day &&
                            new Date(localFilters.endDate).getMonth() === currentMonth.getMonth() &&
                            new Date(localFilters.endDate).getFullYear() ===
                              currentMonth.getFullYear(),
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

        <!-- Filter by Contract Type Section -->
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <h3 class="text-white font-medium">{{ t('jobs.filters.filterByContractType') }}</h3>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.contractTypes"
                type="checkbox"
                value="full-time"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.fullTime') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.contractTypes"
                type="checkbox"
                value="part-time"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.partTime') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.contractTypes"
                type="checkbox"
                value="temporary"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.temporary') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.contractTypes"
                type="checkbox"
                value="permanent"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.permanent') }}</span>
            </label>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="localFilters.contractTypes"
                type="checkbox"
                value="internship"
                class="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
              />
              <span class="text-white text-sm">{{ t('jobs.filters.internship') }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center space-x-3 p-4 border-t border-gray-600">
        <button
          @click="resetFilters"
          class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          <span class="text-white">{{ t('filters.reset') }}</span>
        </button>
        <button
          @click="applyFilters"
          class="flex-1 px-4 py-2 bg-primary hover:bg-primaryDark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <span class="text-white font-medium">{{ t('filters.applyFilters') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='checkbox'],
input[type='radio'] {
  accent-color: #f94daf;
}
</style>
