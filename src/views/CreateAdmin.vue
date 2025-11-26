<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { SweetAlert } from '@/utils/sweetAlert'
import { useAdminStore } from '@/store/admin/useAdminStore'
import { useCommonStore } from '@/store/common/useCommonStore'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const commonStore = useCommonStore()

const mode = computed<'create' | 'edit' | 'view'>(() => {
  if (route.name === 'viewAdmin') return 'view'
  if (route.params.id) return 'edit'
  return 'create'
})

const isViewOnly = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')

interface FormData {
  fullName: string
  emailAddress: string
  phoneNumber: string
  countryCode: string
  role: string
  profilePhoto?: string | File
  adminId?: string
  isAccountSuspended?: boolean
  status?: string
}

const photoInput = ref<HTMLInputElement>()
const profilePhotoPreview = ref<string>('')

const formData = reactive<FormData>({
  fullName: '',
  emailAddress: '',
  phoneNumber: '',
  countryCode: '+94',
  role: '',
  profilePhoto: '',
  adminId: '',
  isAccountSuspended: false,
  status: 'active',
})

const handlePhotoUpload = () => {
  if (!isViewOnly.value) {
    photoInput.value?.click()
  }
}

const handlePhotoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      SweetAlert.error(
        t('alerts.titles.fileTooLarge'),
        t('validation.fileTooLarge', { size: '5MB' }),
      )
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      SweetAlert.error(
        t('alerts.titles.invalidFileType'),
        t('validation.invalidFileType', { types: 'JPEG, PNG, GIF, SVG' }),
      )
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target?.result as string
      formData.profilePhoto = base64String
      profilePhotoPreview.value = base64String
      console.log('Base64 image stored:', base64String.substring(0, 50) + '...')
    }
    reader.readAsDataURL(file)
  }
}

const removeProfilePhoto = async () => {
  try {
    if (formData.profilePhoto && typeof formData.profilePhoto === 'string') {
      if (formData.profilePhoto.startsWith('http')) {
        const url = new URL(formData.profilePhoto)
        const fileKey = url.pathname.substring(1)

        if (fileKey) {
          await commonStore.deleteImage(fileKey)
        }
      }
    }

    formData.profilePhoto = ''
    profilePhotoPreview.value = ''

    if (photoInput.value) {
      photoInput.value.value = ''
    }

    // SweetAlert.success('Success', 'Profile photo removed successfully')
  } catch (error: any) {
    console.error('Error removing profile picture:', error)
    alert('Failed to remove profile picture. Please try again.')
  }
}

const loadAdminData = async (adminId: string) => {
  try {
    console.info('Loading admin id:', adminId)

    const admin = await adminStore.getAdminById(adminId)

    if (!admin) {
      console.warn('No admin returned for id:', adminId)
      throw new Error('Admin data not found')
    }

    formData.adminId = admin.sub
    formData.fullName = admin.name
    formData.emailAddress = admin.email
    formData.phoneNumber = admin.phoneNumber
    formData.role = admin.userType
    formData.profilePhoto = admin.profileImageUrl
    formData.isAccountSuspended = admin.enabled === false
    formData.status = admin.UserStatus

    if (admin.profileImageUrl) profilePhotoPreview.value = admin.profileImageUrl

    await nextTick()
    console.log('Loaded admin data into formData:', JSON.parse(JSON.stringify(formData)))
  } catch (error) {
    console.error('Failed to load admin', error)
    try {
      SweetAlert.form.loadingError(t('admin.title').toLowerCase())
    } catch (e) {
      console.warn('SweetAlert or i18n call failed', e)
    }
  }
}

const validateForm = (): boolean => {
  if (!formData.fullName.trim()) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('admin.fullName') }),
    )
    return false
  }
  if (!formData.emailAddress.trim()) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('admin.emailAddress') }),
    )
    return false
  }
  if (!formData.phoneNumber.trim()) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('admin.phoneNumber') }),
    )
    return false
  }
  if (!formData.role.trim()) {
    SweetAlert.error(
      t('alerts.titles.validationError'),
      t('validation.required', { field: t('admin.role') }),
    )
    return false
  }

  return true
}

/** --- password reset --- */
const sendPasswordReset = async () => {
  if (!formData.emailAddress) {
    SweetAlert.error(t('common.error'), 'Admin email address is missing.')
    return
  }

  const result = await SweetAlert.confirm(
    t('admin.resetPassword'),
    `Send a password reset email to ${formData.emailAddress}?`,
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return
  try {
    SweetAlert.loading(t('alerts.loading.sendingEmail'), t('alerts.loading.pleaseWait'))
    await adminStore.sendResetPasswordEmailAdmin(formData.emailAddress)
    SweetAlert.success(t('common.success'), 'Password reset email sent successfully!')
  } catch (error: any) {
    console.error('Error sending password reset:', error)
    SweetAlert.error(t('common.error'), error.message || 'Failed to send password reset email.')
  }
}

/** --- suspend/activate account --- */
const toggleAccountSuspension = async () => {
  try {
    const isSuspending = !formData.isAccountSuspended

    const actionText = isSuspending ? 'Suspend' : 'Activate'
    const confirmText = isSuspending
      ? t('admin.confirm.suspendAccount')
      : t('admin.confirm.reactivateAccount')

    const result = await SweetAlert.confirm(
      `${actionText} Account`,
      confirmText,
      t('common.yes'),
      t('common.cancel'),
    )

    if (!result.isConfirmed) return

    const email = formData.emailAddress
    const adminId = formData.adminId

    if (!email || !adminId) {
      SweetAlert.error('Missing Data', 'Enterprise email or ID is missing.')
      return
    }
    SweetAlert.loading(t('alerts.loading.updatingAdmin'), t('alerts.loading.pleaseWait'))

    if (isSuspending) {
      await adminStore.disableAdmin(email)
      formData.isAccountSuspended = true
      formData.status = 'suspended'
    } else {
      await adminStore.enableAdmin(email)
      formData.isAccountSuspended = false
      formData.status = 'ACTIVE'
    }

    formData.isAccountSuspended = isSuspending
    formData.status = isSuspending ? 'suspended' : 'active'

    SweetAlert.success(
      t('common.success'),
      isSuspending ? t('alerts.success.accountSuspended') : t('alerts.success.accountReactivated'),
    )
  } catch (err) {
    console.error('Error toggling suspension:', err)
    SweetAlert.error(t('common.error'), t('admin.alerts.suspendFailed'))
  }
}

/** --- delete account --- */
const confirmDeleteAccount = async () => {
  const result = await SweetAlert.confirm(
    t('admin.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete this admin account. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
  )

  if (finalConfirm.isConfirmed) {
    await deleteAccount()
  }
}

const deleteAccount = async () => {
  const adminId = route.params.id as string
  if (!adminId) {
    SweetAlert.error(t('common.error'), 'Admin ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))

    await adminStore.deleteAdmin(adminId)

    SweetAlert.success(t('common.success'), 'Account deleted successfully!')
    router.push('/manage-admins')
  } catch (error: unknown) {
    SweetAlert.error(t('common.error'), 'Failed to delete account.')
  }
}

const submitForm = async () => {
  if (!validateForm()) return

  // Show loading
  SweetAlert.loading(
    mode.value === 'edit' ? t('alerts.loading.updatingAdmin') : t('alerts.loading.addingAdmin'),
    t('alerts.loading.pleaseWait'),
  )
  const payload = {
    name: formData.fullName,
    email: formData.emailAddress,
    phoneNumber: formData.phoneNumber,
    userType: formData.role,

    profileImage: typeof formData.profilePhoto === 'string' ? formData.profilePhoto : '', //TODO
  }
  try {
    console.log('Form submitted:', formData)
    if (mode.value === 'edit') {
      await adminStore.updateAdmin(formData.emailAddress, payload)
    } else {
      await adminStore.createAdmin(payload)
    }
    // Success message
    SweetAlert.success(
      t('common.success'),
      mode.value === 'edit' ? t('alerts.success.adminUpdated') : t('alerts.success.adminAdded'),
    ).then(() => {
      router.push('/manage-admins')
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    SweetAlert.error(
      t('common.error'),
      mode.value === 'edit'
        ? t('alerts.error.updatingData', { type: 'admin' })
        : t('alerts.error.savingData', { type: 'admin' }),
    )
  }
}

const cancelForm = async () => {
  const result = await SweetAlert.confirm(
    t('alerts.titles.cancelChanges'),
    t('alerts.confirm.cancelChanges'),
    t('alerts.buttons.yesCancel'),
    t('alerts.buttons.continueEditing'),
  )

  if (result.isConfirmed) {
    router.push('/manage-admins')
  }
}

/** --- mounted --- */
onMounted(() => {
  try {
    if (mode.value !== 'create' && route.params.id) {
      loadAdminData(String(route.params.id))
    } else {
      console.info('Mode is create; formData initial state:', JSON.parse(JSON.stringify(formData)))
    }
  } catch (err) {
    console.error('onMounted error', err)
  }
})
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
        <Breadcrumb />

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Section 1: User Information -->
          <div class="rounded-lg p-6 bg-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('admin.sections.section1') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2"> {{ t('admin.fullName') }}* </label>
                <input
                  v-model="formData.fullName"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="t('admin.placeholders.fullName')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('admin.emailAddress') }}*
                </label>
                <input
                  v-model="formData.emailAddress"
                  :disabled="isViewOnly || isEditMode"
                  type="email"
                  :placeholder="t('admin.placeholders.emailAddress')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('admin.phoneNumber') }}*
                </label>
                <div class="flex">
                  <select
                    v-model="formData.countryCode"
                    :disabled="isViewOnly"
                    class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="+94">+94</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+33">+33</option>
                  </select>
                  <input
                    v-model="formData.phoneNumber"
                    :disabled="isViewOnly"
                    type="tel"
                    :placeholder="t('admin.placeholders.phoneNumber')"
                    class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"> {{ t('admin.role') }}* </label>
                <select
                  v-model="formData.role"
                  :disabled="isViewOnly"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{{ t('admin.placeholders.selectRole') }}</option>
                  <option value="SUPER_ADMIN">{{ t('Roles.superAdmin') }}</option>
                  <option value="ADMIN">{{ t('Roles.admin') }}</option>
                  <option value="CUSTOMER_SUPPORT">{{ t('Roles.customerSupport') }}</option>
                </select>
                <p class="text-xs text-gray-400 mt-1">
                  {{ t('admin.descriptions.roleDescription') }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('admin.profilePhoto') }}
                </label>
                <div class="flex items-center space-x-4">
                  <div class="flex flex-col items-center">
                    <div
                      class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"
                    >
                      <img
                        v-if="profilePhotoPreview"
                        :src="profilePhotoPreview"
                        alt="Profile Preview"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-2xl">👤</span>
                    </div>

                    <button
                      v-if="formData.profilePhoto && !isViewOnly"
                      @click="removeProfilePhoto"
                      type="button"
                      class="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      {{ t('common.remove') }}
                    </button>
                  </div>
                  <div class="flex-1">
                    <div
                      class="border-2 border-dashed rounded-lg p-4 text-center transition-colors"
                      :class="[
                        isViewOnly
                          ? 'border-gray-700 bg-gray-800 cursor-not-allowed opacity-60'
                          : 'border-gray-600 hover:border-primary cursor-pointer',
                      ]"
                      @click="handlePhotoUpload"
                    >
                      <div class="text-primary mb-2">📤</div>
                      <p class="text-sm text-gray-400">
                        {{ t('admin.descriptions.profileUpload') }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ t('admin.descriptions.profileFormats') }}
                      </p>
                    </div>
                    <input
                      ref="photoInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      :disabled="isViewOnly"
                      @change="handlePhotoChange"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Security -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('admin.sections.section2') }}
            </h3>

            <!-- Initial Password (only show when adding new admin) -->
            <div
              v-if="!isEditMode && !isViewOnly"
              class="space-y-2 border border-gray-600 rounded-md p-4 bg-primary/10"
            >
              <div class="flex items-center">
                <div class="w-4 h-4 bg-primary rounded-full mr-3"></div>
                <label class="block text-sm font-semibold mb-2">
                  {{ t('admin.initialPassword') }}
                </label>
              </div>
              <p class="text-xs text-white mb-1">
                {{ t('admin.descriptions.initialPassword') }}
              </p>
            </div>

            <!-- Account Management Actions (only in edit mode) -->
            <template v-if="!isViewOnly && isEditMode">
              <div class="border-t border-gray-600 pt-4 mt-4">
                <h4 class="text-md font-semibold mb-4 text-white">
                  {{ t('admin.accountSettings') }}
                </h4>

                <!-- Password Reset -->
                <div class="mb-6">
                  <label class="block text-sm font-medium mb-2 text-white">
                    {{ t('admin.resetPassword') }}
                  </label>
                  <button
                    type="button"
                    @click="sendPasswordReset"
                    class="px-4 py-2 min-w-[20vw] bg-primary text-white rounded-md hover:bg-primaryDark transition-colors"
                  >
                    {{ t('admin.actions.sendPasswordReset') }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ t('admin.descriptions.resetPassword') }}
                  </p>
                </div>

                <!-- Suspend/Activate Account -->
                <div class="mb-6">
                  <label class="block text-sm font-medium mb-2 text-white">
                    {{
                      formData.isAccountSuspended
                        ? t('admin.actions.reactivateAccount')
                        : t('admin.suspendAccount')
                    }}
                  </label>
                  <button
                    type="button"
                    @click="toggleAccountSuspension"
                    :class="[
                      'min-w-[20vw] px-4 py-2 rounded-md transition-colors',
                      formData.isAccountSuspended
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    ]"
                  >
                    {{
                      formData.isAccountSuspended
                        ? t('admin.actions.reactivateAccount')
                        : t('admin.actions.suspendAccount')
                    }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ t('admin.descriptions.suspendAccount') }}
                  </p>
                </div>

                <!-- Delete Account -->
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">
                    {{ t('admin.deleteAccount') }}
                  </label>
                  <button
                    type="button"
                    @click="confirmDeleteAccount"
                    class="min-w-[20vw] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {{ t('admin.actions.deleteAccount') }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ t('admin.descriptions.deleteAccount') }}
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelForm"
              type="button"
              class="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              v-if="!isViewOnly"
              type="submit"
              class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              {{ isEditMode ? t('common.saveChanges') : t('admin.actions.createAccount') }}
            </button>
          </div>
        </form>
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
