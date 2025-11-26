import { defineStore } from 'pinia'
import type { WithCallback } from '@/store/common/types'
import type { Job } from '../job/types'
import type { Enterprise } from '../enterprise/types'
import {
  getSignedUrlApi,
  uploadFileToPresignedUrlApi,
  deleteImageApi,
  getDashboardMetricsApi,
  getDashboardRecentJobsApi,
  getDashboardRecentEnterprisesApi,
} from '@/api/common.api'

export interface SignUrl {
  signUrl: string
  objectUrl: string
}

export interface DashboardMetrics {
  activeSubscriptions: number
  jobsGrowth: number
  lastUpdated: string
  subscriptionsGrowth: number
  totalJobsPublished: number
  totalUsers: number
  usersGrowth: number
}

export interface CommonState {
  loading: boolean
  error: string | null
  dashboardMetrics: DashboardMetrics
  jobs: Job[]
  enterprises: Enterprise[]
}

export const useCommonStore = defineStore('common', {
  state: (): CommonState => ({
    loading: false,
    error: null,
    dashboardMetrics: {
      activeSubscriptions: 0,
      jobsGrowth: 0,
      lastUpdated: '',
      subscriptionsGrowth: 0,
      totalJobsPublished: 0,
      totalUsers: 0,
      usersGrowth: 0,
    },
    jobs: [],
    enterprises: [],
  }),

  actions: {
    /**
     * Get signed URLs from the backend
     * @param payload - The payload to send to the backend
     * @param callback - Optional callback with the response
     * @returns Array of SignUrl objects
     */
    async getSignedUrl({ payload, callback }: WithCallback): Promise<SignUrl[]> {
      this.loading = true
      this.error = null

      try {
        const response = await getSignedUrlApi(payload)

        // Backend returns an array of { signUrl, objectUrl }
        const signUrls: SignUrl[] = response
        callback?.(signUrls)

        return signUrls
      } catch (error: any) {
        console.error('Error fetching signed URL:', error)
        this.error = error.message || 'Failed to get signed URL'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Upload a file directly to the signed URL
     * @param url - The pre-signed URL
     * @param file - The file or blob to upload
     * @param contentType - MIME type of the file
     * @param onProgress - Optional progress callback
     */
    async uploadFileToPresignedUrl(
      url: string,
      file: File | Blob,
      contentType: string,
      onProgress?: (progress: number) => void,
    ): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const result = await uploadFileToPresignedUrlApi(url, file, contentType, onProgress)
        return result
      } catch (error: any) {
        console.error('Error uploading file:', error)
        this.error = error.message || 'Failed to upload file'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteImage(fileKey: string) {
      this.loading = true
      this.error = null

      try {
        const response = await deleteImageApi(fileKey)
        return response.data
      } catch (error: any) {
        console.error('Error deleting image:', error)
        this.error = error.message || 'Failed to delete image'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getDashboardMetrics() {
      this.loading = true
      this.error = null

      try {
        const response = await getDashboardMetricsApi()
        this.dashboardMetrics = response.data
      } catch (err: any) {
        console.error('Error in getDashboardMetrics:', err)
        this.error = err.message || 'Failed to fetch metrixs'
        throw err
      } finally {
        this.loading = false
      }
    },

    async getDashboardRecentJobs({ limit = 10 } = {}) {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const params: { limit?: number; lastKey?: string } = { limit }

        const response = await getDashboardRecentJobsApi(params)

        this.jobs = response.jobs
      } catch (err: any) {
        console.error('Error in getAllEnterprises:', err)
        this.error = err.message || 'Failed to fetch enterprises'
        this.jobs = []
        throw err
      } finally {
        this.loading = false
      }
    },
    async getDashboardRecentEnterprises({ limit = 10 } = {}) {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        const params: { limit?: number; lastKey?: string } = { limit }

        const response = await getDashboardRecentEnterprisesApi(params)

        this.enterprises = response.enterprises
      } catch (err: any) {
        console.error('Error in getAllEnterprises:', err)
        this.error = err.message || 'Failed to fetch enterprises'
        this.enterprises = []
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
