<script setup lang="ts">
import { ref, computed } from 'vue'
import ActionButtonSet from '@/components/ActionButtonSet.vue'
import UserStatus from '@/components/UserStatus.vue'
import Scroller from '@/components/Scroller.vue'
import { AdminTypes, adminTypes } from '@/types/constants'

interface adminData {
  id: string
  email: string
  profilePhotoUrl?: string
  name?: string
  phoneNumber?: string
  role?: string
  dateAdded: string
  status: string
  firstName?: string
  lastName?: string
  lastActiveDate: string
  isBanned?: boolean
  isViewed?: boolean
}

interface Props {
  admins?: adminData[]
  loading?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  admins: () => [],
  loading: false,
  itemsPerPage: 10,
})

const emit = defineEmits<{
  ban: [adminId: string, isBanned: boolean]
  view: [adminId: string | number]
  edit: [adminId: string | number]
  delete: [adminId: string]
}>()

const statusFilter = ref('')
const currentPage = ref(1)

const filteredadmins = computed(() => {
  let filtered = props.admins
  if (statusFilter.value) {
    filtered = filtered.filter((admin) => admin.status === statusFilter.value)
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredadmins.value.length / props.itemsPerPage))

const paginatedadmins = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredadmins.value.slice(start, end)
})

// const visiblePages = computed(() => {
//   const pages: number[] = []
//   const total = totalPages.value
//   const current = currentPage.value
//   if (total <= 7) {
//     for (let i = 1; i <= total; i++) pages.push(i)
//   } else {
//     if (current <= 4) {
//       for (let i = 1; i <= 5; i++) pages.push(i)
//       if (total > 5) pages.push(total)
//     } else if (current >= total - 3) {
//       pages.push(1)
//       for (let i = total - 4; i <= total; i++) if (i > 1) pages.push(i)
//     } else {
//       pages.push(1)
//       for (let i = current - 1; i <= current + 1; i++) if (i > 1 && i < total) pages.push(i)
//       pages.push(total)
//     }
//   }
//   return [...new Set(pages)].sort((a, b) => a - b)
// })

// const maxVisibleContracts = 3
// const toggleContracts = (adminId: string) => {
//   showContractsMap.value[adminId] = !showContractsMap.value[adminId]
// }

// const showContractsMap = ref<Record<string, boolean>>({})

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// const formatLocation = (locationName: string) => {
//   if (!locationName) return ''
//   const parts = locationName.split(',').map((p) => p.trim())
//   if (parts.length <= 2) return locationName
//   return `${parts[0]}, ${parts[1]}`
// }

const handleBan = (adminEmail: string, adminId: string, isBanned: boolean) => {
  emit('ban', adminId, isBanned)
}
const handleView = (adminId: string | number) => {
  emit('view', adminId)
}
const handleEdit = (adminId: string | number) => {
  emit('edit', adminId)
}
const handleDelete = (adminId: string) => {
  emit('delete', adminId)
}
</script>

<template>
  <div class="w-full border border-borderGray rounded-xl overflow-hidden">
    <div
      class="flex items-center justify-between p-4 sm:p-6 border-b border-borderGray sticky top-0 bg-white dark:bg-topBar z-20"
    >
      <h2 class="text-black dark:text-white text-lg sm:text-xl lg:text-2xl font-semibold">
        {{ $t('adminTable.tableHeader') }}
      </h2>
      <div class="flex items-center space-x-2 sm:space-x-4">
        <select
          v-model="statusFilter"
          class="bg-lightCardBackground dark:bg-topBar text-black dark:text-white border border-border-borderGray rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>

    <div class="hidden lg:block bg-darkPink/50 border-borderGray sticky top-[64px] z-10">
      <div
        class="grid grid-cols-12 gap-4 px-4 py-2 border-black dark:border-borderGray border-b text-black dark:text-white font-medium text-sm"
      >
        <div class="col-span-2">{{ $t('adminTable.tableHeader') }}</div>
        <div class="col-span-1">{{ $t('adminTable.role') }}</div>
        <div class="col-span-2">{{ $t('adminTable.dateAdded') }}</div>
        <div class="col-span-2">{{ $t('adminTable.lastActive') }}</div>
        <div class="col-span-2">{{ $t('adminTable.phoneNumber') }}</div>
        <div class="col-span-2">{{ $t('adminTable.status') }}</div>
        <div class="col-span-1 text-center">{{ $t('adminTable.actions') }}</div>
      </div>
    </div>

    <Scroller maxHeight="500px">
      <div class="divide-y divide-border-borderGray">
        <div v-if="loading" class="p-8 text-center">
          <div
            class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
          ></div>
          <p class="text-secondaryText mt-2">Loading admins...</p>
        </div>

        <div v-else-if="filteredadmins.length === 0" class="p-8 text-center">
          <p class="text-secondaryText">No admins found</p>
        </div>

        <div v-else>
          <div class="hidden lg:block">
            <div
              v-for="admin in paginatedadmins"
              :key="admin.id"
              class="grid grid-cols-12 gap-4 px-4 py-2 border-b border-black dark:border-borderGray hover:bg-topBar/30 transition-colors duration-200 items-center"
            >
              <div class="col-span-2 flex items-center space-x-1">
                <div
                  class="w-10 h-10 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="admin.profilePhotoUrl"
                    :src="admin.profilePhotoUrl"
                    :alt="admin.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-gray-100 font-bold text-sm">
                    {{ admin.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                    {{ admin.name }}
                  </h3>
                  <p class="text-secondaryText text-xs truncate">{{ admin.email }}</p>
                </div>
              </div>
              <div class="col-span-1">
                <span class="text-black dark:text-white text-xs">{{
                  adminTypes[admin.role as AdminTypes]
                }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-black dark:text-white text-xs">{{
                  formatDate(admin.dateAdded)
                }}</span>
              </div>
              <div class="col-span-2">
                <p class="text-secondaryText text-xs">{{ formatDate(admin.lastActiveDate) }}</p>
              </div>
              <div class="col-span-2">
                <span class="text-black dark:text-white text-xs">{{ admin.phoneNumber }}</span>
              </div>
              <div class="col-span-2">
                <UserStatus :status="admin.status" />
              </div>
              <div class="col-span-1 flex items-center justify-center space-x-1">
                <ActionButtonSet
                  :item-id="admin.email"
                  :is-banned="admin.isBanned"
                  :is-viewed="admin.isViewed"
                  @ban="handleBan"
                  @view="handleView"
                  @edit="handleEdit"
                  @delete="handleDelete"
                />
              </div>
            </div>
          </div>

          <div class="lg:hidden">
            <div
              v-for="admin in paginatedadmins"
              :key="admin.id"
              class="p-4 hover:bg-topBar/30 transition-colors duration-200"
            >
              <div class="flex items-start space-x-3">
                <div
                  class="w-12 h-12 rounded-full bg-topBar flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <img
                    v-if="admin.profilePhotoUrl"
                    :src="admin.profilePhotoUrl"
                    :alt="admin.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-gray-100 font-bold text-sm">
                    {{ admin.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 flex-1">
                      <h3 class="text-black dark:text-white font-semibold text-sm truncate">
                        {{ admin.name }}
                      </h3>
                      <p class="text-secondaryText text-xs truncate">{{ admin.email }}</p>
                    </div>
                    <UserStatus :status="admin.status" />
                  </div>
                  <div class="col-span-2">
                    <span class="text-black dark:text-white text-xs">{{
                      adminTypes[admin.role as AdminTypes]
                    }}</span>
                  </div>
                  <div class="mt-2 space-y-1">
                    <p class="text-secondaryText text-xs">{{ formatDate(admin.dateAdded) }}</p>
                    <p class="text-secondaryText text-xs">{{ formatDate(admin.lastActiveDate) }}</p>
                    <p class="text-secondaryText text-xs">{{ admin.phoneNumber }}</p>
                  </div>
                  <div class="flex items-center justify-end space-x-2 mt-3">
                    <ActionButtonSet
                      :item-id="admin.email"
                      :is-banned="admin.isBanned"
                      :is-viewed="admin.isViewed"
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
    </Scroller>

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
</template>
