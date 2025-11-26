<template>
  <div class="location-map-picker space-y-4">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-white mb-2"> {{ label }}* </label>

    <!-- Search Input with Custom Dropdown -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="localValue"
        :placeholder="placeholder"
        type="text"
        :disabled="disabled"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-10 pr-10 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        @input="debouncedSearch"
        @focus="!disabled && (showSuggestions = true)"
        @blur="handleBlur"
      />
      <!-- Search Icon -->
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <!-- Clear Button - hide in disabled mode -->
      <button
        v-if="localValue && !disabled"
        type="button"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        @click="clearSearch"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Custom Dropdown - hide in disabled mode -->
      <div
        v-if="!disabled && showSuggestions && predictions.length > 0"
        class="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md max-h-60 overflow-y-auto shadow-lg"
      >
        <div
          v-for="prediction in predictions"
          :key="prediction.place_id"
          class="px-4 py-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0 text-white"
          @mousedown.prevent="selectPrediction(prediction)"
        >
          <div class="font-medium">{{ prediction.structured_formatting.main_text }}</div>
          <div class="text-sm text-gray-300">
            {{ prediction.structured_formatting.secondary_text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div v-if="googleLoaded">
      <GoogleMap
        :api-key="apiKey"
        :center="mapCenter"
        :zoom="mapZoom"
        style="width: 100%; height: 400px"
        @map-ready="onMapReady"
      >
        <AdvancedMarker
          ref="markerRef"
          :position="
            currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : defaultCenter
          "
          :options="{ gmpDraggable: !disabled && locationSelected }"
          @dragend="onMarkerDragEnd"
        />
        <Circle v-if="showRadiusControl" :options="circleOptions" />
      </GoogleMap>
    </div>
    <div v-else class="h-48 w-full bg-gray-600 flex items-center justify-center">
      Loading map...
    </div>

    <!-- Radius Control - disable slider in view mode -->
    <div v-if="showRadiusControl && locationSelected" class="pt-2">
      <label class="block text-sm font-bold text-black dark:text-white mb-2">
        {{ $t('location.radius') }} ({{ radiusKm }} km)
      </label>
      <label v-if="!disabled" class="block text-sm text-black/80 dark:text-white/80 mb-2">
        {{ $t('location.drag') }}
      </label>
      <input
        type="range"
        v-model="radiusKm"
        :disabled="disabled"
        min="1/1000"
        max="60"
        step="0.1"
        class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
        @input="!disabled && emitRadiusChange()"
      />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>100 m</span>
        <span>60 km</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { GoogleMap, AdvancedMarker, Circle } from 'vue3-google-map'

interface LocationDetails {
  name: string
  address: string
  lat: number
  lng: number
}

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  apiKey: string
  showRadiusControl?: boolean
  initialRadius?: number
  defaultCenter: { lat: number; lng: number }
  disabled?: boolean
}

interface Emits {
  'update:modelValue': [value: string]
  'location-selected': [location: LocationDetails]
  'radius-changed': [{ radius: number; location: LocationDetails | null }]
}

interface PlacePrediction {
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  showRadiusControl: false,
  initialRadius: 50,
  initialLocationName: '',
  disabled: false,
})

const emit = defineEmits<Emits>()

// State
const localValue = ref(props.modelValue)
const locationSelected = ref(false)
const currentLocation = ref<LocationDetails | null>(null)
const predictions = ref<PlacePrediction[]>([])
const showSuggestions = ref(false)
const mapCenter = ref(props.defaultCenter)
const mapZoom = ref(12)
const radiusKm = ref(props.initialRadius)
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const autocompleteService = ref<google.maps.places.AutocompleteService | null>(null)
const geocoder = ref<google.maps.Geocoder | null>(null)
const markerRef = ref<google.maps.marker.AdvancedMarkerElement | null>(null)
const googleLoaded = ref(false)

// Computed
const circleOptions = computed(() => {
  if (!currentLocation.value) return {}
  return {
    strokeColor: '#FF00A2',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    center: { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
    radius: radiusKm.value * 1000,
    editable: true,
  }
})

// 🔍 Auto zoom based on radius
const getZoomForRadius = (radiusKm: number): number => {
  if (radiusKm <= 1) return 15
  if (radiusKm <= 2) return 14
  if (radiusKm <= 5) return 13
  if (radiusKm <= 10) return 12
  if (radiusKm <= 20) return 11
  if (radiusKm <= 50) return 10
  if (radiusKm <= 100) return 9
  return 8
}

// Watchers
watch(
  () => props.defaultCenter,
  (newCenter) => {
    if (newCenter && googleLoaded.value) {
      mapCenter.value = newCenter
      currentLocation.value = {
        name: props.modelValue || '',
        address: props.modelValue || '',
        lat: newCenter.lat,
        lng: newCenter.lng,
      }
      locationSelected.value = true
    }
  },
  { immediate: true },
)

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal.trim()) {
    locationSelected.value = false
    currentLocation.value = null
    predictions.value = []
  }
})

// Smooth zoom adjustment when user changes radius
watch(radiusKm, (newRadius) => {
  mapZoom.value = getZoomForRadius(newRadius)
})

// Methods
const loadGoogleMaps = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) return resolve()
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places,marker&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject('Failed to load Google Maps')
    document.head.appendChild(script)
  })

const debouncedSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    if (localValue.value.trim().length >= 2) performSearch()
    else predictions.value = []
  }, 300)
}

const performSearch = () => {
  if (!autocompleteService.value) return
  autocompleteService.value.getPlacePredictions(
    {
      input: localValue.value,
      location: new google.maps.LatLng(props.defaultCenter),
      radius: 50000,
    },
    (results, status) => {
      predictions.value = status === google.maps.places.PlacesServiceStatus.OK ? results || [] : []
    },
  )
}

const selectPrediction = async (prediction: PlacePrediction) => {
  showSuggestions.value = false
  if (!prediction.place_id) return

  const placesService = new google.maps.places.PlacesService(document.createElement('div'))
  const placeResult = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
    placesService.getDetails(
      { placeId: prediction.place_id, fields: ['name', 'formatted_address', 'geometry'] },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) resolve(result)
        else reject(status)
      },
    )
  })

  if (placeResult.geometry?.location) {
    const lat = placeResult.geometry.location.lat()
    const lng = placeResult.geometry.location.lng()
    const location: LocationDetails = {
      name: placeResult.name || '',
      address: placeResult.formatted_address || '',
      lat,
      lng,
    }
    currentLocation.value = location
    localValue.value = location.address
    locationSelected.value = true
    mapCenter.value = { lat, lng }
    mapZoom.value = getZoomForRadius(radiusKm.value)
    emit('location-selected', location)
    emitRadiusChange()
  }
}

const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
  if (!event.latLng || !geocoder.value) return
  const lat = event.latLng.lat()
  const lng = event.latLng.lng()

  if (markerRef.value) {
    markerRef.value.position = { lat, lng }
  }

  geocoder.value.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results?.[0]) {
      const location: LocationDetails = {
        name: results[0].formatted_address || '',
        address: results[0].formatted_address || '',
        lat,
        lng,
      }
      currentLocation.value = location
      localValue.value = location.address
      emit('location-selected', location)
      emitRadiusChange()
    }
  })
}

const emitRadiusChange = () => {
  mapZoom.value = getZoomForRadius(radiusKm.value)
  emit('radius-changed', { radius: radiusKm.value, location: currentLocation.value })
}

const clearSearch = () => {
  localValue.value = ''
  locationSelected.value = false
  currentLocation.value = null
  predictions.value = []
  showSuggestions.value = false
}

const handleBlur = () => setTimeout(() => (showSuggestions.value = false), 200)

const onMapReady = (mapInstance: google.maps.Map) => {}

onMounted(async () => {
  await loadGoogleMaps()
  autocompleteService.value = new window.google.maps.places.AutocompleteService()
  geocoder.value = new window.google.maps.Geocoder()
  googleLoaded.value = true

  if (props.modelValue.trim()) {
    localValue.value = props.modelValue
    debouncedSearch()
  }
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #f94daf;
  cursor: pointer;
}
.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #f94daf;
  cursor: pointer;
  border: none;
}
</style>
