<template>
  <div @click="handlePress" :class="containerClasses">
    <LensIcon class="h-4 w-4" />
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="!editable"
      @input="handleInput"
      @blur="onEndEditing"
      class="placeholder-gray-500 w-full bg-transparent text-sm text-black outline-none dark:text-white"
      v-bind="$attrs"
    />
    <div v-if="rightIcon" class="absolute right-3">
      <component :is="rightIcon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import LensIcon from '@/assets/lens.svg'

interface SearchProps {
  className?: string
  placeholder?: string
  modelValue?: string
  editable?: boolean
  rightIcon?: Component
}

interface SearchEmits {
  'update:modelValue': [value: string]
  'end-editing': []
  press: []
}

const props = withDefaults(defineProps<SearchProps>(), {
  placeholder: 'Rechercher...',
  modelValue: '',
  editable: true,
  className: '',
})

const emit = defineEmits<SearchEmits>()

const inputRef = ref<HTMLInputElement>()

const containerClasses = computed(() => {
  const baseClasses =
    'relative mb-2 flex h-10 items-center gap-2 rounded-full border border-borderPrimary bg-white px-4 pr-10 dark:bg-background cursor-pointer'
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const handlePress = () => {
  emit('press')
  inputRef.value?.focus()
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const onEndEditing = () => {
  emit('end-editing')
}

defineOptions({
  inheritAttrs: false,
})
</script>
