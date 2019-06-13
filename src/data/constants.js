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

// EVENTS
export const INTERVENTION = 'intervention';
export const ABSENCE = 'absence';
export const UNAVAILABILITY = 'unavailability';
export const INTERNAL_HOUR = 'internalHour';
export const ILLNESS = 'illness';
export const UNJUSTIFIED = 'unjustified absence';
export const PAID_LEAVE = 'leave';
export const WEDDING = 'wedding';
export const BIRTH = 'birth';
export const DEATH = 'death';
export const ABSENCE_TYPES = [
  { label: 'Congé', value: PAID_LEAVE },
  { label: 'Congé sans solde', value: 'unpaid leave' },
  { label: 'Congé maternité', value: 'maternity leave' },
  { label: 'Maladie', value: ILLNESS },
  { label: 'Absence injustifiée', value: UNJUSTIFIED },
  { label: 'Mariage', value: WEDDING },
  { label: 'Naissance', value: BIRTH },
  { label: 'Décès', value: DEATH },
];
export const EDITION = 'edition';
export const DELETION = 'deletion';
export const CANCELLATION = 'cancellation';
export const DAILY = 'daily';
export const ABSENCE_NATURES = [
  { label: 'Journalière', value: DAILY },
  { label: 'Horaire', value: HOURLY },
];

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirect';
export const BILLING_DIRECT = 'direct';

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

// CANCELLATION REASONS
export const CUSTOMER_INITIATIVE = 'customer_initiative';
export const AUXILIARY_INITIATIVE = 'auxiliary_initiative';

// ROLES
export const COACH = 'coach';
export const ADMIN = 'admin';
export const CUSTOMER = 'customer';
export const AUXILIARY = 'auxiliary';
export const HELPER = 'helper';
export const PLANNING_REFERENT = 'planningReferent';
export const AUXILIARY_ROLES = [AUXILIARY, PLANNING_REFERENT];

// PLANNING
export const THREE_DAYS_VIEW = '3days';
export const WEEK_VIEW = 'week';
export const PLANNING = 'planning';
export const AGENDA = 'agenda';
export const PLANNING_VIEW_START_HOUR = 7;
export const PLANNING_VIEW_END_HOUR = 22;
export const PERCENTAGE_BY_MINUTES = 100 / ((PLANNING_VIEW_END_HOUR - PLANNING_VIEW_START_HOUR) * 60);

// INDICATORS
export const WEEK_STATS = 'week_stats';

// TRANSORT
export const PUBLIC_TRANSPORT = 'public';
export const PRIVATE_TRANSPORT = 'private';
export const TRANSPORT_OPTIONS = [
  { label: 'Abonnement transports en commun', value: PUBLIC_TRANSPORT },
  { label: 'Voiture personnelle', value: PRIVATE_TRANSPORT },
  { label: 'Aucun', value: 'none' }
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
];

// FUNDINGS
export const THIRD_PARTY_PAYER = 'ThirdPartyPayer';

// PAY
export const PAY = 'pay';

// FINAL PAY
export const FINAL_PAY = 'finalpay';

// EXPORTS
export const SERVICE = 'service';
export const SUBSCRIPTION = 'subscription';
export const FUNDING = 'funding';
export const WORKING_EVENT = 'working_event';
export const EXPORT_TYPES = [
  { label: 'Services', value: SERVICE },
  { label: 'Souscriptions', value: SUBSCRIPTION },
  { label: 'Financements', value: FUNDING },
  { label: 'Auxiliaires', value: AUXILIARY },
  { label: 'Bénéficiaires', value: CUSTOMER },
  { label: 'Aidants', value: HELPER },
];
export const EXPORT_HISTORY_TYPES = [
  { label: 'Interventions et heures internes', value: WORKING_EVENT },
  { label: 'Factures', value: BILL },
  { label: 'Paiements', value: PAYMENT },
  { label: 'Absences', value: ABSENCE },
  { label: 'Paies', value: PAY },
  { label: 'Soldes tout compte', value: FINAL_PAY },
];

// ORIGINS
export const COMPANI = 'compani';
export const THIRD_PARTY = 'third_party';
export const OGUST = 'ogust';
