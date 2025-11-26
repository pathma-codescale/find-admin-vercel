export const summaryQuestionsForCandidateEN = [
  {
    id: 'jobTitle',
    label: 'What is your most recent job title?',
    placeholder: 'e.g., "Senior Graphic Designer"',
    type: 'text',
    required: true,
    maxLength: 100,
  },
  {
    id: 'experience',
    label: 'How many years of experience do you have?',
    placeholder: 'e.g., "8 years"',
    type: 'text',
    required: true,
    maxLength: 50,
  },
  {
    id: 'skills',
    label: 'Name one or two of your key skills.',
    placeholder: 'e.g., "Branding, UI Design"',
    type: 'text',
    required: true,
    maxLength: 200,
  },
  {
    id: 'lookingFor',
    label: 'What are you looking for in your next role?',
    placeholder: 'e.g., "A creative leadership position"',
    type: 'text',
    required: false,
    maxLength: 300,
    multiline: true,
  },
] as const;

export const summaryQuestionsForCandidateFR = [
  {
    id: 'jobTitle',
    label: 'Quel était votre dernier poste occupé ?',
    placeholder: 'par ex. "Designer Graphique Senior"',
    type: 'text',
    required: true,
    maxLength: 100,
  },
  {
    id: 'experience',
    label: "Combien d'années d'expérience professionnelle avez-vous ?",
    placeholder: 'par ex. "8 années"',
    type: 'text',
    required: true,
    maxLength: 50,
  },
  {
    id: 'skills',
    label: 'Quelles sont vos deux principales compétences ?',
    placeholder: 'par ex. "Stratégie de marque, Design d\'interface"',
    type: 'text',
    required: true,
    maxLength: 200,
  },
  {
    id: 'lookingFor',
    label: "Qu'attendez-vous de votre prochain emploi ?",
    placeholder: 'par ex. "Un rôle de leadership dans le domaine créatif"',
    type: 'text',
    required: false,
    maxLength: 300,
    multiline: true,
  },
] as const;

export const jobDescriptionQuestionsEN = [
  {
    id: 'keyResponsibilities',
    label: 'What are the main responsibilities and duties?',
    placeholder:
      'e.g., "Develop web applications, Lead technical projects, Mentor junior developers"',
    type: 'text',
    required: true,
    maxLength: 300,
    multiline: true,
  },
  {
    id: 'companyType',
    label: 'What type of company/industry is this?',
    placeholder:
      'e.g., "Tech startup", "Healthcare company", "E-commerce platform"',
    type: 'text',
    required: true,
    maxLength: 150,
  },
  {
    id: 'workEnvironment',
    label: 'What is the work environment like?',
    placeholder:
      'e.g., "Remote-first, Collaborative team, Fast-paced startup environment"',
    type: 'text',
    required: true,
    maxLength: 200,
  },
  {
    id: 'experience',
    label: 'What experience and qualifications are required?',
    placeholder:
      'e.g., "5+ years experience, Bachelor\'s degree, Strong communication skills"',
    type: 'text',
    required: true,
    maxLength: 250,
  },
  {
    id: 'otherInfo',
    label: 'Any additional information or requirements?',
    placeholder:
      'e.g., "Travel required, Flexible hours, Competitive benefits package"',
    type: 'text',
    required: false,
    maxLength: 200,
  },
] as const;

export const jobDescriptionQuestionsFR = [
  {
    id: 'keyResponsibilities',
    label: 'Quelles sont les principales responsabilités et tâches ?',
    placeholder:
      'par ex. "Développer des applications web, Diriger des projets techniques, Encadrer les développeurs juniors"',
    type: 'text',
    required: true,
    maxLength: 300,
    multiline: true,
  },
  {
    id: 'companyType',
    label: "Quel type d'entreprise/secteur d'activité ?",
    placeholder:
      'par ex. "Startup technologique", "Entreprise de santé", "Plateforme e-commerce"',
    type: 'text',
    required: true,
    maxLength: 150,
  },
  {
    id: 'workEnvironment',
    label: "Comment décririez-vous l'environnement de travail ?",
    placeholder:
      'par ex. "Télétravail prioritaire, Équipe collaborative, Environnement startup dynamique"',
    type: 'text',
    required: true,
    maxLength: 200,
  },
  {
    id: 'experience',
    label: 'Quelle expérience et quelles qualifications sont requises ?',
    placeholder:
      'par ex. "5+ années d\'expérience, Diplôme universitaire, Excellentes compétences en communication"',
    type: 'text',
    required: true,
    maxLength: 250,
  },
  {
    id: 'otherInfo',
    label: 'Informations ou exigences supplémentaires ?',
    placeholder:
      'par ex. "Déplacements requis, Horaires flexibles, Package d\'avantages compétitif"',
    type: 'text',
    required: false,
    maxLength: 200,
  },
] as const;