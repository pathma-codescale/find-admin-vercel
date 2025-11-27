<script setup lang="ts">
import { computed } from 'vue'

import ActionButtonSet from '@/components/ActionButtonSet.vue'

interface Location {
  locationName?: string
}

interface Props {
  id: string
  jobTitle?: string
  company?: string
  location?: Location
  date?: string | Date
  image?: string
  isBanned?: boolean
  isViewed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isBanned: false,
  isViewed: false,
})

const emit = defineEmits<{
  ban: [id: string, isBanned: boolean]
  view: [id: string | number, isViewed: boolean]
  edit: [id: string | number]
  delete: [id: string]
}>()

const avatarLetter = computed(() => (props.company?.charAt(0) ?? '').toUpperCase())

const formattedDate = computed(() => {
  const date = new Date(props.date ? props.date : new Date())
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const formatLocation = (locationName: string) => {
  if (!locationName) return ''
  const parts = locationName.split(',').map((p) => p.trim())
  if (parts.length <= 2) return locationName
  return `${parts[0]}, ${parts[1]}\n${parts.slice(2).join(', ')}`
}

const handleBan = (id: string, isBanned: boolean) => {
  emit('ban', id, isBanned)
}

const handleView = (id: string | number, isViewed: boolean) => {
  emit('view', id, isViewed)
}

const handleEdit = (id: string | number) => {
  emit('edit', id)
}

const handleDelete = (id: string) => {
  emit('delete', id)
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 border border-white rounded-lg px-4 hover:border-black/30 hover:dark:border-white/30 transition-all duration-200 mb-2"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4 flex-1 min-w-0">
        <div
          class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-topBar flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="props.image"
            :src="props.image"
            :alt="props.company"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-gray100 font-bold text-xs sm:text-lg">
            {{ avatarLetter }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-white font-semibold text-base text-sm truncate">
            {{ props.jobTitle }}
          </h3>
          <p class="text-secondaryText text-sm truncate">
            {{ $t('Dashboard.jobsTable.by') }} {{ props.company }}
          </p>
        </div>
      </div>

      <div class="hidden md:flex px-4 flex-shrink-0 flex-1">
        <div class="hidden md:flex px-4 flex-shrink-0 items-start justify-start">
          <p class="text-secondaryText text-xs whitespace-pre-line text-left">
            {{ formatLocation(props?.location?.locationName ? props?.location.locationName : '') }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3 sm:space-x-4 flex-1 flex-shrink-0">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-white text-xs font-medium">{{ formattedDate }}</span>
        </div>

        <div class="flex items-center flex-1 space-x-2 justify-end">
          <ActionButtonSet
            :item-id="props.id"
            :is-banned="props.isBanned"
            :is-viewed="props.isViewed"
            @ban="handleBan"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- small screen TODO -->
    <div class="md:hidden mt-3 pt-3 border-t border-white">
      <p class="text-secondaryText text-xs whitespace-pre-line text-left">
        {{ formatLocation(props?.location?.locationName ? props?.location.locationName : '') }}
      </p>
      <p class="text-secondaryText text-xs mt-1 sm:hidden">{{ formattedDate }}</p>
    </div>
  </div>
</template>
