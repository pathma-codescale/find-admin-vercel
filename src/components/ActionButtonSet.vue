<template>
  <div class="flex items-center justify-center">
    <ActionButton
      v-for="action in actions"
      :key="action.type"
      :icon="action.icon"
      :title="action.title"
      :is-active="action.isActive"
      :type="action.type"
      :color="action.color"
      :status="props.status"
      @click="() => handleAction(action.type)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ActionButton from './ActionButton.vue'
import banIcon from '@/assets/Dashboard/ban.svg?raw'
import eyeOpenIcon from '@/assets/Dashboard/eye.svg?raw'
import eyeOffIcon from '@/assets/Dashboard/eye-off.svg?raw'
import editIcon from '@/assets/Dashboard/edit.svg?raw'
import deleteIcon from '@/assets/Dashboard/bin.svg?raw'

interface Props {
  isBanned?: boolean
  isViewed?: boolean
  itemId: string
  itemEmail?: string
  entityType?: 'candidate' | 'admin' | 'enterprise'
  status?: 'active' | 'suspended' | 'flagged' | 'hidden'
}

const props = withDefaults(defineProps<Props>(), {
  isBanned: false,
  isViewed: false,
  entityType: 'candidate',
})

const emit = defineEmits<{
  ban: [email: string, id: string, isBanned: boolean]
  view: [id: string, isViewed: boolean]
  edit: [id: string]
  delete: [id: string]
  color?: string
}>()

// const actions = computed(() => [
//   {
//     type: 'ban' as const,
//     icon: banIcon,
//     title: props.isBanned ? 'Unban' : 'Ban',
//     isActive: props.isBanned
//   },
//   {
//     type: 'view' as const,
//     icon: props.isViewed ? eyeOffIcon : eyeOpenIcon,
//     title: props.isViewed ? 'Hide' : 'View',
//     isActive: props.isViewed
//   },
//   {
//     type: 'edit' as const,
//     icon: editIcon,
//     title: 'Edit',
//     isActive: false
//   },
//   {
//     type: 'delete' as const,
//     icon: deleteIcon,
//     title: 'Delete',
//     isActive: false
//   }
// ])

const actions = computed(() => [
  {
    type: 'ban' as const,
    icon: banIcon,
    title: props.isBanned ? 'Unban' : 'Ban',
    isActive: props.isBanned,
    color:
      props.status === 'suspended'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-gray-600 hover:bg-gray-700 text-white',
  },
  {
    type: 'view' as const,
    icon: props.isViewed ? eyeOffIcon : eyeOpenIcon,
    title: props.isViewed ? 'Hide' : 'View',
    isActive: props.isViewed,
    color: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
  {
    type: 'edit' as const,
    icon: editIcon,
    title: 'Edit',
    isActive: false,
    color: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
  {
    type: 'delete' as const,
    icon: deleteIcon,
    title: 'Delete',
    isActive: false,
    color: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
])

const handleAction = (type: 'ban' | 'view' | 'edit' | 'delete') => {
  switch (type) {
    case 'ban':
      emit('ban', props.itemEmail, props.itemId, !props.isBanned)
      break
    case 'view':
      emit('view', props.itemId, !props.isViewed)
      break
    case 'edit':
      emit('edit', props.itemId)
      break
    case 'delete':
      emit('delete', props.itemId)
      break
  }
}
</script>
