<template>
  <q-modal v-if="Object.keys(editedEvent).length !== 0" :value="editionModal" content-classes="modal-container-md"
    @hide="resetForm()">
    <div class="modal-padding">
      <ni-planning-modal-header v-if="isCustomerPlanning" v-model="editedEvent.customer" :selectedPerson="selectedCustomer"
        @close="close" />
      <ni-planning-modal-header v-else-if="[UNAVAILABILITY, ABSENCE].includes(editedEvent.type)" :options="[]"
        v-model="editedEvent.auxiliary" :selectedPerson="selectedAuxiliary" @close="close" />
      <ni-planning-modal-header v-else v-model="editedEvent.auxiliary" :options="auxiliariesOptions"
        :selectedPerson="selectedAuxiliary" @close="close" />
      <div class="modal-subtitle">
        <q-btn-toggle no-wrap v-model="editedEvent.type" :options="eventType" toggle-color="primary" />
        <q-btn icon="delete" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" no-caps flat
          color="grey" v-if="!isDisabled" />
      </div>
      <template v-if="editedEvent.type !== ABSENCE">
        <ni-datetime-range caption="Dates et heures de l'évènement" v-model="editedEvent.dates" required-field
          :disable="isDisabled" :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date />
      </template>
      <template v-if="editedEvent.type === INTERVENTION">
        <ni-select in-modal caption="Bénéficiaire" v-model="editedEvent.customer" :options="customersOptions"
          :error="validations.customer.$error" required-field disable />
        <ni-select in-modal caption="Service" :options="customerSubscriptionsOptions"
          v-model="editedEvent.subscription" :error="validations.subscription.$error"
          @blur="validations.subscription.$touch" required-field :disable="isDisabled" />
      </template>
      <template v-if="editedEvent.type === INTERNAL_HOUR">
        <ni-select in-modal caption="Type d'heure interne" v-model="editedEvent.internalHour"
          :options="internalHourOptions" :error="validations.internalHour.$error"
          @blur="validations.internalHour.$touch" />
        <ni-search-address v-model="editedEvent.address" inModal
          @blur="validations.address.$touch" :error="validations.address.$error" :error-label="addressError" />
      </template>
      <template v-if="isRepetition(editedEvent) && !isDisabled && !editedEvent.isCancelled">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition"
            @input="toggleRepetition" />
        </div>
      </template>
      <template v-if="editedEvent.type === ABSENCE">
        <ni-select in-modal caption="Nature" v-model="editedEvent.absenceNature" :options="absenceNatureOptions"
          required-field disable />
        <template v-if="editedEvent.absenceNature === DAILY">
          <ni-datetime-picker caption="Date de début" v-model="editedEvent.dates.startDate" type="date" required-field
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Date de fin" v-model="editedEvent.dates.endDate" type="date" required-field
            inModal :error="validations.dates.endDate.$error" @blur="validations.dates.endDate.$touch"
            :min="editedEvent.dates.startDate" />
          <ni-select in-modal caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" />
          <ni-file-uploader v-if="editedEvent.absence && [ILLNESS, WORK_ACCIDENT].includes(editedEvent.absence)" path="attachment"
            caption="Justificatif d'absence" :entity="editedEvent" alt="justificatif absence" name="file"
            :url="docsUploadUrl" @uploaded="documentUploaded" :additionalValue="additionalValue" required-field
            withBorders @delete="deleteDocument(editedEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="editedEvent.absenceNature === HOURLY">
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="editedEvent.dates" required-field
            :disable="isDisabled" disable-end-date :error="validations.dates.$error" @blur="validations.dates.$touch" />
          <ni-select in-modal caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" disable />
        </template>
      </template>
      <ni-input in-modal v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes"
        :disable="isDisabled" @blur="validations.misc.$touch" :error="validations.misc.$error"
        :required-field="isMiscRequired" />
      <template v-if="editedEvent.type === INTERVENTION && !editedEvent.shouldUpdateRepetition && !isDisabled">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
        </div>
        <div class="row justify-between">
          <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
            :options="cancellationConditions" required-field @blur="validations.cancel.condition.$touch"
            class="col-6 cancel" />
          <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif"
            :options="cancellationReasons" required-field @blur="validations.cancel.reason.$touch"
            class="col-6 cancel" />
        </div>
      </template>
    </div>
    <div v-if="editedEvent.type === INTERVENTION && customerAddressList(editedEvent).length > 0" class="customer-info">
      <div class="row items-center no-wrap">
        <q-select v-model="editedEvent.address" color="white" inverted-light
          :options="customerAddressList(editedEvent)" :readonly="customerAddressList(editedEvent).length === 1"
          :after="iconSelect(editedEvent)" :filter-placeholder="editedEvent.address.fullAddress" ref="addressSelect" filter />
        <q-btn flat size="md" color="primary" icon="mdi-information-outline" :to="customerProfileRedirect" />
      </div>
    </div>
    <q-btn v-if="!isDisabled" class="full-width modal-btn" no-caps color="primary" :loading="loading"
      label="Editer l'évènement" @click="updateEvent" icon-right="check" :disable="disableEditionButton" />
  </q-modal>
</template>

<script>
import { INTERVENTION, ABSENCE, OTHER } from '../../data/constants';
import { planningModalMixin } from '../../mixins/planningModalMixin';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'EventEditionModal',
  mixins: [planningModalMixin],
  props: {
    editedEvent: { type: Object, default: () => ({}) },
    editionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    activeAuxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    personKey: { type: String, default: () => '' },
  },
  computed: {
    selectedCustomer () {
      if (!this.editedEvent.customer) return {};
      return this.customers.find(customer => customer._id === this.editedEvent.customer);
    },
    selectedAuxiliary () {
      if (!this.editedEvent.auxiliary || !this.activeAuxiliaries.length) return { identity: {} };
      const aux = this.activeAuxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(aux, this.editedEvent.dates.startDate);
      const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(aux, this.editedEvent.dates.startDate);

      return { ...aux, hasCustomerContractOnEvent, hasCompanyContractOnEvent };
    },
    eventType () {
      return this.eventTypeOptions.filter(option => option.value === this.editedEvent.type);
    },
    isDisabled () {
      return this.editedEvent.type === INTERVENTION && this.editedEvent.isBilled;
    },
    auxiliaryFilterPlaceholder () {
      return this.selectedAuxiliary.identity
        ? formatIdentity(this.selectedAuxiliary.identity, 'FL')
        : 'À affecter';
    },
    isMiscRequired () {
      return (this.editedEvent.type === ABSENCE && this.editedEvent.absence === OTHER) || this.editedEvent.isCancelled;
    },
  },
  methods: {
    toggleAuxiliarySelect () {
      return this.$refs['auxiliarySelect'].show();
    },
    close () {
      this.$emit('close');
    },
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    deleteDocument (value) {
      this.$emit('deleteDocument', value);
    },
    documentUploaded (value) {
      this.$emit('documentUploaded', value);
    },
    updateEvent (value) {
      this.$emit('updateEvent', value);
    },
    deleteEventRepetition (value) {
      this.$emit('deleteEventRepetition', value);
    },
    deleteEvent (value) {
      this.$emit('deleteEvent', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .q-btn-toggle
    border: none;
    box-shadow: none;
    @media screen and (max-width: 767px)
      display: inline-flex;
      flex-wrap: wrap;
    & .q-btn-item
      width: 45%;
      border-radius: 20px;
      margin: 5px;
      background-color: $light-grey;

  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    .q-btn-toggle
      margin-bottom: 0;
      cursor: default;
      width: 50%;
      @media screen and (max-width: 767px)
        width: 100%
      & .q-btn-item
          width: 100%
    .delete-action
      display: flex;
      flex-direction: row;
      align-items: center;

  .light-checkbox
    color: $grey
    font-size: 14px

  .cancel
    padding-right: 3px;

</style>
