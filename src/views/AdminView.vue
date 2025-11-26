<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/store/admin/useAdminStore'
import { useI18n } from 'vue-i18n'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import AdminsTable from '@/components/AdminTable.vue'
import SweetAlert from '@/utils/sweetAlert'

const router = useRouter()
const adminStore = useAdminStore()
const { admins, loading } = storeToRefs(adminStore)
const { t } = useI18n()

interface AdminData {
  id: string
  email: string
  profilePhotoUrl?: string
  name?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  role?: string
  dateAdded?: string

  lastActiveDate?: string
  status?: string
  isBanned?: boolean
  isViewed?: boolean
}

const adminsData = ref<AdminData[]>([])

onMounted(async () => {
  await adminStore.getAllAdmins()
})

const mappedAdmins = computed<AdminData[]>(() => {
  return admins.value.map((e) => ({
    id: e.sub,
    email: e.email,
    profilePhotoUrl: e.profileImageUrl,
    name: e.name,
    phoneNumber: e.phoneNumber || '',
    status: e.status || 'active',
    dateAdded: e.createdAt || '',
    role: e.userType || 'admin',
    lastActiveDate: e.lastLoginAt || '',
    isBanned: e.enabled === false,
  }))
})
const searchQuery = ref('')

const filteredAdmins = computed(() => {
  if (!searchQuery.value) {
    return mappedAdmins.value
  }

  const query = searchQuery.value.toLowerCase()
  return mappedAdmins.value.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(query) || admin.email.toLowerCase().includes(query),
  )
})

const addNewAdmin = () => {
  router.push('/manage-admins/create')
}

onMounted(() => {
  setTimeout(() => {
    adminsData.value = mappedAdmins.value
  }, 1000)
})

const handleBanAdmin = async (adminId: string, isBanned: boolean) => {
  console.log(`Admin ${adminId} ban status changed to:`, isBanned)
  try {
    const isSuspending = isBanned

    const actionText = isSuspending ? 'Suspend' : 'Activate'
    const confirmText = isSuspending
      ? t('admin.confirm.suspendAccount')
      : t('admin.confirm.reactivateAccount')

    const result = await SweetAlert.confirm(
      `${actionText} Account`,
      confirmText,
      t('common.yes'),
      t('common.cancel'),
    )

    if (!result.isConfirmed) return

    const email = adminId
    // const adminId = adminsData.value.Id

    if (!email || !adminId) {
      SweetAlert.error('Missing Data', 'Enterprise email or ID is missing.')
      return
    }
    SweetAlert.loading(t('alerts.loading.updatingAdmin'), t('alerts.loading.pleaseWait'))

    if (isSuspending) {
      await adminStore.disableAdmin(email)
      isBanned = true
      // formData.status = 'suspended'
    } else {
      await adminStore.enableAdmin(email)
      isBanned = false
      // formData.status = 'ACTIVE'
    }

    // formData.isAccountSuspended = isSuspending
    // formData.status = isSuspending ? 'suspended' : 'active'
    const adminIndex = adminsData.value.findIndex((admin) => admin.id === adminId)
    if (adminIndex !== -1) {
      adminsData.value[adminIndex].isBanned = isBanned
    }
    await adminStore.getAllAdmins()
    setTimeout(() => {
      adminsData.value = mappedAdmins.value
    }, 1000)
    SweetAlert.success(
      t('common.success'),
      isSuspending ? t('alerts.success.accountSuspended') : t('alerts.success.accountReactivated'),
    )
  } catch (err) {
    console.error('Error toggling suspension:', err)
    SweetAlert.error(t('common.error'), t('admin.alerts.suspendFailed'))
  }
}

const handleViewAdmin = (adminId: string | number) => {
  router.push({
    path: `/manage-admins/viewAdmin/${adminId}`,
  })
}

const handleEditAdmin = (adminId: string | number) => {
  console.log(`Edit admin ${adminId}`)
  router.push(`/manage-admins/editAdmin/${adminId}`)
}

const confirmDeleteAccount = async (adminId: string) => {
  const result = await SweetAlert.confirm(
    t('admin.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete this admin account. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
  )

  if (finalConfirm.isConfirmed) {
    await handleDeleteAdmin(adminId)
  }
}

const handleDeleteAdmin = async (adminId: string) => {
  if (!adminId) {
    SweetAlert.error(t('common.error'), 'Admin ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))

    await adminStore.deleteAdmin(adminId)

    await adminStore.getAllAdmins()
    setTimeout(() => {
      adminsData.value = mappedAdmins.value
    }, 1000)
    SweetAlert.success(t('common.success'), 'Account deleted successfully!')
  } catch (error: unknown) {
    SweetAlert.error(t('common.error'), 'Failed to delete account.')
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div class="w-full mb-2">
        <DashboardHeader class="border-l border-r border-b border-borderPrimary" />
      </div>

      <div class="flex-1 p-6">
        <!-- Search and Actions Bar -->
        <div
          class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0"
        >
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for Admins"
              class="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <button
              @click="addNewAdmin"
              class="flex items-center px-4 py-2 bg-primary hover:bg-primaryDark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Add Admin
            </button>
          </div>
        </div>

        <!-- Admins Table -->
        <AdminsTable
          :admins="filteredAdmins"
          :loading="loading"
          :items-per-page="15"
          @ban="handleBanAdmin"
          @view="handleViewAdmin"
          @edit="handleEditAdmin"
          @delete="confirmDeleteAccount"
        />
      </div>

      <div class="flex-1 p-4">
        <RouterView />
      </div>
    </div>
  </div>
</template>
