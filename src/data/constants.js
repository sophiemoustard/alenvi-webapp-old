// EVENTS
export const INTERVENTION = 'intervention';
export const ABSENCE = 'absence';
export const UNAVAILABILITY = 'unavailability';
export const INTERNAL_HOUR = 'internalHour';
export const ABSENCE_TYPE = [
  { label: 'Congé', value: 'leave' },
  { label: 'Congé sans solde', value: 'unpaid leave' },
  { label: 'Congé maternité', value: 'maternity leave' },
  { label: 'Maladie', value: 'illness' },
  { label: 'Absence injustifiée', value: 'unjustified absence' },
  { label: 'Mariage', value: 'mariage' },
  { label: 'Naissance', value: 'birth' },
  { label: 'Décès', value: 'death' },
];
export const MORNING = [{ name: 'morning', startHour: 8, endHour: 14 }];
export const AFTERNOON = [{ name: 'afternoon', startHour: 14, endHour: 20 }];
export const ALL_DAY = [{ name: 'afternoon', startHour: 8, endHour: 20 }];
export const DATE_OPTIONS = [
  { label: 'Matinée', value: MORNING },
  { label: 'Après-midi', value: AFTERNOON },
  { label: 'Journée entière', value: ALL_DAY },
];

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirecte';
export const BILLING_DIRECT = 'directe';
