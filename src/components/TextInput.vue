<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: String,
  mainLabel: String,
  showTick: { type: Boolean, default: false },
  rightText: String,
  type: { type: String, default: 'text' },
  maxLength: Number,
  placeholder: String,
  isTransparent: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
  className: String,
  validation: RegExp,
  restriction: RegExp,
  disable: Boolean,
  editable: { type: Boolean, default: true },
  error: String,
  required: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'validationChange'])

const value = ref(props.modelValue)
const isFocused = ref(false)
const touched = ref(false)
const err = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    value.value = val
  }
)

watch(value, (val) => {
  if (!props.restriction || props.restriction.test(val)) {
    const isValid =
      (!props.validation || props.validation.test(val)) &&
      (props.required ? val.trim() !== '' : true)

    const hasError = props.required
      ? val.trim() === '' || (props.validation ? !props.validation.test(val) : false)
      : props.validation
      ? val.trim() !== '' && !props.validation.test(val)
      : false

    err.value = hasError

    emit('update:modelValue', val)
    emit('validationChange', { isValid, value: val })
  }
})

const isDisabled = computed(() => props.disable || !props.editable)

const inputClasses = computed(() => [
  'h-12 w-full px-4 py-3 rounded-full bg-transparent border-2 focus:border-primary focus:outline-none focus:drop-shadow-[0_0_10px_#F94DAF]',
  {
    'border-borderPrimary text-black dark:text-white': !isDisabled.value && (!touched.value || !err.value),
    'border-error text-error': !isDisabled.value && touched.value && err.value,
    'bg-primary': !props.isTransparent,
    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed': !props.editable,
    'disabled:text-label border-borderPrimary dark:border-borderPrimary dark:bg-transparent': isDisabled.value,
  },
  props.className,
])

const displayError = computed(() => {
  if (props.error) return props.error
  if (touched.value && err.value && props.editable) {
    if (props.required && !value.value.trim()) {
      return 'Required field'
    } else {
      return 'Invalid value'
    }
  }
  return ''
})
</script>

<template>
  <div class="w-full space-y-2">
    <!-- Main label / Tick -->
    <div v-if="mainLabel || showTick" class="flex items-center gap-2">
      <div v-if="showTick" class="flex h-5 w-4 items-center justify-center rounded-sm border border-white bg-primary">
        <!-- you can slot an icon here -->
        <slot name="icon"></slot>
      </div>
      <label
        v-if="mainLabel"
        class="text-sm font-medium text-black dark:text-label"
        :class="{ 'opacity-50': !editable }"
      >
        {{ mainLabel }}
      </label>
    </div>

    <!-- Input field -->
    <div class="relative w-full">
      <label
        v-if="!hideLabel"
        class="absolute left-4 top-2 text-xs transition-all duration-150"
        :class="{
          '-translate-y-4 scale-90 text-label': isFocused || value,
          'text-placeholderColor': !isFocused && !value,
          'opacity-50': !editable,
          'cursor-pointer': editable,
          'cursor-not-allowed': !editable,
        }"
        @click="editable && $refs.inputRef.focus()"
      >
        {{ label }}
      </label>

      <input
        ref="inputRef"
        v-model="value"
        :type="type"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :readonly="!editable"
        @focus="editable && (isFocused = true)"
        @blur="() => { if (editable) { isFocused = false; touched = true } }"
        :maxlength="maxLength"
        :class="[inputClasses, 'py-2 text-sm text-black dark:text-label']"
      />

      <!-- Right text -->
      <span
        v-if="rightText && value"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-placeholderColor"
        :class="{ 'opacity-50': !editable }"
      >
        {{ rightText }}
      </span>

      <!-- Max length counter -->
      <span
        v-if="maxLength"
        class="absolute bottom-1 right-4 text-xs text-placeholderColor"
        :class="{ 'opacity-50': !editable }"
      >
        {{ value.length }}/{{ maxLength }}
      </span>
    </div>

    <!-- Error message -->
    <p v-if="editable && displayError" class="mt-1 text-xs text-error">
      {{ displayError }}
    </p>
  </div>
</template>
