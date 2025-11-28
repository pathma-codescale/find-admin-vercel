<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSeekerStore } from '@/store/seeker/useSeekerStore'
import { useCommonStore } from '@/store/common/useCommonStore'
import { toast } from 'vue-sonner'
import { AxiosError } from 'axios'
import { useI18n } from 'vue-i18n'
import {
  getContractOptions,
  getDomainOptions,
  getQualitiesOptions,
  getSkillsOptions,
  getWorkingTimeOptions,
} from '@/constants/selectorOptionsNew'
import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import SweetAlert from '@/utils/sweetAlert'

const { t } = useI18n()

const predefinedInterests = getDomainOptions(t)
const predefinedSkills = getSkillsOptions(t)
const predefinedQualities = getQualitiesOptions(t)

interface FormData {
  // candidateName: string
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  countryCode: string
  dateOfBirth: string
  cityOfResidence: string
  interests: string[]
  skills: string[]
  qualities: string[]
  additionalInfo: string
  contractTypes: string[]
  workingTime: string[]
  availability: string
  preferredLocation: string
  initialPassword: string
  emailNotifications: boolean
  isAccountSuspended: boolean
  profilePicture?: string | File
  candidateId?: string
  status?: string
}

const router = useRouter()
const route = useRoute()
const fileInput = ref<HTMLInputElement>()
const profilePicturePreview = ref<string>('')
const seekerStore = useSeekerStore()
const commonStore = useCommonStore()

const isEditMode = computed(() => {
  return route.name === 'edit-candidate' || route.params.id !== undefined
})

const isViewOnly = computed(() => route.path.includes('/view'))

const formData = reactive<FormData>({
  firstName: '',
  lastName: '',
  emailAddress: '',
  phoneNumber: '',
  countryCode: '+94',
  dateOfBirth: '',
  cityOfResidence: '',
  interests: [],
  skills: [],
  qualities: [],
  additionalInfo: '',
  contractTypes: [],
  workingTime: [],
  availability: '',
  preferredLocation: '',
  initialPassword: '',
  emailNotifications: true,
  isAccountSuspended: false,
  profilePicture: '',
  status: 'active',
})

const contractTypeOptions = getContractOptions(t)
const workingTimeOptions = getWorkingTimeOptions(t)

const skillsWithLabels = computed(() => {
  const skillsMap = predefinedSkills.reduce((acc: Record<string, string>, skill: any) => {
    acc[skill.value] = skill.label
    return acc
  }, {})

  return formData.skills.map((skill: any) => {
    if (typeof skill === 'object' && skill !== null && skill.label) {
      return skill
    }

    const skillValue = typeof skill === 'string' ? skill : skill?.value
    return {
      value: skillValue,
      label: skillsMap[skillValue] || skillValue,
    }
  })
})

const interestsWithLabels = computed(() => {
  const interestsMap = predefinedInterests.reduce((acc: Record<string, string>, interest: any) => {
    acc[interest.value] = interest.label
    return acc
  }, {})

  return formData.interests.map((interest: any) => {
    if (typeof interest === 'object' && interest !== null && interest.label) {
      return interest
    }

    const interestValue = typeof interest === 'string' ? interest : interest?.value
    return {
      value: interestValue,
      label: interestsMap[interestValue] || interestValue,
    }
  })
})

const qualitiesWithLabels = computed(() => {
  const qualitiesMap = predefinedQualities.reduce((acc: Record<string, string>, quality: any) => {
    acc[quality.value] = quality.label
    return acc
  }, {})

  return formData.qualities.map((quality: any) => {
    if (typeof quality === 'object' && quality !== null && quality.label) {
      return quality
    }

    const qualityValue = typeof quality === 'string' ? quality : quality?.value
    return {
      value: qualityValue,
      label: qualitiesMap[qualityValue] || qualityValue,
    }
  })
})

const handleCustomInterestAdd = (customInterest: string) => {
  console.log('Custom interest added:', customInterest)
}

const handleCustomSkillAdd = (customSkill: string) => {
  console.log('Custom skill added:', customSkill)
}

const handleCustomQualityAdd = (customQuality: string) => {
  console.log('Custom quality added:', customQuality)
}

const loadCandidateData = async (candidateId: string) => {
  try {
    await seekerStore.fetchCandidateById(candidateId)
    const candidate = seekerStore.selectedCandidate!

    Object.assign(formData, {
      candidateId: candidate.id,
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      emailAddress: candidate.email || '',
      phoneNumber: candidate.phoneNumber || '',
      countryCode: '+94',
      dateOfBirth: candidate.dateOfBirth || '',
      cityOfResidence: candidate.cityOfResidence || '',
      interests: candidate.interests || [],
      skills: candidate.skills || [],
      qualities: candidate.qualities || [],
      additionalInfo: candidate.additionalInfo || '',
      contractTypes: candidate.contracts || [],
      workingTime: candidate.workingTime || [],
      availability: Array.isArray(candidate.availability) ? candidate.availability.join(', ') : '',
      preferredLocation: candidate.location?.locationName || '',
      profilePicture: candidate.profilePhotoUrl || '',
      emailNotifications: candidate.enabledEmail ?? true,
      status: candidate.status,
    })

    if (formData.profilePicture && typeof formData.profilePicture === 'string') {
      profilePicturePreview.value = formData.profilePicture
    }
  } catch (error) {
    toast('Failed to load candidate data.')
  }
}

const handleFileUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

  const file = target.files[0]

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert('File size must be less than 5MB')
    return
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, GIF, or SVG)')
    return
  }

  try {
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

    SweetAlert.loading(`Uploading...`, t('alerts.loading.pleaseWait'))
    await commonStore.uploadFileToPresignedUrl(signUrl, file, file.type, (progress) => {
      console.log(`Upload progress: ${progress}%`)
    })

    formData.profilePicture = objectUrl

    profilePicturePreview.value = objectUrl
    SweetAlert.success(t('common.success'), 'Image uploaded successfully!')
  } catch (error: any) {
    console.error('Error uploading profile picture:', error)
    alert('Failed to upload profile picture. Please try again.')
  }
}

const removeProfilePicture = async () => {
  try {
    if (formData.profilePicture && typeof formData.profilePicture === 'string') {
      const url = new URL(formData.profilePicture)
      const fileKey = url.pathname.substring(1)

      if (fileKey) {
        await commonStore.deleteImage(fileKey)
      }
    }

    formData.profilePicture = ''
    profilePicturePreview.value = ''

    if (fileInput.value) fileInput.value.value = ''
  } catch (error: any) {
    toast('Failed to delete profile picture. Please try again.')
  }
}

const validateForm = (): boolean => {
  if (!formData.firstName.trim()) {
    toast('Candidate first name is required')
    return false
  }
  if (!formData.lastName.trim()) {
    toast('Candidate last name is required')
    return false
  }

  if (!formData.emailAddress.trim()) {
    toast('Email address is required')
    return false
  }
  if (!formData.phoneNumber.trim()) {
    toast('Phone number is required')
    return false
  }
  if (!formData.dateOfBirth) {
    toast('Date of birth is required')
    return false
  }
  if (!formData.cityOfResidence.trim()) {
    toast('City of residence is required')
    return false
  }

  return true
}

const sendPasswordReset = async () => {
  if (!formData.emailAddress) {
    SweetAlert.error(t('common.error'), 'Candidate email address is missing.')
    return
  }

  const result = await SweetAlert.confirm(
    t('candidate.resetPassword'),
    `Send a password reset email to ${formData.emailAddress}?`,
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  try {
    await seekerStore.sendResetPasswordEmailCandidate(formData.emailAddress)
    SweetAlert.success(t('common.success'), t('alerts.success.passwordResetSent'))
  } catch (error: any) {
    console.error('Error sending password reset:', error)
    SweetAlert.error(t('common.error'), error.message || 'Failed to send password reset email.')
  }
}

const toggleSuspendAccount = async (candidateId: string) => {
  const suspended = formData.status === 'suspended'

  const action = suspended ? 'activate' : 'suspend'
  const confirmText =
    action === 'suspend'
      ? t('alerts.confirm.suspendAccount')
      : t('alerts.confirm.reactivateAccount')

  const result = await SweetAlert.confirm(
    `${action} Account`,
    confirmText,
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  try {
    if (action === 'suspend') {
      await seekerStore.suspendCandidate(candidateId)
    } else {
      await seekerStore.activateCandidate(candidateId)
    }
    SweetAlert.success(
      t('common.success'),
      action === 'suspend'
        ? t('alerts.success.accountSuspended')
        : t('alerts.success.accountReactivated'),
    )
    await loadCandidateData(route.params.id as string)
  } catch (error: any) {
    console.error(`Error trying to ${action} candidate:`, error)
    SweetAlert.error(t('common.error'), t('enterprise.alerts.suspendFailed'))
  }
}

const confirmDeleteAccount = async () => {
  const result = await SweetAlert.confirm(
    t('candidate.deleteAccount'),
    'Are you sure you want to delete this account? This action cannot be undone.',
    t('common.yes'),
    t('common.cancel'),
  )

  if (!result.isConfirmed) return

  const finalConfirm = await SweetAlert.confirm(
    'Final Confirmation',
    'This will permanently delete all enterprise data. Are you absolutely sure?',
    'Yes, Delete Permanently',
    t('common.cancel'),
  )

  if (finalConfirm.isConfirmed) {
    await deleteAccount()
  }
}

const deleteAccount = async () => {
  const candidateId = route.params.id as string
  if (!candidateId) {
    SweetAlert.error(t('common.error'), 'Candidate ID not found.')
    return
  }

  try {
    SweetAlert.loading(t('alerts.loading.deletingData'), t('alerts.loading.pleaseWait'))
    await seekerStore.deleteCandidateById(candidateId)
    SweetAlert.success(t('common.success'), 'Account deleted successfully!')
    router.push('/manage-users/candidates')
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>
    const backendMessage =
      axiosError.response?.data?.message || axiosError.message || 'Failed to delete account.'

    toast.error(backendMessage)
  }
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    const payload = {
      id: formData.candidateId,
      username: formData.emailAddress,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
      cityOfResidence: formData.cityOfResidence,

      contracts: formData.contractTypes,
      availability: [formData.availability],
      interests: formData.interests.map((i: any) => (typeof i === 'string' ? i : i.value)),
      skills: formData.skills.map((s: any) => (typeof s === 'string' ? s : s.value)),
      qualities: formData.qualities.map((q: any) => (typeof q === 'string' ? q : q.value)),
      workingTime: formData.workingTime,

      additionalInfo: formData.additionalInfo,
      profilePhotoUrl:
        typeof formData.profilePicture === 'string' ? formData.profilePicture : undefined,

      enabledEmail: formData.emailNotifications,
      enabledPushNotification: formData.emailNotifications,

      location: {
        locationName: formData.preferredLocation,
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        range: 0,
      },

      days: [],
      schedules: [],
    }
    SweetAlert.loading(
      isEditMode.value
        ? t('alerts.loading.updatingCandidate')
        : t('alerts.loading.addingCandidate'),
      t('alerts.loading.pleaseWait'),
    )
    if (isEditMode.value && formData.candidateId) {
      await seekerStore.updateCandidate(payload)
    } else {
      const newCandidate = await seekerStore.createCandidate(payload)
      console.log('New candidate created:', newCandidate)
    }
    SweetAlert.success(
      t('common.success'),
      isEditMode.value ? t('alerts.success.candidateUpdated') : t('alerts.success.candidateAdded'),
    ).then(() => router.push('/manage-users/candidates'))
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>

    const backendMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to save candidate. Please try again.'
    SweetAlert.error(t('common.error'), backendMessage)
  }
}

const toggleHideCandidate = async (candidateId: string) => {
  const candidate = formData

  if (!candidate) {
    SweetAlert.error('Missing Data', 'Candidate not found')
    return
  }

  const isHidden = candidate.status === 'hidden'

  const actionText = isHidden ? t('alerts.titles.unhideAccount') : t('alerts.titles.hideAccount')
  const confirmText = isHidden ? t('alerts.confirm.unhideAccount') : t('alerts.confirm.hideAccount')

  const result = await SweetAlert.confirm(
    `${actionText}`,
    confirmText,
    t('common.yes'),
    t('common.cancel'),
  )
  if (!result.isConfirmed) return

  try {
    candidate.status = isHidden ? 'active' : 'hidden'

    if (isHidden) {
      SweetAlert.loading(t('alerts.loading.unhidingAccount'), t('alerts.loading.pleaseWait'))
      await seekerStore.displayCandidate(candidateId)
    } else {
      SweetAlert.loading(t('alerts.loading.hidingAccount'), t('alerts.loading.pleaseWait'))

      await seekerStore.hideCandidate(candidateId)
    }
    SweetAlert.success(
      t('common.success'),
      isHidden ? t('alerts.success.accountVisible') : t('alerts.success.accountHidden'),
    )
  } catch (err) {
    console.error(err)
    candidate.status = isHidden ? 'hidden' : 'active'
    SweetAlert.error(
      t('common.error'),
      isHidden ? t('alerts.error.hideAccount') : t('alerts.error.unhideAccount'),
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
  if (result.isConfirmed) router.push('/manage-users/candidates')
}

onMounted(async () => {
  if ((isEditMode.value || isViewOnly.value) && route.params.id) {
    await loadCandidateData(route.params.id as string)
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
        <DashboardHeader />
      </div>
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <Breadcrumb />

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Section 1: Basic Information -->
          <div class="rounded-lg p-6 bg-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ $t('candidate.sections.section1') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.candidateFirstName') }}*</label
                >
                <input
                  v-model="formData.firstName"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="$t('candidate.placeholders.candidateFirstName')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.candidateLastName') }}*</label
                >
                <input
                  v-model="formData.lastName"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="$t('candidate.placeholders.candidateLastName')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.emailAddress') }}*</label
                >
                <input
                  v-model="formData.emailAddress"
                  :disabled="isViewOnly || isEditMode"
                  type="email"
                  :placeholder="$t('candidate.placeholders.emailAddress')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.phoneNumber') }}*</label
                >
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
                    :placeholder="$t('candidate.placeholders.phoneNumber')"
                    class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.dateOfBirth') }}*</label
                >
                <input
                  v-model="formData.dateOfBirth"
                  :disabled="isViewOnly"
                  type="date"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.cityOfResidence') }}*</label
                >
                <input
                  v-model="formData.cityOfResidence"
                  :disabled="isViewOnly"
                  type="text"
                  :placeholder="$t('candidate.placeholders.cityOfResidence')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <!-- <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2"
                  >{{ $t('candidate.cityOfResidence') }}*</label
                >
                <input
                  v-model="formData.cityOfResidence"
                  type="text"
                  :placeholder="$t('candidate.placeholders.cityOfResidence')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div> -->
            </div>

            <!-- <div class="mt-6">
              <label class="block text-sm font-medium mb-2">{{
                $t('candidate.profilePicture')
              }}</label>
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <div
                    class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="profilePicturePreview"
                      :src="profilePicturePreview"
                      alt="Profile Preview"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-2xl">👤</span>
                  </div>
                  <button
                    v-if="formData.profilePicture"
                    @click="removeProfilePicture"
                    type="button"
                    class="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    {{ $t('common.remove') }}
                  </button>
                </div>
                <div class="flex-1">
                  <div
                    class="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                    @click="handleFileUpload"
                  >
                    <div class="text-primary mb-2">📤</div>
                    <p class="text-sm text-gray-400">
                      {{ $t('candidate.descriptions.profileUpload') }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ $t('candidate.descriptions.profileFormats') }}
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
            </div> -->

            <div class="mt-6">
              <label class="block text-sm font-medium mb-2">
                {{ $t('candidate.profilePicture') }}
              </label>

              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-center">
                  <!-- Profile Picture Preview -->
                  <div
                    class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      v-if="profilePicturePreview"
                      :src="profilePicturePreview"
                      alt="Profile Preview"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-2xl">👤</span>
                  </div>

                  <!-- Remove button (hidden in view-only mode) -->
                  <button
                    v-if="formData.profilePicture && !isViewOnly"
                    @click="removeProfilePicture"
                    type="button"
                    class="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    {{ $t('common.remove') }}
                  </button>
                </div>

                <div class="flex-1">
                  <!-- Upload area -->
                  <div
                    class="border-2 border-dashed rounded-lg p-4 text-center transition-colors"
                    :class="[
                      isViewOnly
                        ? 'border-gray-700 bg-gray-800 cursor-not-allowed opacity-60'
                        : 'border-gray-600 hover:border-primary cursor-pointer',
                    ]"
                    @click="!isViewOnly && handleFileUpload()"
                  >
                    <div class="text-primary mb-2">📤</div>
                    <p class="text-sm text-gray-400">
                      {{ $t('candidate.descriptions.profileUpload') }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ $t('candidate.descriptions.profileFormats') }}
                    </p>
                  </div>

                  <!-- File input (disabled when view-only) -->
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="isViewOnly"
                    @change="handleFileChange"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Professional Profile -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ $t('candidate.sections.section2') }}
            </h3>

            <div class="space-y-6">
              <!-- Interests Multi-Select -->
              <div>
                <label class="block text-sm font-medium mb-2">{{
                  $t('candidate.interests')
                }}</label>
                <MultiSelectDropdown
                  v-model="formData.interests"
                  :model-value="interestsWithLabels"
                  :options="predefinedInterests"
                  :disabled="isViewOnly"
                  :placeholder="$t('candidate.placeholders.interests')"
                  :search-placeholder="$t('candidate.placeholders.searchInterests')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="$t('candidate.noOptionsFound.interests')"
                  tag-background-color="#EC4899"
                  @add-custom="handleCustomInterestAdd"
                  @update:model-value="
                    (val) =>
                      (formData.interests = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <!-- Skills Multi-Select -->
              <div>
                <label class="block text-sm font-medium mb-2">{{ $t('candidate.skills') }}</label>
                <MultiSelectDropdown
                  v-model="formData.skills"
                  :model-value="skillsWithLabels"
                  :options="predefinedSkills"
                  :disabled="isViewOnly"
                  :placeholder="$t('candidate.placeholders.skills')"
                  :search-placeholder="$t('candidate.placeholders.searchSkills')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="$t('candidate.noOptionsFound.skills')"
                  tag-background-color="#2563EB"
                  @add-custom="handleCustomSkillAdd"
                  @update:model-value="
                    (val) =>
                      (formData.skills = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <!-- Qualities Multi-Select -->
              <div>
                <label class="block text-sm font-medium mb-2">{{
                  $t('candidate.qualities')
                }}</label>
                <MultiSelectDropdown
                  v-model="formData.qualities"
                  :model-value="qualitiesWithLabels"
                  :options="predefinedQualities"
                  :disabled="isViewOnly"
                  :placeholder="$t('candidate.placeholders.qualities')"
                  :search-placeholder="$t('candidate.placeholders.searchQualities')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="$t('candidate.noOptionsFound.qualities')"
                  tag-background-color="#059669"
                  @add-custom="handleCustomQualityAdd"
                  @update:model-value="
                    (val) =>
                      (formData.qualities = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <!-- Additional Info -->
              <div>
                <label class="block text-sm font-medium mb-2">{{
                  $t('candidate.additionalInfo')
                }}</label>
                <textarea
                  v-model="formData.additionalInfo"
                  :disabled="isViewOnly"
                  :placeholder="$t('candidate.placeholders.additionalInfo')"
                  rows="4"
                  maxlength="275"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
                <p class="text-xs text-gray-400 mt-1">
                  {{ 275 - formData.additionalInfo.length }}
                  {{ $t('candidate.descriptions.charactersLeft') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Section 3: Job Preferences -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ $t('candidate.sections.section3') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-3"> {{ $t('job.contractTypes') }}</label>
                <div class="flex flex-wrap gap-4">
                  <label
                    v-for="type in contractTypeOptions"
                    :key="type.label"
                    class="flex items-center cursor-pointer"
                  >
                    <input
                      v-model="formData.contractTypes"
                      :disabled="isViewOnly"
                      :value="type.value"
                      type="checkbox"
                      class="mr-2 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                    />
                    {{ type.label }}
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-3">{{ $t('job.workingTime') }}</label>
                <div class="flex flex-wrap gap-4">
                  <label
                    v-for="time in workingTimeOptions"
                    :key="time.label"
                    class="flex items-center cursor-pointer"
                  >
                    <input
                      v-model="formData.workingTime"
                      :disabled="isViewOnly"
                      :value="time.value"
                      type="checkbox"
                      class="mr-2 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary"
                    />
                    {{ time.label }}
                  </label>
                </div>
              </div>

              <!-- <div>
                <label class="block text-sm font-medium mb-3">Availability</label>
                <div class="flex flex-wrap gap-4">
                  <label
                    v-for="availability in availabilityOptions"
                    :key="availability.label"
                    class="flex items-center cursor-pointer"
                  >
                    <input
                      v-model="formData.availability"
                      :value="availability.value"
                      type="radio"
                      name="availability"
                      class="mr-2 text-primary bg-gray-700 border-gray-600 focus:ring-primary"
                    />
                    {{ availability.label }}
                  </label>
                </div>
              </div> -->

              <div>
                <label class="block text-sm font-medium mb-2">{{
                  $t('candidate.preferredLocation')
                }}</label>
                <input
                  v-model="formData.preferredLocation"
                  type="text"
                  :disabled="isViewOnly"
                  :placeholder="$t('candidate.placeholders.preferredLocation')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <!-- Section 4: Account Settings -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ $t('candidate.sections.section4') }}
            </h3>

            <div class="space-y-6">
              <!-- Initial Password (only show when adding new candidate) -->
              <div
                v-if="!isEditMode && !isViewOnly"
                class="space-y-2 border border-gray-600 rounded-md p-4 bg-primary/10"
              >
                <label class="block text-sm font-semibold mb-2">{{
                  $t('candidate.initialPassword')
                }}</label>
                <p class="text-xs text-white mb-1">
                  {{ $t('candidate.descriptions.initialPassword') }}
                </p>
              </div>

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
                        'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ',
                        formData.emailNotifications ? 'translate-x-6 ml-1' : 'translate-x-0 ml-0.5',
                      ]"
                    ></div>
                  </div>
                  <div class="ml-4">
                    <span class="font-medium">{{ $t('enterprise.notifications.enablePush') }}</span>
                    <p class="text-sm text-gray-400">
                      {{ $t('enterprise.descriptions.pushNotifications') }}
                    </p>
                  </div>
                </label>
              </div>

              <!-- Edit mode only sections -->
              <template v-if="!isViewOnly && isEditMode">
                <!-- Reset Password -->
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">{{
                    $t('candidate.resetPassword')
                  }}</label>
                  <button
                    @click="sendPasswordReset"
                    type="button"
                    class="px-4 py-2 min-w-[20vw] bg-primary text-white rounded-md hover:bg-primaryDark transition-colors"
                  >
                    {{ $t('candidate.actions.sendPasswordReset') }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('candidate.descriptions.resetPassword') }}
                  </p>
                </div>

                <!-- Suspend Account -->
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">{{
                    $t('candidate.suspendAccount')
                  }}</label>
                  <button
                    @click="toggleSuspendAccount(formData.candidateId!)"
                    type="button"
                    :class="[
                      'min-w-[20vw] px-4 py-2 rounded-md transition-colors',
                      formData.status === 'suspended'
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-500 text-white',
                    ]"
                  >
                    {{
                      formData.status === 'suspended'
                        ? $t('candidate.actions.reactivateAccount')
                        : $t('candidate.actions.suspendAccount')
                    }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('candidate.descriptions.suspendAccount') }}
                  </p>
                </div>

                <!-- Delete Account -->
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">Delete Account</label>
                  <button
                    @click="confirmDeleteAccount"
                    type="button"
                    class="min-w-[20vw] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
                  >
                    {{ $t('candidate.deleteAccount') }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ $t('candidate.descriptions.deleteAccount') }}
                  </p>
                </div>

                <!-- Hide / Unhide Candidate -->
                <div>
                  <label class="block text-sm font-medium mb-2 text-white">Visibility</label>
                  <button
                    @click="toggleHideCandidate(formData.candidateId!)"
                    type="button"
                    :class="[
                      'min-w-[20vw] px-4 py-2 rounded-md transition-colors',
                      formData.status === 'hidden'
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white',
                    ]"
                  >
                    {{ formData.status === 'hidden' ? 'Unhide Candidate' : 'Hide Candidate' }}
                  </button>
                  <p class="text-xs text-gray-400 mt-1">
                    {{
                      formData.status === 'hidden'
                        ? 'This candidate is currently hidden and cannot be seen by companies.'
                        : 'Hiding will make this candidate invisible to companies.'
                    }}
                  </p>
                </div>
              </template>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4">
            <button
              @click="cancelForm"
              type="button"
              class="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              v-if="!isViewOnly"
              type="submit"
              class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              {{ isEditMode ? $t('common.saveChanges') : $t('candidate.addCandidate') }}
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
