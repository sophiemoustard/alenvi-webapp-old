<template>
  <q-modal v-if="Object.keys(editedEvent).length !== 0" :value="editionModal" content-classes="modal-container-md"
    @hide="resetForm()">
    <div class="modal-padding">
      <div class="row q-mb-md">
        <div class="col-11 row auxiliary-name" v-if="selectedAuxiliary">
          <img :src="getAvatar(selectedAuxiliary)" class="avatar">
          <div v-if="[UNAVAILABILITY, ABSENCE].includes(editedEvent.type)">
            {{ selectedAuxiliary.identity.firstname }} {{ selectedAuxiliary.identity.lastname.toUpperCase() }}
          </div>
          <q-select v-else v-model="editedEvent.auxiliary" color="white" inverted-light :options="auxiliariesOptions"
            :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`"
            :disable="isDisabled" ref="auxiliarySelect" filter />
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span>
            <q-icon name="clear" @click.native="close" />
          </span>
        </div>
      </div>
      <div class="modal-subtitle">
        <q-btn-toggle no-wrap v-model="editedEvent.type" :options="eventType" toggle-color="primary" />
        <q-btn icon="delete" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" no-caps flat
          color="grey" v-if="!isDisabled" />
      </div>
      <template v-if="editedEvent.type !== ABSENCE">
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" requiredField
          :disable="isDisabled" />
      </template>
      <template v-if="editedEvent.type === INTERVENTION">
        <ni-modal-select caption="Bénéficiaire" v-model="editedEvent.customer._id" :options="customersOptions"
          :error="validations.customer.$error" requiredField disable />
        <ni-modal-select caption="Service" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
          v-model="editedEvent.subscription" :error="validations.subscription.$error"
          @blur="validations.subscription.$touch" requiredField :disable="isDisabled" />
      </template>
      <template v-if="editedEvent.type === INTERNAL_HOUR">
        <ni-modal-select caption="Type d'heure interne" v-model="editedEvent.internalHour"
          :options="internalHourOptions" :error="validations.internalHour.$error"
          @blur="validations.internalHour.$touch" />
        <ni-search-address v-model="editedEvent.location.fullAddress" @selected="selectedAddress" inModal
          @blur="validations.location.fullAddress.$touch" :error="validations.location.fullAddress.$error"
          :error-label="addressError" />
      </template>
      <template v-if="isRepetition(editedEvent) && !isDisabled">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition"
            @input="toggleRepetition" />
        </div>
      </template>
      <template v-if="editedEvent.type === ABSENCE">
        <ni-modal-select caption="Nature" v-model="editedEvent.absenceNature" :options="absenceNatureOptions"
          requiredField disable />
        <template v-if="editedEvent.absenceNature === DAILY">
          <ni-datetime-picker caption="Date de début" v-model="editedEvent.dates.startDate" type="date" requiredField
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Date de fin" v-model="editedEvent.dates.endDate" type="date" requiredField inModal
            :error="validations.dates.endDate.$error" @blur="validations.dates.endDate.$touch"
            :min="editedEvent.dates.startDate" />
          <ni-modal-select caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" requiredField @blur="validations.absence.$touch" />
          <ni-file-uploader v-if="editedEvent.absence && editedEvent.absence === ILLNESS" caption="Justificatif d'absence"
            path="attachment" :entity="editedEvent" alt="justificatif absence" name="proofOfAbsence" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additionalValue="additionalValue" requiredField withBorders
            @delete="deleteDocument(editedEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="editedEvent.absenceNature === HOURLY">
          <ni-datetime-picker caption="Date de début" v-model="editedEvent.dates.startDate" type="date" requiredField
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Heure de début" v-model="editedEvent.dates.startHour" type="time" requiredField
            :error="validations.dates.startHour.$error" inModal @blur="validations.dates.startHour.$touch"
            :max="editedEvent.dates.endHour" />
          <ni-datetime-picker caption="Heure de fin" v-model="editedEvent.dates.endHour" type="time" requiredField
            :error="validations.dates.endHour.$error" inModal @blur="validations.dates.endHour.$touch"
            :min="editedEvent.dates.startHour" />
          <ni-modal-select caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" requiredField @blur="validations.absence.$touch" disable />
        </template>
      </template>
      <ni-modal-input v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes"
        :disable="isDisabled" />
      <template v-if="editedEvent.type === INTERVENTION && !editedEvent.shouldUpdateRepetition && !isDisabled">
        <div class="row q-mb-md light-checkbox">
          <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
        </div>
        <div class="row justify-between">
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
            :options="cancellationConditions" requiredField @blur="validations.cancel.condition.$touch" class="col-6"
            style="padding-right: 3px" />
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif"
            :options="cancellationReasons" requiredField @blur="validations.cancel.reason.$touch" class="col-6"
            style="padding-left: 3px" />
        </div>
      </template>
    </div>
    <div v-if="editedEvent.type === INTERVENTION" class="cutomer-info">
      <p class="input-caption">Infos bénéficiaire</p>
      <div>{{ editedEvent.customer.contact.address.fullAddress }}</div>
    </div>
    <q-btn v-if="!isDisabled" class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement"
      @click="updateEvent" icon-right="check" :disable="disableEditionButton" />
  </q-modal>
</template>

<script>
import { DEFAULT_AVATAR, INTERVENTION } from '../../data/constants';
import { planningModalMixin } from '../../mixins/planningModalMixin';

export default {
  name: 'AuxiliaryEventEditionModal',
  mixins: [planningModalMixin],
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
    eventType () {
      return this.eventTypeOptions.filter(option => option.value === this.editedEvent.type);
    },
    isDisabled () {
      return this.editedEvent.type === INTERVENTION && this.editedEvent.isBilled;
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
    @media screen and (max-width: 767px)
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
      @media screen and (max-width: 767px)
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
