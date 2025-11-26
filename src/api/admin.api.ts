import api from '../services/api'
import {
  getAllAdminsUrl,
  getAdminByIdUrl,
  updateAdminUrl,
  createAdminUrl,
  disableAdminUrl,
  enableAdminUrl,
  deleteAdminUrl,
  resetAdminPasswordEmailSendUrl,
} from './urls'

export const GetAllAdminsApi = async (params?: string) => {
  return api.request({
    method: 'get',
    url: getAllAdminsUrl,
    publicApi: false,
    data: { params },
  })
}

export const GetAdminByIdApi = async (id: string) => {
  return api.request({
    method: 'get',
    url: getAdminByIdUrl + `/${id}`,
    publicApi: false,
  })
}

export const CreateAdminApi = async (payload: Record<string, any>) => {
  return api.request({
    method: 'post',
    url: createAdminUrl,
    publicApi: false,
    body: payload,
  })
}

export const UpdateAdminApi = async (email: string, body: object) => {
  return api.request({
    method: 'put',
    url: updateAdminUrl + `/${email}`,
    publicApi: false,
    body: body,
  })
}

export const EnableAdminApi = async (email: string) => {
  return api.request({
    method: 'put',
    url: enableAdminUrl + `/${email}`,
    publicApi: false,
  })
}

export const DisableAdminApi = async (email: string) => {
  return api.request({
    method: 'put',
    url: disableAdminUrl + `/${email}`,
    publicApi: false,
  })
}

export const DeleteAdminApi = async (id: string) => {
  return api.request({
    method: 'delete',
    url: deleteAdminUrl + `/${id}`,
    publicApi: false,
  })
}

export const resetAdminPasswordEmailSendApi = async (email: string) => {
  return api.request({
    method: 'post',
    url: resetAdminPasswordEmailSendUrl,
    body: { email },
    publicApi: false,
  })
}
