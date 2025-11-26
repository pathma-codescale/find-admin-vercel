<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  maxHeight?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="overflow-y-auto custom-scrollbar"
    :style="{ maxHeight: props.maxHeight || '400px' }"
  >
    <slot />
  </div>
</template>

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

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #a70d57 transparent;
  scroll-behavior: smooth;
}
</style>
