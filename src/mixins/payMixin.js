import { formatPrice } from '../helpers/utils';
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
          format: value => value && value.identity ? `${value.identity.firstname.slice(0, 1)}. ${value.identity.lastname}` : ''
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
          label: 'Début de paye',
          align: 'left',
          field: 'startDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endNotificationDate',
          label: 'Date de notification',
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
          label: 'Fin de paye',
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
          label: 'Total heures travaillées',
          align: 'center',
          field: 'workedHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo SAP non majorées',
          align: 'center',
          field: 'notSurchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont majorées et exo SAP',
          align: 'center',
          field: 'surchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non majorées non exo SAP',
          align: 'center',
          field: 'notSurchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont majorées et non exo SAP',
          align: 'center',
          field: 'surchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures période',
          align: 'center',
          field: 'hoursBalance',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursCounter',
          label: 'Compteur d\'heures',
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
          label: 'Heures complémentaires à payer',
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
    // Editable td
    editField ({ obj, path, ref }) {
      obj[path] = true;
      this.$nextTick(() => {
        ref.focus();
      })
    },
    setEditionField ({ value, obj, path }) {
      obj[path] = !value || isNaN(value) ? 0 : value;
    },
    disableEditionField ({ obj, path }) {
      obj[path] = false;
    },
  },
};
