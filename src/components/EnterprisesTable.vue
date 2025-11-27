<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDomainOptions } from '@/constants/selectorOptionsNew'
import ActionButtonSet from '@/components/ActionButtonSet.vue'
import UserStatus from '@/components/UserStatus.vue'

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
  isBanned?: boolean
  isViewed?: boolean
}

interface Props {
  enterprises?: EnterpriseData[]
  loading?: boolean
  itemsPerPage?: number
  totalCount?: number
  currentPage?: number
  hasNextPage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enterprises: () => [],
  loading: false,
  itemsPerPage: 10,
  totalCount: 0,
  currentPage: 1,
  hasNextPage: false,
})

const emit = defineEmits<{
  ban: [enterpriseId: string, isBanned: boolean]
  view: [enterpriseId: string]
  edit: [enterpriseId: string]
  delete: [enterpriseId: string]
  'page-change': [page: number]
}>()

const availableBusinessSectors = getDomainOptions(t)

const sectorLabelsMap = computed(() => {
  return availableBusinessSectors.reduce((acc: Record<string, string>, sector: any) => {
    acc[sector.value] = sector.label
    return acc
  }, {})
})

const getSectorLabel = (sectorValue: string) => {
  return sectorLabelsMap.value[sectorValue] || sectorValue
}

const filteredEnterprises = computed(() => props.enterprises || [])

const maxVisibleSectors = 3
const showSectorsMap = ref<Record<string, boolean>>({})

const toggleSectors = (enterpriseId: string) => {
  showSectorsMap.value[enterpriseId] = !showSectorsMap.value[enterpriseId]
}

const formatLocation = (locationName?: string) => {
  if (!locationName) return 'N/A'
  const parts = locationName.split(',').map((p) => p.trim())
  if (parts.length <= 2) return locationName
  return `${parts[0]}, ${parts[1]}`
}

const handleBan = (enterpriseId: string, isBanned: boolean) => {
  emit('ban', enterpriseId, isBanned)
}

const handleView = (id: string) => emit('view', id)
const handleEdit = (id: string) => emit('edit', id)

const handleDelete = (enterpriseId: string) => {
  emit('delete', enterpriseId)
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
    <!-- Header -->
    <div class="flex items-center justify-between p-4 sm:p-6 border-b border-borderGray">
      <h2 class="text-black dark:text-white text-lg sm:text-xl lg:text-2xl font-semibold">
        {{ $t('enterprisesTable.tableHeader') }}
      </h2>
    </div>

    <!-- Table Header -->
    <div class="hidden lg:block bg-darkPink/50 border-borderGray">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-2 border-black dark:border-borderGray border-b text-black dark:text-white font-medium text-sm"
      >
        <div class="col-span-3">{{ $t('enterprisesTable.enterprise') }}</div>
        <div class="col-span-2">{{ $t('enterprisesTable.location') }}</div>
        <div class="col-span-3">{{ $t('enterprisesTable.businessSector') }}</div>
        <div class="col-span-1">{{ $t('enterprisesTable.activeJobs') }}</div>
        <div class="col-span-2">{{ $t('enterprisesTable.subscription') }}</div>
        <div class="col-span-1 text-center">{{ $t('enterprisesTable.actions') }}</div>
      </div>
    </div>

    <!-- Enterprises List -->
    <div class="divide-y divide-border-borderGray">
      <div v-if="props.loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-secondaryText mt-2">Loading enterprises...</p>
      </div>

      <div v-else-if="filteredEnterprises.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">No enterprises found</p>
      </div>

      <div v-else>
        <!-- Desktop -->
        <div class="hidden lg:block">
          <div
            v-for="enterprise in filteredEnterprises"
            :key="enterprise.enterpriseId"
            class="grid grid-cols-12 gap-4 px-4 py-2 border-b border-black dark:border-borderGray hover:bg-topBar/30 transition-colors duration-200 items-center"
          >
            <!-- Enterprise Column -->
            <div class="col-span-3 flex items-center space-x-3">
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
                  {{ enterprise.brand_name?.charAt(0).toUpperCase() || 'E' }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                  {{ enterprise.brand_name || 'Unnamed Enterprise' }}
                </h3>
                <p class="text-secondaryText text-xs truncate">{{ enterprise.email }}</p>
              </div>
            </div>

            <!-- Location -->
            <div class="col-span-2">
              <p class="text-secondaryText text-xs">
                {{ formatLocation(enterprise.businessLocation?.locationName) }}
              </p>
            </div>

            <!-- Business Sector -->
            <div class="col-span-3 relative">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="sector in (enterprise.businessSector || []).slice(0, maxVisibleSectors)"
                  :key="sector"
                  class="px-1 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                >
                  {{ getSectorLabel(sector) }}
                </span>
                <span
                  v-if="(enterprise.businessSector || []).length > maxVisibleSectors"
                  class="px-1 py-1 text-xs rounded-full bg-white dark:bg-black text-black dark:text-white cursor-pointer"
                  @click="toggleSectors(enterprise.enterpriseId)"
                >
                  {{
                    showSectorsMap[enterprise.enterpriseId]
                      ? '-' + ((enterprise.businessSector || []).length - maxVisibleSectors)
                      : '+' + ((enterprise.businessSector || []).length - maxVisibleSectors)
                  }}
                </span>
              </div>

              <div
                v-if="showSectorsMap[enterprise.enterpriseId]"
                class="absolute top-full left-0 mt-1 p-2 bg-label dark:bg-topBar border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 flex flex-wrap gap-1 w-max"
              >
                <span
                  v-for="sector in (enterprise.businessSector || []).slice(maxVisibleSectors)"
                  :key="sector"
                  class="px-1 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                >
                  {{ getSectorLabel(sector) }}
                </span>
              </div>
            </div>

            <!-- Active Jobs -->
            <div class="col-span-1">
              <span class="text-black dark:text-white text-sm">
                {{ enterprise.activeJobs }}
              </span>
            </div>

            <!-- Subscription -->
            <div class="col-span-2">
              <UserStatus :status="enterprise.subscription" type="subscription" />
            </div>

            <!-- Actions -->
            <div class="col-span-1 flex items-center justify-center space-x-1">
              <ActionButtonSet
                :item-id="enterprise.enterpriseId"
                :item-email="enterprise.email"
                :is-banned="enterprise.isBanned"
                :is-viewed="enterprise.isViewed"
                @ban="handleBan"
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </div>
        </div>

        <!-- Mobile -->
        <div class="lg:hidden">
          <div
            v-for="enterprise in filteredEnterprises"
            :key="enterprise.enterpriseId"
            class="p-4 hover:bg-topBar/30 transition-colors duration-200"
          >
            <div class="flex items-start space-x-3">
              <div
                class="w-12 h-12 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
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
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                      {{ enterprise.brand_name }}
                    </h3>
                    <p class="text-secondaryText text-xs truncate">{{ enterprise.email }}</p>
                  </div>
                  <UserStatus :status="enterprise.subscription" />
                </div>

                <div class="mt-2 space-y-1">
                  <p class="text-secondaryText text-xs">
                    {{ formatLocation(enterprise.businessLocation?.locationName) }}
                  </p>
                  <p class="text-black dark:text-white text-xs">
                    Active Jobs: <span class="font-semibold">{{ enterprise.activeJobs }}</span>
                  </p>

                  <div class="flex flex-wrap gap-1 mt-1 relative">
                    <span
                      v-for="sector in (enterprise.businessSector || []).slice(
                        0,
                        maxVisibleSectors,
                      )"
                      :key="sector"
                      class="px-2 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                    >
                      {{ getSectorLabel(sector) }}
                    </span>

                    <span
                      v-if="(enterprise.businessSector || []).length > maxVisibleSectors"
                      class="px-2 py-1 text-xs rounded-full bg-gray/20 text-black dark:text-white cursor-pointer"
                      @click="toggleSectors(enterprise.enterpriseId)"
                    >
                      {{
                        showSectorsMap[enterprise.enterpriseId]
                          ? '-' + ((enterprise.businessSector || []).length - maxVisibleSectors)
                          : '+' + ((enterprise.businessSector || []).length - maxVisibleSectors)
                      }}
                    </span>

                    <div
                      v-if="showSectorsMap[enterprise.enterpriseId]"
                      class="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 flex flex-wrap gap-1 w-max"
                    >
                      <span
                        v-for="sector in (enterprise.businessSector || []).slice(maxVisibleSectors)"
                        :key="sector"
                        class="px-2 py-1 text-xs rounded-full bg-label text-black dark:bg-black dark:text-white"
                      >
                        {{ getSectorLabel(sector) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-2 mt-3">
                  <ActionButtonSet
                    :item-id="enterprise.enterpriseId"
                    :is-banned="enterprise.isBanned"
                    :is-viewed="enterprise.isViewed"
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
