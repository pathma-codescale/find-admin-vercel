export const beginningOptions = [
  { label: 'Dès maintenant', value: 'des_maintenant', translationKey: 'rightNow'},
  { label: '1 à 2 semaines', value: '1_2_semaines', translationKey: 'oneToTwoWeeks'},
  { label: '1 mois', value: '1_mois', translationKey: 'oneMonth'},
  { label: 'Plus tard', value: 'plus_tard', translationKey: 'later'},
] as const;

export const contractOptions = [
  { label: 'CDI', value: 'CDI', translationKey: 'permanentContract' },
  { label: 'CDD', value: 'CDD', translationKey: 'fixedTermContract'},
  { label: 'Alternance', value: 'alternance', translationKey: 'apprenticeship' },
  { label: 'Intérim', value: 'interim', translationKey: 'temporary'},
  { label: 'Stage', value: 'stage', translationKey: 'internship'},
  { label: 'Saison', value: 'saison', translationKey: 'seasonal'},
] as const;

export const daysOptions = [
  { label: 'L', value: 'L', translationKey: 'monday'},
  { label: 'M', value: 'M1', translationKey: 'tuesday'},
  { label: 'M', value: 'M2', translationKey: 'wednesday'},
  { label: 'J', value: 'J', translationKey: 'thursday'},
  { label: 'V', value: 'V', translationKey: 'friday'},
  { label: 'S', value: 'S', translationKey: 'saturday'},
  { label: 'D', value: 'D', translationKey: 'sunday'},
] as const;

export const workingTimeOptions = [
  { label: 'Temps plein', value: 'temps_plein', translationKey: 'fullTime' },
  { label: 'Temps partiel', value: 'temps_partiel', translationKey: 'partTime' },
] as const;

export const scheduleOptions = [
  { label: 'Matin', value: 'matin', translationKey: 'morning' },
  { label: 'Après-midi', value: 'apres_midi', translationKey: 'afternoon' },
  { label: 'Soirée', value: 'soiree', translationKey: 'evening' },
  { label: 'Nuit', value: 'nuit', translationKey: 'night' },
  { label: 'Horaire de bureau', value: 'horaire_bureau', translationKey: 'officeHours' },
] as const;

export const domainOptions = [
  { label: 'Service aux personnes', value: 'service_aux_personnes', translationKey: 'personalServices' },
  { label: 'Automobile', value: 'automobile', translationKey: 'automotive' },
  { label: 'Esthétique/coiffure', value: 'esthetique_coiffure', translationKey: 'beautyHairdressing' },
  { label: 'Onglerie', value: 'onglerie', translationKey: 'nailCare' },
  { label: 'Nettoyage', value: 'nettoyage', translationKey: 'cleaning' },
  { label: 'Restauration', value: 'restauration', translationKey: 'catering' },
  { label: 'Hôtellerie', value: 'hotellerie', translationKey: 'hospitality' },
  { label: 'Commerce', value: 'commerce', translationKey: 'retail' },
  { label: 'Animation', value: 'animation', translationKey: 'animation' },
  { label: 'Agricole', value: 'agricole', translationKey: 'agricultural' },
  { label: 'Boucherie', value: 'boucherie', translationKey: 'butchery' },
  { label: 'Administratif', value: 'administratif', translationKey: 'administrative' },
  { label: 'Grande distribution', value: 'grande_distribution', translationKey: 'massRetail' },
  { label: 'Secrétariat', value: 'secretariat', translationKey: 'secretarial' },
  { label: 'Transport', value: 'transport', translationKey: 'transport' },
  { label: 'Logistique', value: 'logistique', translationKey: 'logistics' },
  { label: 'Agro alimentaire', value: 'agroalimentaire', translationKey: 'foodProcessing' },
  { label: 'Immobilier', value: 'immobilier', translationKey: 'realEstate' },
  { label: 'BTP', value: 'btp', translationKey: 'construction' },
  { label: 'Électricité', value: 'electricite', translationKey: 'electricity' },
  { label: 'Informatique', value: 'informatique', translationKey: 'informationTechnology' },
  { label: 'Télécom', value: 'telecom', translationKey: 'telecommunications' },
  { label: 'Petite enfance', value: 'petite_enfance', translationKey: 'earlyChildhood' },
  { label: 'Boulangerie', value: 'boulangerie', translationKey: 'bakery' },
  { label: 'Médical', value: 'medical', translationKey: 'medical' },
  { label: 'Prêt à porter', value: 'pret_a_porter', translationKey: 'readyToWear' },
] as const;

export const skillsOptions = [
  { label: 'Accueil client', value: 'accueil_client', translationKey: 'customerReception' },
  { label: 'Accueil patient', value: 'accueil_patient', translationKey: 'patientReception' },
  { label: 'Réception marchandise', value: 'reception_marchandise', translationKey: 'goodsReception' },
  { label: 'Permis B', value: 'permis_b', translationKey: 'drivingLicense' },
  { label: 'Service en salle', value: 'service_en_salle', translationKey: 'tableService' },
  { label: 'Cuisine', value: 'cuisine', translationKey: 'cooking' },
  { label: 'Cantine', value: 'cantine', translationKey: 'canteen' },
  { label: 'Prêt à porter', value: 'pret_a_porter', translationKey: 'readyToWear' },
  { label: 'Décoration', value: 'decoration', translationKey: 'decoration' },
  { label: 'Maquillage', value: 'maquillage', translationKey: 'makeup' },
  { label: 'Mode', value: 'mode', translationKey: 'fashion' },
  { label: 'Poids lourd', value: 'poids_lourd', translationKey: 'heavyGoods' },
  { label: 'Manutention', value: 'manutention', translationKey: 'handling' },
  { label: 'Mise en rayon', value: 'mise_en_rayon', translationKey: 'shelfStocking' },
  { label: 'Électricité', value: 'electricite', translationKey: 'electricity' },
  { label: 'Maçonnerie', value: 'maconnerie', translationKey: 'masonry' },
  { label: 'Barman', value: 'barman', translationKey: 'bartender' },
  { label: 'Aisance téléphonique', value: 'aisance_telephonique', translationKey: 'telephoneSkills' },
  { label: 'Maîtrise bureautique', value: 'maitrise_bureautique', translationKey: 'officeSoftware' },
  { label: 'Informatique', value: 'informatique', translationKey: 'computerSkills' },
  { label: 'Plongeur', value: 'plongeur', translationKey: 'dishwasher' },
  { label: 'Hygiène', value: 'hygiene', translationKey: 'hygiene' },
  { label: 'CACES', value: 'caces', translationKey: 'forkliftCertification' },
  { label: 'Travaux', value: 'travaux', translationKey: 'construction' },
  { label: 'Bricolage', value: 'bricolage', translationKey: 'diy' },
  { label: 'Jardinage', value: 'jardinage', translationKey: 'gardening' },
  { label: 'Maison de retraite', value: 'maison_de_retraite', translationKey: 'retirementHome' },
  { label: 'Baby sitting', value: 'baby_sitting', translationKey: 'babysitting' },
  { label: 'Ouvrier', value: 'ouvrier', translationKey: 'worker' },
  { label: 'Magasinier', value: 'magasinier', translationKey: 'warehouseWorker' },
  { label: 'Préparateur de commande', value: 'preparateur_de_commande', translationKey: 'orderPicker' },
  { label: 'Maintenance', value: 'maintenance', translationKey: 'maintenance' },
  { label: 'Mobilité', value: 'mobilite', translationKey: 'mobility' },
  { label: 'Maître nageur', value: 'maitre_nageur', translationKey: 'lifeguard' },
  { label: 'Moto', value: 'moto', translationKey: 'motorcycle' },
  { label: 'Automobile', value: 'automobile', translationKey: 'automotive' },
  { label: 'Entretien', value: 'entretien', translationKey: 'upkeep' },
  { label: 'Camping', value: 'camping', translationKey: 'camping' },
  { label: 'Aide à la personne', value: 'aide_a_la_personne', translationKey: 'personalAssistance' },
  { label: 'Réparation', value: 'reparation', translationKey: 'repair' },
  { label: 'Rénovation', value: 'renovation', translationKey: 'renovation' },
  { label: 'Distribution', value: 'distribution', translationKey: 'distribution' },
  { label: 'Techniques de vente', value: 'techniques_de_vente', translationKey: 'salesTechniques' },
  { label: 'Langues étrangères', value: 'langues_etrangeres', translationKey: 'foreignLanguages' },
  { label: 'Conduite de véhicules', value: 'conduite_de_vehicules', translationKey: 'vehicleDriving' },
  { label: 'Comptabilité', value: 'comptabilite', translationKey: 'accounting' },
  { label: 'Langages de programmation', value: 'langages_de_programmation', translationKey: 'programmingLanguages' },
  {
    label: 'Gestion des réseaux sociaux',
    value: 'gestion_des_reseaux_sociaux',
    translationKey: 'socialMediaManagement'
  },
  {
    label: 'Connaissances en marketing',
    value: 'connaissances_en_marketing',
    translationKey: 'marketingKnowledge'
  },
  { label: 'Dactylographie', value: 'dactylographie', translationKey: 'typing' },
  { label: 'Outils bureautiques', value: 'outils_bureautiques', translationKey: 'officeTools' },
  { label: 'Tenue de caisse', value: 'tenue_de_caisse', translationKey: 'cashRegister' },
] as const;

export const qualitiesOptions = [
  { label: 'Bonne élocution', value: 'bonne_elocution', translationKey: 'goodSpeech' },
  { label: 'Aisance téléphonique', value: 'aisance_telephonique', translationKey: 'telephoneSkills' },
  { label: 'Accueil client', value: 'accueil_client', translationKey: 'customerReception' },
  { label: 'Manuel', value: 'manuel', translationKey: 'manual' },
  { label: 'Rapide', value: 'rapide', translationKey: 'fast' },
  { label: 'Permis B', value: 'permis_b', translationKey: 'drivingLicense' },
  { label: 'Aisance informatique', value: 'aisance_informatique', translationKey: 'computerLiteracy' },
  { label: 'Créativité', value: 'creativite', translationKey: 'creativity' },
  { label: 'Travail en équipe', value: 'travail_equipe', translationKey: 'teamwork' },
  { label: 'Empathie', value: 'empathie', translationKey: 'empathy' },
  { label: 'Rigueur', value: 'rigueur', translationKey: 'rigor' },
  { label: 'Port de charge lourdes', value: 'port_charge_lourdes', translationKey: 'heavyLifting' },
  { label: 'Transport', value: 'transport', translationKey: 'transport' },
  { label: 'Anglais', value: 'anglais', translationKey: 'english' },
] as const;

export const activitiesOptions = [
  { label: 'Service aux personnes', value: 'service_aux_personnes', translationKey: 'personalServices' },
  { label: 'Automobile', value: 'automobile', translationKey: 'automotive' },
  { label: 'Esthétique/coiffure', value: 'esthetique_coiffure', translationKey: 'beautyHairdressing' },
  { label: 'Onglerie', value: 'onglerie', translationKey: 'nailCare' },
  { label: 'Nettoyage', value: 'nettoyage', translationKey: 'cleaning' },
  { label: 'Restauration', value: 'restauration', translationKey: 'catering' },
  { label: 'Hôtellerie', value: 'hotellerie', translationKey: 'hospitality' },
  { label: 'Commerce', value: 'commerce', translationKey: 'retail' },
  { label: 'Animation', value: 'animation', translationKey: 'animation' },
  { label: 'Agricole', value: 'agricole', translationKey: 'agricultural' },
  { label: 'Boucherie', value: 'boucherie', translationKey: 'butchery' },
  { label: 'Administratif', value: 'administratif', translationKey: 'administrative' },
  { label: 'Grande distribution', value: 'grande_distribution', translationKey: 'massRetail' },
  { label: 'Secrétariat', value: 'secretariat', translationKey: 'secretarial' },
  { label: 'Transport', value: 'transport', translationKey: 'transport' },
  { label: 'Logistique', value: 'logistique', translationKey: 'logistics' },
  { label: 'Agro alimentaire', value: 'agroalimentaire', translationKey: 'foodProcessing' },
  { label: 'Immobilier', value: 'immobilier', translationKey: 'realEstate' },
  { label: 'BTP', value: 'btp', translationKey: 'construction' },
  { label: 'Électricité', value: 'electricite', translationKey: 'electricity' },
  { label: 'Informatique', value: 'informatique', translationKey: 'informationTechnology' },
  { label: 'Télécom', value: 'telecom', translationKey: 'telecommunications' },
  { label: 'Petite enfance', value: 'petite_enfance', translationKey: 'earlyChildhood' },
  { label: 'Boulangerie', value: 'boulangerie', translationKey: 'bakery' },
  { label: 'Médical', value: 'medical', translationKey: 'medical' },
  { label: 'Prêt à porter', value: 'pret_a_porter', translationKey: 'readyToWear' },
] as const;

export const competenceOptions = [
  { label: 'Accueil client', value: 'accueil_client', translationKey: 'customerReception' },
  { label: 'Accueil patient', value: 'accueil_patient', translationKey: 'patientReception' },
  { label: 'Réception marchandise', value: 'reception_marchandise', translationKey: 'goodsReception' },
  { label: 'Permis B', value: 'permis_b', translationKey: 'drivingLicense' },
  { label: 'Service en salle', value: 'service_en_salle', translationKey: 'tableService' },
  { label: 'Cuisine', value: 'cuisine', translationKey: 'cooking' },
  { label: 'Cantine', value: 'cantine', translationKey: 'canteen' },
  { label: 'Prêt à porter', value: 'pret_a_porter', translationKey: 'readyToWear' },
  { label: 'Décoration', value: 'decoration', translationKey: 'decoration' },
  { label: 'Maquillage', value: 'maquillage', translationKey: 'makeup' },
  { label: 'Mode', value: 'mode', translationKey: 'fashion' },
  { label: 'Poids lourd', value: 'poids_lourd', translationKey: 'heavyGoods' },
  { label: 'Manutention', value: 'manutention', translationKey: 'handling' },
  { label: 'Mise en rayon', value: 'mise_en_rayon', translationKey: 'shelfStocking' },
  { label: 'Électricité', value: 'electricite', translationKey: 'electricity' },
  { label: 'Maçonnerie', value: 'maconnerie', translationKey: 'masonry' },
  { label: 'Barman', value: 'barman', translationKey: 'bartender' },
  { label: 'Aisance téléphonique', value: 'aisance_telephonique', translationKey: 'telephoneSkills' },
  { label: 'Maitrise bureautique', value: 'maitrise_bureautique', translationKey: 'officeSoftware' },
  { label: 'Informatique', value: 'informatique', translationKey: 'computerSkills' },
] as const;

export const conditionOptions = [
  {
    label: 'Remboursement frais de transport',
    value: 'remboursement_transport',
    translationKey: 'transportReimbursement'
  },
  { label: 'Titres-restaurant', value: 'titres_restaurant', translationKey: 'mealVouchers' },
  { label: 'Télétravail', value: 'teletravail', translationKey: 'remoteWork' },
  { label: 'RTT', value: 'rtt', translationKey: 'reducedWorkingTime' },
  { label: 'Mutuelle santé', value: 'mutuelle_sante', translationKey: 'healthInsurance' },
  { label: 'Chèques cadeaux', value: 'cheques_cadeaux', translationKey: 'giftVouchers' },
  { label: 'Team building', value: 'team_building', translationKey: 'teamBuilding' },
  { label: 'Primes', value: 'primes', translationKey: 'bonuses' },
  { label: 'Épargne', value: 'epargne', translationKey: 'savings' },
  { label: 'Voiture de fonction', value: 'voiture_fonction', translationKey: 'companyVehicle' },
  { label: 'Salle de sport', value: 'salle_sport', translationKey: 'gym' },
] as const;

import { useTranslations } from 'next-intl';

export const useTranslatedOptions = () => {
  const t = useTranslations('');

  const getTranslatedOptions = (options: readonly { value: string; translationKey: string }[]) => {
    return options.map(option => ({
      ...option,
      label: t(`filters.${option.translationKey}`)
    }));
  };

  return {
    beginningOptions: getTranslatedOptions(beginningOptions),
    contractOptions: getTranslatedOptions(contractOptions),
    daysOptions: getTranslatedOptions(daysOptions),
    workingTimeOptions: getTranslatedOptions(workingTimeOptions),
    scheduleOptions: getTranslatedOptions(scheduleOptions),
    domainOptions: getTranslatedOptions(domainOptions),
  };
};
