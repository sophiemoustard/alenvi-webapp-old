import { MONTH } from '../data/constants';

export const billingMixin = {
  methods: {
    setBillingDates () {
      const billingPeriod = this.user.company.customersConfig.billingPeriod;
      if (billingPeriod === MONTH) {
        this.billingDates = {
          endDate: this.$moment().subtract(1, 'M').endOf('month').toISOString(),
          startDate: this.$moment().subtract(1, 'M').startOf('month').toISOString(),
        };
      } else {
        this.billingDates = {
          endDate: this.$moment().date() > 15 ? this.$moment().date(15).hour(23).minute(59).toISOString()
            : this.$moment().endOf('month').hour(23).minute(59).toISOString(),
          startDate: this.$moment().date() > 15 ? this.$moment().date(1).hour(0).minute(0).toISOString()
            : this.$moment().date(16).hour(0).minute(0).toISOString(),
        }
      }
    },
  },
};
