import api from '../services/api'
import {
  getAllEnterprisesUrl,
  searchEnterprisesUrl,
  getEnterpriseByIdUrl,
  createEnterpriseUrl,
  updateEnterpriseUrl,
  enableEnterpriseUrl,
  disableEnterpriseUrl,
  deleteEnterpriseUrl,
  filterEnterprisesUrl,
  resetEnterprisesPasswordEmailSendUrl,
} from './urls'

export const GetAllEnterprisesApi = async (params?: { limit?: number; lastKey?: string }) => {
  return api.request({
    method: 'get',
    url: getAllEnterprisesUrl,
    publicApi: false,
    data: params,
  })
}

export const SearchEnterprisesApi = async (query: string) => {
  return api.request({
    method: 'get',
    url: searchEnterprisesUrl,
    publicApi: false,
    data: { search: query },
  })
}

export const GetEnterpriseByIdApi = async (id: string) => {
  return api.request({
    method: 'get',
    url: getEnterpriseByIdUrl + `/${id}`,
    publicApi: false,
  })
}

export const CreateEnterpriseApi = async (payload: Record<string, any>) => {
  return api.request({
    method: 'post',
    url: createEnterpriseUrl,
    publicApi: false,
    body: payload,
  })
}

export const UpdateEnterpriseApi = async (payload: Record<string, any>) => {
  return api.request({
    method: 'put',
    url: updateEnterpriseUrl,
    publicApi: false,
    body: payload,
  })
}

export const EnableEnterpriseApi = async (enterpriseId: string) => {
  return api.request({
    method: 'put',
    url: `${enableEnterpriseUrl}/${enterpriseId}`,
    publicApi: false,
  })
}

export const DisableEnterpriseApi = async (enterpriseId: string) => {
  return api.request({
    method: 'put',
    url: `${disableEnterpriseUrl}/${enterpriseId}`,
    publicApi: false,
  })
}

export const DeleteEnterpriseApi = async (id: string) => {
  return api.request({
    method: 'delete',
    url: deleteEnterpriseUrl + `/${id}`,
    publicApi: false,
  })
}

export const FilterEnterprisesApi = async (filters: Record<string, any>) => {
  return api.request({
    method: 'post',
    url: filterEnterprisesUrl,
    publicApi: false,
    body: filters,
  })
}

export const resetEnterprisesPasswordEmailSendApi = async (email: string) => {
  return api.request({
    method: 'post',
    url: resetEnterprisesPasswordEmailSendUrl,
    body: { email },
    publicApi: false,
  })
}
