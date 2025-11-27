/* eslint-disable @typescript-eslint/no-explicit-any */
import Axios, { type AxiosRequestConfig, type AxiosRequestHeaders, type Method } from 'axios'
import { useAuthStore } from '@/store/auth/useAuthStore'
import router from '@/router'
import { SweetAlert } from '@/utils/sweetAlert'
import { toast } from 'vue-sonner'

const api = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
})

let isShowingLogoutAlert = false

const handleLogout = async (message = 'Your session has expired. Please log in again.') => {
  if (isShowingLogoutAlert) return

  isShowingLogoutAlert = true

  try {
    await SweetAlert.warning('Session Expired', message)

    const authStore = useAuthStore()
    authStore.logout()

    if (router.currentRoute.value.name !== 'login') {
      router.push({
        name: 'login',
        query: {
          redirect: router.currentRoute.value.fullPath,
          sessionExpired: 'true',
        },
      })
    }
  } finally {
    isShowingLogoutAlert = false
  }
}

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')

    const isAuthRoute = config.url?.includes('/login') || config.url?.includes('/register')

    if (!accessToken && !isAuthRoute) {
      handleLogout('Authentication required. Please log in.')
    }

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401 && error.response.data?.error === 'UNAUTHORIZED') {
        const errorMessage =
          error.response.data?.message || 'Your session has expired. Please log in again.'
        handleLogout(errorMessage)
      }

      if (error.response.status === 403) {
        SweetAlert.error('Access Denied', 'You do not have permission to perform this action.')
      }
    }

    return Promise.reject(error)
  },
)

const request = ({
  url,
  data,
  method,
  body,
  headers: addHeaders,
  publicApi,
  validUser,
  file,
}: {
  url?: string
  data?: object
  method?: Method
  body?: object
  headers?: AxiosRequestHeaders
  publicApi?: boolean
  validUser?: string
  file?: boolean
}): Promise<any> =>
  new Promise(async (resolve, reject) => {
    const headers: any = {
      'Content-Type': file ? 'multipart/form-data' : 'application/json',
      ...addHeaders,
    }

    if (validUser) {
      headers.Authorization = `Bearer ${validUser}`
    } else if (!publicApi) {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        console.error('FAILED: Cannot retrieve token')
        handleLogout('Authentication required. Please log in.')
        reject({ response: { error: 'Cannot retrieve token' } })
        return
      }
    }

    const config: AxiosRequestConfig = {
      method: method || 'post',
      url: url || '',
      params: data,
      data: body,
      headers: headers,
      responseType: 'json',
    }

    try {
      const res = await api(config)
      console.log(`%c SUCCESS: ${config?.url}`, 'color: #0ffaac', res.data)
      resolve(res.data)
    } catch (err) {
      if (Axios.isAxiosError(err)) {
        console.error(`%c FAILED: ${config?.url}`, 'color: #FF0000', err.response)
        toast.error(err.response?.data?.message)
        reject(err)
      } else {
        console.error(`%c FAILED: ${config?.url}`, 'color: #FF0000', 'Unknown error occurred.')
        toast.error({ response: { error: 'Unknown error occurred.' } })
        reject({ response: { error: 'Unknown error occurred.' } })
      }
    }
  })

export default { request, api }
