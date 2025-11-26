import {
  contractOptions,
  domainOptions,
  scheduleOptions,
  workingTimeOptions,
  beginningOptions,
  competenceOptions,
} from './selectorOptionsNew';

export const filterTypes = {
  contract: contractOptions,
  domain: domainOptions,
  schedule: scheduleOptions,
  workingTime: workingTimeOptions,
  beginning: beginningOptions,
  availability: beginningOptions,
  availabilitySlots: beginningOptions,
  competencies: competenceOptions,
} as const;
