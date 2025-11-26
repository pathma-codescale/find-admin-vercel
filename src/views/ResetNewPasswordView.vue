<template>
  <div class="min-h-screen bg-white px-4 py-6 text-black dark:bg-background dark:text-white">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-pink-600 opacity-50 blur-[110px]"
    />

    <div class="m-32">
      <Header :back="true" />
    </div>

    <div class="mx-auto max-w-md space-y-6">
      <h2 class="text-2xl font-semibold">
        {{ $t('createNewPassword.title') }}
      </h2>
      <p class="text-sm">
        {{ $t('createNewPassword.body') }}
      </p>

      <PasswordInput
        :main-label="$t('createNewPassword.newPassword')"
        name="new-password"
        :placeholder="$t('createNewPassword.placeHolder')"
        v-model="password"
      />

      <PasswordInput
        :main-label="$t('createNewPassword.confirmPassword')"
        name="confirm-password"
        :placeholder="$t('createNewPassword.placeHolder')"
        v-model="confirmPassword"
      />

      <div class="pt-2">
        <Button
          :text="loading ? $t('createNewPassword.loading') : $t('createNewPassword.buttonText')"
          variant="contained"
          class="w-full max-w-full justify-self-center"
          :disabled="loading"
          @click="handleSubmit"
        />
      </div>

      <p v-if="message" class="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue'
import Button from '../components/Button.vue'
import PasswordInput from '../components/PasswordInput.vue'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSeekerStore } from '@/store/seeker/useSeekerStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useSeekerStore()

// local state
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const loading = ref(false)

// extract token from URL (?token=xyz)
const token = route.query.token as string | undefined

const handleSubmit = async () => {
  if (!token) {
    message.value = t('createNewPassword.invalidToken') || 'Invalid token'
    return
  }

  if (!password.value || !confirmPassword.value) {
    message.value = t('createNewPassword.fillAllFields') || 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    message.value = t('createNewPassword.mismatch') || 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    message.value = ''

    const res = await store.resetCandidatePassword({
      token,
      newPassword: password.value,
    })

    message.value = res?.message || t('createNewPassword.success')

    setTimeout(() => {
      window.location.href = 'https://find-web-one.vercel.app/en'
    }, 2000)
  } catch (err: any) {
    console.error(err)
    message.value = err.response?.data?.message || t('createNewPassword.error')
  } finally {
    loading.value = false
  }
}
</script>
