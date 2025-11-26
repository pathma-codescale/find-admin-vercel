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
        {{ $t(`resetSuccess.title`) }}
      </h2>
      <p class="text-sm">
        {{ $t(`resetSuccess.body`) }}
      </p>

      <div class="pt-2">
        <Button
          :text="$t('resetSuccess.buttonTest')"
          variant="contained"
          class="w-full max-w-full justify-self-center"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Button from '../components/Button.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
