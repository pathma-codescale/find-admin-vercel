<template>
  <div class="bg-background py-8 px-6 shadow-sm rounded-lg sm:px-10">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <h2 class="text-left font-semibold text-xl text-white mb-6">{{ $t('loginForm.login') }}</h2>

      <InputField
        v-model="email"
        type="email"
        :label="$t('loginForm.email')"
        :placeholder="'email@email.com'"
        required
      />

      <InputField
        v-model="password"
        type="password"
        :label="$t('loginForm.password')"
        :placeholder="$t('loginForm.passwordPlaceholder')"
        required
      />

      <div class="text-left">
        <ForgotPasswordLink />
      </div>

      <!-- <SubmitButton :loading="false" :disabled="false" /> -->
      <SubmitButton :loading="authStore.loading" :disabled="authStore.loading" />
    </form>
  </div>
</template>

<!-- <script lang="ts">
import { ref } from 'vue'
import InputField from './InputField.vue'
import ForgotPasswordLink from './ForgotPasswordLink.vue'
import SubmitButton from './SubmitButton.vue'
import router from '@/router'

export default {
  name: 'LoginForm',
  components: {
    InputField,
    ForgotPasswordLink,
    SubmitButton,
  },
  setup() {
    // const authStore = useAuthStore()
    const email = ref('')
    const password = ref('')
    const errors = ref({})

    // const isFormValid = computed(() => {
    //   return email.value && password.value && !errors.value.email && !errors.value.password
    // })

    const validateForm = () => {
      errors.value = {}

      // if (!email.value) {
      //   errors.value.email = 'Email is required'
      // } else if (!/\S+@\S+\.\S+/.test(email.value)) {
      //   errors.value.email = 'Email is invalid'
      // }

      // if (!password.value) {
      //   errors.value.password = 'Password is required'
      // } else if (password.value.length < 6) {
      //   errors.value.password = 'Password must be at least 6 characters'
      // }

      return Object.keys(errors.value).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      try {
        // await authStore.login({
        //   email: email.value,
        //   password: password.value
        // })
        router.push('/dashboard')
      } catch (error) {
        console.error('Login failed:', error)
      }
    }

    return {
      // authStore,
      email,
      password,
      errors,
      // isFormValid,
      handleSubmit,
    }
  },
}
</script> -->

<script lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth/useAuthStore'

import InputField from './InputField.vue'
import ForgotPasswordLink from './ForgotPasswordLink.vue'
import SubmitButton from './SubmitButton.vue'
import router from '@/router'

export default {
  name: 'LoginForm',
  components: {
    InputField,
    ForgotPasswordLink,
    SubmitButton,
  },
  setup() {
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const errors = ref({})

    const validateForm = () => {
      errors.value = {}
      return true
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      const success = await authStore.login(email.value, password.value)

      if (success) {
        router.push('/dashboard')
      } else {
        console.error('Login failed:', authStore.error)
      }
    }

    return {
      authStore,
      email,
      password,
      errors,
      handleSubmit,
    }
  },
}
</script>
