<template>
  <div class="relative inline-block text-left w-80">
    <!-- Label -->
    <span class="block mb-1 text-sm font-normal text-black dark:text-white">
      Select Currency
    </span>

    <!-- Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center justify-between w-full h-12 px-4 border-2 rounded-full border-gray-300 dark:bg-gray-900 text-black dark:text-white bg-white focus:border-pink-500 focus:outline-none focus:drop-shadow-[0_0_10px_#F94DAF]"
    >
      <div class="flex items-center flex-1">
        <span class="text-lg font-semibold mr-3 min-w-[25px] text-center">
          {{ selectedCurrency.symbol }}
        </span>
        <div class="flex flex-col text-left">
          <span class="text-sm font-semibold">{{ selectedCurrency.value }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ selectedCurrency.label }}
          </span>
        </div>
      </div>
      <span class="ml-2 text-xs">▼</span>
    </button>

    <!-- Dropdown Menu -->
    <transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="absolute left-0 mt-2 w-full rounded-lg border border-gray-300 shadow-lg bg-white dark:bg-gray-900 z-50"
      >
        <div class="max-h-56 overflow-y-auto">
          <button
            v-for="item in sortedCurrencies"
            :key="item.value"
            @click="selectCurrency(item)"
            class="flex items-center justify-between w-full px-4 py-2 border-b border-gray-200 last:border-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center flex-1">
              <span class="text-lg font-semibold mr-3 min-w-[25px] text-center text-black dark:text-white">
                {{ item.symbol }}
              </span>
              <div class="flex flex-col text-left">
                <span class="text-sm font-semibold text-black dark:text-white">
                  {{ item.value }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ item.label }}
                </span>
              </div>
            </div>
            <span
              v-if="selectedCurrency.symbol === item.symbol"
              class="ml-2 text-base font-bold text-pink-500"
            >
              ✓
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const currencies = [
  { label: 'Euro', value: 'EUR', symbol: '€' },
  { label: 'US Dollar', value: 'USD', symbol: '$' },
  { label: 'Russian Ruble', value: 'RUB', symbol: '₽' },
  { label: 'Sri Lankan Rupee', value: 'LKR', symbol: 'Rs' },
  { label: 'Japanese Yen', value: 'JPY', symbol: '¥' }
]

const props = defineProps({
  modelValue: String,
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isDropdownOpen = ref(false)
const selectedCurrency = ref(
  currencies.find(c => c.symbol === props.modelValue) || currencies[1]
)

watch(
  () => props.modelValue,
  newVal => {
    const match = currencies.find(c => c.symbol === newVal)
    if (match) selectedCurrency.value = match
  }
)

const sortedCurrencies = computed(() =>
  [...currencies].sort((a, b) => a.label.localeCompare(b.label))
)

function selectCurrency(currency) {
  selectedCurrency.value = currency
  emit('update:modelValue', currency.symbol)
  isDropdownOpen.value = false
}

function toggleDropdown() {
  if (!props.disabled) {
    isDropdownOpen.value = !isDropdownOpen.value
  }
}


// Close dropdown on outside click
function handleClickOutside(e) {
  const el = document.querySelector('.relative.inline-block')
  if (el && !el.contains(e.target)) isDropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
