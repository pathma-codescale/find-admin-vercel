import api from '../services/api'
import {
  createJobUrl,
  getAllJobsUrl,
  updateJobUrl,
  filterJobsUrl,
  deleteJobUrl,
  enableJobUrl,
  disableJobUrl,
} from './urls'

export const GetAllJobsApi = (params?: any) =>
  api.request({
    method: 'get',
    url: getAllJobsUrl,
    publicApi: false,
    data: { params },
  })

export const GetJobApi = (jobId: string) => {
  return api.request({
    method: 'get',
    url: `${getAllJobsUrl}/${jobId}`,
    publicApi: false,
  })
}

export const CreateJobApi = (body: object) => {
  return api.request({
    method: 'post',
    url: createJobUrl,
    publicApi: false,
    body: body,
  })
}

export const UpdateEnterpriseJobApi = (jobId: string, body: object) => {
  return api.request({
    method: 'put',
    url: `${updateJobUrl}/${jobId}`,
    publicApi: false,
    body: body,
  })
}

export const FilterJobsApi = (filters: Record<string, any>) => {
  return api.request({
    method: 'post',
    url: filterJobsUrl,
    publicApi: false,
    body: filters,
  })
}

export const DeleteJobApi = (jobId: string) => {
  return api.request({
    method: 'delete',
    url: `${deleteJobUrl}/${jobId}`,
    publicApi: false,
  })
}

export const EnableJobApi = (jobId: string) => {
  return api.request({
    method: 'put',
    url: `${enableJobUrl}/${jobId}`,
    publicApi: false,
  })
}

export const DisableJobApi = (jobId: string) => {
  return api.request({
    method: 'put',
    url: `${disableJobUrl}/${jobId}`,
    publicApi: false,
  })
}
