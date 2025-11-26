<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useI18n } from 'vue-i18n'

import FindLogo from '@/assets/find-logo.svg?url'
import DashboardIcon from '@/assets/Dashboard/home.svg?url'
import UsersIcon from '@/assets/Dashboard/users.svg?url'
import BriefcaseIcon from '@/assets/Dashboard/briefcaseWhite.svg?url'
import AlertCircleIcon from '@/assets/Dashboard/alert-circle.svg?url'
import ShieldIcon from '@/assets/Dashboard/shield.svg?url'
import SettingsIcon from '@/assets/Dashboard/settings.svg?url'
import BarChartIcon from '@/assets/Dashboard/analytics.svg?url'
import TrendingUpIcon from '@/assets/Dashboard/crashlytics.svg?url'
import LogOutIcon from '@/assets/Dashboard/logout.svg?url'
import GlobeIcon from '@/assets/Dashboard/globe.svg?url'
// import FileTextIcon from '@/assets/Dashboard/clipboard.svg?url'

import SidebarItem from '@/components/SideBarItem.vue'
import SidebarSubItem from '@/components/SidebarSubItem.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'

interface Props {
  defaultActive?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultActive: 'dashboard',
})

// const emit = defineEmits<{
//   logout?: []
// }>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const adminStore = useAuthStore()

const isSidebarOpen = ref(false)

const routeMap: Record<string, string> = {
  login: '/',
  dashboard: '/dashboard',
  // users: '/users',
  candidates: '/manage-users/candidates',
  enterprises: '/manage-users/enterprises',
  jobs: '/manage-jobs',
  alerts: '/manage-alerts',
  reports: '/reports',
  admins: '/manage-admins',
  settings: '/settings',
}

const getCurrentActiveItem = (): string => {
  const currentPath = route.path

  for (const [item, path] of Object.entries(routeMap)) {
    if (currentPath.startsWith(path)) {
      return item
    }
  }

  return props.defaultActive
}

const activeItem = ref(getCurrentActiveItem())
const submenuOpen = ref<string | null>('users')

onMounted(() => {
  activeItem.value = getCurrentActiveItem()
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const setActive = (item: string) => {
  activeItem.value = item
  const targetRoute = routeMap[item]

  if (targetRoute && !route.path.startsWith(targetRoute)) {
    router.push(targetRoute).catch((err) => {
      console.warn('Navigation error:', err)
    })
  }
}

const toggleSubmenu = (menu: string) => {
  if (submenuOpen.value === menu) {
    submenuOpen.value = null
  } else {
    submenuOpen.value = menu
    setActive(menu)
  }
}

const handleLogout = () => {
  adminStore.logout()
  router.push('/')

  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
}

const openFirebaseAnalytics = () => {
  setActive('firebase')
  window.open(import.meta.env.VITE_FIREBASE_ANALYTICS_URL, '_blank')
}

const openCrashAnalytics = () => {
  setActive('crash')
  window.open(import.meta.env.VITE_CRASH_ANALYTICS_URL, '_blank')
}
</script>

<style scoped>
/* Custom Scrollbar Styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
  margin: 8px 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #e91985 0%, #ff6b9d 100%);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #d01575 0%, #ff5a8c 100%);
}

/* Firefox scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #a70d57 transparent;
}

/* Smooth scrolling */
.custom-scrollbar {
  scroll-behavior: smooth;
}

/* Hide scrollbar when not hovering  */
.custom-scrollbar:not(:hover)::-webkit-scrollbar-thumb {
  background: rgba(233, 25, 133, 0.3);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>

<template>
  <div>
    <!-- Hamburger Button-->
    <button
      @click="toggleSidebar"
      class="fixed top-4 right-4 z-[9999] p-2 rounded-lg bg-white dark:bg-gray-800 border border-borderPrimary lg:hidden"
      aria-label="Toggle menu"
    >
      <svg
        class="w-6 h-6 text-gray-700 dark:text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <!-- Hamburger Icon -->
        <path
          v-if="!isSidebarOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <!-- Close Icon -->
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Overlay (visible when sidebar is open on sm/md screens) -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 w-full bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <div
      :class="[
        'fixed lg:fixed inset-y-0 left-0 z-50 h-screen flex flex-col justify-between bg-white dark:bg-gray-900 border-r border-borderPrimary transition-transform duration-300 ease-in-out',
        // Mobile
        isSidebarOpen
          ? 'translate-x-0 w-full lg:w-64'
          : '-translate-x-full lg:translate-x-0 lg:w-64',
      ]"
    >
      <!-- Top + Nav -->
      <div class="flex flex-col flex-1 min-h-0">
        <!-- Logo -->
        <div class="p-6 shrink-0">
          <img alt="Find logo" class="items-center pb-1" :src="FindLogo" width="90" height="125" />
          <h2 class="text-xl font-semibold pb-2 dark:text-white text-black">
            {{ t('leftPanel.dashboardTitle') }}
          </h2>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 space-y-2 overflow-y-auto overscroll-contain custom-scrollbar">
          <!-- Dashboard -->
          <SidebarItem
            :icon="DashboardIcon"
            :label="t('leftPanel.dashboard')"
            :active="activeItem === 'dashboard'"
            @click="setActive('dashboard')"
          />
          <div>
            <SidebarItem
              :icon="UsersIcon"
              :label="t('leftPanel.manageUsers')"
              :active="activeItem === 'users'"
              :has-submenu="true"
              :submenu-open="submenuOpen === 'users'"
              @click="toggleSubmenu('users')"
            />

            <!-- Submenu -->
            <div v-if="submenuOpen === 'users'" class="ml-6 mt-2 space-y-1">
              <SidebarSubItem
                :label="t('leftPanel.candidates')"
                :active="activeItem === 'candidates'"
                @click="setActive('candidates')"
              />
              <SidebarSubItem
                :label="t('leftPanel.enterprises')"
                :active="activeItem === 'enterprises'"
                @click="setActive('enterprises')"
              />
            </div>
          </div>

          <SidebarItem
            :icon="BriefcaseIcon"
            :label="t('leftPanel.manageJobs')"
            :active="activeItem === 'jobs'"
            @click="setActive('jobs')"
          />

          <SidebarItem
            :icon="AlertCircleIcon"
            :label="t('leftPanel.manageAlerts')"
            :active="activeItem === 'alerts'"
            @click="setActive('alerts')"
          />

          <!-- <SidebarItem
            :icon="FileTextIcon"
            :label="t('leftPanel.userReports')"
            :active="activeItem === 'reports'"
            @click="setActive('reports')"
          /> -->

          <SidebarItem
            :icon="ShieldIcon"
            :label="t('leftPanel.manageAdmins')"
            :active="activeItem === 'admins'"
            @click="setActive('admins')"
          />
        </nav>

        <!-- Bottom Section -->
        <div class="shrink-0">
          <div class="px-4 py-4 border-t border-borderPrimary space-y-2">
            <SidebarItem
              :icon="BarChartIcon"
              :label="t('leftPanel.firebaseAnalytics')"
              @click="openFirebaseAnalytics"
            />
            <SidebarItem
              :icon="TrendingUpIcon"
              :label="t('leftPanel.crashAnalytics')"
              @click="openCrashAnalytics"
            />

            <SidebarItem
              :icon="SettingsIcon"
              :label="t('leftPanel.settings')"
              :active="activeItem === 'settings'"
              @click="setActive('settings')"
            />

            <SidebarItem
              :icon="GlobeIcon"
              :label="t('leftPanel.language')"
              :active="activeItem === 'language'"
              @click="setActive('language')"
            >
              <LanguageToggle />
            </SidebarItem>
          </div>

          <div class="px-4 py-4 border-t border-borderPrimary">
            <SidebarItem
              :icon="LogOutIcon"
              :label="t('leftPanel.logout')"
              @click="handleLogout"
              class="hover:bg-error rounded-lg hover:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
