<template>
  <div
    class="relative p-4 max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-primary dark:text-white text-black flex flex-col justify-between"
  >
    <div class="flex justify-between items-start mb-1">
      <div>
        <h3 class="text-sm font-medium dark:text-white text-black mb-1">{{ title }}</h3>
        <div class="text-3xl font-bold dark:text-white text-black">
          {{ formattedValue }}
        </div>
      </div>

      <div class="p-1.5 rounded-md">
        <img v-if="iconPath" :src="iconPath" alt="Icon" class="w-6 h-6" />
      </div>
    </div>

    <div class="flex justify-between items-end">
      <div class="flex items-center gap-1">
        <!-- arrow -->
        <img v-if="isPositive" :src="arrowUp" alt="Arrow Up" class="w-4 h-4" />
        <img v-else :src="arrowDown" alt="Arrow Down" class="w-4 h-4" />

        <div class="flex items-baseline gap-1 whitespace-nowrap">
          <span
            :class="[isPositive ? 'text-success-400' : 'text-error-400', 'text-sm font-medium']"
          >
            {{ Math.abs(percentageChange) }}%
          </span>
          <span class="text-xs dark:text-white text-black">{{
            $t('Dashboard.graphs.graphText')
          }}</span>
        </div>
      </div>

      <div class="relative ml-12 h-16 w-32">
        <svg class="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
          <defs>
            <linearGradient :id="`gradient-${componentId}`" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                :stop-color="isPositive ? '#4ADE80' : '#F87171'"
                stop-opacity="0.3"
              />
              <stop
                offset="100%"
                :stop-color="isPositive ? '#4ADE80' : '#F87171'"
                stop-opacity="0.05"
              />
            </linearGradient>
          </defs>
          <path :d="areaPath" :fill="`url(#gradient-${componentId})`" />
          <path
            :d="linePath"
            fill="none"
            :stroke="isPositive ? '#4ADE80' : '#F87171'"
            stroke-width="2"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import arrowUp from '@/assets/Dashboard/arrow-up.svg?url'
import arrowDown from '@/assets/Dashboard/arrow-down.svg?url'
import multiUser from '@/assets/Dashboard/multiUsers.svg?url'
import briefcase from '@/assets/Dashboard/briefcase.svg?url'
import coin from '@/assets/Dashboard/coin.svg?url'

interface Props {
  title?: string
  value?: number
  percentageChange: number
  data?: number[]
  formatValue?: (value: number) => string
  icon?: 'multiUser' | 'briefcase' | 'coin'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Total Users',
  data: () => [],
  formatValue: (value: number) => (value ? value.toLocaleString() : '0'),
})

const componentId = ref(Math.random().toString(36).substr(2, 9))
const isPositive = computed(() => props.percentageChange >= 0)
const formattedValue = computed(() => props.formatValue(props.value))

const graphData = computed(() => {
  if (props.data.length > 0) return props.data

  const points = 24
  const baseAmplitude = 15
  const trend = isPositive.value ? 1 : -1
  const data = []

  for (let i = 0; i < points; i++) {
    const x = i / (points - 1)

    const trendValue = 30 + trend * x * 25

    // Primary wave (slower frequency)
    const primaryWave = Math.sin(x * Math.PI * 3) * baseAmplitude * 0.6

    // Secondary modulation (faster frequency, smaller amplitude)
    const secondaryWave = Math.sin(x * Math.PI * 8) * baseAmplitude * 0.3

    // Tertiary subtle variation
    const tertiaryWave = Math.sin(x * Math.PI * 15) * baseAmplitude * 0.1

    // Random noise for organic feel
    const noise = (Math.random() - 0.5) * 3

    const value = Math.max(5, trendValue + primaryWave + secondaryWave + tertiaryWave + noise)
    data.push(value)
  }

  return data
})

// Generate smooth wave curve using cubic bezier curves
const makeWaveCurve = (data: number[], width = 200, height = 60, padding = 4) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding
    const y = height - padding - ((v - min) / range) * (height - 2 * padding)
    return { x, y }
  })

  if (points.length < 4) return { line: '', area: '' }

  // Create smooth curve using cubic bezier
  let line = `M ${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const prev = i > 0 ? points[i - 1] : current
    const nextNext = i < points.length - 2 ? points[i + 2] : next

    // Calculate control points for smooth curve
    const tension = 0.3
    const cp1x = current.x + (next.x - prev.x) * tension * 0.5
    const cp1y = current.y + (next.y - prev.y) * tension * 0.5
    const cp2x = next.x - (nextNext.x - current.x) * tension * 0.5
    const cp2y = next.y - (nextNext.y - current.y) * tension * 0.5

    line += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`
  }

  // Create area path
  let area = `M ${points[0].x},${height - padding} L ${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const prev = i > 0 ? points[i - 1] : current
    const nextNext = i < points.length - 2 ? points[i + 2] : next

    const tension = 0.3
    const cp1x = current.x + (next.x - prev.x) * tension * 0.5
    const cp1y = current.y + (next.y - prev.y) * tension * 0.5
    const cp2x = next.x - (nextNext.x - current.x) * tension * 0.5
    const cp2y = next.y - (nextNext.y - current.y) * tension * 0.5

    area += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`
  }

  area += ` L ${points[points.length - 1].x},${height - padding} Z`

  return { line, area }
}

const { line: linePath, area: areaPath } = computed(() => makeWaveCurve(graphData.value)).value

const iconPath = computed(() => {
  switch (props.icon) {
    case 'multiUser':
      return multiUser
    case 'briefcase':
      return briefcase
    case 'coin':
      return coin
    default:
      return null
  }
})
</script>
