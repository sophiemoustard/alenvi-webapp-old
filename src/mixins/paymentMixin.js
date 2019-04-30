import { required } from 'vuelidate/lib/validators';
import { PAYMENT, PAYMENT_OPTIONS, WITHDRAWAL } from '../data/constants';

export const paymentMixin = {
  data () {
    return {
      creationLoading: false,
      paymentCreationModal: false,
      selectedCustomer: '',
      selectedClient: { identity: {} },
      PAYMENT,
      PAYMENT_OPTIONS,
      WITHDRAWAL,
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
      this.selectedCustomer = customer.identity.lastname;
      this.selectedClient = tpp ? Object.assign({}, tpp) : Object.assign({}, customer);
      this.newPayment.customer = customer._id;
      this.newPayment.nature = PAYMENT;
      this.newPayment.client = tpp ? tpp._id : customer._id;
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.paymentCreationModal = false;
      this.selectedCustomer = '';
      this.selectedClient = { identity: {} };
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
  },
};
