import { defineStore } from 'pinia'
import { LoginApi } from '@/api/auth.api'

interface user {
  createdAt: string
  createdBy: string
  email: string
  enabled: boolean
  lastLoginAt: string
  mfaEnabled: boolean
  name: string
  phoneNumber: string
  profileImageUrl: string
  status: string
  sub: string
  updatedAt: string
  userType: string
}

interface AuthState {
  user: user | null
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  loading: boolean
  error: string | null
  success: boolean | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    idToken: localStorage.getItem('idToken'),
    loading: false,
    error: null,
    success: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const { data, success } = await LoginApi({ email, password })

        if (!success) {
          this.error = data.message || 'Login failed'
          return false
        }

        const tokens = data

        this.user = tokens.user
        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken
        this.idToken = tokens.idToken
        this.success = success

        localStorage.setItem('user', JSON.stringify(tokens.user))
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        localStorage.setItem('idToken', tokens.idToken)

        return true
      } catch (error: any) {
        console.error('Login error:', error)
        this.error = error.response?.data?.message || 'Invalid email or password'
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.idToken = null

      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('idToken')
    },
  },
})
