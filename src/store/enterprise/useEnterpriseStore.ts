import {
  CreateEnterpriseApi,
  DeleteEnterpriseApi,
  DisableEnterpriseApi,
  EnableEnterpriseApi,
  FilterEnterprisesApi,
  GetAllEnterprisesApi,
  GetEnterpriseByIdApi,
  resetEnterprisesPasswordEmailSendApi,
  SearchEnterprisesApi,
  UpdateEnterpriseApi,
} from '@/api/enterprise.api'
import { defineStore } from 'pinia'
import type { EnterpriseApiResponse } from './types'

interface BusinessLocation {
  locationName: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface Enterprise {
  status: string
  email: string
  enterpriseId: string
  brand_name: string
  address: string
  city: string
  postal_code: string
  phone_number: string
  businessSector: string[]
  logo?: string
  enabledEmail: boolean
  enabledPushNotification: boolean
  businessLocation: BusinessLocation
  subscription: string
  subscriptionStatus: string
  activeSubscription?: any
  created_at: string
  updatedAt: string
  jobsCount: {
    active: number
    hidden: number
    suspended: number
  }
}

interface EnterprisesState {
  enterprises: Enterprise[]
  currentEnterprise: Enterprise | null
  totalCount: number
  status: string
  prevKeys: string[]
  loading: boolean
  error: string | null
  appliedFilters: {
    sortBy: string
    subscription: string
    businessSector: string
    dateRange: { from: string | null; to: string | null }
  } | null
  currentPage: number
  pages: Record<number, any[]>
  pageSize: number
  pagination: {
    hasMore: boolean
    lastEvaluatedKey: string | null
    limit: number
  }
}

export const useEnterpriseStore = defineStore('enterprise', {
  state: (): EnterprisesState => ({
    enterprises: [],
    totalCount: 0,
    prevKeys: [],
    loading: false,
    error: null,
    currentEnterprise: null,
    appliedFilters: null,
    currentPage: 1,
    pages: {},
    pageSize: 10,
    pagination: {
      hasMore: true,
      lastEvaluatedKey: null,
      limit: 0,
    },
    status: '',
  }),

  actions: {
    async getAllEnterprises({ limit = 10, page = 1, loadMore = false } = {}) {
      if (this.loading) return
      this.loading = true
      this.error = null

      try {
        if (this.pages[page] && !loadMore) {
          this.enterprises = this.pages[page]
          this.currentPage = page
          this.loading = false
          return
        }

        const params: { limit?: number; lastEvaluatedKey?: string } = { limit }

        if (loadMore && this.pagination.lastEvaluatedKey) {
          params.lastEvaluatedKey = this.pagination.lastEvaluatedKey
        }

        const response = (await GetAllEnterprisesApi(params)) as EnterpriseApiResponse
        const { enterprises, pagination } = response

        const processedEnterprises = enterprises.map((e: any) => ({
          ...e,
          status: e.status ? e.status.toLowerCase() : 'active',
          isBanned: false,
          isViewed: false,
        }))

        if (loadMore) {
          this.enterprises = processedEnterprises
          this.currentPage += 1
        } else {
          this.enterprises = processedEnterprises
          this.currentPage = page
        }

        this.pages[this.currentPage] = [...this.enterprises]

        this.pagination = pagination
      } catch (err: any) {
        console.error('Error in getAllEnterprises:', err)
        this.error = err.message || 'Failed to fetch enterprises'
        this.enterprises = []
        throw err
      } finally {
        this.loading = false
      }
    },

    async filterEnterprises(filters: {
      sortBy?: string
      subscription?: string
      businessSector?: string
      dateFrom?: string
      dateTo?: string
      limit?: number
      lastEvaluatedKey?: string
      email?: string
    }) {
      this.loading = true
      this.error = null

      try {
        const payload: any = {
          limit: filters.limit || 10,
        }

        if (filters.lastEvaluatedKey) {
          payload.lastEvaluatedKey = filters.lastEvaluatedKey
        }
        if (filters.sortBy) {
          const sortByMap: Record<string, string> = {
            newest: 'date_newest',
            oldest: 'date_oldest',
            'name-asc': 'brand_name',
            'jobs-desc': 'active_jobs',
          }
          payload.sortBy = sortByMap[filters.sortBy] || 'date_newest'
        }

        // Map subscription values
        if (filters.subscription && filters.subscription !== 'all') {
          payload.subscription = filters.subscription
        }

        // Map business sector
        if (filters.businessSector && filters.businessSector !== 'all') {
          payload.businessSector = filters.businessSector
        }

        if (filters.dateFrom) {
          payload.dateFrom = filters.dateFrom
        }
        if (filters.dateTo) {
          payload.dateTo = filters.dateTo
        }

        if (filters.email) {
          payload.email = filters.email
        }

        console.log('Filtering enterprises with payload:', payload)
        const response = await FilterEnterprisesApi(payload)
        console.log('FilterEnterprises response:', response)

        const { enterprises, totalCount, lastKey, appliedFilters } = response

        this.enterprises = enterprises
        this.totalCount = totalCount
        this.pagination.lastEvaluatedKey = lastKey
        this.appliedFilters = appliedFilters
      } catch (err: any) {
        console.error('Error in filterEnterprises:', err)
        this.error = err.message || 'Failed to filter enterprises'
        this.enterprises = []
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadNextPage(additionalParams = {}) {
      if (!this.pagination.hasMore || this.loading) return

      return this.getAllEnterprises({
        limit: this.pageSize || 10,
        loadMore: true,
        ...additionalParams,
      })
    },

    async loadPreviousPage() {
      if (this.currentPage <= 1) return

      const prevPage = this.currentPage - 1

      if (this.pages[prevPage]) {
        this.enterprises = this.pages[prevPage]
        this.currentPage = prevPage
      }
    },

    async searchEnterprises(query: string) {
      this.loading = true
      this.error = null

      try {
        console.log('Calling SearchEnterprisesApi with query:', query)
        const response = await SearchEnterprisesApi(query)

        // Check different possible response structures
        let enterprisesData = []

        if (response.enterprises) {
          enterprisesData = response.enterprises
        } else if (response.data?.enterprises) {
          enterprisesData = response.data.enterprises
        } else if (response.data?.data) {
          enterprisesData = response.data.data
        } else if (Array.isArray(response.enterprises)) {
          enterprisesData = response.enterprises
        }

        console.log('Parsed enterprises data:', enterprisesData)

        this.enterprises = enterprisesData
        this.totalCount = enterprisesData.length

        console.log('Store updated. Enterprises count:', this.enterprises.length)
      } catch (err: any) {
        console.error('Error in searchEnterprises:', err)
        console.error('Error details:', err.response)
        this.error = err.message || 'Failed to search enterprises'
        this.enterprises = []
        throw err
      } finally {
        this.loading = false
      }
    },

    async getEnterpriseById(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await GetEnterpriseByIdApi(id)
        this.currentEnterprise = response.enterpriseUser
        return response.enterpriseUser
      } catch (err: any) {
        console.error('Error in getEnterpriseById:', err)
        this.error = err.message || 'Failed to fetch enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createEnterprise(payload: Record<string, any>) {
      this.loading = true
      this.error = null
      try {
        const response = await CreateEnterpriseApi(payload)
        const newEnterprise = response

        this.enterprises.push(newEnterprise)
        return newEnterprise
      } catch (err: any) {
        console.error('Error in createEnterprise:', err)
        this.error = err.message || 'Failed to create enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateEnterprise(payload: Record<string, any>) {
      this.loading = true
      this.error = null
      try {
        const response = await UpdateEnterpriseApi(payload)
        const updatedEnterprise = response.updatedEnterprise
        const id = payload.enterpriseId
        const index = this.enterprises.findIndex((e) => e.enterpriseId === id)
        if (index !== -1) this.enterprises[index] = updatedEnterprise
        return updatedEnterprise
      } catch (err: any) {
        console.error('Error in updateEnterprise:', err)
        this.error = err.message || 'Failed to update enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async enableEnterprise(email: string, enterpriseId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await EnableEnterpriseApi({ email, enterpriseId })
        console.log('Enable Enterprise response:', response)
        return response
      } catch (err: any) {
        console.error('Error enabling enterprise:', err)
        this.error = err.message || 'Failed to enable enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async disableEnterprise(email: string, enterpriseId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await DisableEnterpriseApi({ email, enterpriseId })
        console.log('Disable Enterprise response:', response)
        return response
      } catch (err: any) {
        console.error('Error disabling enterprise:', err)
        this.error = err.message || 'Failed to disable enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteEnterprise(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await DeleteEnterpriseApi(id)
        console.log('Delete Enterprise response:', response)
        // Remove from store
        this.enterprises = this.enterprises.filter((e) => e.enterpriseId !== id)
        return response
      } catch (err: any) {
        console.error('Error deleting enterprise:', err)
        this.error = err.message || 'Failed to delete enterprise'
        throw err
      } finally {
        this.loading = false
      }
    },

    async sendResetPasswordEmailEnterprise(email: string) {
      this.loading = true
      this.error = null

      try {
        const response = await resetEnterprisesPasswordEmailSendApi(email)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to send password reset email'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Reset filters and fetch all enterprises
    async resetAndFetchAll() {
      this.appliedFilters = null
      await this.getAllEnterprises({ limit: this.pageSize, page: 1 })
    },

    resetPagination() {
      this.pages = {}
      this.currentPage = 1
      this.pagination.lastEvaluatedKey = null
      this.pagination.hasMore = false
    },
  },
})
