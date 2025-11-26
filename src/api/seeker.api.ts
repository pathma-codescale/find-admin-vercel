import api from '../services/api'
import type { ResetPasswordPayload } from '@/store/seeker/types'
import {
  candidateGetAllUrl,
  candidateGetByIdUrl,
  candidateCreateUrl,
  candidateDeleteUrl,
  candidateUpdateUrl,
  candidateSuspendUrl,
  resetCandidatePasswordUrl,
  activeCandidateUrl,
  displayCandidateUrl,
  hideCandidateUrl,
  resetPasswordEmailSendUrl,
  filterCandidatesUrl,
} from './urls'

export interface CandidateData {
  [key: string]: any
}
export const getAllCandidateApi = async (params?: { limit?: number; lastKey?: string }) => {
  return api.request({
    method: 'get',
    url: candidateGetAllUrl,
    publicApi: false,
    data: params,
  })
}

export const getCandidateByIdApi = async (candidateId: string) => {
  return api.request({
    method: 'get',
    url: `${candidateGetByIdUrl}/${candidateId}`,
  })
}

export const createCandidateApi = async (candidateData: Partial<CandidateData>) => {
  return api.request({
    method: 'post',
    url: candidateCreateUrl,
    body: candidateData,
  })
}

export const deleteCandidateByIdApi = async (candidateId: string) => {
  return api.request({
    method: 'delete',
    url: `${candidateDeleteUrl}/${candidateId}`,
  })
}

export const updateCandidateApi = async (candidateData: Partial<CandidateData>) => {
  return api.request({
    method: 'put',
    url: candidateUpdateUrl,
    body: candidateData,
  })
}

export const suspendCandidateByIdApi = async (candidateId: string) => {
  return api.request({
    method: 'put',
    url: `${candidateSuspendUrl}/${candidateId}`,
  })
}

export const resetCandidatePasswordApi = async (payload: ResetPasswordPayload) => {
  return api.request({
    method: 'post',
    url: resetCandidatePasswordUrl,
    body: payload,
  })
}

export const activateCandidateApi = async (userId: string) => {
  if (!userId) throw new Error('User ID is required')

  return api.request({
    method: 'put', // backend expects an update/PUT request
    url: `${activeCandidateUrl}/${userId}`, // URL with user ID
  })
}

export const displayCandidateByIdApi = async (userId: string) => {
  if (!userId) throw new Error('User ID is required')

  return api.request({
    method: 'put',
    url: `${displayCandidateUrl}/${userId}`,
  })
}

export const hideCandidateByIdApi = async (candidateId: string) => {
  if (!candidateId) throw new Error('User ID is required')

  return api.request({
    method: 'put',
    url: `${hideCandidateUrl}/${candidateId}`,
  })
}

export const resetPasswordEmailSendCandidateApi = async (email: string) => {
  return api.request({
    method: 'post',
    url: resetPasswordEmailSendUrl,
    body: { email },
  })
}

export const filterCandidatesApi = async (params?: {
  status?: string
  dateJoinedFrom?: string
  dateJoinedTo?: string
  limit?: number
  lastKey?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) => {
  const queryParams: Record<string, any> = { ...params }

  return api.request({
    method: 'post',
    url: filterCandidatesUrl,
    publicApi: false,
    body: queryParams,
  })
}
