<script setup lang="ts">
import { ref, computed } from 'vue'

import UserStatus from '@/components/UserStatus.vue'
import ActionButtonSet from '@/components/ActionButtonSet.vue'

interface JobData {
  id: string
  jobTitle: string
  company: string
  location: {
    locationName: string
  }
  datePosted: string | Date
  contractTypes: string[]
  status: 'active' | 'suspended' | 'flagged' | 'hidden' | 'enterprise_deleted' | string
  isBanned?: boolean
  isViewed?: boolean
  image?: string
}

interface Props {
  jobs?: JobData[]
  loading?: boolean
  itemsPerPage?: number
  hasNextPage?: boolean
  totalCount?: number
  currentPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  jobs: () => [],
  loading: false,
  itemsPerPage: 10,
  totalCount: 0,
  currentPage: 1,
  hasNextPage: false,
})

const emit = defineEmits<{
  ban: [jobId: string, isBanned: boolean]
  view: [jobId: string, isViewed: boolean]
  edit: [jobId: string]
  delete: [jobId: string]
  'page-change': [page: number]
}>()

const statusFilter = ref('')

const filteredJobs = computed(() => {
  let filtered = props.jobs

  if (statusFilter.value) {
    filtered = filtered.filter((job) => job.status === statusFilter.value)
  }

  return filtered
})

const paginatedJobs = computed(() => props.jobs || [])

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatLocation = (locationName: string) => {
  if (!locationName) return ''
  const parts = locationName.split(',').map((p) => p.trim())
  if (parts.length <= 2) return locationName
  return `${parts[0]}, ${parts[1]}`
}

const handleBan = (jobId: string, isBanned: boolean) => {
  console.log(isBanned)
  emit('ban', jobId, isBanned)
}

const handleView = (jobId: string, isViewed: boolean) => {
  emit('view', jobId, isViewed)
}

const handleEdit = (jobId: string) => {
  emit('edit', jobId)
}

const handleDelete = (jobId: string) => {
  emit('delete', jobId)
}
const loadNextPage = () => {
  emit('page-change', props.currentPage + 1)
}

const loadPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}
</script>

<template>
  <div class="w-full border border-borderGray rounded-xl overflow-hidden">
    <!-- Header Section -->
    <div class="flex items-center justify-between p-4 sm:p-6 border-b border-borderGray">
      <h2 class="text-black dark:text-white text-lg sm:text-xl lg:text-2xl font-semibold">
        All Jobs
      </h2>
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Filter -->
        <select
          v-model="statusFilter"
          class="bg-lightCardBackground dark:bg-topBar text-black dark:text-white border border-border-borderGray rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="flagged">Flagged</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
    </div>

    <div class="hidden lg:block bg-darkPink/50 border-borderGray">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-2 border-black dark:border-borderGray border-b text-black dark:text-white font-medium text-sm"
      >
        <div class="col-span-3">Job</div>
        <div class="col-span-2">Location</div>
        <div class="col-span-2">Date Posted</div>
        <div class="col-span-2">Contract Type</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-2 text-center">Actions</div>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="divide-y divide-border-borderGray">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-secondaryText mt-2">Loading jobs...</p>
      </div>

      <div v-else-if="filteredJobs.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">No jobs found</p>
      </div>

      <div v-else>
        <!-- Desktop View -->
        <div class="hidden lg:block">
          <div
            v-for="job in paginatedJobs"
            :key="job.id"
            class="grid grid-cols-12 gap-4 px-4 py-2 border-b border-black dark:border-borderGray hover:bg-topBar/30 transition-colors duration-200 items-center"
          >
            <!-- Job Column -->
            <div class="col-span-3 flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="job.image"
                  :src="job.image"
                  :alt="job.company"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-gray-100 font-bold text-sm">
                  {{ job.company.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                  {{ job.jobTitle }}
                </h3>
                <p class="text-secondaryText text-xs truncate">by {{ job.company }}</p>
              </div>
            </div>

            <div class="col-span-2">
              <p class="text-secondaryText text-xs">
                {{ formatLocation(job.location.locationName) }}
              </p>
            </div>

            <div class="col-span-2">
              <span class="text-black dark:text-white text-xs">{{
                formatDate(job.datePosted)
              }}</span>
            </div>

            <div class="col-span-2">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="type in job.contractTypes"
                  :key="type"
                  class="px-2 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                >
                  {{ type }}
                </span>
              </div>
            </div>

            <div class="col-span-1">
              <div class="col-span-2">
                <UserStatus :status="job.status" />
              </div>
            </div>

            <div class="col-span-2 flex items-center justify-center space-x-2">
              <ActionButtonSet
                :item-id="job.id"
                :item-email="job.company"
                :is-banned="job.isBanned"
                :is-viewed="job.isViewed"
                @ban="handleBan"
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </div>
        </div>

        <!-- Mobile/Tablet View -->
        <div class="lg:hidden">
          <div
            v-for="job in paginatedJobs"
            :key="job.id"
            class="p-4 hover:bg-topBar/30 transition-colors duration-200"
          >
            <div class="flex items-start space-x-3">
              <!-- Avatar -->
              <div
                class="w-12 h-12 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="job.image"
                  :src="job.image"
                  :alt="job.company"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-gray-100 font-bold text-sm">
                  {{ job.company.charAt(0).toUpperCase() }}
                </span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                      {{ job.jobTitle }}
                    </h3>
                    <p class="text-secondaryText text-xs truncate">by {{ job.company }}</p>
                  </div>

                  <div class="col-span-2">
                    <UserStatus :status="job.status" />
                  </div>
                </div>

                <div class="mt-2 space-y-1">
                  <p class="text-secondaryText text-xs">
                    {{ formatLocation(job.location.locationName) }}
                  </p>
                  <p class="text-secondaryText text-xs">{{ formatDate(job.datePosted) }}</p>

                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="type in job.contractTypes"
                      :key="type"
                      class="px-2 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                    >
                      {{ type }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-2 mt-3">
                  <ActionButtonSet
                    :item-id="job.id"
                    :is-banned="job.isBanned"
                    :is-viewed="job.isViewed"
                    @ban="handleBan"
                    @view="handleView"
                    @edit="handleEdit"
                    @delete="handleDelete"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between p-4 border-t border-borderGray">
      <div class="text-black dark:text-white text-sm">Page {{ props.currentPage }}</div>

      <div class="flex items-center space-x-2">
        <button
          @click="loadPreviousPage"
          :disabled="props.currentPage <= 1 || props.loading"
          class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
        >
          {{ $t('pagination.previous') }}
        </button>

        <button
          @click="loadNextPage"
          :disabled="!props.hasNextPage || props.loading"
          class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
        >
          {{ $t('pagination.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
