<template>
  <button 
    :class="[
      'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200',
      'dark:text-white text-black text-sm',
      active ? 'bg-primaryLight/30 dark:bg-primaryDark/30 px-4 py-2 pl-6 text-primary font-medium' : 'hover:bg-gray-700/30 dark:hover:bg-gray-700/30'
    ]"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>