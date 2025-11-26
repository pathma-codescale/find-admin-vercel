<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  status: string
  type?: 'status' | 'subscription' | 'alertStatus'
}>()

const status = props.status
const type = props.type || 'status'
const dotClass = computed(() => {
  if (type === 'subscription') {
    switch (status.toLowerCase()) {
      case 'subscribed':
        return 'bg-success500'
      case 'expired':
        return 'bg-error500'
      case 'trial':
        return 'bg-warning-500'
      default:
        return 'bg-gray'
    }
  } else if (type === 'alertStatus') {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-success500'
      case 'draft':
        return 'bg-gray'
      default:
        return 'bg-gray'
    }
  }

  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-success500'
    case 'suspended':
    case 'inactive':
      return 'bg-error500'
    case 'flagged':
      return 'bg-flagged'
    default:
      return 'bg-gray'
  }
})

const statusClass = computed(() => {
  if (type === 'subscription') {
    switch (status.toLowerCase()) {
      case 'subscribed':
        return 'bg-successBg text-success500'
      case 'expired':
        return 'bg-errorBg text-error500'
      case 'trial':
        return 'bg-warning-100 text-warning-600'
      default:
        return 'bg-gray/20 text-gray'
    }
  } else if (type === 'alertStatus') {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-successBg text-success500'
      case 'draft':
        return 'bg-gray/20 text-gray'
      default:
        return 'bg-gray/20 text-gray'
    }
  }

  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-successBg text-success500'
    case 'suspended':
      return 'bg-errorBg text-error500'
    case 'flagged':
      return 'bg-flaggedBg text-flagged'
    default:
      return 'bg-gray/20 text-gray'
  }
})

const tStatus = computed(() => {
  let prefix

  switch (type) {
    case 'subscription':
      prefix = 'subscription'
      break
    case 'alertStatus':
      prefix = 'alertStatus'
      break
    default:
      prefix = 'status'
  }

  return t(`${prefix}.${status.toLowerCase()}`)
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full font-medium"
    :class="statusClass"
  >
    <span class="w-2 h-2 rounded-full" :class="dotClass"></span>
    {{ tStatus }}
  </span>
</template>
