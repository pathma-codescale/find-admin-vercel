<script setup lang="ts">
import { ref, computed } from 'vue'
import JobListingCard from './JobListingCard.vue'

import arrowRightIcon from '@/assets/Dashboard/cheveron-right.svg?url'

interface JobData {
  id: string
  jobTitle?: string
  company?: string
  location?: {
    locationName?: string
  }
  datePosted?: string | Date
  isBanned?: boolean
  isViewed?: boolean
  image?: string
}

interface Props {
  jobs?: JobData[]
  loading?: boolean
  maxDisplayed?: number
}

const props = withDefaults(defineProps<Props>(), {
  jobs: () => [],
  loading: false,
  maxDisplayed: 5,
})

const emit = defineEmits<{
  viewAll: []
  ban: [jobId: string, isBanned: boolean]
  view: [jobId: string | number, isViewed: boolean]
  edit: [jobId: string | number]
  delete: [jobId: string]
}>()

const showAll = ref(false)

const displayedJobs = computed(() => {
  if (showAll.value || props.jobs.length <= props.maxDisplayed) {
    return props.jobs
  }
  return props.jobs.slice(0, props.maxDisplayed)
})

const viewAllJobs = () => {
  emit('viewAll')
}

const handleBan = (jobId: string, isBanned: boolean) => {
  emit('ban', jobId, isBanned)
}

const handleView = (jobId: string | number, isViewed: boolean) => {
  emit('view', jobId, isViewed)
}

const handleEdit = (jobId: string | number) => {
  emit('edit', jobId)
}

const handleDelete = (jobId: string) => {
  emit('delete', jobId)
}
</script>

<template>
  <div
    class="w-full h-[calc(100vh-340px)] bg-white dark:bg-gray-800 border border-black dark:border-white rounded-xl overflow-hidden overflow-y-auto"
  >
    <!-- Header Section -->
    <div class="flex items-center justify-between p-4 border-b border-black dark:border-white">
      <h2 class="text-black dark:text-white text-md sm:text-md lg:text-md font-semibold">
        {{ $t('Dashboard.jobsTable.title') }}
      </h2>
      <button
        class="flex items-center space-x-2 text-secondaryText hover:text-primary transition-colors duration-200 group"
        @click="viewAllJobs"
      >
        <span class="text-xs sm:text-base font-medium">
          {{ $t('Dashboard.jobsTable.viewAll') }}
        </span>
        <img
          :src="arrowRightIcon"
          alt="Arrow right"
          class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200"
        />
      </button>
    </div>

    <!-- Table Header -->
    <div class="hidden lg:block bg-darkPink/50 border-b border-black dark:border-white">
      <div class="grid grid-cols-12 gap-4 p-2 text-sm text-white font-medium">
        <div class="col-span-5 pl-2">{{ $t('Dashboard.jobsTable.job') }}</div>
        <div class="col-span-3">{{ $t('Dashboard.jobsTable.location') }}</div>
        <div class="col-span-2">{{ $t('Dashboard.jobsTable.date') }}</div>
        <div class="col-span-2 text-center">{{ $t('Dashboard.jobsTable.actions') }}</div>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="divide-y divide-borderPrimary">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

        <p class="text-secondaryText">{{ $t('common.loadingJobs') }}</p>
      </div>

      <div v-else-if="jobs.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">{{ $t('common.noJobsFound') }}</p>
      </div>

      <div v-else>
        <JobListingCard
          v-for="job in displayedJobs"
          :key="job.id"
          :id="job.id"
          :job-title="job.jobTitle"
          :company="job.company"
          :image="job.image"
          :location="job.location"
          :date="job.datePosted"
          :is-banned="job.isBanned"
          :is-viewed="job.isViewed"
          class="p-1 border-0 border-b border-black dark:border-white last:border-b-0 rounded-none"
          @ban="handleBan"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Show More Button (Mobile) -->
    <div
      v-if="jobs.length > maxDisplayed && !showAll"
      class="p-4 border-t border-black dark:border-white lg:hidden"
    >
      <button
        @click="showAll = true"
        class="w-full py-3 px-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors duration-200 font-medium"
      >
        {{ $t('common.showMoreJobs', { count: jobs.length - maxDisplayed }) }}
      </button>
    </div>
  </div>
</template>
