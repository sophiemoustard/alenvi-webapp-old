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
          label: 'Coût hebdomadaire TTC',
          align: 'center',
          field: row => `${this.formatNumber(this.computeWeeklyRate(row))}€`,
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
    getSubscriptionLastVersion (subscription) {
      if (!subscription.versions || subscription.versions.length === 0) return {};

      return subscription.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
    },
    computeWeeklyRate (subscription) {
      let weeklyRate = subscription.unitTTCRate * subscription.estimatedWeeklyVolume;
      if (subscription.sundays && subscription.service.holidaySurcharge) {
        weeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.holidaySurcharge / 100;
      }
      if (subscription.evenings && subscription.service.eveningSurcharge) {
        weeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.eveningSurcharge / 100;
      }

      return weeklyRate;
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
        this.subscriptions = this.customer.subscriptions.map(sub => ({
          ...this.getSubscriptionLastVersion(sub),
          ...sub,
        }))

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
  },
};
