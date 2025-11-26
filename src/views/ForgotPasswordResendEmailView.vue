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
           {{ $t(`resendEmail.title`) }}
      </h2>
      <p class="text-sm">
            {{ $t(`resendEmail.body`) }}
      </p>

    <div class="pt-2 text-sm">
  <span> {{ $t(`resendEmail.notReceive`) }} </span>
  <button
    class="font-bold text-primary hover:underline"
    @click="resendEmail"
  >
    {{ $t(`resendEmail.linkText`) }}
  </button>
</div>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '../components/Header.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
</script>

