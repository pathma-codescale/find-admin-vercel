import { defineStore } from 'pinia'

import {
  CreateAdminApi,
  DeleteAdminApi,
  DisableAdminApi,
  EnableAdminApi,
  GetAdminByIdApi,
  GetAllAdminsApi,
  resetAdminPasswordApi,
  resetAdminPasswordEmailSendApi,
  UpdateAdminApi,
  type ResetPasswordPayload,
} from '@/api/admin.api'

interface Admin {
  createdAt: string
  createdBy?: string
  email: string
  enabled: boolean
  lastLoginAt?: string
  mfaEnabled: boolean
  name?: string
  phoneNumber?: string
  profileImageUrl?: string
  status: string
  sub: string
  updatedAt: string
  userStatus?: string
  userType?: string
}
interface AuthState {
  admins: Admin[]
  currentAdmin: Admin | null
  totalCount: number
  lastKey: string | null
  prevKeys: string[]
  loading: boolean
  error: string | null
  appliedFilters: {
    sortBy: string
    subscription: string
    businessSector: string
    dateRange: { from: string | null; to: string | null }
  } | null
}

export const useAdminStore = defineStore('admin', {
  state: (): AuthState => ({
    admins: [],
    totalCount: 0,
    lastKey: null,
    prevKeys: [],
    loading: false,
    error: null,
    currentAdmin: null,
    appliedFilters: null,
  }),

  actions: {
    async getAllAdmins(params?: Record<string, any>) {
      this.loading = true
      this.error = null

      try {
        const response = await GetAllAdminsApi(params)

        const { users, totalCount, lastKey } = response.data
        this.admins = users
        this.totalCount = totalCount
        this.lastKey = lastKey
      } catch (err: any) {
        console.error('Error in getAllAdmins:', err)
        this.error = err.message || 'Failed to fetch admins'
        this.admins = []
        throw err
      } finally {
        this.loading = false
      }
    },
    async getAdminById(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await GetAdminByIdApi(id)

        this.currentAdmin = response.data.user
        return response.data.user
      } catch (err: any) {
        console.error('Error in getAdminById:', err)
        this.error = err.message || 'Failed to fetch Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createAdmin(payload: Record<string, any>) {
      this.loading = true
      this.error = null
      try {
        const response = await CreateAdminApi(payload)
        const newAdmin = response

        this.admins.push(newAdmin)
        return newAdmin
      } catch (err: any) {
        console.error('Error in createAdmin:', err)
        this.error = err.message || 'Failed to create Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateAdmin(email: string, body: object) {
      this.loading = true
      this.error = null
      try {
        const response = await UpdateAdminApi(email, body)
        const updatedAdmin = response.updatedAdmin
        // const id = body.sub
        // const index = this.admins.findIndex((e) => e.sub === id)
        // if (index !== -1) this.admins[index] = updatedAdmin
        return updatedAdmin
      } catch (err: any) {
        console.error('Error in updateAdmin:', err)
        this.error = err.message || 'Failed to update Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async enableAdmin(email: string) {
      this.loading = true
      this.error = null
      try {
        const response = await EnableAdminApi(email)
        console.log('Enable Admin response:', response)
        return response
      } catch (err: any) {
        console.error('Error enabling Admin:', err)
        this.error = err.message || 'Failed to enable Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async disableAdmin(email: string) {
      this.loading = true
      this.error = null
      try {
        const response = await DisableAdminApi(email)
        console.log('Disable Admin response:', response)
        return response
      } catch (err: any) {
        console.error('Error disabling Admin:', err)
        this.error = err.message || 'Failed to disable Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteAdmin(id: string) {
      this.loading = true
      this.error = null
      try {
        const response = await DeleteAdminApi(id)
        console.log('Delete Admin response:', response)
        // Remove from store
        this.admins = this.admins.filter((e) => e.sub !== id)
        return response
      } catch (err: any) {
        console.error('Error deleting Admin:', err)
        this.error = err.message || 'Failed to delete Admin'
        throw err
      } finally {
        this.loading = false
      }
    },

    async sendResetPasswordEmailAdmin(email: string) {
      this.loading = true
      this.error = null

      try {
        const response = await resetAdminPasswordEmailSendApi(email)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to send password reset email'
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetAdminPassword(payload: ResetPasswordPayload) {
      this.loading = true
      this.error = null

      try {
        const response = await resetAdminPasswordApi(payload)
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to reset password'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Reset filters and fetch all Admins
    async resetAndFetchAll() {
      this.appliedFilters = null
      await this.getAllAdmins()
    },
  },
})
