<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LeftPanel from '@/components/LeftPanel.vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()

// Alert form data
const alertData = ref({
  audience: {
    type: '', // 'all', 'group', 'user'
    userGroup: '',
    specificUser: '',
  },
  message: {
    title: '',
    body: '',
  },
  channels: '', // 'push', 'email', 'both'
})

// Character limit for message body
const maxCharacters = 275
const remainingCharacters = computed(() => {
  return maxCharacters - alertData.value.message.body.length
})

// Form validation
const isFormValid = computed(() => {
  // Check audience selection
  const audienceValid =
    alertData.value.audience.type === 'all' ||
    (alertData.value.audience.type === 'group' && alertData.value.audience.userGroup) ||
    (alertData.value.audience.type === 'user' && alertData.value.audience.specificUser)

  // Check message
  const messageValid =
    alertData.value.message.title.trim() !== '' && alertData.value.message.body.trim() !== ''

  // Check channel
  const channelValid = alertData.value.channels !== ''

  return audienceValid && messageValid && channelValid
})

// Set audience type
const setAudienceType = (type: string) => {
  alertData.value.audience.type = type

  // Reset related fields when changing audience type
  if (type === 'all') {
    alertData.value.audience.userGroup = ''
    alertData.value.audience.specificUser = ''
  }
}

// Handle form submission
const sendAlert = () => {
  if (!isFormValid.value) {
    alert('Please fill all required fields')
    return
  }

  console.log('Sending alert:', alertData.value)

  router.push('/manage-alerts')
}

// Save as draft
const saveAsDraft = () => {
  console.log('Saving alert as draft:', alertData.value)
  // router.push('/manage-alerts')
}

// Cancel and go back
const cancel = () => {
  // Navigate back to alerts list
  router.push('/manage-alerts')
  console.log('Cancelled alert creation')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-900 text-white">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div>
        <DashboardHeader
          class="border-l border-r border-b border-borderPrimary dark:text-white text-black"
        />
      </div>

      <div class="flex-1 px-4 py-6 z-10">
        <!-- Page Header -->
        <Breadcrumb />

        <!-- Section 1: Choose Audience -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">
            Section 1: Choose Your Audience
          </h3>

          <!-- Send to options -->
          <div class="mb-6">
            <label class="block mb-2 font-medium">Send to<span class="text-primary">*</span></label>
            <div class="flex flex-wrap gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="all"
                  v-model="alertData.audience.type"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                  @change="setAudienceType('all')"
                />
                <span class="ml-2">All users</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="group"
                  v-model="alertData.audience.type"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                  @change="setAudienceType('group')"
                />
                <span class="ml-2">A Specific Group</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value="user"
                  v-model="alertData.audience.type"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                  @change="setAudienceType('user')"
                />
                <span class="ml-2">A Specific User</span>
              </label>
            </div>
          </div>

          <!-- User Group Selection -->
          <div class="mb-6" v-if="alertData.audience.type === 'group'">
            <label class="block mb-2 font-medium">
              User Group<span class="text-primary">*</span>
            </label>
            <div class="relative">
              <select
                v-model="alertData.audience.userGroup"
                class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-white"
              >
                <option value="" disabled selected>Select the user group</option>
                <option value="admins">Admins</option>
                <option value="managers">Managers</option>
                <option value="developers">Developers</option>
                <option value="testers">Testers</option>
              </select>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Specific User Selection -->
          <div class="mb-6" v-if="alertData.audience.type === 'user'">
            <label class="block mb-2 font-medium">
              Select User<span class="text-primary">*</span>
            </label>
            <div class="relative">
              <input
                type="text"
                v-model="alertData.audience.specificUser"
                placeholder="Search and select the user"
                class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Compose Message -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">
            Section 2: Compose Your Message
          </h3>

          <!-- Alert Title -->
          <div class="mb-6">
            <label class="block mb-2 font-medium">Alert Title</label>
            <div class="relative">
              <input
                type="text"
                v-model="alertData.message.title"
                placeholder="Enter a short, clear title"
                class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-white"
              />
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              This will be the push notification title or the email subject line.
            </p>
          </div>

          <!-- Message Body -->
          <div class="mb-6">
            <label class="block mb-2 font-medium">Message Body</label>
            <textarea
              v-model="alertData.message.body"
              placeholder="Write the full message for the alert here..."
              rows="6"
              maxlength="275"
              class="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary text-white resize-none"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1 text-right">
              {{ remainingCharacters }} characters left
            </p>
          </div>
        </div>

        <!-- Section 3: Delivery Channels -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">
            Section 3: Select Delivery Channels
          </h3>

          <!-- Channels -->
          <div class="mb-6">
            <label class="block mb-2 font-medium">Channels</label>
            <div class="flex flex-wrap gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="channel"
                  value="push"
                  v-model="alertData.channels"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                />
                <span class="ml-2">Push Notification</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="channel"
                  value="email"
                  v-model="alertData.channels"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                />
                <span class="ml-2">Email</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="channel"
                  value="both"
                  v-model="alertData.channels"
                  class="form-radio h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                />
                <span class="ml-2">Both</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 mt-8">
          <button
            @click="cancel"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveAsDraft"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            Save as Draft
          </button>
          <button
            @click="sendAlert"
            class="px-4 py-2 bg-primary hover:bg-primaryDark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            :disabled="!isFormValid"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            Send Alert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='checkbox'],
input[type='radio'] {
  accent-color: #f94daf;
}
</style>
