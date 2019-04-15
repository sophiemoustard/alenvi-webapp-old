import { NotifyPositive, NotifyNegative } from '../components/popup/notify';
import { extend } from '../helpers/utils.js';

export const followUpMixin = {
  methods: {
    async getCustomer (customerId) {
      try {
        const customer = await this.$customers.getById(customerId);
        this.mergeUser(customer);
        this.isLoaded = true;
      } catch (e) {
        console.error(e.response);
        NotifyNegative('Erreur lors du chargement des données');
      }
    },
    mergeUser (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
    async updateCustomer (path) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, path)) return 0;

        const value = this.$_.get(this.customer, path);
        const payload = this.$_.set({}, path, value);
        payload._id = this.userProfile._id;

        await this.$customers.updateById(payload);
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de la fiche bénéficiaire :/');
      }
    }
  }
};
