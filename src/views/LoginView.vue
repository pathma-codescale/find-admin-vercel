<script setup lang="ts">
import AppLogo from '../components/AppLogo.vue'
import LoginForm from '../components/LoginForm.vue'
</script>

<template>
  <div
    class="min-h-screen px-4 py-6 bg-background w-screen flex flex-col items-center justify-center relative overflow-hidden"
  >
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <AppLogo />
      <LoginForm />
    </div>
  </div>
</template>