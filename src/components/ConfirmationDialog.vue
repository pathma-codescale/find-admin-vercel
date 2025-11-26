<!-- ConfirmDialog.vue -->
<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button @click="confirm">Yes</button>
      <button @click="cancel">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  title: String,
  message: String
})

const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => emit('confirm')
const cancel = () => emit('cancel')
</script>

<style>
/* simple styling for modal backdrop and modal box */
.modal-backdrop { /* dark transparent overlay */ }
.modal { /* box with padding, border-radius */ }
</style>
