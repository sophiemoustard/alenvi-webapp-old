import { required } from 'vuelidate/lib/validators';
import { PAYMENT, WITHDRAWAL, PAYMENT_OPTIONS } from '../data/constants';
import { getLastVersion } from '../helpers/utils.js';

export const paymentMixin = {
  data () {
    return {
      creationLoading: false,
      paymentCreationModal: false,
      selectedCustomer: { identity: {} },
      selectedClientName: '',
      PAYMENT,
      WITHDRAWAL,
      PAYMENT_OPTIONS,
      newPayment: {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      }
    }
  },
  validations: {
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    }
  },
  methods: {
    openPaymentCreationModal (customer, tpp) {
      this.selectedCustomer = { ...customer };
      this.selectedClientName = tpp ? tpp.name : customer.identity.lastname;
      this.newPayment.customer = customer._id;
      this.newPayment.nature = PAYMENT;
      this.newPayment.client = tpp ? tpp._id : customer._id;
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.paymentCreationModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedClientName = '';
      this.newPayment = {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      };
      this.$v.newPayment.$reset();
    },
    formatPayload (payment, customer) {
      const payload = { ...payment };

      if (payload.customer === payload.client) {
        delete payload.client
        if (payload.type === this.WITHDRAWAL && payload.nature === PAYMENT) {
          payload.rum = getLastVersion(customer.payment.mandates, 'createdAt').rum;
        }
      }

      return payload;
    },
  },
};
