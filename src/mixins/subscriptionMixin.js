export const subscriptionMixin = {
  data () {
    return {
      subscriptions: [],
    };
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(1)
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
    getSubscriptionLastVersion (subscription) {
      if (!subscription.versions || subscription.versions.length === 0) return {};

      return subscription.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
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
