export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Location {
  coordinates: Coordinates
  range: number
  locationName: string
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  cityOfResidence: string
  dateOfBirth: string
  profilePhotoUrl: string
  enabledEmail: boolean
  enabledPushNotification: boolean
  additionalInfo?: string

  location: Location

  days: string[]
  schedules: string[]
  availability: string[]
  qualities: string[]
  contracts: string[]
  interests: string[]
  skills: string[]
  workingTime: string[]

  fcmTokens: string[]
  createdAt: string
  updatedAt: string
  status?: string

  isBanned?: boolean
  isViewed?: boolean
}

export interface CandidatesApiResponse {
  message: string
  candidates: Candidate[]

  pagination: {
    hasMore: boolean
    lastEvaluatedKey: string | null
    limit: number
  }
}

export interface SeekerState {
  candidates: Candidate[]
  loading: boolean
  error: string | null

  currentPage: number
  pages: Record<number, Candidate[]>
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface CandidateFilters {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  dateJoinedFrom?: string
  dateJoinedTo?: string
  lastEvaluatedKey?: string
  limit?: number
  email?: string
}
