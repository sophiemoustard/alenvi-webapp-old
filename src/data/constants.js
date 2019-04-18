// EVENTS
export const INTERVENTION = 'intervention';
export const ABSENCE = 'absence';
export const UNAVAILABILITY = 'unavailability';
export const INTERNAL_HOUR = 'internalHour';
export const ILLNESS = 'illness';
export const ABSENCE_TYPE = [
  { label: 'Congé', value: 'leave' },
  { label: 'Congé sans solde', value: 'unpaid leave' },
  { label: 'Congé maternité', value: 'maternity leave' },
  { label: 'Maladie', value: ILLNESS },
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
export const EDITION = 'edition';
export const DELETION = 'deletion';
export const CANCELLATION = 'cancellation';

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirect';
export const BILLING_DIRECT = 'direct';

// CUSTOMER FUNDING
export const MONTHLY = 'monthly';
export const ONCE = 'once';
export const FIXED = 'fixed';
export const HOURLY = 'hourly';

export const FUNDING_FREQ_OPTIONS = [
  { label: 'Mensuelle', value: MONTHLY },
  { label: 'Une seule fois', value: ONCE }
];
export const NATURE_OPTIONS = [
  { label: 'Horaire', value: HOURLY },
  { label: 'Forfaitaire', value: FIXED },
];

// AVATAR
export const DEFAULT_AVATAR = 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';

// REPETITION FREQUENCY
export const NEVER = 'never';
export const EVERY_DAY = 'every_day';
export const EVERY_WEEK_DAY = 'every_week_day';
export const EVERY_WEEK = 'every_week';

// CANCELLATION OPTIONS
export const INVOICED_AND_PAYED = 'invoiced_and_payed';
export const INVOICED_AND_NOT_PAYED = 'invoiced_and_not_payed';
export const NOT_INVOICED_AND_NOT_PAYED = 'not_invoiced_and_not_payed';

// CANCELLATION REASONS
export const CUSTOMER_INITIATIVE = 'customer_initiative';
export const AUXILIARY_INITIATIVE = 'auxiliary_initiative';

// ROLES
export const COACH = 'Coach';
export const CUSTOMER = 'Customer';
export const AUXILIARY = 'Auxiliaire';
export const PLANNING_REFERENT = 'Référent(e) planning';
export const AUXILIARY_ROLES = [AUXILIARY, PLANNING_REFERENT];

// PLANNING
export const THREE_DAYS_VIEW = '3days';
export const WEEK_VIEW = 'week';
export const PLANNING = 'planning';
export const AGENDA = 'agenda';
export const PERCENTAGE_BY_MINUTES = 0.136; // ( = 100 / (12 * 60))

// INDICATORS
export const WEEK_STATS = 'week_stats';

// TRANSORT
export const PUBLIC_TRANSPORT = 'public';
export const PRIVATE_TRANSPORT = 'private';
export const TRANSPORT_OPTIONS = [
  { label: 'Abonnement transports en commun', value: PUBLIC_TRANSPORT, ogustValue: 'C' },
  { label: 'Voiture personnelle', value: PRIVATE_TRANSPORT, ogustValue: 'V' },
  { label: 'Aucun', value: 'none', ogustValue: 'P' }
];
export const TRANSIT = 'transit';
export const DRIVING = 'driving';

// CONTRACTS
export const OTHER = 'other';
export const END_CONTRACT_REASONS = [
  { label: 'Rupture période d’essai employeur', value: 'employer_trial_period_termination' },
  { label: 'Rupture période d’essai salarié', value: 'employee_trial_period_termination' },
  { label: 'Démission', value: 'resignation' },
  { label: 'Licenciement faute grave', value: 'serious_misconduct_layoff' },
  { label: 'Licenciement faute lourde', value: 'gross_fault_layoff' },
  { label: 'Licenciement autre motif', value: 'other_reason_layoff' },
  { label: 'Mutation', value: 'mutation' },
  { label: 'Rupture conventionnelle', value: 'contractual_termination' },
  { label: 'Fin de stage', value: 'internship_end' },
  { label: 'Fin de contrat CDD', value: 'cdd_end' },
  { label: 'Autres', value: OTHER },
];

export const REQUIRED_LABEL = 'Champ requis';
export const CUSTOMER_CONTRACT = 'contract_with_customer';
export const COMPANY_CONTRACT = 'contract_with_company';
export const CONTRACT_STATUS_OPTIONS = [
  { label: 'Prestataire', value: COMPANY_CONTRACT },
  { label: 'Mandataire', value: CUSTOMER_CONTRACT },
];

// Billing

export const TWO_WEEKS = 'two_weeks';
export const MONTH = 'month';
export const BILL = 'bill';
export const CREDIT_NOTE = 'creditNote';

// Payments
export const WITHDRAWAL = 'withdrawal';
export const BANK_TRANSFER = 'bank_transfer';
export const CHECK = 'check';
export const CESU = 'cesu';
export const PAYMENT_OPTIONS = [
  { label: 'Prélèvement', value: WITHDRAWAL },
  { label: 'Virement', value: BANK_TRANSFER },
  { label: 'Chèque', value: CHECK },
  { label: 'CESU', value: CESU },
];
export const REFUND = 'refund';
export const PAYMENT = 'payment';
export const PAYMENT_NATURE_OPTIONS = [
  { label: 'Règlement', value: PAYMENT },
  { label: 'Remboursement', value: REFUND },
]
