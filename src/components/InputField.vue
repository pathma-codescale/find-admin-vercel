<script lang="ts">
import { computed } from 'vue'

export default {
  name: 'InputField',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props) {
    const id = computed(() => props.label.toLowerCase().replace(/\s+/g, '-'))

    const inputClasses = computed(() => ({
      'border-red-300': props.error,
      'border-gray-300': !props.error,
    }))

    return {
      id,
      inputClasses,
    }
  },
}
</script>

<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-200 mb-2">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses"
      class="'h-12 w-full px-4 py-3 rounded-full bg-transparent border-2 focus:border-primary focus:outline-none focus:drop-shadow-[0_0_10px_#F94DAF]'"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
