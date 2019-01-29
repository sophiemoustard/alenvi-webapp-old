import { getLastVersion } from '../helpers/utils';
import { MONTHLY, ONE_TIME, ONCE } from '../data/constants';

export const subscriptionMixin = {
  data () {
    return {
      subscriptions: [],
      selectedSubscription: {},
      subscriptionHistoryModal: false,
      subscriptionsColumns: [
        {
          name: 'service',
          label: 'Service',
          align: 'left',
          field: row => row.service.name,
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          field: row => row.service.nature,
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => row.service.nature === 'Horaire' ? `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
        },
        {
          name: 'weeklyRate',
          label: 'Coût hebdomadaire TTC *',
          align: 'center',
          field: row => `${this.formatNumber(this.computeWeeklyRate(row, this.getMatchingFunding(row)))}€`,
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      subscriptionHistoryColumns: [
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => this.selectedSubscription.service && this.selectedSubscription.service.nature === 'Horaire'
            ? `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
        },
        {
          name: 'evenings',
          label: 'dont soirées',
          align: 'center',
          field: row => row.evenings ? `${row.evenings}h` : '',
        },
        {
          name: 'sundays',
          label: 'dont dimanche',
          align: 'center',
          field: row => row.sundays ? `${row.sundays}h` : '',
        },
      ],
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
    };
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(2)
    },
    computeWeeklyRate (subscription, funding) {
      let weeklyRate = subscription.unitTTCRate * subscription.estimatedWeeklyVolume;
      if (subscription.sundays && subscription.service.holidaySurcharge) {
        weeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.holidaySurcharge / 100;
      }
      if (subscription.evenings && subscription.service.eveningSurcharge) {
        weeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.eveningSurcharge / 100;
      }

      let fundingReduction = 0;
      if (funding !== {} || funding !== undefined) {
        if (funding.frequency !== ONCE) {
          if (funding.nature === ONE_TIME) {
            fundingReduction = funding.frequency === MONTHLY ? funding.amountTTC / 4.33 : funding.amountTTC;
          } else {
            const refundedHours = Math.min(
              funding.frequency === MONTHLY ? funding.careHours / 4.33 : funding.careHours,
              subscription.estimatedWeeklyVolume,
            );
            fundingReduction = refundedHours * funding.unitTTCRate;
          }

          fundingReduction = fundingReduction * (1 - funding.customerParticipationRate / 100);
        }
      }

      return weeklyRate - fundingReduction;
    },
    getMatchingFunding (subscription) {
      return this.fundings.find(fd => fd.services.some(ser => ser._id === subscription.service._id));
    },
    showHistory (id) {
      this.selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      this.subscriptionHistoryModal = true;
    },
    resetSubscriptionHistoryData () {
      this.subscriptionHistoryModal = false;
      this.selectedSubscription = [];
    },
    refreshSubscriptions () {
      try {
        const { subscriptions } = this.customer;
        this.subscriptions = subscriptions.map(sub => {
          const { versions } = sub;

          return { ...getLastVersion(versions, 'startDate'), ...sub }
        });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
