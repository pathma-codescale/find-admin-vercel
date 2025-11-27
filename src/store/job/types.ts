// src/stores/job/types.ts

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  coordinates: Coordinates
  range: number
  locationName: string
}

export interface Salary {
  monthly: string
  annual: string
  hourly: string
}

export interface Job {
  jobDescription: string
  currency: string
  location: Location
  companyId: string
  days: string[]
  salary: Salary
  jobTitleLower: string
  status: string
  createdAt: string
  jobId: string
  contract: string[]
  schedules: string[]
  qualities: string[]
  locationLower: string
  updatedAt: string
  startDate: string[]
  skills: string[]
  workingTime: string[]
  benefits: string[]
  jobTitle: string
  domain: string[]
  companyName: string
  companyLogo: string
  isSuspended: boolean
}

export interface JobState {
  jobs: any[]
  loading: boolean
  error: string | null
  selectedJob: any | null
  currentPage: number
  totalCount: number
  pageSize: number
  pages: Record<number, any[]>
  pagination: {
    hasMore: boolean
    lastEvaluatedKey: string | null
    limit: number
  }
  filters: {
    status: string[]
    startDate: string | null
    endDate: string | null
    contract: string[] | null
    sortBy: string
  }
  isSuspended: boolean
}
