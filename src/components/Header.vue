<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '@/assets/find-logo.svg?url'
import BackDark from '@/assets/header/arrow-left.svg?url'
import BackLight from '@/assets/header/arrow-left-light.svg?url'

const props = defineProps({
  style: String,
  back: Boolean,
  noLogo: Boolean,
  onPressBack: Function,
})

const router = useRouter()

const backPress = () => {
  if (props.onPressBack) {
    props.onPressBack()
  } else {
    router.back()
  }
}
</script>

<template>
  <header :class="['mb-8 mt-6 w-full flex flex-col items-center relative', style]">
    <div class="w-full max-w-md flex items-center justify-center relative">
      <button v-if="back" @click="backPress" class="absolute left-0">
        <img :src="BackDark" alt="Back" class="h-6 w-6" />
      </button>

      <div v-if="!noLogo" class="flex justify-center w-[100px] aspect-[65/40]">
        <img :src="Logo" alt="Logo" class="w-full h-full" />
      </div>
    </div>
  </header>
</template>
