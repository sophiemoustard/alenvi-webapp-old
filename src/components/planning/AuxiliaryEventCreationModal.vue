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
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="newEvent.dates" requiredField />
      </template>
      <template v-if="newEvent.type === INTERVENTION">
        <ni-modal-select caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions"
          :error="validations.customer.$error" requiredField @blur="validations.customer.$touch" />
        <ni-modal-select caption="Service" v-model="newEvent.subscription" :error="validations.subscription.$error"
          :options="customerSubscriptionsOptions(newEvent.customer)" requiredField @blur="validations.subscription.$touch" />
      </template>
      <template v-if="newEvent.type === ABSENCE">
        <ni-modal-select caption="Nature" v-model="newEvent.absenceNature" :options="absenceNatureOptions"
          :error="validations.absenceNature.$error" requiredField @blur="validations.absenceNature.$touch"
          @input="resetAbsenceType" />
        <template v-if="newEvent.absenceNature === DAILY">
          <ni-datetime-picker caption="Date de début" v-model="newEvent.dates.startDate" type="date" requiredField
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.dates.endDate" type="date" requiredField inModal
            :error="validations.dates.endDate.$error" @blur="validations.dates.endDate.$touch"
            :min="newEvent.dates.startDate" />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" requiredField @blur="validations.absence.$touch" />
          <ni-file-uploader v-if="newEvent.absence && newEvent.absence === ILLNESS" caption="Justificatif d'absence"
            path="attachment" :entity="newEvent" alt="justificatif absence" name="proofOfAbsence" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additionalValue="additionalValue" requiredField withBorders
            @delete="deleteDocument(newEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="newEvent.absenceNature === HOURLY">
          <ni-datetime-picker caption="Date de début" v-model="newEvent.dates.startDate" type="date" requiredField
            :error="validations.dates.startDate.$error" inModal @blur="validations.dates.startDate.$touch" />
          <ni-datetime-picker caption="Heure de début" v-model="newEvent.dates.startHour" type="time" requiredField
            :error="validations.dates.startHour.$error" inModal @blur="validations.dates.startHour.$touch"
            :max="newEvent.dates.endHour" />
          <ni-datetime-picker caption="Heure de fin" v-model="newEvent.dates.endHour" type="time" requiredField
            :error="validations.dates.endHour.$error" inModal @blur="validations.dates.endHour.$touch"
            :min="newEvent.dates.startHour" />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" requiredField @blur="validations.absence.$touch" disable />
        </template>
      </template>
      <template v-if="newEvent.type === INTERNAL_HOUR">
        <ni-modal-select caption="Type d'heure interne" v-model="newEvent.internalHour" :options="internalHourOptions"
          requiredField :error="validations.internalHour.$error" @blur="validations.internalHour.$touch" />
      </template>
      <template v-if="newEvent.type !== ABSENCE">
        <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency"
          :options="repetitionOptions" requiredField @blur="validations.repetition.frequency.$touch" />
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
import { ABSENCE, DEFAULT_AVATAR, INTERNAL_HOUR, INTERVENTION, HOURLY, UNJUSTIFIED } from '../../data/constants';
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
  },
  watch: {
    selectedAuxiliary (value) {
      if (!this.selectedAuxiliary.hasActiveCompanyContract && this.newEvent.type === INTERNAL_HOUR) this.newEvent.type = INTERVENTION;
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
