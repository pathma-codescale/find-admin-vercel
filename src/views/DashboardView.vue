<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/store/common/useCommonStore'
import { useJobStore } from '@/store/job/useJobStore'

import DashboardGraph from '@/components/DashboardGraph.vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import LeftPanel from '@/components/LeftPanel.vue'
import DashboardEnterprisesTable from '@/components/DashboardEnterprisesTable.vue'
import DashboardJobsTable from '@/components/DashboardJobsTable.vue'
import SweetAlert from '@/utils/sweetAlert'

const { t } = useI18n()
const commonStore = useCommonStore()
const jobStore = useJobStore()

const { dashboardMetrics, jobs, enterprises } = storeToRefs(commonStore)

interface JobData {
  id: string
  jobTitle?: string
  company?: string
  location: {
    locationName?: string
  }
  datePosted?: string | Date
  isBanned?: boolean
  isViewed?: boolean
  image?: string
}

interface EnterpriseData {
  enterpriseId: string
  email: string
  logo?: string
  brand_name?: string
  activeJobs?: number
  businessLocation?: {
    locationName?: string
  }
  businessSector?: string[]
  subscription?: 'subscribed' | 'expired' | 'trial' | string
  isBanned?: boolean
  isViewed?: boolean
}

interface DashboardData {
  activeSubscriptions: number
  jobsGrowth: number
  lastUpdated: string
  subscriptionsGrowth: number
  totalJobsPublished: number
  totalUsers: number
  usersGrowth: number
}

const isLoading = ref(true)
const jobsData = ref<JobData[]>([])
const enterprisesData = ref<EnterpriseData[]>([])
const dashboardData = ref<DashboardData>()

const router = useRouter()

const mappedJobs = computed<JobData[]>(() => {
  return jobs.value.map((e) => ({
    id: e.jobId,
    jobTitle: e.jobTitle,
    company: e.companyName,
    location: { locationName: e.location.locationName },
    datePosted: e.createdAt,
    isBanned: e.status !== 'ACTIVE',
    image: e.companyLogo,
  }))
})

const mappedEnterprises = computed<EnterpriseData[]>(() => {
  return enterprises.value.map((e) => ({
    enterpriseId: e.enterpriseId,
    email: e.email,
    logo: e.logo,
    brand_name: e.brand_name,
    activeJobs: e.jobsCount.active,
    businessLocation: { locationName: e.businessLocation.locationName },
    businessSector: e.businessSector,
    subscription: e.subscription,
    isBanned: e.status !== 'ACTIVE',
  }))
})
onMounted(async () => {
  await commonStore.getDashboardMetrics()
  await commonStore.getDashboardRecentJobs({ limit: 10 })
  await commonStore.getDashboardRecentEnterprises({ limit: 10 })

  setTimeout(() => {
    jobsData.value = mappedJobs.value
    enterprisesData.value = mappedEnterprises.value
    isLoading.value = false

    dashboardData.value = dashboardMetrics.value
  }, 1000)
})

const handleViewAllJobs = () => {
  router.push('/manage-jobs')
}

const handleViewAllEnterprises = () => {
  router.push('/manage-users/enterprises')
}
const handleViewEnterpriseProfile = (enterpriseId: string) => {
  console.log(enterpriseId)
  router.push(`/manage-users/enterprises/${enterpriseId}/view`)
}
const handleBanJob = async (email: string, jobId: string, isBanned: boolean) => {
  try {
    if (!isBanned) {
      await jobStore.EnableJob(jobId)
    } else {
      await jobStore.DisableJob(jobId)
    }

    await jobStore.getAllJobs()
    SweetAlert.success(
      t('common.success'),
      !isBanned ? 'Job suspended successfully!' : 'Job reactivated successfully!',
    )
  } catch (error) {
    console.error('Error updating job status:', error)
    SweetAlert.error(t('common.error'), 'Failed to update job status. Please try again.')
  }
}

const handleViewJob = (jobId: string | number) => {
  router.push(`/manage-jobs/view-job/${jobId}`)
}

const handleEditJob = (jobId: string | number) => {
  router.push(`/manage-jobs/edit-job/${jobId}`)
}

const handleDeleteJob = async (jobId: string) => {
  const result = await SweetAlert.confirm(
    'Delete Job?',
    'Are you sure you want to delete this job? This action cannot be undone.',
    'Yes, Delete',
    'Cancel',
  )

  if (result.isConfirmed) {
    try {
      await jobStore.deleteJob(jobId)

      await jobStore.getAllJobs()

      SweetAlert.success(t('common.success'), 'Job deleted successfully!')
    } catch (error) {
      console.error('Error deleting job:', error)
      SweetAlert.error(t('common.error'), 'Failed to delete job. Please try again.')
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="pointer-events-none absolute left-1/2 top-[-250px] z-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-[#E91985] opacity-50 blur-[110px]"
    ></div>
    <LeftPanel />

    <div class="flex-1 flex flex-col lg:ml-64">
      <div class="w-full mb-2">
        <DashboardHeader class="border-l border-r border-b border-borderPrimary" />
      </div>

      <!-- Dashboard Graphs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 py-2">
        <DashboardGraph
          :title="$t('Dashboard.graphs.totalUsers')"
          :value="dashboardData?.totalUsers"
          :percentage-change="50"
          :data="[25, 50, 40, 62, 58, 90]"
          icon="multiUser"
        />

        <DashboardGraph
          :title="$t('Dashboard.graphs.activeSubscriptions')"
          :value="dashboardData?.activeSubscriptions"
          :percentage-change="-50"
          :data="[90, 58, 62, 40, 60, 25]"
          icon="coin"
        />
        <DashboardGraph
          :title="$t('Dashboard.graphs.totalPublished')"
          :value="dashboardData?.totalJobsPublished"
          :percentage-change="-50"
          :data="[90, 58, 62, 40, 60, 25]"
          icon="briefcase"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full py-4 px-4">
        <!-- Left: 2 columns on lg+ -->
        <div class="col-span-1 lg:col-span-2">
          <DashboardJobsTable
            :jobs="jobsData"
            :loading="isLoading"
            :max-displayed="6"
            @view-all="handleViewAllJobs"
            @ban="handleBanJob"
            @view="handleViewJob"
            @edit="handleEditJob"
            @delete="handleDeleteJob"
          />
        </div>

        <!-- Right: 1 column on lg+ -->
        <div class="col-span-1">
          <DashboardEnterprisesTable
            :enterprises="enterprisesData"
            :loading="isLoading"
            :itemsPerPage="6"
            @view-all="handleViewAllEnterprises"
            @viewProfile="handleViewEnterpriseProfile"
          />
        </div>
      </div>

      <div class="flex-1 p-4">
        <RouterView />
      </div>
    </div>
  </div>
</template>
