<script setup lang="ts">
import { ref, computed } from 'vue'

import arrowRightIcon from '@/assets/Dashboard/cheveron-right.svg?url'

interface EnterpriseData {
  enterpriseId: string
  email: string
  logo?: string
  brand_name?: string
  activeJobs?: number
  businessLocation?: {
    locationName?: string
  }
  businessSector?: string[]
  subscription?: 'subscribed' | 'expired' | 'trial' | string
  isBanned?: boolean
  isViewed?: boolean
}

interface Props {
  enterprises?: EnterpriseData[]
  loading?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  enterprises: () => [],
  loading: false,
  itemsPerPage: 10,
})

const emit = defineEmits<{
  viewAll: []
  viewProfile: [enterpriseId: string]
}>()

const viewAllJobs = () => {
  emit('viewAll')
}

const handleViewProfile = (enterpriseId: string) => {
  console.log(enterpriseId)
  emit('viewProfile', enterpriseId)
}
const subscriptionFilter = ref('')
const currentPage = ref(1)

const filteredEnterprises = computed(() => {
  let filtered = props.enterprises

  if (subscriptionFilter.value) {
    filtered = filtered.filter((enterprise) => enterprise.subscription === subscriptionFilter.value)
  }

  return filtered
})

const paginatedEnterprises = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredEnterprises.value.slice(start, end)
})
</script>

<template>
  <div
    class="w-full h-[calc(100vh-340px)] border bg-white dark:bg-gray-800 border-borderGray rounded-xl overflow-hidden overflow-y-auto"
  >
    <!-- Header Section -->
    <div class="flex items-center justify-between p-4 sm:p-4 border-b border-borderGray">
      <h2 class="text-black dark:text-white text-md sm:text-md lg:text-md font-semibold">
        {{ $t('Dashboard.enterprisesTable.title') }}
      </h2>
      <button
        class="flex items-center space-x-2 text-secondaryText hover:text-primary transition-colors duration-200 group"
        @click="viewAllJobs"
      >
        <span class="text-xs sm:text-base font-medium">
          {{ $t('Dashboard.enterprisesTable.viewAll') }}
        </span>
        <img
          :src="arrowRightIcon"
          alt="Arrow right"
          class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200"
        />
      </button>
    </div>

    <div class="hidden lg:block bg-darkPink/50 border-borderGray">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-2 border-black dark:border-borderGray border-b text-black dark:text-white font-medium text-sm"
      >
        <div class="col-span-3">{{ $t('Dashboard.enterprisesTable.job') }}</div>
      </div>
    </div>

    <!-- Enterprises List -->
    <div class="divide-y divide-border-borderGray">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-secondaryText mt-2">{{ $t('common.loadingEnterprises') }}</p>
      </div>

      <div v-else-if="filteredEnterprises.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">{{ $t('common.noEnterprisesFound') }}</p>
      </div>

      <div v-else>
        <!-- Desktop View -->
        <div>
          <div
            v-for="enterprise in paginatedEnterprises"
            :key="enterprise.enterpriseId"
            class="grid gap-4 px-4 py-2 border-b border-black dark:border-borderGray hover:bg-topBar/30 transition-colors duration-200 items-center"
          >
            <!-- Enterprise Column -->
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
              >
                <img
                  v-if="enterprise.logo"
                  :src="enterprise.logo"
                  :alt="enterprise.brand_name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-gray-100 font-bold text-sm">
                  {{ enterprise.brand_name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                  {{ enterprise.brand_name }}
                </h3>
                <p class="text-secondaryText text-xs truncate">{{ enterprise.email }}</p>
              </div>
              <button
                class="flex items-center space-x-2 text-secondaryText hover:text-primary transition-colors duration-200 group"
                @click="handleViewProfile(enterprise.enterpriseId)"
              >
                <span class="text-black dark:text-white text-sm font-semibold">
                  {{ $t('Dashboard.enterprisesTable.viwProfile') }}
                </span>
                <img
                  :src="arrowRightIcon"
                  alt="Arrow right"
                  class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
