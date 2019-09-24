import { NotifyPositive, NotifyWarning, NotifyNegative } from '../components/popup/notify.js';

export const customerMixin = {
  computed: {
    lastSubscriptionHistory () {
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length > 1) {
        const history = this.customer.subscriptionsHistory;
        return history.sort((a, b) => new Date(b.approvalDate) - new Date(a.approvalDate))[0];
      }
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length === 1) {
        return this.customer.subscriptionsHistory[0];
      }
      return {};
    },
    acceptedBy () {
      if (!this.$_.has(this.lastSubscriptionHistory, 'helper.lastname')) return '';
      return `${this.lastSubscriptionHistory.helper.title || ''} ${this.lastSubscriptionHistory.helper.firstname || ''} ${this.lastSubscriptionHistory.helper.lastname}`;
    },
  },
  methods: {
    async updateCustomer (path) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, path)) return;
        console.log(this.$_.get(this.$v.customer, path));
        if (this.$_.get(this.$v.customer, path)) {
          const isValid = await this.waitForValidation(this.$v.customer, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        await this.updateAlenviCustomer(path);

        NotifyPositive('Modification enregistrée');
        if (path.match(/iban/i)) this.refreshCustomer();

        this.$store.commit('rh/saveUserProfile', this.customer);
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    async updateAlenviCustomer (path) {
      let value = this.$_.get(this.customer, path);
      if (path.match(/iban/i)) value = value.split(' ').join('');

      const payload = this.$_.set({}, path, value);
      payload._id = this.userProfile._id;
      await this.$customers.updateById(payload);
    },
  },
};
