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