<!-- eslint-disable vue/no-dupe-keys -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { storeToRefs } from 'pinia'
import { adminTypes } from '@/types/constants'
import type { AdminTypes } from '@/types/constants'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { t } = useI18n()
const route = useRoute()

const breadcrumbs = computed(
  () => (route.meta.breadcrumbs as { name: string; to?: string }[]) || [],
)

const title = computed(() =>
  breadcrumbs.value.length > 0
    ? t(`breadcrumbs.${breadcrumbs.value[0].name}`)
    : t('breadcrumbs.dashboard'),
)

const subtitle = computed(() =>
  breadcrumbs.value.length > 1 ? t(`breadcrumbs.${breadcrumbs.value[1].name}`) : '',
)

const initials = computed(() => {
  const fullName = user.value?.name ?? ''
  return fullName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('')
})
</script>

<template>
  <div
    class="flex flex-col md:flex-row items-center justify-between p-4 dark:text-white text-black shadow-md"
  >
    <div class="flex items-center gap-2 mb-3 md:mb-0">
      <h1 class="text-2xl sm:text-3xl font-bold dark:text-white text-black">{{ title }}</h1>
      <span class="text-lg sm:text-2xl font-semibold dark:text-white text-black">
        <span v-if="subtitle" class="text-lg sm:text-2xl font-semibold text-white">
          / {{ subtitle }}
        </span>
      </span>
    </div>

    <div class="flex items-center gap-3">
      <div class="text-right">
        <div class="text-sm sm:text-base font-medium">{{ user?.name }}</div>
        <div class="text-xs sm:text-sm text-primary font-medium">
          {{ adminTypes[user?.userType as AdminTypes] }}
        </div>
      </div>

      <div
        class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-topBar flex items-center justify-center overflow-hidden"
      >
        <img
          v-if="user?.profileImageUrl"
          :src="user?.profileImageUrl"
          :alt="user?.profileImageUrl"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-gray100 font-bold text-sm sm:text-lg">
          {{ initials }}
        </span>
      </div>
    </div>
  </div>
</template>
