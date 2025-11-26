import { defineStore } from 'pinia'
import {
  getAllCandidateApi,
  createCandidateApi,
  getCandidateByIdApi,
  deleteCandidateByIdApi,
  updateCandidateApi,
  suspendCandidateByIdApi,
  resetCandidatePasswordApi,
  activateCandidateApi,
  displayCandidateByIdApi,
  hideCandidateByIdApi,
  resetPasswordEmailSendCandidateApi,
  filterCandidatesApi,
} from '@/api/seeker.api'
import type {
  Candidate,
  SeekerState,
  CandidatesApiResponse,
  ResetPasswordPayload,
  CandidateFilters,
} from './types'

export const useSeekerStore = defineStore('seeker', {
  state: (): Omit<SeekerState, 'lastKey'> & {
    candidates: (Candidate & { status?: string; isBanned?: boolean; isViewed?: boolean })[]
    selectedCandidate:
      | (Candidate & { status?: string; isBanned?: boolean; isViewed?: boolean })
      | null
    loading: boolean
    error: string | null
    totalCount: number
    pageSize: number
    currentPage: number
    pages: Record<number, any[]>
    isFiltering: boolean
    activeFilters: CandidateFilters
    pagination: {
      hasMore: boolean
      lastEvaluatedKey: string | null
      limit: number
    }
  } => ({
    candidates: [],
    selectedCandidate: null,
    loading: false,
    error: null,
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    pages: {},
    isFiltering: false,
    activeFilters: {},
    pagination: {
      hasMore: true,
      lastEvaluatedKey: null,
      limit: 0,
    },
  }),

  actions: {
    async fetchAllCandidates({ limit = 10, page = 1, loadMore = false } = {}) {
      if (this.loading) return
      this.isFiltering = false
      this.activeFilters = {}
      this.loading = true
      this.error = null

      try {
        if (this.pages[page] && !loadMore) {
          this.candidates = this.pages[page]
          this.currentPage = page
          this.loading = false
          return
        }

        const params: { limit?: number; lastKey?: string } = { limit }
        if (loadMore && this.pagination.lastEvaluatedKey)
          params.lastKey = this.pagination.lastEvaluatedKey

        const response = (await getAllCandidateApi(params)) as CandidatesApiResponse

        const { candidates, pagination } = response

        const processedCandidates = candidates.map((c) => ({
          ...c,
          status: c.status ? c.status.toLowerCase() : 'active',
          isBanned: false,
          isViewed: false,
        }))

        if (loadMore) {
          this.candidates = processedCandidates
          this.currentPage += 1
        } else {
          this.candidates = processedCandidates
          this.currentPage = page
        }

        this.pages[this.currentPage] = [...processedCandidates]

        this.pagination = pagination
      } catch (error: any) {
        console.error('Error fetching candidates:', error)
        this.error = error.message || 'Failed to load candidates'
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadNextPage() {
      if (!this.pagination.lastEvaluatedKey || this.loading) return

      if (this.isFiltering) {
        return this.filterCandidates(this.activeFilters, true)
      }

      return this.fetchAllCandidates({
        limit: this.pageSize,
        loadMore: true,
      })
    },

    async loadPreviousPage() {
      if (this.currentPage <= 1) return

      const prevPage = this.currentPage - 1

      if (this.pages[prevPage]) {
        this.candidates = this.pages[prevPage]
        this.currentPage = prevPage
      }
    },

    async createCandidate(candidatePayload: Partial<Candidate>) {
      this.loading = true
      this.error = null
      try {
        const response = await createCandidateApi(candidatePayload)
        console.log('Candidate created:', response)

        this.candidates.unshift({
          ...response,
          status: response.status ?? 'active',
          isBanned: response.isBanned ?? false,
          isViewed: response.isViewed ?? false,
        })
      } catch (error: any) {
        console.error('Error creating candidate:', error)
        this.error = error.message || 'Failed to create candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCandidateById(candidateId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await getCandidateByIdApi(candidateId)
        console.log('Fetched candidate:', response.user)

        this.selectedCandidate = {
          ...response.user,
          status: response.user.status ? response.user.status.toLowerCase() : 'active',
          isBanned: false,
          isViewed: false,
        }
      } catch (error: any) {
        console.error('Error fetching candidate by ID:', error)
        this.error = error.message || 'Failed to load candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCandidateById(candidateId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await deleteCandidateByIdApi(candidateId)

        this.candidates = this.candidates.filter((c) => c.id !== candidateId)

        return response
      } catch (error: any) {
        console.error('Error deleting candidate:', error)
        this.error = error.message || 'Failed to delete candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCandidate(candidateData: Partial<Candidate>) {
      this.loading = true
      this.error = null

      try {
        const response = await updateCandidateApi(candidateData)

        const updated = response.user
        const index = this.candidates.findIndex((c) => c.id === updated.id)
        if (index !== -1) this.candidates[index] = updated

        if (this.selectedCandidate?.id === updated.id) {
          this.selectedCandidate = updated
        }

        return updated
      } catch (error: any) {
        console.error(' Error updating candidate:', error)
        this.error = error.message || 'Failed to update candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async suspendCandidate(candidateId: string) {
      this.loading = true
      this.error = null

      try {
        const response = await suspendCandidateByIdApi(candidateId)
        console.log('Candidate suspended successfully:', response)

        const updated = response?.updatedUser
        if (!updated || !updated.id) {
          throw new Error('API returned invalid updatedUser')
        }
        const index = this.candidates.findIndex((c) => c.id === updated.id)
        if (index !== -1) this.candidates[index] = updated

        if (this.selectedCandidate?.id === updated.id) {
          this.selectedCandidate = updated
        }

        return updated
      } catch (error: any) {
        console.error('Error suspending candidate:', error)
        this.error = error.message || 'Failed to suspend candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetCandidatePassword(payload: ResetPasswordPayload) {
      this.loading = true
      this.error = null

      try {
        const response = await resetCandidatePasswordApi(payload)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to reset password'
        throw error
      } finally {
        this.loading = false
      }
    },

    async activateCandidate(candidateId: string) {
      if (!candidateId) return
      this.loading = true
      this.error = null

      try {
        const response = await activateCandidateApi(candidateId)
        console.log('Candidate activated successfully:', response)

        const updated = response?.updatedUser
        if (!updated || !updated.id) {
          throw new Error('API returned invalid updatedUser')
        }

        const index = this.candidates.findIndex((c) => c.id === updated.id)
        if (index !== -1) this.candidates[index] = updated

        if (this.selectedCandidate?.id === updated.id) {
          this.selectedCandidate = updated
        }

        return updated
      } catch (error: any) {
        console.error('Error activating candidate:', error)
        this.error = error.message || 'Failed to activate candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async displayCandidate(candidateId: string) {
      if (!candidateId) return
      this.loading = true
      this.error = null

      try {
        const response = await displayCandidateByIdApi(candidateId)
        console.log('Candidate displayed successfully:', response)

        const updated = response?.updatedUser
        if (!updated || !updated.id) {
          throw new Error('API returned invalid updatedUser')
        }

        const index = this.candidates.findIndex((c) => c.id === updated.id)
        if (index !== -1) this.candidates[index] = updated

        if (this.selectedCandidate?.id === updated.id) {
          this.selectedCandidate = updated
        }

        return updated
      } catch (error: any) {
        console.error('Error displaying candidate:', error)
        this.error = error.message || 'Failed to display candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async hideCandidate(candidateId: string) {
      if (!candidateId) return
      this.loading = true
      this.error = null

      try {
        const response = await hideCandidateByIdApi(candidateId)
        console.log('Candidate hidden successfully:', response)

        const updated = response?.updatedUser
        if (!updated || !updated.id) {
          throw new Error('API returned invalid updatedUser')
        }

        const index = this.candidates.findIndex((c) => c.id === updated.id)
        if (index !== -1) this.candidates[index] = updated

        if (this.selectedCandidate?.id === updated.id) {
          this.selectedCandidate = updated
        }

        return updated
      } catch (error: any) {
        console.error('Error hiding candidate:', error)
        this.error = error.message || 'Failed to hide candidate'
        throw error
      } finally {
        this.loading = false
      }
    },

    async sendResetPasswordEmailCandidate(email: string) {
      this.loading = true
      this.error = null

      try {
        const response = await resetPasswordEmailSendCandidateApi(email)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to send password reset email'
        throw error
      } finally {
        this.loading = false
      }
    },

    async filterCandidates(filters: CandidateFilters) {
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
        if (filters.status && filters.status !== 'all') {
          payload.status = filters.status
        }

        // Add date filters
        if (filters.dateJoinedFrom) {
          console.log(filters.dateJoinedFrom)
          payload.dateJoinedFrom = filters.dateJoinedFrom
          // payload.dateJoinedFrom = '2025-10-31T07:32:09.959Z'
        }
        if (filters.dateJoinedTo) {
          payload.dateJoinedTo = filters.dateJoinedTo
        }

        // Add search query parameter
        if (filters.email) {
          payload.email = filters.email
        }

        console.log('Filtering candidates with payload:', payload)
        const response = await filterCandidatesApi(payload)
        console.log('FilterEnterprises response:', response)

        const { candidates, pagination, totalCount, appliedFilters } = response

        this.candidates = candidates
        this.totalCount = totalCount
        this.pagination = pagination
        this.activeFilters = appliedFilters
      } catch (err: any) {
        console.error('Error in filterCandidates:', err)
        this.error = err.message || 'Failed to filter candidates'
        this.candidates = []
        throw err
      } finally {
        this.loading = false
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
