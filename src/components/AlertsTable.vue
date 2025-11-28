<script setup lang="ts">
import { ref, computed } from 'vue'
import ActionButtonSet from '@/components/ActionButtonSet.vue'
import UserStatus from '@/components/UserStatus.vue'
import { useI18n } from 'vue-i18n'

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

interface Props {
  alerts?: AlertData[]
  loading?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  alerts: () => [],
  loading: false,
  itemsPerPage: 10,
})

const emit = defineEmits<{
  ban: [alertId: string | number, isBanned: boolean]
  view: [alertId: string]
  edit: [alertId: string | number]
  delete: [alertId: string | number]
}>()

const { t } = useI18n()
const alertFilter = ref('')
const currentPage = ref(1)

const filteredAlerts = computed(() => {
  let filtered = props.alerts

  if (alertFilter.value) {
    filtered = filtered.filter((alert) => alert.alertStatus === alertFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredAlerts.value.length / props.itemsPerPage))

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredAlerts.value.slice(start, end)
})

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getChannels = (channels: string[]) => {
  return channels.map((channel) => {
    if (channel.toLowerCase() === 'email') return t('alertsTable.email')
    if (channel.toLowerCase() === 'notifications') return t('alertsTable.pushNotifications')
    return channel
  })
}

const handleBan = (alertId: string | number, isBanned: boolean) => {
  emit('ban', alertId, isBanned)
}

const handleView = (alertId: string) => {
  emit('view', alertId)
}

const handleEdit = (alertId: string | number) => {
  emit('edit', alertId)
}

const handleDelete = (alertId: string | number) => {
  emit('delete', alertId)
}
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-800 z-10 border border-borderGray rounded-xl overflow-hidden"
  >
    <!-- Header Section -->
    <div
      class="flex items-center bg-white dark:bg-gray-800 justify-between pl-4 px-2 py-1 sm:p-2 border-b border-borderGray"
    >
      <h2
        class="text-black dark:text-white text-md font-bold sm:text-lg ml-2 lg:text-lg font-semibold"
      >
        {{ $t('alertsTable.tableHeader') }}
      </h2>
      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Filter -->
        <select
          v-model="alertFilter"
          class="bg-lightCardBackground dark:bg-topBar text-black dark:text-white border border-border-borderGray rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>

    <div class="hidden lg:block border-borderGray">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-1 bg-darkPink/50 border-black dark:border-borderGray border-b text-black dark:text-white font-medium text-sm"
      >
        <div class="col-span-3">{{ $t('alertsTable.alert') }}</div>
        <div class="col-span-2">{{ $t('alertsTable.audience') }}</div>
        <div class="col-span-2">{{ $t('alertsTable.dateSent') }}</div>
        <div class="col-span-2">{{ $t('alertsTable.channels') }}</div>
        <div class="col-span-2">{{ $t('alertsTable.status') }}</div>
        <div class="col-span-1 text-center">{{ $t('alertsTable.actions') }}</div>
      </div>
    </div>

    <!-- Alerts List -->
    <div class="divide-y divide-border-borderGray">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-secondaryText mt-2">Loading alerts...</p>
      </div>

      <div v-else-if="filteredAlerts.length === 0" class="p-8 text-center">
        <p class="text-secondaryText">No alerts found</p>
      </div>

      <div v-else>
        <!-- Desktop View -->
        <div class="hidden lg:block">
          <div
            v-for="alert in paginatedAlerts"
            :key="alert.alertId"
            class="grid grid-cols-12 gap-4 px-4 py-2 border-b border-black dark:border-borderGray hover:bg-topBar/30 transition-colors duration-200 items-center"
          >
            <!-- Alert Column -->
            <div class="col-span-3 text-sm text-black dark:text-white flex items-center space-x-3">
              {{ alert.alertTitle }}
            </div>

            <!-- Location Column -->
            <div class="col-span-2">
              <p class="text-secondaryText text-xs">
                {{ alert.audience }}
              </p>
            </div>

            <!-- Business Sector Column -->
            <div class="col-span-2">
              <span class="text-black dark:text-secondaryText text-xs">
                {{ alert.dateSent ? formatDate(alert.dateSent) : '-' }}
              </span>
            </div>

            <!-- Active Jobs Column -->
            <div class="col-span-2 flex flex-col gap-1">
              <span
                v-for="(ch, idx) in getChannels(alert.channels)"
                :key="idx"
                class="px-1 py-1 text-xs rounded-full bg-white dark:bg-black text-black dark:text-white w-max"
              >
                {{ ch }}
              </span>
            </div>

            <!-- Subscription Column -->
            <div class="col-span-2">
              <UserStatus :status="alert.alertStatus" type="alertStatus" />
            </div>

            <!-- Actions Column -->
            <div class="col-span-1 flex items-center justify-center space-x-1">
              <ActionButtonSet
                :item-id="alert.alertId"
                :is-banned="alert.isBanned"
                :is-viewed="alert.isViewed"
                @ban="handleBan"
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t border-borderGray">
        <div class="text-black dark:text-white text-sm">
          {{
            $t('pagination.showing', {
              start: (currentPage - 1) * itemsPerPage + 1,
              total: totalPages,
            })
          }}
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
          >
            {{ $t('pagination.previous') }}
          </button>

          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 text-sm border border-black dark:border-borderGray rounded text-black dark:text-white disabled:text-secondaryText disabled:border-border-borderGray disabled:cursor-not-allowed hover:bg-topBar transition-colors"
          >
            {{ $t('pagination.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
