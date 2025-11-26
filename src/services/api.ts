/* eslint-disable @typescript-eslint/no-explicit-any */
// import { store } from '@/store'
import Axios, { type AxiosRequestConfig, type AxiosRequestHeaders, type Method } from 'axios'

// import { getAppCheckToken } from 'firebaseConfig/appCheck'

Axios.interceptors.response.use(undefined, (error) => {
  console.log('INTERCEPTOR ERROR:', error)
  return Promise.reject(error)
})

const request = ({
  url,
  data,
  method,
  body,
  headers: addHeaders,
  // publicApi,
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
    // const appCheckToken = import.meta.env.REACT_APP_ENV !== 'DEV' && (await getAppCheckToken())

    const headers: any =
      import.meta.env.REACT_APP_ENV !== 'DEV'
        ? {
            'Content-Type': file ? 'multipart/form-data' : 'application/json',
            'Access-Control-Allow-Origin': '*',
            // 'X-Firebase-AppCheck': appCheckToken ?? '',
            ...addHeaders,
          }
        : {
            'Content-Type': file ? 'multipart/form-data' : 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...addHeaders,
          }

    // if (!publicApi) {
    //   const token = store.getState().auth?.userToken
    //   if (!token) {
    //     console.error('FAILED: Cannot retrieve token')
    //     reject({ response: { error: 'Cannot retrieve token' } })
    //   }
    //   headers.Authorization = `Bearer ${token}`
    //   // if (import.meta.env.REACT_APP_ENV !== 'DEV') headers['X-Firebase-AppCheck'] = appCheckToken ?? ''
    // }

    if (validUser) headers.Authorization = `Bearer ${validUser}`

    const config: AxiosRequestConfig = {
      method: method || 'post',
      url: url || '',
      params: data,
      data: body,
      headers: headers,
      responseType: 'json',
    }

    try {
      const res = await Axios(config)
      console.log(`%c SUCCESS: ${config?.url}`, 'color: #0ffaac', res.data)
      resolve(res.data)
    } catch (err) {
      if (Axios.isAxiosError(err)) {
        console.error(`%c FAILED: ${config?.url}`, 'color: #FF0000', err.response)
        throw err
      } else {
        console.error(`%c FAILED: ${config?.url}`, 'color: #FF0000', 'Unknown error occurred.')
        throw { response: { error: 'Unknown error occurred.' } }
      }
    }
  })

export default { request }
