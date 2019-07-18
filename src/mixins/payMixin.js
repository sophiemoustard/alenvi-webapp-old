import { formatPrice, formatShortIdentity, formatHours } from '../helpers/utils';
import { END_CONTRACT_REASONS } from '../data/constants';

export const payMixin = {
  data () {
    return {
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          align: 'left',
          field: 'auxiliary',
          format: value => value ? formatShortIdentity(value.identity) : '',
        },
        {
          name: 'sector',
          label: 'Équipe',
          align: 'left',
          field: 'auxiliary',
          format: value => value && value.sector ? value.sector.name : '',
        },
        {
          name: 'startDate',
          label: 'Début',
          align: 'left',
          field: 'startDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endNotificationDate',
          label: 'Date de notif',
          align: 'left',
          field: 'endNotificationDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endReason',
          label: 'Motif',
          align: 'left',
          field: 'endReason',
          format: (value) => {
            const reason = END_CONTRACT_REASONS.find(r => r.value === value);
            return reason ? reason.label : '';
          },
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: 'endDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'contractHours',
          label: 'Heures contrat',
          align: 'center',
          field: 'contractHours',
          format: formatHours,
        },
        {
          name: 'workedHours',
          label: 'Heures travaillées',
          align: 'center',
          field: 'workedHours',
          format: formatHours,
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo non majo',
          align: 'center',
          field: 'notSurchargedAndExempt',
          format: formatHours,
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont exo et majo',
          align: 'center',
          field: 'surchargedAndExempt',
          format: formatHours,
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non exo et non majo ',
          align: 'center',
          field: 'notSurchargedAndNotExempt',
          format: formatHours,
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont non exo et majo',
          align: 'center',
          field: 'surchargedAndNotExempt',
          format: formatHours,
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures',
          align: 'center',
          field: 'hoursBalance',
          format: formatHours,
        },
        {
          name: 'hoursCounter',
          label: 'Compteur',
          align: 'center',
          field: row => row.hoursCounter - row.additionalHours - row.overtimeHours,
          format: formatHours,
        },
        {
          name: 'overtimeHours',
          label: 'Heures sup à payer',
          align: 'center',
          field: 'overtimeHours',
          format: formatHours,
        },
        {
          name: 'additionalHours',
          label: 'Heures comp à payer',
          align: 'center',
          field: 'additionalHours',
          format: formatHours,
        },
        {
          name: 'mutual',
          label: 'Mutuelle',
          align: 'center',
          field: 'mutual',
          format: value => value ? 'Oui' : 'Non',
        },
        {
          name: 'transport',
          label: 'Transport',
          align: 'center',
          field: 'transport',
          format: formatPrice,
        },
        {
          name: 'otherFees',
          label: 'Autres frais',
          align: 'center',
          field: 'otherFees',
          format: formatPrice,
        },
        {
          name: 'bonus',
          label: 'Prime',
          align: 'center',
          field: 'bonus',
          format: formatPrice,
        },
        {
          name: 'compensation',
          label: 'Indémnité',
          align: 'center',
          field: 'compensation',
          format: formatPrice,
        },
      ],
    }
  },
  methods: {
    formatPayload (payload) {
      return {
        ...this.$_.omit(payload, ['auxiliaryId', 'additionalHoursEdition', 'overtimeHoursEdition', 'bonusEdition', 'hoursCounterEdition', 'compensationEdition', 'paidKm', '__index']),
        hoursCounter: payload.hoursCounter - payload.overtimeHours - payload.additionalHours,
        auxiliary: payload.auxiliary._id,
      };
    },
  },
};
