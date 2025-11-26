<template>
  <button
    type="submit"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="w-full h-12 rounded-full flex items-center justify-center mb-2 transition-colors text-sm font-bold font-manrope"
  >
    <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
      <svg
        class="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    {{ loading ? t('loginForm.loginIn') : t('loginForm.login') }}
  </button>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'SubmitButton',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()

    const buttonClasses = computed(() => ({
      'bg-pink-600 hover:bg-pink-700': !props.disabled && !props.loading,
      'bg-pink-400 cursor-not-allowed': props.disabled || props.loading,
    }))

    return {
      t,
      buttonClasses,
    }
  },
}
</script>
