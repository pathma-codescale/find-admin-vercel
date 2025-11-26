<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const showCalendar = ref(false)
const selectedDate = ref<string>('')

const today = dayjs()

const currentMonth = ref(today.month())
const currentYear = ref(today.year())

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const yearOptions = computed(() => {
  const years = []
  for (let y = today.year() - 100; y <= today.year() + 10; y++) {
    years.push(y)
  }
  return years
})

function daysInMonth(year: number, month: number) {
  const start = dayjs(new Date(year, month, 1))
  const days = []
  const firstDay = start.day()
  const totalDays = start.daysInMonth()

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= totalDays; d++) days.push(d)

  return days
}

function selectDate(day: number | null) {
  if (!day) return
  selectedDate.value = dayjs(new Date(currentYear.value, currentMonth.value, day)).format(
    'YYYY-MM-DD',
  )
  showCalendar.value = false
}
</script>

<template>
  <div class="w-full">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>

    <div class="relative">
      <input
        type="text"
        readonly
        v-model="selectedDate"
        @click="showCalendar = !showCalendar"
        placeholder="Select date"
        class="w-full h-12 px-4 py-2 border-2 border-gray-300 rounded-full bg-white dark:bg-gray-800 text-sm focus:border-pink-500 outline-none cursor-pointer"
      />

      <div
        v-if="showCalendar"
        class="absolute mt-2 left-0 bg-white dark:bg-gray-800 border rounded-xl shadow-lg p-4 z-10 w-72"
      >
        <div class="flex items-center justify-between mb-3">
          <select
            v-model="currentMonth"
            class="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
          >
            <option
              v-for="(m, i) in 12"
              :key="i"
              :value="i"
              class="bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              {{ dayjs(new Date(0, i)).format('MMMM') }}
            </option>
          </select>

          <select
            v-model="currentYear"
            class="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
          >
            <option
              v-for="y in yearOptions"
              :key="y"
              :value="y"
              class="bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              {{ y }}
            </option>
          </select>
        </div>

        <div
          class="grid grid-cols-7 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <div v-for="d in weekDays" :key="d">{{ d }}</div>
        </div>

        <div class="grid grid-cols-7 text-center mt-2">
          <div
            v-for="(day, index) in daysInMonth(currentYear, currentMonth)"
            :key="index"
            class="h-8 flex items-center justify-center cursor-pointer rounded-md"
            :class="{
              'text-gray-400': !day,
              'bg-pink-500 text-white':
                selectedDate ===
                dayjs(new Date(currentYear, currentMonth, day)).format('YYYY-MM-DD'),
              'hover:bg-pink-100 dark:hover:bg-gray-700': day,
            }"
            @click="selectDate(day)"
          >
            {{ day || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
