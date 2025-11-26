<template>
  <div>
    <button 
      :class="[
        'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200',
        'dark:text-white text-black',
        active ? 'bg-primaryLight dark:bg-darkPink text-black dark:text-white' : 'hover:bg-gray-700/30 dark:hover:bg-gray-700/50'
      ]"
      @click="handleClick"
    >
      <div class="flex items-center space-x-3">
        <img :src="icon" class="w-5 h-5" alt="" />
        <span class="font-medium">{{ label }}</span>
      </div>
      <img 
        v-if="hasSubmenu" 
        :src="chevronUp"
        :class="[
          'w-4 h-4 transition-transform duration-200',
          submenuOpen ? 'rotate-180' : 'rotate-0'
        ]"
        alt=""
      />
       <slot></slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import chevronUp from '@/assets/Dashboard/chevron-up.svg?url'

interface Props {
  icon: string
  label: string
  active?: boolean
  hasSubmenu?: boolean
  submenuOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  hasSubmenu: false,
  submenuOpen: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>