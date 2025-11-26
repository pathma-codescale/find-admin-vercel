<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SweetAlert } from '@/utils/sweetAlert'
import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'

const { t, locale } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const profileImagePreview = ref<string>('')

// Profile data
const profileData = reactive({
  fullName: 'Demi Wilkinson',
  profileImage:
    'https://img.freepik.com/premium-vector/cartoon-cute-girl-lovely-dog_268269-233.jpg',
})

// Password data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Set initial profile image preview
onMounted(() => {
  if (profileData.profileImage) {
    profileImagePreview.value = profileData.profileImage
  }
})

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Handle file change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      SweetAlert.error(
        t('alerts.titles.fileTooLarge'),
        t('validation.fileTooLarge', { size: '5MB' }),
      )
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      SweetAlert.error(
        t('alerts.titles.invalidFileType'),
        t('validation.invalidFileType', { types: 'JPG, PNG, GIF, SVG' }),
      )
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImagePreview.value = e.target?.result as string
      profileData.profileImage = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Remove profile image
const removeProfileImage = () => {
  profileData.profileImage = ''
  profileImagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Change language
const changeLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('userLanguage', lang)
}

// Save profile changes
const saveProfileChanges = async () => {
  if (!profileData.fullName.trim()) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('settings.fullName') }),
    )
    return
  }

  try {
    // Show loading
    SweetAlert.loading(t('settings.updatingProfile'), t('alerts.loading.pleaseWait'))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Show success message
    SweetAlert.success(t('common.success'), t('settings.profileUpdated'))
  } catch (error) {
    console.error('Error updating profile:', error)
    SweetAlert.error(t('common.error'), t('settings.errorUpdatingProfile'))
  }
}

// Cancel profile changes
const cancelProfileChanges = async () => {
  const result = await SweetAlert.confirm(
    t('alerts.titles.cancelChanges'),
    t('alerts.confirm.cancelChanges'),
    t('alerts.buttons.yesCancel'),
    t('alerts.buttons.continueEditing'),
  )

  if (result.isConfirmed) {
    // Reset to original values
    profileData.fullName = 'Demi Wilkinson'
    profileData.profileImage =
      'https://img.freepik.com/premium-vector/cartoon-cute-girl-lovely-dog_268269-233.jpg'
    profileImagePreview.value = profileData.profileImage
  }
}

// Save password changes
const savePasswordChanges = async () => {
  // Validate password fields
  if (!passwordData.currentPassword) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('settings.currentPassword') }),
    )
    return
  }

  if (!passwordData.newPassword) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('settings.newPassword') }),
    )
    return
  }

  if (passwordData.newPassword.length < 8) {
    SweetAlert.error(t('alerts.titles.validationError'), t('settings.passwordTooShort'))
    return
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    SweetAlert.error(t('alerts.titles.validationError'), t('settings.passwordMismatch'))
    return
  }

  try {
    // Show loading
    SweetAlert.loading(t('settings.updatingPassword'), t('alerts.loading.pleaseWait'))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Clear password fields
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''

    // Show success message
    SweetAlert.success(t('common.success'), t('settings.passwordUpdated'))
  } catch (error) {
    console.error('Error updating password:', error)
    SweetAlert.error(t('common.error'), t('settings.errorUpdatingPassword'))
  }
}

// Cancel password changes
const cancelPasswordChanges = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
}
</script>

<template>
  <div class="flex min-h-screen text-white">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div class="w-full mb-2">
        <DashboardHeader class="border-l border-r border-b border-borderPrimary" />
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Edit Profile Section -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-2">{{ t('settings.editProfile') }}</h2>
          <p class="text-gray-400 text-sm mb-6">{{ t('settings.updateDetails') }}</p>

          <!-- Full Name -->
          <div class="mb-6">
            <label for="fullName" class="block text-sm font-medium mb-2"
              >{{ t('settings.fullName') }}*</label
            >
            <input
              id="fullName"
              v-model="profileData.fullName"
              type="text"
              :placeholder="t('settings.enterFullName')"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Profile Picture -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">{{ t('settings.profilePicture') }}</label>
            <div class="flex items-center space-x-4">
              <!-- Profile Image Preview -->
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="profileImagePreview"
                    :src="profileImagePreview"
                    alt="Profile"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-gray-400 text-2xl">👤</span>
                </div>
                <button
                  v-if="profileData.profileImage"
                  @click="removeProfileImage"
                  type="button"
                  class="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  {{ t('common.remove') }}
                </button>
              </div>

              <!-- Upload Area -->
              <div
                @click="triggerFileInput"
                class="flex-1 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
              >
                <div class="text-gray-400 mb-2">
                  <svg
                    class="w-8 h-8 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>
                <p class="text-sm text-center text-gray-400">{{ t('settings.clickToUpload') }}</p>
                <p class="text-xs text-center text-gray-500 mt-1">
                  {{ t('settings.imageFormats') }}
                </p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
            </div>
          </div>

          <!-- Profile Actions -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="cancelProfileChanges"
              class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="saveProfileChanges"
              class="px-4 py-2 bg-primary hover:bg-primaryDark rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              {{ t('common.saveChanges') }}
            </button>
          </div>
        </div>

        <!-- Divider -->
        <hr class="border-gray-600 my-8" />

        <!-- Change Password Section -->
        <div>
          <h2 class="text-xl font-semibold mb-2">{{ t('settings.changePassword') }}</h2>
          <p class="text-gray-400 text-sm mb-6">{{ t('settings.updatePassword') }}</p>

          <!-- Current Password -->
          <div class="mb-6">
            <label for="currentPassword" class="block text-sm font-medium mb-2">{{
              t('settings.currentPassword')
            }}</label>
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              :placeholder="t('settings.enterCurrentPassword')"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- New Password -->
          <div class="mb-6">
            <label for="newPassword" class="block text-sm font-medium mb-2">{{
              t('settings.newPassword')
            }}</label>
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              :placeholder="t('settings.enterNewPassword')"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Confirm New Password -->
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium mb-2">{{
              t('settings.confirmNewPassword')
            }}</label>
            <input
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              :placeholder="t('settings.confirmPassword')"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Password Actions -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="cancelPasswordChanges"
              class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="savePasswordChanges"
              class="px-4 py-2 bg-primary hover:bg-primaryDark rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              {{ t('common.saveChanges') }}
            </button>
          </div>
        </div>

        <!-- Language Selection -->
        <hr class="border-gray-600 my-8" />

        <div>
          <h2 class="text-xl font-semibold mb-2">{{ t('settings.language') }}</h2>
          <p class="text-gray-400 text-sm mb-6">{{ t('settings.selectLanguage') }}</p>

          <div class="flex space-x-4 mb-6">
            <button
              @click="changeLanguage('en')"
              class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              :class="
                locale === 'en'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 border border-gray-600 text-white hover:bg-gray-700'
              "
            >
              English
            </button>
            <button
              @click="changeLanguage('fr')"
              class="px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
              :class="
                locale === 'fr'
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 border border-gray-600 text-white hover:bg-gray-700'
              "
            >
              Français
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
