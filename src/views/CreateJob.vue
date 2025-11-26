<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { SweetAlert } from '@/utils/sweetAlert'
import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import SelectCurrency from '@/components/SelectCurrency.vue'
import LocationMap from '@/components/LocationMap.vue'
import { useJobStore } from '@/store/job/useJobStore'
import {
  getSkillsOptions,
  getQualitiesOptions,
  getDomainOptions,
  getConditionOptions,
} from '@/constants/selectorOptionsNew'

import { useEnterpriseStore } from '@/store/enterprise/useEnterpriseStore'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const jobStore = useJobStore()
const enterpriseStore = useEnterpriseStore()

// Get reactive state from enterprise store
const { enterprises, loading: enterprisesLoading } = storeToRefs(enterpriseStore)

// Enterprise search state
const enterpriseSearch = ref('')
const showEnterpriseDropdown = ref(false)
const selectedEnterpriseId = ref<string | null>(null)

// Debounce timer for search
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Watch for enterprise search changes and trigger API call
watch(enterpriseSearch, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!newValue || newValue.length < 2) {
    showEnterpriseDropdown.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    showEnterpriseDropdown.value = true
    await enterpriseStore.searchEnterprises(newValue)
    console.log('Enterprises found:', enterprises.value)
  }, 300) // 300ms debounce
})

// Select enterprise from dropdown
const selectedEnterpriseDetails = ref<{
  brand_name: string
  logo?: string
} | null>(null)

// Select enterprise from dropdown
const selectEnterprise = (enterprise: any) => {
  formData.hiringEnterprise = enterprise.brand_name
  selectedEnterpriseId.value = enterprise.enterpriseId
  enterpriseSearch.value = enterprise.brand_name
  showEnterpriseDropdown.value = false

  // Store enterprise details to show logo and name
  selectedEnterpriseDetails.value = {
    brand_name: enterprise.brand_name,
    logo: enterprise.logo,
  }
}

// Clear selected enterprise
const clearSelectedEnterprise = () => {
  formData.hiringEnterprise = ''
  selectedEnterpriseId.value = null
  enterpriseSearch.value = ''
  selectedEnterpriseDetails.value = null
}

// Handle blur with delay to allow click events
const handleEnterpriseBlur = () => {
  setTimeout(() => {
    showEnterpriseDropdown.value = false
  }, 200)
}

// Handle focus - show dropdown if there are search results
const handleEnterpriseFocus = () => {
  if (enterpriseSearch.value && enterprises.value.length > 0) {
    showEnterpriseDropdown.value = true
  }
}

const fetchEnterpriseDetails = async (companyId: string) => {
  try {
    const enterprise = await enterpriseStore.getEnterpriseById(companyId)
    if (enterprise) {
      selectedEnterpriseDetails.value = {
        brand_name: enterprise.brand_name || formData.hiringEnterprise,
        logo: enterprise.logo,
      }
    }
  } catch (error) {
    console.error('Error fetching enterprise details:', error)
    // Fallback to just showing the name
    selectedEnterpriseDetails.value = {
      brand_name: formData.hiringEnterprise,
    }
  }
}

interface LocationDetails {
  name: string
  address: string
  lat: number
  lng: number
}

interface FormData {
  hiringEnterprise: string
  jobTitle: string
  essentialSkills: string[]
  desiredQualities: string[]
  jobDomains: string[]
  workplaceType: string
  jobLocation: string
  locationDetails?: LocationDetails
  serviceRadius: number
  contractTypes: {
    permanent: boolean
    fixedTerm: boolean
    internship: boolean
  }
  workingTime: {
    fullTime: boolean
    partTime: boolean
  }
  selectedDays: string[]
  selectedSchedules: string[]
  startDate: string
  hourlySalary: string
  monthlySalary: string
  annualSalary: string
  currency: string
  benefits: string[]
  jobDescription: string
  initialStatus: string
  jobId?: string
}

// Available options for dropdowns
const availableSkills = getSkillsOptions(t)
const availableQualities = getQualitiesOptions(t)
const availableDomains = getDomainOptions(t)
const availableBenefits = getConditionOptions(t)

// Determine if we're in edit mode or view mode
const isEditMode = computed(() => {
  return route.name === 'edit-job' || route.params.id !== undefined
})
const isViewMode = computed(() => route.path.includes('/view'))

const formData = reactive<FormData>({
  hiringEnterprise: '',
  jobTitle: '',
  essentialSkills: [],
  desiredQualities: [],
  jobDomains: [],
  workplaceType: 'onsite',
  jobLocation: '',
  locationDetails: undefined,
  serviceRadius: 1000,
  contractTypes: {
    permanent: false,
    fixedTerm: false,
    internship: false,
  },
  workingTime: {
    fullTime: false,
    partTime: false,
  },
  selectedDays: [],
  selectedSchedules: [],
  startDate: 'rightNow',
  hourlySalary: '',
  monthlySalary: '',
  annualSalary: '',
  currency: '',
  benefits: [],
  jobDescription: '',
  initialStatus: 'active',
})

// Transform form data to API format
const transformFormDataToApi = () => {
  // Build contract types array (using API format: CDI, CDD, STAGE)
  const contractTypes = []
  if (formData.contractTypes.permanent) contractTypes.push('CDI')
  if (formData.contractTypes.fixedTerm) contractTypes.push('CDD')
  if (formData.contractTypes.internship) contractTypes.push('STAGE')

  // Build working time array (using API format: temps_plein, temps_partiel)
  const workingTime = []
  if (formData.workingTime.fullTime) workingTime.push('temps_plein')
  if (formData.workingTime.partTime) workingTime.push('temps_partiel')

  const location = {
    locationName: formData.jobLocation || '',
    coordinates: formData.locationDetails
      ? {
          latitude: formData.locationDetails.lat,
          longitude: formData.locationDetails.lng,
        }
      : undefined,
    range: formData.serviceRadius || 1000,
  }

  return {
    companyId: selectedEnterpriseId.value,
    companyName: formData.hiringEnterprise,
    jobTitle: formData.jobTitle,
    skills: formData.essentialSkills.map((s: any) => (typeof s === 'string' ? s : s.value)),
    qualities: formData.desiredQualities.map((q: any) => (typeof q === 'string' ? q : q.value)),
    domain: formData.jobDomains.map((d: any) => (typeof d === 'string' ? d : d.value)),
    workplaceType: formData.workplaceType.toUpperCase(),
    location: location,
    contract: contractTypes,
    workingTime: workingTime,
    days: formData.selectedDays.map((d: any) => (typeof d === 'string' ? d : d.value)),
    schedules: formData.selectedSchedules.map((s: any) => (typeof s === 'string' ? s : s.value)),
    startDate: formData.startDate ? [formData.startDate] : [],
    salary: {
      hourly: formData.hourlySalary || '',
      monthly: formData.monthlySalary || '',
      annual: formData.annualSalary || '',
    },
    currency: formData.currency || '€',
    benefits: formData.benefits.map((b: any) => (typeof b === 'string' ? b : b.value)),
    jobDescription: formData.jobDescription || '',
    status: formData.initialStatus.toUpperCase(),
  }
}

// Transform API data to form format
const transformApiDataToForm = (job: any) => {
  // Parse contract types (API uses: CDI, CDD, STAGE)
  const contractTypes = {
    permanent: job.contract?.includes('CDI') || false,
    fixedTerm: job.contract?.includes('CDD') || false,
    internship: job.contract?.includes('STAGE') || false,
  }

  // Parse working time (API uses: temps_plein, temps_partiel)
  const workingTime = {
    fullTime: job.workingTime?.includes('temps_plein') || false,
    partTime: job.workingTime?.includes('temps_partiel') || false,
  }

  // Set form data
  Object.assign(formData, {
    jobId: job.jobId,
    hiringEnterprise: job.companyName || '',
    jobTitle: job.jobTitle || '',
    essentialSkills: job.skills || [],
    desiredQualities: job.qualities || [],
    jobDomains: job.domain || [],
    workplaceType: job.workplaceType?.toLowerCase() || 'onsite',
    jobLocation: job.location?.locationName || '',
    serviceRadius: job.location?.range || 1000,
    locationDetails: job.location?.coordinates
      ? {
          name: job.location.locationName,
          address: job.location.locationName,
          lat: job.location.coordinates.latitude,
          lng: job.location.coordinates.longitude,
        }
      : undefined,
    contractTypes,
    workingTime,
    selectedDays: job.days || [],
    selectedSchedules: job.schedules || [],
    startDate: job.startDate?.[0] || 'rightNow',
    hourlySalary: job.salary?.hourly?.toString() || '',
    monthlySalary: job.salary?.monthly?.toString() || '',
    annualSalary: job.salary?.annual?.toString() || '',
    currency: job.currency || '€',
    benefits: job.benefits || [],
    jobDescription: job.jobDescription || '',
    initialStatus: job.status?.toLowerCase() || 'active',
  })

  // Store the enterprise ID if available
  if (job.enterpriseId) {
    selectedEnterpriseId.value = job.enterpriseId
  }

  // Sync enterprise search with selected value
  enterpriseSearch.value = job.companyName || ''
}

// Methods for custom additions
const handleCustomSkillAdd = (customSkill: string) => {
  console.log('Custom skill added:', customSkill)
}

const handleCustomQualityAdd = (customQuality: string) => {
  console.log('Custom quality added:', customQuality)
}

const handleCustomDomainAdd = (customDomain: string) => {
  console.log('Custom domain added:', customDomain)
}

const handleCustomBenefitAdd = (customBenefit: string) => {
  console.log('Custom benefit added:', customBenefit)
}

const essentialSkillsWithLabels = computed(() => {
  const skillsMap = availableSkills.reduce((acc: Record<string, string>, skill: any) => {
    acc[skill.value] = skill.label
    return acc
  }, {})

  return formData.essentialSkills.map((skill: any) => {
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

const desiredQualitiesWithLabels = computed(() => {
  const qualitiesMap = availableQualities.reduce((acc: Record<string, string>, quality: any) => {
    acc[quality.value] = quality.label
    return acc
  }, {})

  return formData.desiredQualities.map((quality: any) => {
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

const jobDomainsWithLabels = computed(() => {
  const domainsMap = availableDomains.reduce((acc: Record<string, string>, domain: any) => {
    acc[domain.value] = domain.label
    return acc
  }, {})

  return formData.jobDomains.map((domain: any) => {
    if (typeof domain === 'object' && domain !== null && domain.label) {
      return domain
    }

    const domainValue = typeof domain === 'string' ? domain : domain?.value
    return {
      value: domainValue,
      label: domainsMap[domainValue] || domainValue,
    }
  })
})

const benefitsWithLabels = computed(() => {
  const benefitsMap = availableBenefits.reduce((acc: Record<string, string>, benefit: any) => {
    acc[benefit.value] = benefit.label
    return acc
  }, {})

  return formData.benefits.map((benefit: any) => {
    if (typeof benefit === 'object' && benefit !== null && benefit.label) {
      return benefit
    }

    const benefitValue = typeof benefit === 'string' ? benefit : benefit?.value
    return {
      value: benefitValue,
      label: benefitsMap[benefitValue] || benefitValue,
    }
  })
})

// Load job data for editing
const loadJobData = async (jobId: string) => {
  try {
    await jobStore.getJob(jobId)

    if (jobStore.selectedJob) {
      transformApiDataToForm(jobStore.selectedJob)

      // Fetch enterprise details for both view and edit mode
      if (jobStore.selectedJob.companyId) {
        await fetchEnterpriseDetails(jobStore.selectedJob.companyId)
      }
    } else {
      throw new Error('Job not found')
    }
  } catch (error) {
    console.error('Error loading job data:', error)
    SweetAlert.error(
      t('common.error'),
      t('alerts.error.loadingData', { type: t('job.title').toLowerCase() }),
    )
    router.push('/manage-jobs')
  }
}

// Form validation
const validateForm = (): boolean => {
  if (!formData.hiringEnterprise.trim()) {
    SweetAlert.validation.required(t('job.hiringEnterprise'))
    return false
  }

  if (!selectedEnterpriseId.value) {
    SweetAlert.error(t('common.error'), t('job.pleaseSelectEnterpriseFromDropdown'))
    return false
  }

  if (!formData.jobTitle.trim()) {
    SweetAlert.validation.required(t('job.jobTitle'))
    return false
  }

  // Check if at least one contract type is selected
  const hasContractType = Object.values(formData.contractTypes).some((value) => value === true)
  if (!hasContractType) {
    SweetAlert.validation.required(t('job.contractTypes'))
    return false
  }

  // Check if at least one working time is selected
  const hasWorkingTime = Object.values(formData.workingTime).some((value) => value === true)
  if (!hasWorkingTime) {
    SweetAlert.validation.required(t('job.workingTime'))
    return false
  }

  if (formData.workplaceType !== 'remote' && !formData.jobLocation.trim()) {
    SweetAlert.validation.required(t('job.jobLocation'))
    return false
  }

  return true
}

// Submit form (create or update)
const submitForm = async () => {
  if (!validateForm()) return

  // Show loading
  SweetAlert.loading(
    isEditMode.value ? t('alerts.loading.updatingJob') : t('alerts.loading.publishingJob'),
    t('alerts.loading.pleaseWait'),
  )

  try {
    const apiData = transformFormDataToApi()

    if (isEditMode.value && formData.jobId) {
      // Update existing job
      await jobStore.updateJob(formData.jobId, apiData)

      if (jobStore.error) {
        throw new Error(jobStore.error)
      }

      SweetAlert.success(t('common.success'), t('alerts.success.jobUpdated')).then(() => {
        router.push('/manage-jobs')
      })
    } else {
      // Create new job
      await jobStore.createJob(apiData)
      console.log('createjob**** ', apiData)

      if (jobStore.error) {
        throw new Error(jobStore.error)
      }

      SweetAlert.success(t('common.success'), t('alerts.success.jobPublished')).then(() => {
        router.push('/manage-jobs')
      })
    }
  } catch (error: any) {
    console.error('Error submitting form:', error)
    if (isEditMode.value) {
      SweetAlert.error(
        t('common.error'),
        t('alerts.error.updatingData', { type: t('job.title').toLowerCase() }),
      )
    } else {
      SweetAlert.error(
        t('common.error'),
        t('alerts.error.savingData', { type: t('job.title').toLowerCase() }),
      )
    }
  }
}

const saveAsDraft = async () => {
  try {
    // Set status to draft
    const currentStatus = formData.initialStatus
    formData.initialStatus = 'draft'

    // Show loading
    SweetAlert.loading(t('alerts.loading.savingDraft'))

    const apiData = transformFormDataToApi()

    if (isEditMode.value && formData.jobId) {
      await jobStore.updateJob(formData.jobId, apiData)
    } else {
      await jobStore.createJob(apiData)
    }

    if (jobStore.error) {
      throw new Error(jobStore.error)
    }

    // Show success message
    SweetAlert.toast.success(t('alerts.success.draftSaved'))

    // Navigate to manage jobs
    setTimeout(() => {
      router.push('/manage-jobs')
    }, 1000)
  } catch (error) {
    console.error('Error saving draft:', error)
    SweetAlert.toast.error(t('alerts.error.savingDraft'))
  }
}

// Cancel form
const cancelForm = async () => {
  const result = await SweetAlert.confirm(
    t('alerts.titles.cancelChanges'),
    t('alerts.confirm.cancelChanges'),
    t('alerts.buttons.yesCancel'),
    t('alerts.buttons.continueEditing'),
  )

  if (result.isConfirmed) {
    router.push('/manage-jobs')
  }
}

// Location handlers
const googleMapsApiKey = 'AIzaSyBNQFackbUlkEUxb2LIouJ1r9jJZxIP7Nw'
const defaultMapCenter = { lat: 32.0809, lng: -81.0912 }

const onLocationSelected = (location: LocationDetails) => {
  console.log('Location selected:', location)
  formData.locationDetails = location
  formData.jobLocation = location.address
}

const onRadiusChanged = (data: { radius: number; location: LocationDetails | null }) => {
  formData.serviceRadius = Math.round(data.radius * 1000)
}

// Lifecycle
onMounted(async () => {
  // If we're in edit mode or view mode, load the job data
  if ((isEditMode.value || isViewMode.value) && route.params.id) {
    await loadJobData(route.params.id as string)
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

      <!-- Loading State -->
      <div
        v-if="jobStore.loading && (isEditMode || isViewMode)"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          ></div>
          <p class="text-gray-400 mt-4">{{ t('alerts.loading.loadingJob') }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="flex-1 p-6">
        <Breadcrumb />

        <form @submit.prevent="submitForm" class="space-y-8">
          <!-- Section 1: Core Job Details -->
          <div class="rounded-lg p-6 bg-gray-700">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('job.sections.coreJobDetails') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.hiringEnterprise') }}*
                </label>

                <!-- View Mode Display -->
                <div
                  v-if="isViewMode"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                >
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
                    >
                      <img
                        v-if="selectedEnterpriseDetails?.logo"
                        :src="selectedEnterpriseDetails.logo"
                        :alt="selectedEnterpriseDetails.brand_name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-gray-300 font-semibold text-lg">
                        {{ formData.hiringEnterprise?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-white font-medium truncate">
                        {{ selectedEnterpriseDetails?.brand_name || formData.hiringEnterprise }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Edit/Create Mode -->
                <div v-else>
                  <!-- Show selected enterprise if one is selected -->
                  <div
                    v-if="selectedEnterpriseId && selectedEnterpriseDetails"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-2"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div
                          class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
                        >
                          <img
                            v-if="selectedEnterpriseDetails.logo"
                            :src="selectedEnterpriseDetails.logo"
                            :alt="selectedEnterpriseDetails.brand_name"
                            class="w-full h-full object-cover"
                          />
                          <span v-else class="text-gray-300 font-semibold text-lg">
                            {{ selectedEnterpriseDetails.brand_name?.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-white font-medium truncate">
                            {{ selectedEnterpriseDetails.brand_name }}
                          </p>
                        </div>
                      </div>
                      <button
                        @click="clearSelectedEnterprise"
                        type="button"
                        :disabled="isEditMode"
                        class="text-gray-400 hover:text-white transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Search input (shown when no enterprise is selected) -->
                  <div v-else class="relative">
                    <input
                      v-model="enterpriseSearch"
                      @focus="handleEnterpriseFocus"
                      @blur="handleEnterpriseBlur"
                      type="text"
                      :placeholder="t('job.placeholders.searchCompany')"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                      autocomplete="off"
                      :disabled="isEditMode"
                    />
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        v-if="!enterprisesLoading"
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
                      <div
                        v-else
                        class="w-4 h-4 border-2 border-gray-400 border-t-primary rounded-full animate-spin"
                      ></div>
                    </div>

                    <!-- Dropdown -->
                    <div
                      v-if="showEnterpriseDropdown && enterprises.length > 0"
                      class="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      <div
                        v-for="enterprise in enterprises"
                        :key="enterprise.enterpriseId"
                        @mousedown.prevent="selectEnterprise(enterprise)"
                        class="px-4 py-2 hover:bg-gray-600 cursor-pointer transition-colors"
                      >
                        <div class="flex items-center space-x-3">
                          <div
                            class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
                          >
                            <img
                              v-if="enterprise.logo"
                              :src="enterprise.logo"
                              :alt="enterprise.brand_name"
                              class="w-full h-full object-cover"
                            />
                            <span v-else class="text-gray-300 font-semibold text-sm">
                              {{ enterprise.brand_name.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-white text-sm font-medium truncate">
                              {{ enterprise.brand_name }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- No results -->
                    <div
                      v-if="
                        showEnterpriseDropdown &&
                        enterpriseSearch &&
                        enterprises.length === 0 &&
                        !enterprisesLoading
                      "
                      class="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg"
                    >
                      <div class="px-4 py-3 text-gray-400 text-sm text-center">
                        {{ t('common.noResultsFound') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2"> {{ t('job.jobTitle') }}* </label>
                <input
                  :disabled="isViewMode"
                  v-model="formData.jobTitle"
                  type="text"
                  :placeholder="t('job.placeholders.jobTitle')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <!-- Section 2: Candidate Requirements -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('job.sections.candidateRequirements') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.essentialSkills') }}
                </label>
                <MultiSelectDropdown
                  :disabled="isViewMode"
                  v-model="formData.essentialSkills"
                  :model-value="essentialSkillsWithLabels"
                  :options="availableSkills"
                  :placeholder="t('job.placeholders.addSkill')"
                  :search-placeholder="t('job.placeholders.searchSkills')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="t('common.noOptionsFound')"
                  @add-custom="handleCustomSkillAdd"
                  @update:model-value="
                    (val) =>
                      (formData.essentialSkills = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.desiredQualities') }}
                </label>
                <MultiSelectDropdown
                  :disabled="isViewMode"
                  v-model="formData.desiredQualities"
                  :model-value="desiredQualitiesWithLabels"
                  :options="availableQualities"
                  :placeholder="t('job.placeholders.addQuality')"
                  :search-placeholder="t('job.placeholders.searchQualities')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="t('common.noOptionsFound')"
                  @add-custom="handleCustomQualityAdd"
                  @update:model-value="
                    (val) =>
                      (formData.desiredQualities = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.jobDomains') }}
                </label>
                <MultiSelectDropdown
                  :disabled="isViewMode"
                  v-model="formData.jobDomains"
                  :model-value="jobDomainsWithLabels"
                  :options="availableDomains"
                  :placeholder="t('job.placeholders.addDomain')"
                  :search-placeholder="t('job.placeholders.searchDomains')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="t('common.noOptionsFound')"
                  @add-custom="handleCustomDomainAdd"
                  @update:model-value="
                    (val) =>
                      (formData.jobDomains = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>
            </div>
          </div>

          <!-- Section 3: Location & Schedule -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('job.sections.locationSchedule') }}
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.workplaceType') }}
                </label>
                <div class="flex space-x-6">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="radio"
                      name="workplaceType"
                      value="onsite"
                      v-model="formData.workplaceType"
                      class="form-radio h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.workplaceTypes.onSite') }}</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="radio"
                      name="workplaceType"
                      value="hybrid"
                      v-model="formData.workplaceType"
                      class="form-radio h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.workplaceTypes.hybrid') }}</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="radio"
                      name="workplaceType"
                      value="remote"
                      v-model="formData.workplaceType"
                      class="form-radio h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.workplaceTypes.fullyRemote') }}</span>
                  </label>
                </div>
              </div>

              <div v-if="formData.workplaceType !== 'remote'">
                <LocationMap
                  :disabled="isViewMode"
                  v-model="formData.jobLocation"
                  :api-key="googleMapsApiKey"
                  :default-center="
                    formData.locationDetails
                      ? { lat: formData.locationDetails.lat, lng: formData.locationDetails.lng }
                      : defaultMapCenter
                  "
                  :initial-radius="formData.serviceRadius / 1000"
                  :initial-location-name="formData.locationDetails?.name"
                  :show-radius-control="true"
                  @location-selected="onLocationSelected"
                  @radius-changed="onRadiusChanged"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.contractTypes') }}
                </label>
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="checkbox"
                      v-model="formData.contractTypes.permanent"
                      class="form-checkbox h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.contractTypeOptions.permanent') }}</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="checkbox"
                      v-model="formData.contractTypes.fixedTerm"
                      class="form-checkbox h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.contractTypeOptions.fixedTerm') }}</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="checkbox"
                      v-model="formData.contractTypes.internship"
                      class="form-checkbox h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.contractTypeOptions.internship') }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.workingTime') }}
                </label>
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="checkbox"
                      v-model="formData.workingTime.fullTime"
                      class="form-checkbox h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.workingTimeOptions.fullTime') }}</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      :disabled="isViewMode"
                      type="checkbox"
                      v-model="formData.workingTime.partTime"
                      class="form-checkbox h-4 w-4 text-primary"
                    />
                    <span>{{ t('job.workingTimeOptions.partTime') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Compensation & Status -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4 text-white">
              {{ t('job.sections.compensationStatus') }}
            </h3>

            <div class="space-y-6">
              <div className="mt-4">
                <SelectCurrency v-model="(formData as any).currency" :disabled="isViewMode" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.hourlySalary') }}
                </label>
                <input
                  :disabled="isViewMode"
                  v-model="formData.hourlySalary"
                  type="text"
                  :placeholder="t('job.placeholders.hourlySalary')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.monthlySalary') }}
                </label>
                <input
                  :disabled="isViewMode"
                  v-model="formData.monthlySalary"
                  type="text"
                  :placeholder="t('job.placeholders.monthlySalary')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.annualSalary') }}
                </label>
                <input
                  :disabled="isViewMode"
                  v-model="formData.annualSalary"
                  type="text"
                  :placeholder="t('job.placeholders.annualSalary')"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.benefits') }}
                </label>
                <MultiSelectDropdown
                  :disabled="isViewMode"
                  v-model="formData.benefits"
                  :model-value="benefitsWithLabels"
                  :options="availableBenefits"
                  :placeholder="t('job.placeholders.addBenefit')"
                  :search-placeholder="t('job.placeholders.searchBenefits')"
                  :searchable="true"
                  :allow-custom="true"
                  :show-tags="true"
                  :no-options-text="t('common.noOptionsFound')"
                  @add-custom="handleCustomBenefitAdd"
                  @update:model-value="
                    (val) =>
                      (formData.benefits = val.map((item) =>
                        typeof item === 'object' ? item.value : item,
                      ))
                  "
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  {{ t('job.initialStatus') }}
                </label>
                <div class="relative">
                  <select
                    :disabled="isViewMode"
                    v-model="formData.initialStatus"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="active">{{ t('status.active') }}</option>
                    <option value="draft">{{ t('status.draft') }}</option>
                    <option value="pending">{{ t('status.pending') }}</option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
                  >
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
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4" v-if="!isViewMode">
            <button
              @click="cancelForm"
              type="button"
              class="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              :disabled="jobStore.loading"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="saveAsDraft"
              type="button"
              class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="jobStore.loading"
            >
              {{ t('common.saveAsDraft') }}
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="jobStore.loading"
            >
              {{ isEditMode ? t('job.updateJobOffer') : t('job.publishJobOffer') }}
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
