<template>
  <q-modal :value="creationModal" content-classes="modal-container-md" @hide="resetForm">
    <div class="modal-padding">
      <div class="row justify-between items-baseline">
        <div class="col-11">
          <h5>Ajouter un <span class="text-weight-bold">{{ creationModalNature }}</span></h5>
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span><q-icon name="clear" @click.native="resetForm" /></span>
        </div>
      </div>
      <div class="modal-subtitle">
        <q-btn-toggle no-wrap v-model="newPayment.nature" :options="paymentNatureOptions" toggle-color="primary" />
      </div>
      <ni-modal-input caption="Bénéficiaire" v-model="selectedCustomer.identity.lastname" required-field read-only />
      <ni-modal-input caption="Client" v-model="selectedClient" required-field read-only />
      <ni-modal-input :caption="`Montant du ${creationModalNature}`" suffix="€" type="number"
        v-model="newPayment.netInclTaxes" required-field :error="validations.netInclTaxes.$error"
        @blur="validations.netInclTaxes.$touch" :error-label="netInclTaxesError" />
      <ni-modal-select :caption="`Type du ${creationModalNature}`" v-model="newPayment.type" :options="paymentOptions"
        required-field @blur="validations.type.$touch" :error="validations.type.$error" />
      <ni-datetime-picker :caption="`Date du ${creationModalNature}`" v-model="newPayment.date"
        :error="validations.date.$error" @blur="validations.date.$touch" in-modal type="date" required-field />
    </div>
    <q-btn no-caps class="full-width modal-btn" :label="creationButtonLabel" icon-right="add" color="primary"
      :loading="loading" @click="createPayment" :disable="validations.$error || disableCreationButton" />
  </q-modal>
</template>

<script>
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '../../data/constants.js';
import ModalSelect from '../form/ModalSelect';
import ModalInput from '../form/ModalInput';
import DatetimePicker from '../form/DatetimePicker';

export default {
  name: 'PaymentCreationModal',
  components: {
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-datetime-picker': DatetimePicker,
  },
  props: {
    newPayment: { type: Object, default: () => ({}) },
    creationModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    selectedCustomer: { type: Object, default: () => ({}) },
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
      return 'Montant TTC non valide'
    },
    disableCreationButton () {
      return this.$_.some(this.newPayment, (el) => !el);
    },
    creationModalNature () {
      if (!this.newPayment.nature) return '';
      return this.paymentNatureOptions.find(option => option.value === this.newPayment.nature).label.toLowerCase();
    },
    creationButtonLabel () {
      return `Créer le ${this.creationModalNature.toLowerCase()}`;
    }
  },
  methods: {
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    createPayment (value) {
      this.$emit('createPayment', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables'

  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    .q-btn-toggle
      margin-bottom: 0;
      cursor: default;
      width: 100%;
    & /deep/ .q-btn-toggle
      border: none;
      box-shadow: none;
      & .q-btn-item
        width: 50%
        border-radius: 20px;
        margin: 5px;
        background-color: $light-grey;
</style>
