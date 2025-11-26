export enum UserTypes {
  JOB_SEEKER = 'JOB_SEEKER',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AppThemes {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum ProfileCVTypes {
  CONTRATS = 'contrats',
  SLOTS = 'slots',
  AVAILABILITY = 'availability',
  DOMAINES = 'domaines',
  COMPETENCES = 'competences',
  QUALITES = 'qualites',
  INFORMATIONS = 'informations',
  LOCATION = 'LOCATION',
}

export enum ProfileSettingsTypes {
  PERSONAL_INFO = 'personalInfo',
  ACTIVITY_SECTORS = 'sectorsOfActivity',
  SUBSCRIPTION = 'subscription',
  RESET_PASSWORD = 'resetPassword',
  NOTIFICATIONS = 'notifications',
  LEGAL = 'legal',
  LOCATION = 'LOCATION',
}

export enum InputTypes {
  PHONE = 'phone',
  EMAIL = 'email',
  NUMBER = 'number',
}

export enum FavoriteDrawerTypes {
  FAVORITE = 'favorite',
  CONFIRM = 'confirm',
  SUCCESS = 'success',
}

export enum ImageSelectTypes {
  CAMERA = 'CAMERA',
  GALLERY = 'GALLERY',
  DELETE = 'DELETE',
}

export enum JobSearchTypes {
  JOB_TITLE = 'JOB_TITLE',
  JOB_LOCATION = 'JOB_LOCATION',
}

export enum JobInformationStatus {
  TO_TRANSMIT = 'TO_TRANSMIT',
  TRANSMITTED = 'TRANSMITTED',
  DEFAULT = 'default',
}

export enum PricingFormulaTypes {
  ESSENTIAL = 'Essentielle',
  PROFESSIONAL = 'Professionnelle',
  BUSINESS = 'Entreprise',
}

export enum CandidateInformationStatus {
  MATCH = 'MATCH',
  RECEIVED = 'RECEIVED',
  DEFAULT = 'default',
}

export enum JobCardSelectTypes {
  MODIFY = 'MODIFY',
  VISIBLE = 'VISIBLE',
  DELETE = 'DELETE',
}

export enum ProfileJobTypes {
  JOB_TITLE = 'Nom du poste',
  DOMAINES = 'Domaines d’activité',
  CONTRACT_TYPE = 'Type de contrat',
  AVAILABILITY = 'Disponibilités attendues',
  START_DATE = 'Date d’embauche',
  COMPETENCIES = 'Compétences',
  QUALITIES = 'Qualités',
  SALARY = 'Rémunération',
  BENEFITS = 'Avantages',
  LOCATION = 'Lieu de travail',
  JOB_DESCRIPTION = 'Description du poste',
}

export enum favoritesScreenTabTypes {
  FAVORITES = 'FAVORITES',
  OPPORTUNITIES = 'OPPORTUNITIES',
}

export enum JobCardStatusTypes {
  VISIBLE = 'VISIBLE',
  HIDE = 'HIDE',
}

export const MAX_RADIUS_VALUE = 60000 // meters
export const MAX_RADIUS_LABEL = ' 60km'
export const ZOOM_FACTOR = 2.5 / 111320

export const PRICING_PLANS = {
  Essentielle: 'price_1RWBDmQ0C81qsD6Y9mgcl2RG',
  Professionnelle: 'price_1RWBCrQ0C81qsD6YfAX0gB0a',
  Entreprise: 'price_1RWBCDQ0C81qsD6YP7W92OyA',
}

export enum AdminTypes {
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export const adminTypes = {
  CUSTOMER_SUPPORT: 'Customer Support',
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
}
