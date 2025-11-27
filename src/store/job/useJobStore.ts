import { defineStore } from 'pinia'
import {
  CreateJobApi,
  GetAllJobsApi,
  GetJobApi,
  UpdateEnterpriseJobApi,
  FilterJobsApi,
  DeleteJobApi,
  EnableJobApi,
  DisableJobApi,
} from '@/api/jobs.api'
import type { JobState } from './types'

export const useJobStore = defineStore('job', {
  state: (): JobState => ({
    jobs: [],
    loading: false,
    error: null,
    selectedJob: null,
    pagination: {
      hasMore: false,
      lastEvaluatedKey: null,
      limit: 50,
    },
    filters: {
      status: [],
      startDate: null,
      endDate: null,
      contract: null,
      sortBy: 'datePosted-newest',
    },
    currentPage: 1,
    totalCount: 0,
    pageSize: 10,
    pages: {},
    isSuspended: false,
  }),

  actions: {
    async getAllJobs({ limit = 10, page = 1, loadMore = false } = {}) {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        if (this.pages[page] && !loadMore) {
          this.jobs = this.pages[page]
          this.currentPage = page
          this.loading = false
          return
        }
        const params: { limit?: number; lastEvaluatedKey?: string } = { limit }

        if (loadMore && this.pagination.lastEvaluatedKey) {
          params.lastEvaluatedKey = this.pagination.lastEvaluatedKey
        }

        const response = await GetAllJobsApi(params)
        const { jobs, pagination } = response

        const processedJobs = jobs.map((e: any) => ({
          ...e,
          // status: e.status ? e.status.toLowerCase() : 'active',
          isBanned: false,
          isViewed: false,
        }))
        if (loadMore) {
          this.jobs = processedJobs
          this.currentPage += 1
        } else {
          this.jobs = processedJobs
          this.currentPage = page
        }
        this.pages[this.currentPage] = [...this.jobs]

        this.pagination = pagination
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch jobs'
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadNextPage(additionalParams = {}) {
      if (!this.pagination.hasMore || this.loading) return

      return this.getAllJobs({
        limit: this.pageSize || 10,
        loadMore: true,
        ...additionalParams,
      })
    },

    async loadPreviousPage() {
      if (this.currentPage <= 1) return

      const prevPage = this.currentPage - 1

      if (this.pages[prevPage]) {
        this.jobs = this.pages[prevPage]
        this.currentPage = prevPage
      }
    },

    async filterJobs(filters: any, loadMore = false) {
      this.loading = true
      this.error = null

      try {
        const params: any = {
          limit: this.pagination.limit,
          ...filters,
        }

        // Include pagination key if loading more
        if (loadMore && this.pagination.lastEvaluatedKey) {
          params.lastEvaluatedKey = this.pagination.lastEvaluatedKey
        }

        if (filters.startDate) {
          params.startDate = filters.startDate
        }
        if (filters.endDate) {
          params.endDate = filters.endDate
        }
        if (filters.status) {
          params.status = filters.status
        }
        const response = await FilterJobsApi(params)
        const { jobs, count, pagination, filters: appliedFilters } = response

        if (loadMore) {
          this.jobs = [...this.jobs, ...jobs]
        } else {
          this.jobs = jobs
        }

        // Update pagination info
        this.pagination.hasMore = pagination?.hasMore || false
        this.pagination.lastEvaluatedKey = pagination?.lastEvaluatedKey || null
        this.pagination.limit = pagination?.limit || this.pagination.limit

        // Update applied filters
        this.filters = appliedFilters

        return { jobs, count }
      } catch (err: any) {
        this.error = err.message || 'Failed to filter jobs'
        throw err
      } finally {
        this.loading = false
      }
    },

    async getJob(jobId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await GetJobApi(jobId)
        this.selectedJob = response.job || response || null
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch job'
        this.selectedJob = null
        throw err
      } finally {
        this.loading = false
      }
    },

    async createJob(jobData: object) {
      this.loading = true
      this.error = null

      try {
        const response = await CreateJobApi(jobData)
        if (response.job) {
          this.jobs.push(response.job)
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to create job'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateJob(jobId: string, jobData: object) {
      this.loading = true
      this.error = null

      try {
        const response = await UpdateEnterpriseJobApi(jobId, jobData)
        if (response.job) {
          const index = this.jobs.findIndex((job) => job.jobId === jobId)
          if (index !== -1) this.jobs[index] = response.job
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to update job'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteJob(jobId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await DeleteJobApi(jobId)

        this.jobs = this.jobs.filter((c) => c.id !== jobId)

        return response
      } catch (error: any) {
        console.error('Error deleting candidate:', error)
        this.error = error.message || 'Failed to delete candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async EnableJob(jobId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await EnableJobApi(jobId)

        this.jobs = this.jobs.filter((c) => c.id !== jobId)

        return response
      } catch (error: any) {
        console.error('Error deleting candidate:', error)
        this.error = error.message || 'Failed to delete candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async DisableJob(jobId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await DisableJobApi(jobId)

        this.jobs = this.jobs.filter((c) => c.id !== jobId)
        console.log(response)
        return response
      } catch (error: any) {
        console.error('Error deleting candidate:', error)
        this.error = error.message || 'Failed to delete candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      this.filters = {
        status: [],
        startDate: null,
        endDate: null,
        contract: null,
        sortBy: 'datePosted-newest',
      }
    },
    resetPagination() {
      this.pages = {}
      this.currentPage = 1
      this.pagination.lastEvaluatedKey = null
      this.pagination.hasMore = false
    },
  },
})
