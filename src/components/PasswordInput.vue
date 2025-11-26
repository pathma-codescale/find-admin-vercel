<script setup>
import { ref, computed, watch } from 'vue'
import EyeOpen from '@/assets/eye.svg?url'
import EyeClosed from '@/assets/eye-off.svg?url'

const props = defineProps({
  modelValue: { type: String, default: '' },
  mainLabel: String,
  label: String,
  validation: RegExp,
  placeholder: { type: String, default: '' },
  editable: { type: Boolean, default: true },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const value = ref(props.modelValue)
const secureView = ref(true)
const isFocused = ref(false)
const isTouched = ref(false)

watch(
  () => props.modelValue,
  (val) => (value.value = val),
)

const toggleSecure = () => {
  if (props.editable) secureView.value = !secureView.value
}

const hasRequiredError = computed(() => props.required && !value.value && isTouched.value)

const hasValidationError = computed(
  () =>
    props.validation &&
    value.value.length > 0 &&
    !props.validation.test(value.value) &&
    isTouched.value,
)

const isDisabled = computed(() => !props.editable)

const inputClasses = computed(() => [
  'h-12 w-full rounded-full border-2 bg-transparent px-4 py-3 focus:border-primary focus:outline-none focus:drop-shadow-[0_0_10px_#F94DAF]',
  {
    'border-borderPrimary text-black dark:text-white':
      !hasRequiredError.value && !hasValidationError.value && props.editable,
    'border-error text-error':
      (hasRequiredError.value || hasValidationError.value) && props.editable,
    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border-borderPrimary dark:border-borderPrimary':
      !props.editable,
  },
])
</script>

<template>
  <div class="relative w-full space-y-2">
    <label
      v-if="mainLabel"
      class="text-sm font-medium text-black dark:text-label"
      :class="{ 'opacity-50': !editable }"
    >
      {{ mainLabel }}
    </label>

    <div class="relative w-full">
      <input
        v-model="value"
        :type="secureView ? 'password' : 'text'"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :readonly="!editable"
        @input="emit('update:modelValue', value)"
        @focus="editable && (isFocused = true)"
        @blur="
          () => {
            if (editable) {
              isFocused = false
              isTouched = true
            }
          }
        "
        :class="inputClasses"
      />

      <button
        v-if="value"
        type="button"
        @click="toggleSecure"
        :disabled="!editable"
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <img
          :src="secureView ? EyeOpen : EyeClosed"
          class="h-5 w-5"
          alt="toggle password visibility"
        />
      </button>
    </div>

    <p v-if="editable && isTouched && hasRequiredError" class="mt-1 text-xs text-error">
      Required field
    </p>
    <p
      v-else-if="editable && isTouched && hasValidationError && !hasRequiredError"
      class="mt-1 text-xs text-error"
    >
      Invalid password
    </p>
  </div>
</template>
