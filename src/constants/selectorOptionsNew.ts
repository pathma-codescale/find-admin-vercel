// import { useTranslations } from 'next-intl'

const beginningOptions: { value: string; label: string }[] = []
const contractOptions: { value: string; label: string }[] = []
const daysOptions: { value: string; label: string }[] = []
const workingTimeOptions: { value: string; label: string }[] = []
const scheduleOptions: { value: string; label: string }[] = []
const domainOptions: { value: string; label: string }[] = []
const skillsOptions: { value: string; label: string }[] = []
const qualitiesOptions: { value: string; label: string }[] = []
const activitiesOptions: { value: string; label: string }[] = []
const competenceOptions: { value: string; label: string }[] = []
const conditionOptions: { value: string; label: string }[] = []

const getTranslatedLabel = (key: string, t: unknown) => {
  return t(`options.${key}`)
}

export const beginningOptionsBase = [
  { value: 'des_maintenant', labelKey: 'rightNow' },
  { value: '1_2_semaines', labelKey: 'oneToTwoWeeks' },
  { value: '1_mois', labelKey: 'oneMonth' },
  { value: 'plus_tard', labelKey: 'later' },
] as const

export const contractOptionsBase = [
  { value: 'CDI', labelKey: 'permanentContract' },
  { value: 'CDD', labelKey: 'fixedTermContract' },
  { value: 'alternance', labelKey: 'apprenticeship' },
  { value: 'interim', labelKey: 'temporary' },
  { value: 'stage', labelKey: 'internship' },
  { value: 'saison', labelKey: 'seasonal' },
] as const

export const daysOptionsBase = [
  { value: 'L', labelKey: 'monday' },
  { value: 'M1', labelKey: 'tuesday' },
  { value: 'M2', labelKey: 'wednesday' },
  { value: 'J', labelKey: 'thursday' },
  { value: 'V', labelKey: 'friday' },
  { value: 'S', labelKey: 'saturday' },
  { value: 'D', labelKey: 'sunday' },
] as const

export const workingTimeOptionsBase = [
  { value: 'temps_plein', labelKey: 'fullTime' },
  { value: 'temps_partiel', labelKey: 'partTime' },
] as const

export const scheduleOptionsBase = [
  { value: 'matin', labelKey: 'morning' },
  { value: 'apres_midi', labelKey: 'afternoon' },
  { value: 'soiree', labelKey: 'evening' },
  { value: 'nuit', labelKey: 'night' },
  { value: 'horaire_bureau', labelKey: 'officeHours' },
] as const

export const domainOptionsBase = [
  { value: 'service_aux_personnes', labelKey: 'personalServices' },
  { value: 'automobile', labelKey: 'automotive' },
  { value: 'esthetique_coiffure', labelKey: 'beautyHairdressing' },
  { value: 'onglerie', labelKey: 'nailCare' },
  { value: 'nettoyage', labelKey: 'cleaning' },
  { value: 'restauration', labelKey: 'catering' },
  { value: 'hotellerie', labelKey: 'hospitality' },
  { value: 'commerce', labelKey: 'retail' },
  { value: 'animation', labelKey: 'animation' },
  { value: 'agricole', labelKey: 'agricultural' },
  { value: 'boucherie', labelKey: 'butchery' },
  { value: 'administratif', labelKey: 'administrative' },
  { value: 'secretariat', labelKey: 'secretarial' },
  { value: 'transport', labelKey: 'transport' },
  { value: 'logistique', labelKey: 'logistics' },
  { value: 'Agro alimentaire', labelKey: 'foodProcessing' },
  { value: 'immobilier', labelKey: 'realEstate' },
  { value: 'maconnerie', labelKey: 'masonry' },
  { value: 'electricite', labelKey: 'electricity' },
  { value: 'telecom', labelKey: 'telecommunications' },
  { value: 'petite_enfance', labelKey: 'earlyChildhood' },
  { value: 'boulangerie', labelKey: 'bakery' },
  { value: 'medical', labelKey: 'medical' },
  { value: 'pret_a_porter', labelKey: 'readyToWear' },
  { value: 'grande_distribution', labelKey: 'massRetail' },
  { value: 'ambulance', labelKey: 'ambulance' },
  { value: 'maison_de_retraite', labelKey: 'retirementHome' },
  { value: 'baby_sitting', labelKey: 'babySitting' },
  { value: 'comptabilite', labelKey: 'accounting' },
  { value: 'marketing', labelKey: 'marketing' },
  { value: 'btp', labelKey: 'construction' },
  { value: 'patisserie', labelKey: 'pastry' },
  { value: 'pharmaceutique', labelKey: 'pharmaceutical' },
  { value: 'poissonnerie', labelKey: 'fishmonger' },
  { value: 'industriel', labelKey: 'industrial' },
  { value: 'livraison', labelKey: 'delivery' },
] as const

export const skillsOptionsBase = [
  { value: 'accueil_client', labelKey: 'customerReception' },
  { value: 'accueil_patient', labelKey: 'patientReception' },
  { value: 'reception_marchandise', labelKey: 'goodsReception' },
  { value: 'service_en_salle', labelKey: 'tableService' },
  { value: 'cuisine', labelKey: 'cooking' },
  { value: 'cantine', labelKey: 'canteen' },
  { value: 'decoration', labelKey: 'decoration' },
  { value: 'maquillage', labelKey: 'makeup' },
  { value: 'mode', labelKey: 'fashion' },
  { value: 'poids_lourd', labelKey: 'heavyGoods' },
  { value: 'manutention', labelKey: 'handling' },
  { value: 'mise_en_rayon', labelKey: 'shelfStocking' },
  { value: 'barman', labelKey: 'bartender' },
  { value: 'chef_d_equipe', labelKey: 'teamLeader' },
  { value: 'informatique', labelKey: 'computerSkills' },
  { value: 'hygiene', labelKey: 'hygiene' },
  { value: 'caces', labelKey: 'forkliftCertification' },
  { value: 'bricolage', labelKey: 'diy' },
  { value: 'jardinage', labelKey: 'gardening' },
  { value: 'pack_office', labelKey: 'msOffice' },
  { value: 'gestion_des_stocks', labelKey: 'inventoryManagement' },
  { value: 'magasinier', labelKey: 'warehouseWorker' },
  { value: 'preparateur_de_commande', labelKey: 'orderPicker' },
  { value: 'maintenance', labelKey: 'maintenance' },
  { value: 'mobilite', labelKey: 'mobility' },
  { value: 'maitre_nageur', labelKey: 'lifeguard' },
  { value: 'moto', labelKey: 'motorcycle' },
  { value: 'entretien', labelKey: 'upkeep' },
  { value: 'camping', labelKey: 'camping' },
  { value: 'renovation', labelKey: 'renovation' },
  { value: 'distribution', labelKey: 'distribution' },
  { value: 'gestion_des_reseaux_sociaux', labelKey: 'socialMediaManagement' },
  { value: 'dactylographie', labelKey: 'typing' },
  { value: 'tenue_de_caisse', labelKey: 'cashRegister' },
] as const

export const qualitiesOptionsBase = [
  { value: 'rigueur', labelKey: 'rigor' },
  { value: 'bonne_elocution', labelKey: 'goodSpeech' },
  { value: 'aisance_telephonique', labelKey: 'telephoneSkills' },
  { value: 'manuel', labelKey: 'manual' },
  { value: 'transport', labelKey: 'transport' },
  { value: 'rapide', labelKey: 'fast' },
  { value: 'permis_b', labelKey: 'drivingLicense' },
  { value: 'aisance_informatique', labelKey: 'computerLiteracy' },
  { value: 'creativite', labelKey: 'creativity' },
  { value: 'empathie', labelKey: 'empathy' },
  { value: 'travail_equipe', labelKey: 'teamwork' },
  { value: 'port_charge_lourdes', labelKey: 'heavyLifting' },
  { value: 'maitrise_bureautique', labelKey: 'officeSoftware' },
  { value: 'techniques_de_vente', labelKey: 'salesTechniques' },
  { value: 'management', labelKey: 'management' },
  { value: 'langues_etrangeres', labelKey: 'foreignLanguages' },
  { value: 'autonomie', labelKey: 'autonomy' },
  { value: 'curiosite', labelKey: 'curiosity' },
  { value: 'prise_initiative', labelKey: 'initiative' },
  { value: 'gestion_stress', labelKey: 'stressManagement' },
  { value: 'polyvalence', labelKey: 'versatility' },
  { value: 'mobilite', labelKey: 'mobility' },
] as const

export const activitiesOptionsBase = domainOptionsBase

export const competenceOptionsBase = [
  { value: 'accueil_client', labelKey: 'customerReception' },
  { value: 'accueil_patient', labelKey: 'patientReception' },
  { value: 'reception_marchandise', labelKey: 'goodsReception' },
  { value: 'service_en_salle', labelKey: 'tableService' },
  { value: 'cuisine', labelKey: 'cooking' },
  { value: 'cantine', labelKey: 'canteen' },
  { value: 'decoration', labelKey: 'decoration' },
  { value: 'maquillage', labelKey: 'makeup' },
  { value: 'mode', labelKey: 'fashion' },
  { value: 'poids_lourd', labelKey: 'heavyGoods' },
  { value: 'manutention', labelKey: 'handling' },
  { value: 'mise_en_rayon', labelKey: 'shelfStocking' },
  { value: 'barman', labelKey: 'bartender' },
  { value: 'chef_d_equipe', labelKey: 'teamLeader' },
  { value: 'informatique', labelKey: 'computerSkills' },
  { value: 'hygiene', labelKey: 'hygiene' },
  { value: 'caces', labelKey: 'forkliftCertification' },
  { value: 'bricolage', labelKey: 'diy' },
  { value: 'jardinage', labelKey: 'gardening' },
  { value: 'pack_office', labelKey: 'msOffice' },
  { value: 'gestion_des_stocks', labelKey: 'inventoryManagement' },
  { value: 'magasinier', labelKey: 'warehouseWorker' },
  { value: 'preparateur_de_commande', labelKey: 'orderPicker' },
  { value: 'maintenance', labelKey: 'maintenance' },
  { value: 'mobilite', labelKey: 'mobility' },
  { value: 'maitre_nageur', labelKey: 'lifeguard' },
  { value: 'moto', labelKey: 'motorcycle' },
  { value: 'entretien', labelKey: 'upkeep' },
  { value: 'camping', labelKey: 'camping' },
  { value: 'renovation', labelKey: 'renovation' },
  { value: 'distribution', labelKey: 'distribution' },
  { value: 'gestion_des_reseaux_sociaux', labelKey: 'socialMediaManagement' },
  { value: 'dactylographie', labelKey: 'typing' },
  { value: 'tenue_de_caisse', labelKey: 'cashRegister' },
] as const

export const conditionOptionsBase = [
  { value: 'remboursement_transport', labelKey: 'transportReimbursement' },
  { value: 'titres_restaurant', labelKey: 'mealVouchers' },
  { value: 'teconstravail', labelKey: 'remoteWork' },
  { value: 'rtt', labelKey: 'reducedWorkingTime' },
  { value: 'mutuelle_sante', labelKey: 'healthInsurance' },
  { value: 'cheques_cadeaux', labelKey: 'giftVouchers' },
  { value: 'team_building', labelKey: 'teamBuilding' },
  { value: 'primes', labelKey: 'bonuses' },
  { value: 'epargne', labelKey: 'savings' },
  // { value: 'voiture_fonction', labelKey: 'compunknownVehicle' },
  { value: 'salle_sport', labelKey: 'gym' },
] as const

export const getBeginningOptions = (t: unknown) => {
  return beginningOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getContractOptions = (t: unknown) => {
  return contractOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getDaysOptions = (t: unknown) => {
  return daysOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getWorkingTimeOptions = (t: unknown) => {
  return workingTimeOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getScheduleOptions = (t: unknown) => {
  return scheduleOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getDomainOptions = (t: unknown) => {
  return domainOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getSkillsOptions = (t: unknown) => {
  return skillsOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getQualitiesOptions = (t: unknown) => {
  return qualitiesOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getActivitiesOptions = (t: unknown) => {
  return activitiesOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getCompetenceOptions = (t: unknown) => {
  return competenceOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getConditionOptions = (t: unknown) => {
  return conditionOptionsBase.map((option) => ({
    value: option.value,
    label: getTranslatedLabel(option.labelKey, t),
  }))
}

export const getOptionLabelByValue = (
  options: readonly { value: string; labelKey: string }[],
  value: string,
  t: unknown,
): string => {
  const option = options.find((opt) => opt.value === value)
  return option ? t(`options.${option.labelKey}`) : value
}

// export const updateAllOptions = (t: unknown) => {
//   beginningOptions = getBeginningOptions();
//   contractOptions = getContractOptions();
//   daysOptions = getDaysOptions();
//   workingTimeOptions = getWorkingTimeOptions();
//   scheduleOptions = getScheduleOptions();
//   domainOptions = getDomainOptions();
//   skillsOptions = getSkillsOptions();
//   qualitiesOptions = getQualitiesOptions();
//   activitiesOptions = getActivitiesOptions();
//   competenceOptions = getCompetenceOptions();
//   conditionOptions = getConditionOptions();
// };

// updateAllOptions();

// useTranslations.on('languageChanged', (t: unknown) => {
//   updateAllOptions();
// });

export {
  beginningOptions,
  contractOptions,
  daysOptions,
  workingTimeOptions,
  scheduleOptions,
  domainOptions,
  skillsOptions,
  qualitiesOptions,
  activitiesOptions,
  competenceOptions,
  conditionOptions,
}
