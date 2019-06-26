import { formatPrice, formatShortIdentity } from '../helpers/utils';
import { END_CONTRACT_REASONS } from '../data/constants';
import get from 'lodash/get';

export const payMixin = {
  data () {
    return {
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          align: 'left',
          field: 'auxiliary',
          format: value => formatShortIdentity(get(value, 'identity')),
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
          format: value => this.formatHours(value),
        },
        {
          name: 'workedHours',
          label: 'Heures travaillées',
          align: 'center',
          field: 'workedHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo non majo',
          align: 'center',
          field: 'notSurchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont exo et majo',
          align: 'center',
          field: 'surchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non exo et non majo ',
          align: 'center',
          field: 'notSurchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont non exo et majo',
          align: 'center',
          field: 'surchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures',
          align: 'center',
          field: 'hoursBalance',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursCounter',
          label: 'Compteur',
          align: 'center',
          field: row => row.hoursCounter - row.additionalHours - row.overtimeHours,
          format: value => this.formatHours(value),
        },
        {
          name: 'overtimeHours',
          label: 'Heures sup à payer',
          align: 'center',
          field: 'overtimeHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'additionalHours',
          label: 'Heures comp à payer',
          align: 'center',
          field: 'additionalHours',
          format: value => this.formatHours(value),
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
          format: value => formatPrice(value),
        },
        {
          name: 'otherFees',
          label: 'Autres frais',
          align: 'center',
          field: 'otherFees',
          format: value => formatPrice(value),
        },
        {
          name: 'bonus',
          label: 'Prime',
          align: 'center',
          field: 'bonus',
          format: value => formatPrice(value),
        },
        {
          name: 'compensation',
          label: 'Indémnité',
          align: 'center',
          field: 'compensation',
          format: value => formatPrice(value),
        },
      ],
    }
  },
  methods: {
    // Format value
    formatPrice (value) {
      return formatPrice(value);
    },
    formatHours (value) {
      return value ? `${parseFloat(value).toFixed(2)}h` : '0.00h';
    },
    formatPayload (payload) {
      return {
        ...this.$_.omit(payload, ['auxiliaryId', 'additionalHoursEdition', 'overtimeHoursEdition', 'bonusEdition', 'hoursCounterEdition', 'compensationEdition', 'paidKm', '__index']),
        hoursCounter: payload.hoursCounter - payload.overtimeHours - payload.additionalHours,
        auxiliary: payload.auxiliary._id,
      };
    },
  },
};
