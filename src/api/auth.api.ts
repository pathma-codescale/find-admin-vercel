import api from '../services/api'

import { adminLoginUrl } from './urls'

export const LoginApi = (payload: { email: string; password: string }) => {
  return api.request({
    method: 'post',
    url: adminLoginUrl,
    publicApi: false,
    body: payload,
  })
}
