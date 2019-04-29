<template>
  <q-modal :value="editionModal" content-classes="modal-container-md" @hide="resetForm">
    <div class="modal-padding">
      <div class="row justify-between items-baseline">
        <div class="col-11">
          <h5>Editer le <span class="text-weight-bold">{{ editionModalNature }}</span></h5>
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span><q-icon name="clear" @click.native="resetForm" /></span>
        </div>
      </div>
      <ni-modal-input caption="Bénéficiaire" v-model="selectedCustomer" required-field read-only />
      <ni-modal-input caption="Client" v-model="selectedClient" required-field read-only />
      <ni-modal-input :caption="`Montant du ${editionModalNature}`" suffix="€" type="number"
        v-model="editedPayment.netInclTaxes" required-field :error="validations.netInclTaxes.$error"
        @blur="validations.netInclTaxes.$touch" :error-label="netInclTaxesError" />
      <ni-modal-select :caption="`Type du ${editionModalNature}`" v-model="editedPayment.type" :options="paymentOptions"
        required-field @blur="validations.type.$touch" :error="validations.type.$error" />
      <ni-datetime-picker :caption="`Date du ${editionModalNature}`" v-model="editedPayment.date"
        :error="validations.date.$error" @blur="validations.date.$touch" in-modal type="date" required-field />
    </div>
    <q-btn no-caps class="full-width modal-btn" :label="editionButtonLabel" icon-right="add" color="primary"
      :loading="loading" @click="updatePayment" :disable="validations.$error || disableEditionButton" />
  </q-modal>
</template>

<script>
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '../../data/constants.js';
import ModalSelect from '../form/ModalSelect';
import ModalInput from '../form/ModalInput';
import DatetimePicker from '../form/DatetimePicker';

export default {
  name: 'PaymentEditionModal',
  components: {
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-datetime-picker': DatetimePicker,
  },
  props: {
    editedPayment: { type: Object, default: () => ({}) },
    editionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    selectedCustomer: { type: String, default: '' },
    selectedClient: { type: String, default: '' },
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
    }
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
