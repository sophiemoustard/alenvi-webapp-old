<template>
  <ni-modal :value="editionModal" @hide="resetForm">
    <template slot="title">
      Editer le <span class="text-weight-bold">{{ editionModalNature }}</span>
    </template>
    <ni-input in-modal caption="Bénéficiaire" :value="customerFullname" required-field read-only />
    <ni-input in-modal caption="Client" v-model="selectedClientName" required-field read-only />
    <ni-input in-modal :caption="`Montant du ${editionModalNature}`" suffix="€" type="number"
      v-model="editedPayment.netInclTaxes" required-field :error="validations.netInclTaxes.$error"
      @blur="validations.netInclTaxes.$touch" :error-label="netInclTaxesError" />
    <ni-select in-modal :caption="`Type du ${editionModalNature}`" v-model="editedPayment.type"
      :options="paymentOptions" required-field @blur="validations.type.$touch" :error="validations.type.$error" />
    <ni-datetime-picker :caption="`Date du ${editionModalNature}`" v-model="editedPayment.date"
      :error="validations.date.$error" @blur="validations.date.$touch" in-modal type="date" required-field />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" :label="editionButtonLabel" icon-right="add" color="primary"
        :loading="loading" @click="updatePayment" :disable="validations.$error || disableEditionButton" />
    </template>
  </ni-modal>
</template>

<script>
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '../../data/constants.js';
import Select from '../form/Select';
import Input from '../form/Input';
import Modal from '../Modal';
import DatetimePicker from '../form/DatetimePicker';
import { formatIdentity } from '../../helpers/utils.js';

export default {
  name: 'PaymentEditionModal',
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-datetime-picker': DatetimePicker,
    'ni-modal': Modal,
  },
  props: {
    editedPayment: { type: Object, default: () => ({}) },
    editionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    selectedCustomer: { type: Object, default: () => ({}) },
    selectedClientName: { type: String, default: '' },
  },
  data () {
    return {
      paymentOptions: PAYMENT_OPTIONS,
      paymentNatureOptions: PAYMENT_NATURE_OPTIONS,
    };
  },
  computed: {
    netInclTaxesError () {
      if (!this.validations.netInclTaxes.required) return REQUIRED_LABEL;
      return 'Montant TTC non valide';
    },
    disableEditionButton () {
      return this.$_.some(this.editedPayment, (el) => !el);
    },
    editionModalNature () {
      if (!this.editedPayment.nature) return '';
      return this.paymentNatureOptions.find(option => option.value === this.editedPayment.nature).label.toLowerCase();
    },
    editionButtonLabel () {
      return `Editer le ${this.editionModalNature.toLowerCase()}`;
    },
    customerFullname () {
      return formatIdentity(this.selectedCustomer.identity, 'FL');
    },
  },
  methods: {
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    updatePayment (value) {
      this.$emit('updatePayment', value);
    },
  },
}
</script>
