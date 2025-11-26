<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    @click="handleClick"
  >
    <span v-if="$slots.default" class="mr-1.5">
      <slot />
    </span>

    <svg
      v-if="isLoading"
      class="animate-spin h-4 w-4 text-pink-500"
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
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>

    <span v-else-if="text" :class="textClass">{{ text }}</span>

    <span v-if="Icon && !isLoading" class="ml-2">
      <component :is="Icon" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  onClick: Function,
  text: String,
  disabled: { type: Boolean, default: false },
  variant: { type: String, default: 'contained' }, 
  className: { type: String, default: '' },
  textClassName: { type: String, default: '' },
  Icon: [Object, Function],
  isLoading: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  if (!props.disabled && !props.isLoading && props.onClick) {
    props.onClick(event);
    emit('click', event);
  }
};

const buttonClasses = computed(() => {
  const baseStyle =
    'w-full h-12 rounded-full flex items-center justify-center mb-2 transition-colors text-sm font-bold font-manrope';

  const variantStyles = {
    contained: 'bg-primary text-white hover:bg-primaryDark',
    outlined:
      'border border-borderLight text-black dark:text-white dark:hover:bg-borderPrimary hover:bg-borderLight',
    'no-border': 'bg-transparent text-gray-800 dark:text-white',
  };

  const disabledStyle =
    'bg-graniteGray text-lightGray cursor-not-allowed hover:bg-graniteGray';

  return [
    baseStyle,
    props.disabled || props.isLoading ? disabledStyle : variantStyles[props.variant],
    props.className,
  ].join(' ');
});

const textClass = computed(() => ['text-center', props.textClassName].join(' '));
</script>
