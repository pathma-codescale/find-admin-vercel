import api from '../services/api'

import {
  getSignedUrl,
  deleteImageUrl,
  getDashboardMetricsUrl,
  getDashboardRecentJobsUrl,
  getDashboardRecentEnterprisesUrl,
} from './urls'

export const getSignedUrlApi = (body: object) => {
  return api.request({
    method: 'post',
    url: getSignedUrl,
    publicApi: false,
    body: body,
  })
}

/**
 * Upload file directly to pre-signed URL
 * @param url - signed URL returned by backend
 * @param file - File or Blob
 * @param contentType - MIME type of the file
 * @param onProgress - optional callback for upload progress
 */
export const uploadFileToPresignedUrlApi = async (
  url: string,
  file: File | Blob,
  contentType: string,
  onProgress?: (progress: number) => void,
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response)
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.send(file)
  })
}

export const deleteImageApi = (fileKey: string) => {
  return api.request({
    method: 'delete',
    url: deleteImageUrl,
    publicApi: false,
    body: { fileKey },
  })
}

export const getDashboardMetricsApi = async () => {
  return api.request({
    method: 'get',
    url: getDashboardMetricsUrl,
    publicApi: false,
  })
}

export const getDashboardRecentJobsApi = async (params?: { limit?: number; lastKey?: string }) => {
  return api.request({
    method: 'get',
    url: getDashboardRecentJobsUrl + `?limit=${params?.limit}`,
    publicApi: false,
  })
}

export const getDashboardRecentEnterprisesApi = async (params?: {
  limit?: number
  lastKey?: string
}) => {
  return api.request({
    method: 'get',
    url: getDashboardRecentEnterprisesUrl + `?limit=${params?.limit}`,
    publicApi: false,
  })
}
