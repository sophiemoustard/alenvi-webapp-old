<template>
  <q-modal v-if="Object.keys(newEvent).length !== 0" :value="creationModal" content-classes="modal-container-md"
    @hide="resetForm(false)">
    <div class="modal-padding">
      <div class="row q-mb-md">
        <div class="col-11 row auxiliary-name">
          <img :src="getAvatar(selectedAuxiliary)" class="avatar">
          <q-select filter v-model="newEvent.auxiliary" color="white" inverted-light :options="auxiliariesOptions"
            :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`"
            ref="auxiliarySelect" />
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span>
            <q-icon name="clear" @click.native="close" />
          </span>
        </div>
      </div>
      <q-btn-toggle no-wrap v-model="newEvent.type" toggle-color="primary" :options="eventTypeOptions"
        @input="resetForm(true, newEvent.type)" />
      <template v-if="newEvent.type !== ABSENCE">
        <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
          :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date />
      </template>
      <template v-if="newEvent.type === INTERVENTION">
        <ni-modal-select caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions"
          :error="validations.customer.$error" required-field @blur="validations.customer.$touch"
          @input="toggleServiceSelection"/>
        <ni-modal-select caption="Service" v-model="newEvent.subscription" :error="validations.subscription.$error"
          :options="customerSubscriptionsOptions(newEvent.customer)" required-field @blur="validations.subscription.$touch" />
      </template>
      <template v-if="newEvent.type === ABSENCE">
        <ni-modal-select caption="Nature" v-model="newEvent.absenceNature" :options="absenceNatureOptions"
          :error="validations.absenceNature.$error" required-field @blur="validations.absenceNature.$touch"
          @input="resetAbsenceType" />
        <template v-if="newEvent.absenceNature === DAILY">
          <ni-datetime-picker caption="Date de début" v-model="newEvent.dates.startDate" type="date" required-field
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.dates.endDate" type="date" required-field inModal
            :error="validations.dates.endDate.$error" @blur="validations.dates.endDate.$touch"
            :min="newEvent.dates.startDate" />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" />
          <ni-file-uploader v-if="newEvent.absence && newEvent.absence === ILLNESS" caption="Justificatif d'absence"
            path="attachment" :entity="newEvent" alt="justificatif absence" name="proofOfAbsence" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additionalValue="additionalValue" required-field withBorders
            @delete="deleteDocument(newEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="newEvent.absenceNature === HOURLY">
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
            disable-end-date :error="validations.dates.$error" @blur="validations.dates.$touch" />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch" disable />
        </template>
      </template>
      <template v-if="newEvent.type === INTERNAL_HOUR">
        <ni-modal-select caption="Type d'heure interne" v-model="newEvent.internalHour" :options="internalHourOptions"
          required-field :error="validations.internalHour.$error" @blur="validations.internalHour.$touch" />
      </template>
      <template v-if="newEvent.type !== ABSENCE">
        <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency"
          :options="repetitionOptions" required-field @blur="validations.repetition.frequency.$touch" :disable="!isRepetitionAllowed" />
      </template>
      <template v-if="newEvent.type === INTERNAL_HOUR">
        <ni-search-address v-model="newEvent.location.fullAddress" @selected="selectedAddress" :error-label="addressError"
          @blur="validations.location.fullAddress.$touch" :error="validations.location.fullAddress.$error" inModal />
      </template>
      <ni-modal-input v-model="newEvent.misc" caption="Notes" />
    </div>
    <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary"
      @click="createEvent" :disable="disableCreationButton" icon-right="add" />
  </q-modal>
</template>

<script>
import { ABSENCE, DEFAULT_AVATAR, INTERNAL_HOUR, INTERVENTION, HOURLY, UNJUSTIFIED, CUSTOMER_CONTRACT, COMPANY_CONTRACT, NEVER } from '../../data/constants';
import { planningModalMixin } from '../../mixins/planningModalMixin';

export default {
  name: 'AuxiliaryEventCreationModal',
  mixins: [planningModalMixin],
  props: {
    newEvent: { type: Object, default: () => ({}) },
    creationModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    selectedAuxiliary: { type: Object, default: () => ({}) },
    auxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
  },
  computed: {
    isEndDurationRequired () {
      if (this.newEvent.type !== ABSENCE) return false;

      return this.$moment(this.newEvent.dates.endDate).isAfter(this.$moment(this.newEvent.dates.startDate));
    },
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
    },
    docsUploadUrl () {
      return !this.selectedAuxiliary._id
        ? ''
        : `${process.env.API_HOSTNAME}/events/${this.selectedAuxiliary._id}/gdrive/${this.selectedAuxiliary.administrative.driveFolder.id}/upload`;
    },
    isCompanyContractActive () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContract = this.selectedAuxiliary.contracts.find(contract => contract.status === COMPANY_CONTRACT);
      if (!companyContract) return false;

      return !companyContract.endDate && companyContract.versions.some(version => version.isActive);
    },
    isCustomerContractActive () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const correspContract = this.selectedAuxiliary.contracts.find(ctr => ctr.customer === this.newEvent.customer);
      if (!correspContract) return false;
      return !correspContract.endDate && correspContract.versions.some(version => version.isActive);
    },
    isRepetitionAllowed () {
      if (this.newEvent.subscription !== '' && this.newEvent.customer !== '') {
        const selectedCustomer = this.customers.find(cus => cus._id === this.newEvent.customer);
        if (!selectedCustomer) return true;
        const selectedSubscription = selectedCustomer.subscriptions.find(sub => sub._id === this.newEvent.subscription);
        if (!selectedSubscription) return true;
        if (selectedSubscription.service.type === COMPANY_CONTRACT) return this.isCompanyContractActive;
        if (selectedSubscription.service.type === CUSTOMER_CONTRACT) return this.isCustomerContractActive;
      }
      return true;
    },
  },
  watch: {
    selectedAuxiliary (value) {
      if (!this.selectedAuxiliary.hasActiveCompanyContractOnEvent && this.newEvent.type === INTERNAL_HOUR) this.newEvent.type = INTERVENTION;
    },
    isRepetitionAllowed (value) {
      if (!value) this.newEvent.repetition.frequency = NEVER;
    }
  },
  methods: {
    getAvatar (user) {
      return user && user.picture && user.picture.link ? user.picture.link : DEFAULT_AVATAR;
    },
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
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    selectedAddress (value) {
      this.$emit('selectedAddress', value);
    },
    resetAbsenceType () {
      if (this.newEvent.type === ABSENCE && this.newEvent.absenceNature === HOURLY) {
        this.newEvent.absence = UNJUSTIFIED;
      }
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
      width: 45%
      border-radius: 20px;
      margin: 5px;
      background-color: $light-grey;

</style>
