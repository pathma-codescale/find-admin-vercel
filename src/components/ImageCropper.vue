<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  imageUrl: string
  aspectRatio?: number
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 1,
  title: 'Crop Image'
})

const emit = defineEmits<{
  cropComplete: [blob: Blob]
  cancel: []
}>()

const scale = ref(1)
const rotation = ref(0)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const containerRef = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()
const imageLoaded = ref(false)
const imageNaturalSize = ref({ width: 0, height: 0 })

// Calculate initial scale to fit image in container
const calculateInitialScale = () => {
  if (!imageRef.value || !containerRef.value) return

  const img = imageRef.value
  const container = containerRef.value
  const containerRect = container.getBoundingClientRect()
  
  imageNaturalSize.value = {
    width: img.naturalWidth,
    height: img.naturalHeight
  }

  // Calculate scale to fit the crop area (300x300)
  const cropSize = 300
  const imgAspect = img.naturalWidth / img.naturalHeight
  
  // We want the image to cover the crop area
  let displayWidth: number
  let displayHeight: number
  
  if (imgAspect > 1) {
    // Landscape
    displayHeight = containerRect.height
    displayWidth = displayHeight * imgAspect
  } else {
    // Portrait or square
    displayWidth = containerRect.width
    displayHeight = displayWidth / imgAspect
  }
  
  // Make sure it covers the crop area
  const minScale = Math.max(
    cropSize / displayWidth,
    cropSize / displayHeight
  )
  
  scale.value = Math.max(1, minScale * 1.2) // Slight zoom for better coverage
  position.value = { x: 0, y: 0 }
  imageLoaded.value = true
}

const handleImageLoad = () => {
  calculateInitialScale()
}

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 3)
}

const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

const handleRotate = () => {
  rotation.value = (rotation.value + 90) % 360
  // Reset position after rotation
  position.value = { x: 0, y: 0 }
}

const handleCrop = async () => {
  if (!containerRef.value || !imageRef.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cropSize = 300
  canvas.width = cropSize
  canvas.height = cropSize

  const img = imageRef.value
  const containerRect = containerRef.value.getBoundingClientRect()

  // Get the displayed image dimensions
  const imgRect = img.getBoundingClientRect()
  const displayedWidth = imgRect.width
  const displayedHeight = imgRect.height

  // Calculate the ratio between natural and displayed size
  const scaleRatioX = img.naturalWidth / displayedWidth
  const scaleRatioY = img.naturalHeight / displayedHeight

  // Calculate the center of the crop area in displayed coordinates
  const cropCenterX = containerRect.width / 2
  const cropCenterY = containerRect.height / 2

  // Calculate the image center in displayed coordinates
  const imgCenterX = containerRect.width / 2 + position.value.x
  const imgCenterY = containerRect.height / 2 + position.value.y

  // Calculate the offset from image center to crop center
  const offsetX = (cropCenterX - imgCenterX) * scaleRatioX
  const offsetY = (cropCenterY - imgCenterY) * scaleRatioY

  // Calculate source coordinates (in natural image coordinates)
  const sourceSize = (cropSize * scaleRatioX) / scale.value
  const sourceX = (img.naturalWidth / 2) - (sourceSize / 2) + offsetX
  const sourceY = (img.naturalHeight / 2) - (sourceSize / 2) + offsetY

  // Draw the cropped image
  ctx.save()
  
  if (rotation.value !== 0) {
    ctx.translate(cropSize / 2, cropSize / 2)
    ctx.rotate((rotation.value * Math.PI) / 180)
    ctx.translate(-cropSize / 2, -cropSize / 2)
  }

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    cropSize,
    cropSize
  )
  
  ctx.restore()

  canvas.toBlob((blob) => {
    if (blob) {
      emit('cropComplete', blob)
    }
  }, 'image/jpeg', 0.95)
}

const imageTransform = computed(() => {
  const rotationTransform = rotation.value !== 0 ? `rotate(${rotation.value}deg)` : ''
  return {
    transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value}) ${rotationTransform}`,
    transformOrigin: 'center center',
    transition: isDragging.value ? 'none' : 'transform 0.1s ease-out',
    cursor: isDragging.value ? 'grabbing' : 'grab'
  }
})

const imageStyle = computed(() => {
  if (!imageLoaded.value || !containerRef.value) {
    return { opacity: 0 }
  }

  return {
    ...imageTransform.value,
    opacity: 1,
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    marginLeft: '-50%',
    marginTop: '-50%',
    maxWidth: 'none',
    maxHeight: 'none',
    width: 'auto',
    height: '100%',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const
  }
})

// Reset when rotation changes
watch(rotation, () => {
  calculateInitialScale()
})

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
        <button
          @click="emit('cancel')"
          class="text-gray-400 hover:text-white transition-colors p-1"
          type="button"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Crop Area -->
      <div
        ref="containerRef"
        class="relative bg-gray-900 rounded-lg overflow-hidden mb-4 select-none"
        style="height: 400px; touch-action: none;"
      >
        <!-- Cropping Frame -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            class="border-2 border-white shadow-lg relative"
            style="width: 300px; height: 300px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5)"
          >
            <!-- Grid lines -->
            <div class="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div v-for="i in 9" :key="i" class="border border-white border-opacity-30" />
            </div>
            
            <!-- Corner markers -->
            <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          </div>
        </div>

        <!-- Image -->
        <img
          ref="imageRef"
          :src="imageUrl"
          alt="Crop preview"
          draggable="false"
          @load="handleImageLoad"
          @mousedown="handleMouseDown"
          :style="imageStyle"
        />
        
        <!-- Loading state -->
        <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
          <div class="text-white text-sm">Loading image...</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="mb-4">
        <div class="flex items-center justify-center space-x-3 mb-3">
          <button
            @click="handleZoomOut"
            type="button"
            class="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Zoom Out"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <div class="flex items-center space-x-2 flex-1 max-w-xs">
            <span class="text-xs text-gray-400 w-8">{{ Math.round(scale * 100) }}%</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              v-model.number="scale"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <button
            @click="handleZoomIn"
            type="button"
            class="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Zoom In"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          
          <button
            @click="handleRotate"
            type="button"
            class="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Rotate 90°"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-700 rounded-lg p-3 mb-4">
        <p class="text-sm text-gray-300 flex items-start">
          <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Drag the image to reposition, use the slider to zoom, and click rotate to adjust the angle. The area inside the white square will be cropped.</span>
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3">
        <button
          @click="emit('cancel')"
          type="button"
          class="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          @click="handleCrop"
          type="button"
          class="px-5 py-2.5 bg-primary hover:bg-primaryDark text-white rounded-md transition-colors flex items-center space-x-2 font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Crop & Save</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #f94daf;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #f94daf;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

input[type="range"]::-webkit-slider-track {
  background: #4b5563;
  border-radius: 4px;
  height: 8px;
}

input[type="range"]::-moz-range-track {
  background: #4b5563;
  border-radius: 4px;
  height: 8px;
}
</style>