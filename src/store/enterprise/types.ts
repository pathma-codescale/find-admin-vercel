import { JobCardStatusTypes } from '@/types/constants'

export interface Enterprise {
  email: string
  enterpriseId: string
  brand_name: string
  address: string
  city: string
  postal_code: string
  phone_number: string
  businessSector: string[]
  logo?: string
  enabledEmail: boolean
  enabledPushNotification: boolean
  businessLocation: BusinessLocation
  subscription: string
  subscriptionStatus: string
  activeSubscription?: any
  created_at: string
  updatedAt: string
  jobsCount: {
    active: number
    hidden: number
    suspended: number
  }
  status: string
}
interface BusinessLocation {
  locationName: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface SalaryTypes {
  annual?: string
  monthly?: string
  hourly?: string
}
interface Job {
  interestedCount: number
  domain: any
  jobId: string
  jobTitle: string
  companyName: string
  location?: {
    locationName: string
    coordinates: {
      latitude: number
      longitude: number
    }
    range: number
  }
  status: JobCardStatusTypes
  companyLogo: string
  createdAt: Date
  startDate?: string[]
  availability?: string[]
  benefits?: string[]
  contract?: string[]
  qualities?: string[]
  skills?: string[]
  salary?: SalaryTypes
  days: string[]
  schedules?: string[]
  interests?: string[]
  workingTime?: string[]
  jobDescription: string
  currency?: string
}
interface CandidatesPagination {
  hasMore: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  nextPage: number
}
interface Candidate {
  id: string
  email: string
  profilePhotoUrl?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  cityOfResidence?: string
  dateOfBirth?: string
  enabledPushNotification?: boolean
  enabledEmail?: boolean
  contracts?: string[]
  days?: string[]
  workingTime?: string[]
  schedules?: string[]
  availability?: string[]
  interests?: string[]
  skills?: string[]
  qualities?: string[]
  additionalInfo?: string
  type?: string
  location?: {
    locationName: string
    coordinates: {
      latitude: number
      longitude: number
    }
    range: number
  }
}
interface JobList {
  jobId?: string
  type?: string
}
interface Application {
  applicationId: string
  email: string
  enterpriseId: string
  jobId: string
  phone: string
  type: string
  userId: string
}
interface SubscriptionInfo {
  activeOn: {
    apple: boolean
    google: boolean
    isInTrialPeriod: boolean
    stripe: boolean
  }
  apple: any
  google: any
  hasAccess: boolean
  hasActiveSubscription: boolean
  stripe: any
  trialInfo: {
    daysRemaining: number
    isTrialActive: boolean
    trialEndDate: string
    trialStartDate: string
  } | null
}
export interface EnterpriseState {
  errorMessage?: string
  loader: boolean
  enterprise: Enterprise
  candidates: Candidate[]
  favouriteCandidates: Candidate[]
  job: Job
  enterpriseJobs: Job[]
  interestedJobs: Job[]
  getFavouriteCandidates: {
    candidateId: string
    enterpriseId: string
    jobList: JobList[]
  }[]
  applications: Application[]
  favoriteCandidateCount?: number
  pagination?: {
    hasMore: boolean
    lastEvaluatedKey: string
  }
  candidatesPagination?: CandidatesPagination
  page?: number
  subscriptionStatus?: string
  subscription?: {
    status: string
    plan: string
    startDate: Date
    endDate: Date
    autoRenew: boolean
  }
  trialInfo: {
    isTrialActive: boolean
    trialStartDate: Date
    trialEndDate: Date
    daysRemaining: number
  }
  hasActiveSubscription?: boolean
  sessionId?: string
  // setIosSubscription?: boolean;
  subscriptionId?: string
  planId?: string
  //setIosSubscription?: boolean;
  subscriptions?: SubscriptionInfo
  jobsCount: {
    active: number
  }
}

const initialState: EnterpriseState = {
  errorMessage: undefined,
  loader: false,
  enterprise: {
    enterpriseId: '',
    email: '',
    logo: '',
    brand_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone_number: '',
    enabledPushNotification: false,
    enabledEmail: false,
    businessSector: [],
    businessLocation: {
      locationName: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      range: 0,
    },
  },
  candidates: [],
  favouriteCandidates: [],
  job: {
    jobId: '',
    companyName: '',
    jobTitle: '',
    location: {
      locationName: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      range: 0,
    },
    status: JobCardStatusTypes.VISIBLE,
    companyLogo: '',
    jobDescription: '',
    createdAt: new Date(),
    startDate: [],
    availability: [],
    benefits: [],
    contract: [],
    qualities: [],
    skills: [],
    currency: '',
    salary: {
      annual: '',
      monthly: '',
      hourly: '',
    },
    days: [],
    schedules: [],
    interests: [],
    workingTime: [],
    domain: undefined,
    interestedCount: 0,
  },
  applications: [],
  favoriteCandidateCount: 0,
  pagination: {
    hasMore: false,
    lastEvaluatedKey: '',
  },
  page: 0,
  candidatesPagination: {
    hasMore: false,
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    limit: 10,
    nextPage: 1,
  },
  enterpriseJobs: [],
  interestedJobs: [],
  getFavouriteCandidates: [],
  subscriptionStatus: '',
  subscription: {
    status: '',
    plan: '',
    startDate: new Date(),
    endDate: new Date(),
    autoRenew: false,
  },
  trialInfo: {
    isTrialActive: false,
    trialStartDate: new Date(),
    trialEndDate: new Date(),
    daysRemaining: 0,
  },
  hasActiveSubscription: false,
  sessionId: '',
  subscriptionId: '',
  planId: '',
  //setIosSubscription: false, //TODO: remove this sub state,
  subscriptions: undefined,
  jobsCount: {
    active: 0,
  },
}

export interface EnterpriseApiResponse {
  data: { enterprises: any; totalCount: any; lastKey: any }
  message: string
  enterprises: Enterprise[]

  totalCount?: number
  pagination: {
    hasMore: boolean
    lastEvaluatedKey: string | null
    limit: number
  }
}

export interface EnterpriseFilters {
  sortBy?: string
  subscription?: string[]
  businessSector?: string[]
  dateRange: {
    startDate?: string
    endDate?: string
  }
}
