<template>
  <!-- <button :class="['action-button gap-1 rounded-lg transition-all', `action-${type}`, { 'is-active': isActive }]"
        :title="title" @click="$emit('click')" v-html="icon">
    </button> -->
  <button
    :class="[
      'action-button gap-1 rounded-lg transition-all',
      `action-${type}`,
      { 'is-active': isActive, 'is-suspended': type === 'ban' && status === 'suspended' },
    ]"
    :title="title"
    @click="$emit('click')"
    v-html="icon"
  ></button>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title?: string
  isActive?: boolean
  type: 'ban' | 'view' | 'edit' | 'delete'
  status?: 'active' | 'suspended' | 'flagged' | 'hidden'
}

const props = defineProps<Props>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
/* .action-button :deep(svg) {
    width: 1.25rem;
    height: 1.25rem;
} */

.action-button :deep(svg path) {
  fill: none;
  transition: stroke 0.2s ease;
}

/* Default state */
.action-button :deep(svg path) {
  stroke: #9ca3af;
  /* gray-400 */
}

/* Ban button */
.action-ban.is-active :deep(svg path) {
  stroke: #ef4444;
  /* red-500 */
}

.action-ban:hover :deep(svg path) {
  stroke: #ffffff;
}

/* View button */
.action-view:hover :deep(svg path) {
  stroke: #ffffff;
}

/* Edit button */
.action-edit:hover :deep(svg path) {
  stroke: #10b981;
  /* green-500 */
}

/* Delete button */
.action-delete:hover :deep(svg path) {
  stroke: #ef4444;
  /* red-500 */
}

/* Ban button suspended state */
.action-ban.is-suspended :deep(svg path) {
    stroke: #EF4444; /* red-500 */
}

.action-ban.is-suspended:hover :deep(svg path) {
    stroke: #FFFFFF;
}
</style>
