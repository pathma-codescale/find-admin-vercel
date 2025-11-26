<script lang="ts">
export default {
  name: 'ForgotPasswordLink',
  methods: {
    handleForgotPassword() {
      console.log('Forgot password clicked')

      this.$emit('forgot-password')
    },
  },
  emits: ['forgot-password'],
}
</script>

<template>
  <a
    href="#"
    @click.prevent="handleForgotPassword"
    class="text-sm text-white hover:text-pink-500 transition-colors font-semibold"
  >
    {{ $t('loginForm.forgotPassword') }}
  </a>
</template>
