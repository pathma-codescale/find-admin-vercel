<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AxiosError } from 'axios'
import { SweetAlert } from '@/utils/sweetAlert'
import { getDomainOptions } from '@/constants/selectorOptionsNew'
import { useEnterpriseStore } from '@/store/enterprise/useEnterpriseStore'
import { useCommonStore } from '@/store/common/useCommonStore'

import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import ImageCropper from '@/components/ImageCropper.vue'

/** --- i18n / router / store --- */
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const enterpriseStore = useEnterpriseStore()
const commonStore = useCommonStore()

/** --- refs --- */
const logoInput = ref<HTMLInputElement | null>(null)
const companyLogoPreview = ref<string>('')
const showCropper = ref(false)
const tempImageUrl = ref('')

/** --- mode detection --- */
const mode = computed<'create' | 'edit' | 'view'>(() => {
  if (route.name === 'view-enterprise') return 'view'
  if (route.params.id) return 'edit'
  return 'create'
})
const isViewOnly = computed(() => route.path.includes('/view'))

const isEditMode = computed(() => mode.value === 'edit')

/** --- form model --- */
interface FormData {
  companyName: string
  emailAddress: string
  phoneNumber: string
  countryCode: string
  companyLogo?: string | File | null
  businessSectors: string[]
  streetAddress: string
  city: string
  postalCode: string
  businessLocation: string
  initialSubscription: string
  pushNotifications: boolean
  emailNotifications: boolean
  enterpriseId?: string
  isAccountSuspended?: boolean
  status?: string
}

const formData = reactive<FormData>({
  companyName: '',
  emailAddress: '',
  phoneNumber: '',
  countryCode: '+94',
  companyLogo: null,
  businessSectors: [],
  streetAddress: '',
  city: '',
  postalCode: '',
  businessLocation: '',
  initialSubscription: '',
  pushNotifications: true,
  emailNotifications: true,
  isAccountSuspended: false,
  enterpriseId: '',
  status: 'active',
})

/** --- options --- */
const availableBusinessSectors = getDomainOptions(t)

const businessSectorsWithLabels = computed(() => {
  const sectorsMap = availableBusinessSectors.reduce((acc: Record<string, string>, sector: any) => {
    acc[sector.value] = sector.label
    return acc
  }, {})

  return formData.businessSectors.map((sector: any) => {
    if (typeof sector === 'object' && sector !== null && sector.label) {
      return sector
    }

    const sectorValue = typeof sector === 'string' ? sector : sector?.value
    return {
      value: sectorValue,
      label: sectorsMap[sectorValue] || sectorValue,
    }
  })
})

/** --- logo handlers --- */
const handleLogoUpload = () => {
  if (!isViewOnly.value) {
    logoInput.value?.click()
  }
}

const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

  const file = target.files[0]

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    SweetAlert.error(t('common.error'), 'File size must be less than 5MB')
    return
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    SweetAlert.error(t('common.error'), 'Please select a valid image file (JPEG, PNG, GIF, or SVG)')
    return
  }

  // Show cropper with temp URL
  tempImageUrl.value = URL.createObjectURL(file)
  showCropper.value = true
}

const handleCropComplete = async (blob: Blob) => {
  try {
    showCropper.value = false

    SweetAlert.loading(t('alerts.loading.uploadingImage'), t('alerts.loading.pleaseWait'))

    // Create a file from blob
    const file = new File([blob], 'cropped-logo.jpg', { type: 'image/jpeg' })

    const signedUrlResponse = await commonStore.getSignedUrl({
      payload: {
        fileCategory: 'profile-pictures',
        files: [{ fileName: file.name, fileType: file.type }],
      },
      callback: undefined,
    })

    if (!signedUrlResponse || !Array.isArray(signedUrlResponse) || signedUrlResponse.length === 0) {
      throw new Error('Failed to get signed URL from backend')
    }

    const { signUrl, objectUrl } = signedUrlResponse[0]

    if (!signUrl || !objectUrl) {
      throw new Error('Signed URL or final file URL missing from backend response')
    }

    await commonStore.uploadFileToPresignedUrl(signUrl, file, file.type, (progress) => {
      console.log(`Upload progress: ${progress}%`)
    })

    formData.companyLogo = objectUrl
    companyLogoPreview.value = objectUrl

    // Clean up temp URL
    URL.revokeObjectURL(tempImageUrl.value)
    tempImageUrl.value = ''

    // SweetAlert.close()
  } catch (error: any) {
    console.error('Error uploading company logo:', error)
    SweetAlert.error(t('common.error'), 'Failed to upload company logo. Please try again.')
  }
}

const handleCropCancel = () => {
  showCropper.value = false
  if (tempImageUrl.value) {
    URL.revokeObjectURL(tempImageUrl.value)
    tempImageUrl.value = ''
  }
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

const removeCompanyLogo = async () => {
  if (!confirm(t('enterprise.confirm.removeLogo') || 'Remove company logo?')) return

  try {
    if (formData.companyLogo && typeof formData.companyLogo === 'string') {
      const url = new URL(formData.companyLogo)
      const fileKey = url.pathname.substring(1)

      if (fileKey) {
        await commonStore.deleteImage(fileKey)
      }
    }

    formData.companyLogo = ''
    companyLogoPreview.value = ''

    if (logoInput.value) logoInput.value.value = ''

    SweetAlert.success(t('common.success'), t('enterprise.alerts.logoRemoved'))
  } catch (error: any) {
    SweetAlert.error(t('common.error'), 'Failed to delete company logo. Please try again.')
  }
}

/** --- custom sector add --- */
const handleCustomSectorAdd = (customSector: string) => {
  if (!formData.businessSectors.includes(customSector)) formData.businessSectors.push(customSector)
}

/** --- load enterprise --- */
const loadEnterpriseData = async (enterpriseId: string) => {
  try {
    console.info('Loading enterprise id:', enterpriseId)
    const enterprise = await enterpriseStore.getEnterpriseById(enterpriseId)
    console.log('getEntdatabyId ', enterprise)

    if (!enterprise) {
      console.warn('No enterprise returned for id:', enterpriseId)
      throw new Error('Enterprise data not found')
    }

    formData.enterpriseId = enterprise.enterpriseId ?? null
    formData.companyName = enterprise.brand_name ?? ''
    formData.emailAddress = enterprise.email ?? ''
    formData.phoneNumber = enterprise.phone_number ?? ''
    formData.countryCode = '+94'
    formData.businessSectors = Array.isArray(enterprise.businessSector)
      ? enterprise.businessSector
      : []
    formData.streetAddress = enterprise.address ?? ''
    formData.city = enterprise.city ?? ''
    formData.postalCode = enterprise.postal_code ?? ''
    formData.businessLocation = enterprise.businessLocation?.locationName ?? ''
    formData.initialSubscription = enterprise.subscription?.type ?? ''
    formData.companyLogo = enterprise.logo ?? null
    formData.pushNotifications = enterprise.enabledPushNotification ?? true
    formData.emailNotifications = enterprise.enabledEmail ?? true
    formData.isAccountSuspended = enterprise.status === 'suspended'
    formData.status = enterprise.status || 'active'

    if (enterprise.logo) companyLogoPreview.value = enterprise.logo

    await nextTick()
    console.log('Loaded enterprise data into formData:', JSON.parse(JSON.stringify(formData)))
  } catch (error) {
    console.error('Failed to load enterprise', error)
    try {
      SweetAlert.form.loadingError(t('enterprise.title').toLowerCase())
    } catch (e) {
      console.warn('SweetAlert or i18n call failed', e)
    }
  }
}

/** --- validation --- */
const validateForm = () => {
  if (!formData.companyName?.trim()) {
    SweetAlert.validation.required(t('enterprise.companyName'))
    return false
  }
  if (!formData.emailAddress?.trim()) {
    SweetAlert.validation.required(t('enterprise.emailAddress'))
    return false
  }
  if (!formData.phoneNumber?.trim()) {
    SweetAlert.validation.required(t('enterprise.phoneNumber'))
    return false
  }
  return true
}

/** --- password reset --- */
const sendPasswordReset = async () => {
  if (!formData.emailAddress) {
    SweetAlert.error(t('common.error'), 'Enterprise email address is missing.')
    return
  }

  const result = await SweetAlert.confirm(
    t('enterprise.resetPassword'),
    `Send a password reset email to ${formData.emailAddress}?`,
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  try {
    await enterpriseStore.sendResetPasswordEmailEnterprise(formData.emailAddress)
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
      ? t('alerts.confirm.suspendAccount')
      : t('alerts.confirm.reactivateAccount')

    const result = await SweetAlert.confirm(
      `${actionText} Account`,
      confirmText,
      t('common.yes'),
      t('common.cancel'),
    )

    if (!result.isConfirmed) return

    const enterpriseId = formData.enterpriseId

    if (!enterpriseId) {
      SweetAlert.error('Missing Data', 'Enterprise email or ID is missing.')
      return
    }

    if (isSuspending) {
      await enterpriseStore.disableEnterprise(enterpriseId)
      formData.isAccountSuspended = true
      formData.status = 'suspended'
    } else {
      await enterpriseStore.enableEnterprise(enterpriseId)
      formData.isAccountSuspended = false
      formData.status = 'active'
    }

    SweetAlert.success(
      t('common.success'),
      isSuspending ? t('alerts.success.accountSuspended') : t('alerts.success.accountReactivated'),
    )
  } catch (err) {
    console.error('Error toggling suspension:', err)
    SweetAlert.error(t('common.error'), t('enterprise.alerts.suspendFailed'))
  }
}

/** --- delete account --- */
const confirmDeleteAccount = async () => {
  const result = await SweetAlert.confirm(
    t('enterprise.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
    // 'warning'
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete all enterprise data. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
    // 'error'
  )

  if (finalConfirm.isConfirmed) {
    await deleteAccount()
  }
}

const deleteAccount = async () => {
  const enterpriseId = route.params.id as string
  if (!enterpriseId) {
    SweetAlert.error(t('common.error'), 'Enterprise ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))
    await enterpriseStore.deleteEnterprise(enterpriseId)
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>
    const backendMessage =
      axiosError.response?.data?.message || axiosError.message || 'Failed to delete account.'

    SweetAlert.error(t('common.error'), backendMessage)
  }
  SweetAlert.success(t('common.success'), 'Account deleted successfully!')
  router.push('/manage-users/enterprises')
}

/** --- submit --- */
const submitForm = async () => {
  if (!validateForm()) return

  SweetAlert.loading(
    mode.value === 'edit'
      ? t('alerts.loading.updatingEnterprise')
      : t('alerts.loading.addingEnterprise'),
    t('alerts.loading.pleaseWait'),
  )

  const payload = {
    brand_name: formData.companyName,
    username: formData.emailAddress,
    phone_number: formData.phoneNumber,
    address: formData.streetAddress,
    city: formData.city,
    postal_code: formData.postalCode,
    logo: typeof formData.companyLogo === 'string' ? formData.companyLogo : '',
    businessSector: formData.businessSectors.map((sector: any) =>
      typeof sector === 'string' ? sector : sector.value,
    ),
    businessLocation: {
      locationName: formData.businessLocation || '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      range: 0,
    },
    enabledPushNotification: formData.pushNotifications ?? false,
  }

  try {
    if (mode.value === 'edit') {
      await enterpriseStore.updateEnterprise({
        ...payload,
        enterpriseId: formData.enterpriseId!,
      })
    } else {
      await enterpriseStore.createEnterprise(payload)
    }
    SweetAlert.success(t('common.success'), t('alerts.success.enterpriseAdded')).then(() =>
      router.push('/manage-users/enterprises'),
    )
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>
    const backendMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      (mode.value === 'edit'
        ? t('alerts.error.updatingData', { type: t('enterprise.title').toLowerCase() })
        : t('alerts.error.savingData', { type: t('enterprise.title').toLowerCase() }))

    SweetAlert.error(t('common.error'), backendMessage)
  }
}

/** --- cancel --- */
const cancelForm = async () => {
  const result = await SweetAlert.confirm(
    t('alerts.titles.cancelChanges'),
    t('alerts.confirm.cancelChanges'),
    t('alerts.buttons.yesCancel'),
    t('alerts.buttons.continueEditing'),
  )
  if (result.isConfirmed) router.push('/enterprises')
}

/** --- mounted --- */
onMounted(() => {
  try {
    if (mode.value !== 'create' && route.params.id) {
      loadEnterpriseData(String(route.params.id))
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
          <!-- Section 1: Company Information -->
          <div class="rounded-lg p-6 bg-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('enterprise.sections.section1') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.companyName') }}*
                </label>
                <input
                  v-model="formData.companyName"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="t('enterprise.placeholders.companyName')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.emailAddress') }}*
                </label>
                <input
                  v-model="formData.emailAddress"
                  :disabled="isViewOnly || isEditMode"
                  type="email"
                  :placeholder="t('enterprise.placeholders.emailAddress')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.phoneNumber') }}*
                </label>
                <div class="flex">
                  <select
                    v-model="formData.countryCode"
                    :disabled="isViewOnly"
                    class="px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="+94">+94</option>
                  </select>
                  <input
                    v-model="formData.phoneNumber"
                    :disabled="isViewOnly"
                    type="tel"
                    :placeholder="t('enterprise.placeholders.phoneNumber')"
                    class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.companyLogo') }}
                </label>
                <div class="flex items-center space-x-4">
                  <div class="flex flex-col items-center">
                    <!-- Company Logo Preview -->
                    <div
                      class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"
                    >
                      <img
                        v-if="companyLogoPreview"
                        :src="companyLogoPreview"
                        alt="Logo Preview"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-2xl">🏢</span>
                    </div>
                    <!-- Remove button -->
                    <button
                      v-if="formData.companyLogo && !isViewOnly"
                      @click="removeCompanyLogo"
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
                      @click="handleLogoUpload"
                    >
                      <div class="text-primary mb-2">📤</div>
                      <p class="text-sm text-gray-400">
                        {{ t('enterprise.descriptions.logoUpload') }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ t('enterprise.descriptions.logoFormats') }}
                      </p>
                    </div>
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      :disabled="isViewOnly"
                      @change="handleLogoChange"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Business Details -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('enterprise.sections.section2') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.businessSectors') }}
                </label>
                <MultiSelectDropdown
                  v-model="formData.businessSectors"
                  :model-value="businessSectorsWithLabels"
                  :options="availableBusinessSectors"
                  :disabled="isViewOnly"
                  :placeholder="t('enterprise.placeholders.businessSectors')"
                  :search-placeholder="t('enterprise.placeholders.searchSectors')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="t('common.noOptionsFound')"
                  @add-custom="handleCustomSectorAdd"
                  @update:model-value="
                    (val) =>
                      (formData.businessSectors = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.streetAddress') }}
                </label>
                <input
                  v-model="formData.streetAddress"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="t('enterprise.placeholders.streetAddress')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.city') }}
                </label>
                <input
                  v-model="formData.city"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="t('enterprise.placeholders.city')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.postalCode') }}
                </label>
                <input
                  v-model="formData.postalCode"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="t('enterprise.placeholders.postalCode')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.businessLocation') }}
                </label>
                <div class="relative">
                  <input
                    v-model="formData.businessLocation"
                    :disabled="isViewOnly"
                    type="text"
                    :placeholder="t('enterprise.placeholders.businessLocation')"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  />
                  <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Account & Subscription -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('enterprise.sections.section3') }}
            </h3>

            <div class="space-y-6">
              <!-- Initial Password (only show when adding new enterprise) -->
              <div
                v-if="!isEditMode && !isViewOnly"
                class="space-y-2 border border-gray-600 rounded-md p-4 bg-primary/10"
              >
                <label class="block text-sm font-semibold mb-2">
                  {{ t('enterprise.initialPassword') }}
                </label>
                <p class="text-xs text-white mb-1">
                  {{ t('enterprise.descriptions.initialPassword') }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('enterprise.initialSubscription') }}
                </label>
                <select
                  v-model="formData.initialSubscription"
                  :disabled="isViewOnly"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{{ t('enterprise.placeholders.selectSubscription') }}</option>
                  <option value="free-trial">
                    {{ t('enterprise.subscriptionPlans.freeTrial') }}
                  </option>
                  <option value="essential">
                    {{ t('enterprise.subscriptionPlans.essential') }}
                  </option>
                  <option value="professional">
                    {{ t('enterprise.subscriptionPlans.professional') }}
                  </option>
                  <option value="business">
                    {{ t('enterprise.subscriptionPlans.business') }}
                  </option>
                </select>
                <p class="text-xs text-gray-400 mt-1">
                  {{ t('enterprise.descriptions.subscriptionOptions') }}
                </p>
              </div>

              <!-- Account Management Actions (only in edit mode) -->
              <template v-if="!isViewOnly && isEditMode">
                <div class="border-t border-gray-600 pt-4">
                  <h4 class="text-md font-semibold mb-4 text-white">
                    {{ t('enterprise.accountSettings') }}
                  </h4>

                  <!-- Password Reset -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-white">
                      {{ t('enterprise.resetPassword') }}
                    </label>
                    <button
                      type="button"
                      @click="sendPasswordReset"
                      class="px-4 py-2 min-w-[20vw] bg-primary text-white rounded-md hover:bg-primaryDark transition-colors"
                    >
                      {{ t('enterprise.actions.sendPasswordReset') }}
                    </button>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ t('enterprise.descriptions.resetPassword') }}
                    </p>
                  </div>

                  <!-- Suspend/Activate Account -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-white">
                      {{
                        formData.isAccountSuspended
                          ? t('enterprise.actions.reactivateAccount')
                          : t('enterprise.suspendAccount')
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
                          ? t('enterprise.actions.reactivateAccount')
                          : t('enterprise.actions.suspendAccount')
                      }}
                    </button>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ t('enterprise.descriptions.suspendAccount') }}
                    </p>
                  </div>

                  <!-- Delete Account -->
                  <div>
                    <label class="block text-sm font-medium mb-2 text-white">
                      {{ t('enterprise.deleteAccount') }}
                    </label>
                    <button
                      type="button"
                      @click="confirmDeleteAccount"
                      class="min-w-[20vw] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      {{ t('enterprise.actions.deleteAccount') }}
                    </button>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ t('enterprise.descriptions.deleteAccount') }}
                    </p>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Section 4: Notification Settings -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('enterprise.sections.section4') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="formData.emailNotifications"
                    type="checkbox"
                    class="sr-only"
                    :disabled="isViewOnly"
                  />
                  <div
                    :class="[
                      'w-12 h-6 rounded-full transition-colors duration-200 flex items-center',
                      formData.emailNotifications ? 'bg-primary' : 'bg-gray-600',
                    ]"
                  >
                    <div
                      :class="[
                        'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                        formData.emailNotifications ? 'translate-x-6 ml-1' : 'translate-x-0 ml-0.5',
                      ]"
                    ></div>
                  </div>
                  <div class="ml-4">
                    <span class="font-medium">{{ t('enterprise.emailNotifications') }}</span>
                    <p class="text-sm text-gray-400">
                      {{ t('enterprise.descriptions.emailNotifications') }}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label class="flex items-start cursor-pointer">
                  <input
                    v-model="formData.pushNotifications"
                    type="checkbox"
                    class="sr-only"
                    :disabled="isViewOnly"
                  />
                  <div
                    :class="[
                      'w-12 h-6 rounded-full transition-colors duration-200 flex items-center',
                      formData.pushNotifications ? 'bg-primary' : 'bg-gray-600',
                    ]"
                  >
                    <div
                      :class="[
                        'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                        formData.pushNotifications ? 'translate-x-6 ml-1' : 'translate-x-0 ml-0.5',
                      ]"
                    ></div>
                  </div>
                  <div class="ml-4">
                    <span class="font-medium">{{ t('enterprise.notifications.enablePush') }}</span>
                    <p class="text-sm text-gray-400">
                      {{ t('enterprise.descriptions.pushNotifications') }}
                    </p>
                  </div>
                </label>
              </div>
            </div>
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
              {{ isEditMode ? t('common.saveChanges') : t('enterprise.actions.addEnterprise') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image Cropper Modal -->
    <ImageCropper
      v-if="showCropper"
      :image-url="tempImageUrl"
      :title="t('enterprise.cropLogo')"
      @crop-complete="handleCropComplete"
      @cancel="handleCropCancel"
    />
  </div>
</template>

<style scoped>
input[type='checkbox'],
input[type='radio'] {
  accent-color: #f94daf;
}
</style>
