<template>
  <q-modal v-if="Object.keys(editedEvent).length !== 0" v-model="editionModal" content-classes="modal-container-md"
    @hide="resetForm()">
    <div class="modal-padding">
      <div class="row q-mb-md">
        <div class="col-11 row auxiliary-name">
          <img :src="getAvatar(selectedAuxiliary)" class="avatar">
          <q-select filter v-model="editedEvent.auxiliary" color="white" inverted-light :options="auxiliariesOptions"
            ref="auxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`"
            :disable="[UNAVAILABILITY, ABSENCE].includes(editedEvent.type)" />
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span>
            <q-icon name="clear" @click.native="close" />
          </span>
        </div>
      </div>
      <div class="modal-subtitle">
        <q-btn-toggle no-wrap v-model="editedEvent.type" toggle-color="primary" :options="eventTypeOptions.filter(option => option.value === editedEvent.type)" />
        <q-btn icon="delete" no-caps flat color="grey" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" />
      </div>
      <template v-if="editedEvent.type !== ABSENCE">
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" />
      </template>
      <template v-if="editedEvent.type === INTERVENTION">
        <ni-modal-select caption="Bénéficiaire" v-model="editedEvent.customer._id" :options="customersOptions" :error="validations.customer.$error"
          icon="face" requiredField disable />
        <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
          :error="validations.subscription.$error" @blur="validations.subscription.$touch" />
      </template>
      <template v-if="editedEvent.type === INTERNAL_HOUR">
        <ni-modal-select caption="Type d'heure interne" v-model="editedEvent.internalHour" :options="internalHourOptions"
          :error="validations.internalHour.$error" @blur="validations.internalHour.$touch" />
        <ni-search-address v-model="editedEvent.location.fullAddress" @selected="selectedAddress" @blur="validations.location.fullAddress.$touch"
          :error="validations.location.fullAddress.$error" :error-label="addressError" inModal />
      </template>
      <template v-if="isRepetition(editedEvent)">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition" @input="toggleRepetition" />
        </div>
      </template>
      <template v-if="editedEvent.type === ABSENCE">
        <ni-datetime-picker caption="Date de debut" v-model="editedEvent.dates.startDate" type="date" :error="validations.dates.startDate.$error"
          inModal @blur="validations.dates.startDate.$touch" />
        <ni-modal-select caption="Durée" :error="validations.startDuration.$error" :options="dateOptions" v-model="editedEvent.startDuration"
          separator @blur="validations.startDuration.$touch" />
        <ni-datetime-picker caption="Date de fin" v-model="editedEvent.dates.endDate" type="date" :error="validations.dates.endDate.$error"
          inModal @blur="validations.dates.endDate.$touch" />
        <ni-modal-select caption="Durée" :error="validations.endDuration.$error" :options="dateOptions" v-model="editedEvent.endDuration"
          separator @blur="validations.endDuration.$touch" />
        <ni-modal-select caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions" :error="validations.absence.$error"
          @blur="validations.absence.$touch" />
        <ni-file-uploader v-if="editedEvent.absence && editedEvent.absence === ILLNESS" caption="Justificatif d'absence"
          path="attachment" :entity="editedEvent" alt="justificatif absence" name="proofOfAbsence" :url="docsUploadUrl"
          @uploaded="documentUploaded" :additionalValue="additionalValue" :disable="!selectedAuxiliary._id" @delete="deleteDocument(editedEvent.attachment.driveId)"
          withBorders requiredField />
      </template>
      <ni-modal-input v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes" />
      <template v-if="editedEvent.type === INTERVENTION && !editedEvent.shouldUpdateRepetition">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
        </div>
        <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
          :options="cancellationConditions" requiredField @blur="validations.cancel.condition.$touch" />
        <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif" :options="cancellationReasons"
          requiredField @blur="validations.cancel.reason.$touch" />
      </template>
    </div>
    <div v-if="editedEvent.type === INTERVENTION" class="cutomer-info">
      <p class="input-caption">Infos bénéficiaire</p>
      <div>{{ editedEvent.customer.contact.address.fullAddress }}</div>
    </div>
    <q-btn class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement" @click="updateEvent"
      icon-right="check" :disable="disableEditionButton" />
  </q-modal>
</template>

<script>
import { DEFAULT_AVATAR } from '../../data/constants';
import { planningActionMixin } from '../../mixins/planningActionMixin';

export default {
  name: 'AuxiliaryEventEditionModal',
  mixins: [planningActionMixin],
  props: {
    editedEvent: { type: Object, default: () => ({}) },
    editionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    selectedAuxiliary: { type: Object, default: () => ({}) },
    auxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
  },
  computed: {
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
    },
    docsUploadUrl () {
      return !this.selectedAuxiliary._id
        ? ''
        : `${process.env.API_HOSTNAME}/events/${this.selectedAuxiliary._id}/gdrive/${this.selectedAuxiliary.administrative.driveFolder.id}/upload`;
    },
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
    updateEvent (value) {
      this.$emit('updateEvent', value);
    },
    deleteEventRepetition (value) {
      this.$emit('deleteEventRepetition', value);
    },
    deleteEvent (value) {
      this.$emit('deleteEvent', value);
    },
    selectedAddress (value) {
      this.$emit('selectedAddress', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .q-btn-toggle
    border: none;
    box-shadow: none;
    @media screen and (max-width: 677px)
      display: inline-flex;
      flex-wrap: wrap;
    & .q-btn-item
      width: 45%
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
      @media screen and (max-width: 677px)
        width: 100%
      & .q-btn-item
          width: 100%
    .delete-action
      display: flex;
      flex-direction: row;
      align-items: center;

  .cutomer-info
    background: $light-grey;
    padding: 10px 25px;
    /deep/ .q-if-inverted
      background: $light-grey !important;
      border: none;

  .light-checkbox
    color: $grey
    font-size: 14px

</style>
