<template>
  <div class="relative">
    <!-- Main Input/Button -->
    <div
      @click="toggleDropdown"
      :class="[
        'w-full px-3 py-2 border rounded-md cursor-pointer flex justify-between items-center transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary',
        inputClass,
      ]"
      :style="{ backgroundColor: backgroundColor, borderColor: borderColor }"
    >
      <span :class="selectedItems.length === 0 ? 'text-gray-400' : 'text-white'">
        {{ displayText }}
      </span>
      <svg
        :class="['w-5 h-5 transition-transform', dropdownOpen ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen"
      :class="[
        'absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto',
        dropdownClass,
      ]"
      :style="{ backgroundColor: dropdownBackgroundColor, borderColor: borderColor }"
    >
      <!-- Search input -->
      <div v-if="searchable" class="p-2 border-b" :style="{ borderColor: borderColor }">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          :class="[
            'w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary',
            searchInputClass,
          ]"
          :style="{ backgroundColor: searchBackgroundColor, borderColor: searchBorderColor }"
          @click.stop
        />
      </div>

      <!-- Options -->
      <div class="py-1">
        <div
          v-for="option in filteredOptions"
          :key="getOptionValue(option)"
          @click="toggleOption(option)"
          :class="[
            'px-3 py-2 cursor-pointer flex items-center justify-between transition-colors',
            'hover:bg-opacity-10 hover:bg-primary',
            optionClass,
          ]"
        >
          <span>{{ getOptionLabel(option) }}</span>
          <div
            :class="[
              'w-4 h-4 border-2 rounded flex items-center justify-center',
              isSelected(option) ? 'bg-primary border-primary' : 'border-gray-400',
            ]"
          >
            <svg
              v-if="isSelected(option)"
              class="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        </div>

        <!-- Add custom option -->
        <div
          v-if="allowCustom && searchQuery && !optionExists(searchQuery)"
          @click="addCustomOption"
          :class="[
            'px-3 py-2 cursor-pointer border-t transition-colors',
            'hover:bg-opacity-10 hover:bg-primary text-primary',
            customOptionClass,
          ]"
          :style="{ borderColor: borderColor }"
        >
          + {{ t('multiselector.add') }} "{{ searchQuery }}"
        </div>

        <!-- No options message -->
        <div
          v-if="filteredOptions.length === 0 && (!allowCustom || !searchQuery)"
          class="px-3 py-2 text-gray-400 text-center"
        >
          {{ noOptionsText }}
        </div>
      </div>
    </div>

    <!-- Selected Items Tags -->
    <div v-if="showTags && selectedItems.length > 0" class="flex flex-wrap gap-2 mt-2">
      <span
        v-for="item in selectedItems"
        :key="getOptionValue(item)"
        :class="['px-3 py-1 rounded-full text-sm flex items-center transition-colors', tagClass]"
        :style="{ backgroundColor: tagBackgroundColor, color: tagTextColor }"
      >
        {{ getOptionLabel(item) }}
        <button
          v-if="!disabled"
          @click="removeItem(item)"
          type="button"
          class="ml-2 hover:text-gray-300 focus:outline-none"
        >
          ✕
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Types
type Option = string | { [key: string]: any }

// Props
interface Props {
  modelValue: any[]
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  searchable?: boolean
  allowCustom?: boolean
  showTags?: boolean
  multiple?: boolean
  valueKey?: string
  labelKey?: string
  noOptionsText?: string
  maxSelections?: number
  // Styling props
  inputClass?: string
  dropdownClass?: string
  optionClass?: string
  tagClass?: string
  searchInputClass?: string
  customOptionClass?: string
  backgroundColor?: string
  dropdownBackgroundColor?: string
  borderColor?: string
  searchBackgroundColor?: string
  searchBorderColor?: string
  tagBackgroundColor?: string
  tagTextColor?: string
}

const { t } = useI18n()
const props = withDefaults(defineProps<Props>(), {
  placeholder: "$t('multiselector.placeholder')",
  searchPlaceholder: "$t('multiselector.searchPlaceholder')",
  disabled: false,
  searchable: true,
  allowCustom: false,
  showTags: true,
  multiple: true,
  valueKey: 'value',
  labelKey: 'label',
  noOptionsText: " $t('multiselector.noOptionsText')",
  maxSelections: undefined,
  // Default styling
  inputClass: 'bg-gray-700 border-gray-600 text-white',
  dropdownClass: 'bg-gray-700 border-gray-600',
  optionClass: 'text-white',
  tagClass: 'bg-primary text-white',
  searchInputClass: 'bg-gray-600 border-gray-500 text-white',
  customOptionClass: '',
  backgroundColor: '#374151', // gray-700
  dropdownBackgroundColor: '#374151', // gray-700
  borderColor: '#4B5563', // gray-600
  searchBackgroundColor: '#4B5563', // gray-600
  searchBorderColor: '#6B7280', // gray-500
  tagBackgroundColor: '#EC4899', // primary pink
  tagTextColor: '#FFFFFF',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  change: [value: any[]]
  search: [query: string]
  'add-custom': [value: string]
}>()

// Reactive data
const dropdownOpen = ref(false)
const searchQuery = ref('')

// Computed properties
const selectedItems = computed({
  get: () => props.modelValue || [],
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

const displayText = computed(() => {
  if (selectedItems.value.length === 0) {
    return props.placeholder
  }
  if (selectedItems.value.length === 1) {
    return getOptionLabel(selectedItems.value[0])
  }
  return t('multiselector.selected', { count: selectedItems.value.length })
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase()
    return label.includes(query)
  })
})

// Methods
const getOptionValue = (option: Option): any => {
  if (typeof option === 'string') return option
  return option[props.valueKey]
}

const getOptionLabel = (option: Option): string => {
  if (typeof option === 'string') return option
  return option[props.labelKey] || option[props.valueKey] || String(option)
}

const isSelected = (option: Option): boolean => {
  const value = getOptionValue(option)
  return selectedItems.value.some((item) => getOptionValue(item) === value)
}

const toggleDropdown = () => {
  if (!props.disabled) {
    dropdownOpen.value = !dropdownOpen.value
  }
}

const toggleOption = (option: Option) => {
  if (props.disabled) return

  const value = getOptionValue(option)
  const currentIndex = selectedItems.value.findIndex((item) => getOptionValue(item) === value)

  const newSelection = [...selectedItems.value]

  if (currentIndex > -1) {
    // Remove if already selected
    newSelection.splice(currentIndex, 1)
  } else {
    // Add if not selected (check max selections)
    if (props.maxSelections && newSelection.length >= props.maxSelections) {
      return // Don't add if max reached
    }
    newSelection.push(option)
  }

  selectedItems.value = newSelection

  // Close dropdown if not multiple
  if (!props.multiple) {
    dropdownOpen.value = false
  }
}

const removeItem = (item: Option) => {
  if (props.disabled) return

  const value = getOptionValue(item)
  selectedItems.value = selectedItems.value.filter(
    (selectedItem) => getOptionValue(selectedItem) !== value,
  )
}

const optionExists = (query: string): boolean => {
  return props.options.some(
    (option) => getOptionLabel(option).toLowerCase() === query.toLowerCase(),
  )
}

const addCustomOption = () => {
  const newOption = searchQuery.value.trim()
  if (newOption && !optionExists(newOption)) {
    const customOption =
      typeof props.options[0] === 'string'
        ? newOption
        : {
            [props.valueKey]: newOption,
            [props.labelKey]: newOption,
          }

    selectedItems.value = [...selectedItems.value, customOption]
    emit('add-custom', newOption)
    searchQuery.value = ''
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    dropdownOpen.value = false
  }
}

// Watch for search changes
watch(searchQuery, (newQuery) => {
  emit('search', newQuery)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
