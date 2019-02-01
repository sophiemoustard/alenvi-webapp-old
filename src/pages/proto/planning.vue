<template>
  <div>
    <div class="planning-container full-width q-pa-md">
      <div class="row justify-between items-center q-mb-md">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek"></q-btn>
        <span>{{ timelineTitle() }}</span>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek"></q-btn>
      </div>
      <table style="width: 100%">
        <thead>
          <th></th>
          <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">
            {{day}}
          </th>
        </thead>
        <tbody>
          <tr class="auxiliaries-row" v-for="(person, index) in persons" :key="index">
            <td class="event-cell" valign="top">
              {{person.firstname}} {{person.lastname}}
            </td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top" class="event-cell"
              @click="$emit('createEvent', { dayIndex, person })">
              <div :id="Math.random().toString(36).substr(2, 5)" draggable @dragstart="drag(dayIndex, event._id)" class="row cursor-pointer"
                v-for="(event, eventIndex) in getOneDayAuxiliaryEvents(person, days[dayIndex])" :key="eventIndex" @click.stop="openEditionModal(event._id)">
                <div class="col-12 event">
                  <p class="no-margin">{{ getEventHours(event) }}</p>
                  <p v-if="event.type === INTERVENTION" class="no-margin">{{ event.customer.identity.title }} {{ event.customer.identity.lastname }}</p>
                  <p v-if="event.type === ABSENCE" class="no-margin">{{ displayAbsenceType(event.absence) }}</p>
                  <p v-if="event.type === UNAVAILABILITY" class="no-margin">Indisponibilité</p>
                  <p v-if="event.type === INTERNAL_HOUR" class="no-margin">{{ event.internalHour.name }}</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Event edition modal -->
    <q-modal v-model="editionModal" content-classes="modal-container-md" @hide="resetEditionForm()">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>{{ editionModalTitle }}</h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="editionModal = false" /></span>
          </div>
        </div>
        <q-btn-toggle no-wrap v-model="editionType" toggle-color="primary" :options="editionTypeOptions" />
        <template v-if="editionType === EDITION">
          <ni-modal-select caption="Auxiliaire" v-model="editedEvent.auxiliary" :options="auxiliariesOptions" :error="$v.editedEvent.auxiliary.$error" />
          <template v-if="editedEvent.type !== ABSENCE">
            <ni-datetime-picker caption="Date de début" v-model="editedEvent.startDate" type="datetime" inModal />
            <ni-datetime-picker caption="Date de fin" v-model="editedEvent.endDate" type="datetime" inModal />
          </template>
          <template v-if="editedEvent.type === INTERVENTION">
            <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
              :error="$v.editedEvent.subscription.$error" />
          </template>
          <template v-if="editedEvent.type === ABSENCE">
            <ni-datetime-picker caption="Date de debut" v-model="editedEvent.startDate" type="date" :error="$v.editedEvent.startDate.$error" inModal />
            <ni-modal-select caption="Durée" :error="$v.editedEvent.startDuration.$error" :options="dateOptions" v-model="editedEvent.startDuration"
              separator />
            <ni-datetime-picker caption="Date de fin" v-model="editedEvent.endDate" type="date" :error="$v.editedEvent.endDate.$error" inModal />
            <ni-modal-select caption="Durée" :error="$v.editedEvent.endDuration.$error" :options="dateOptions" v-model="editedEvent.endDuration"
              separator />
            <ni-modal-select caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions" :error="$v.editedEvent.absence.$error" />
            <ni-file-uploader caption="Justificatif d'absence" path="attachment" :entity="editedEvent" alt="justificatif absence" name="proofOfAbsence"
              :url="docsUploadUrl" @uploaded="documentUploaded" :additionalValue="additionalValue" :key="uploaderKey" :disable="!selectedAuxiliary._id"
              @delete="deleteDocument(editedEvent.attachment.driveId)" withBorders />
          </template>
          <template v-if="editedEvent.type === INTERNAL_HOUR">
            <ni-modal-select caption="Type d'heure interne" v-model="editedEvent.internalHour" :options="internalHourOptions" :error="$v.editedEvent.internalHour.$error" />
          </template>
          <ni-search-address v-model="editedEvent.location.fullAddress" @selected="selectedAddress" @blur="$v.editedEvent.location.fullAddress.$touch"
            :error="$v.editedEvent.location.fullAddress.$error" :error-label="addressError" inModal/>
        </template>
        <template v-else-if="editionType === CANCELLATION">
        </template>
        <template v-else-if="editionType === DELETION">
        </template>
      </div>
      <q-btn v-if="editionType === EDITION" class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement"
        @click="updateEvent" />
      <q-btn v-if="editionType === CANCELLATION" class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Annuler l'évènement"
        @click="cancelEvent" />
      <q-btn v-if="editionType === DELETION" class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Supprimer l'évènement"
        @click="deleteEvent" />
    </q-modal>
  </div>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../helpers/vuelidateCustomVal.js';
import DatetimePicker from '../../components/form/DatetimePicker.vue';
import ModalSelect from '../../components/form/ModalSelect';
import SearchAddress from '../../components/form/SearchAddress';
import ModalInput from '../../components/form/ModalInput.vue';
import FileUploader from '../../components/form/FileUploader';
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, ABSENCE_TYPE, DATE_OPTIONS, MORNING, AFTERNOON, ALL_DAY, EDITION, CANCELLATION, DELETION } from '../../data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../../components/popup/notify';

export default {
  name: 'PlanningManager',
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-search-address': SearchAddress,
    'ni-modal-select': ModalSelect,
    'ni-file-uploader': FileUploader,
  },
  props: {
    events: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
  },
  data () {
    return {
      loading: false,
      beingDragged: {},
      startOfWeek: '',
      days: [],
      auxiliaries: [],
      maxDays: 7,
      editedEvent: {
        subscription: {},
        location: {},
        attachment: {},
        customer: '',
      },
      editionModal: false,
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      EDITION,
      DELETION,
      CANCELLATION,
      editionType: EDITION,
      editionTypeOptions: [
        {label: 'Edition', value: EDITION},
        {label: 'Annulation', value: CANCELLATION},
        {label: 'Suppression', value: DELETION},
      ],
      internalHours: [],
      absenceOptions: ABSENCE_TYPE,
      dateOptions: DATE_OPTIONS,
      uploaderKey: 0,
    }
  },
  validations: {
    editedEvent: {
      startDate: { required },
      startDuration: { required: requiredIf((item) => {
        return item.type === ABSENCE;
      }) },
      endDate: { required },
      endDuration: { required: requiredIf((item) => {
        return item.type === ABSENCE;
      }) },
      auxiliary: { required },
      sector: { required },
      subscription: { required: requiredIf((item) => {
        return item.type === INTERVENTION;
      }) },
      internalHour: { required: requiredIf((item) => {
        return item.type === INTERNAL_HOUR;
      }) },
      absence: { required: requiredIf((item) => {
        return item.type === ABSENCE;
      }) },
      location: { fullAddress: { frAddress } },
    },
  },
  computed: {
    daysHeader () {
      return this.days.map(day => this.$moment(day).format('dd DD'));
    },
    auxiliariesOptions () {
      return this.persons.length === 0 ? [] : this.persons.map(aux => ({
        label: `${aux.firstname || ''} ${aux.lastname}`,
        value: aux._id,
      }));
    },
    customersOptions () {
      return this.customers.length === 0 ? [] : this.customers.map(customer => ({
        label: `${customer.identity.firstname || ''} ${customer.identity.lastname}`,
        value: customer._id,
      }));
    },
    docsUploadUrl () {
      return !this.selectedAuxiliary._id
        ? ''
        : `${process.env.API_HOSTNAME}/events/${this.selectedAuxiliary._id}/gdrive/${this.selectedAuxiliary.administrative.driveFolder.id}/upload`;
    },
    selectedAuxiliary (action) {
      if (this.creationModal && this.newEvent.auxiliary !== '') return this.persons.find(aux => aux._id === this.newEvent.auxiliary);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.persons.find(aux => aux._id === this.editedEvent.auxiliary);
      return {};
    },
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.lastname}`;
    },
    internalHourOptions () {
      return this.internalHours.map(hour => ({
        label: hour.name,
        value: hour._id,
      }));
    },
    addressError () {
      if (!this.$v.editedEvent.location.fullAddress.required) return 'Champ requis';

      return 'Adresse non valide';
    },
    editionModalTitle () {
      if (!this.editedEvent.type) return '';

      switch (this.editedEvent.type) {
        case INTERVENTION:
          const customer = this.customers.find(customer => customer._id === this.editedEvent.customer._id);
          const subscription = customer.subscriptions.find(sub => sub._id === this.editedEvent.subscription);
          return `Edition de l'intervention ${subscription.service.name} chez ${customer.identity.title} ${customer.identity.lastname}`;
        case ABSENCE:
          return 'Edition de l\'abscence';
        case INTERNAL_HOUR:
          return 'Edition de l\'heure interne';
        case UNAVAILABILITY:
          return 'Edition de l\'indisponibilité';
      }
    },
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
  },
  methods: {
    selectedAddress (item) {
      this.editedEvent.location = Object.assign({}, this.newEvent.location, item);
    },
    // Table
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    timelineTitle () {
      return `${this.$moment(this.startOfWeek).format('DD/MM')} - ${this.$moment(this.endOfWeek()).format('DD/MM')}`;
    },
    goToPreviousWeek () {
      this.startOfWeek.subtract(7, 'd');
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    goToNextWeek () {
      this.startOfWeek.add(7, 'd');
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    getTimelineDays () {
      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
    },
    // Event display
    getOneDayAuxiliaryEvents (auxiliary, day) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliary._id)
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          let dayEvent = { ...event };
          if (!this.$moment(day).isSame(event.startDate, 'day')) dayEvent.startDate = this.$moment(day).hour(8).toISOString();
          if (!this.$moment(day).isSame(event.endDate, 'day')) dayEvent.endDate = this.$moment(day).hour(20).toISOString();

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPE.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    // Event creation
    // Event edition
    getAbsenceDurations (event) {
      let startDuration;
      let endDuration;

      if (event.type !== ABSENCE) return { startDuration, endDuration }

      const startHour = this.$moment(event.startDate).hours();
      const endHour = this.$moment(event.endDate).hours();
      if (this.$moment(event.startDate).isSame(this.$moment(event.endDate), 'days')) {
        if (startHour === MORNING[0].startHour && endHour === MORNING[0].endHour) startDuration = MORNING;
        else if (startHour === AFTERNOON[0].startHour && endHour === AFTERNOON[0].endHour) startDuration = AFTERNOON;
        else startDuration = ALL_DAY;
      } else {
        if (startHour === AFTERNOON[0].startHour) startDuration = AFTERNOON;
        else startDuration = ALL_DAY;

        if (endHour === MORNING[0].endHour) endDuration = MORNING;
        else endDuration = ALL_DAY;
      }

      return { startDuration, endDuration };
    },
    openEditionModal (eventId) {
      const editedEvent = this.events.find(ev => ev._id === eventId);
      const { createdAt, updatedAt, ...eventData } = editedEvent;
      const auxiliary = editedEvent.auxiliary._id;
      switch (editedEvent.type) {
        case INTERVENTION:
          const subscription = editedEvent.subscription._id;
          this.editedEvent = { location: {}, ...eventData, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = editedEvent.internalHour._id;
          this.editedEvent = { location: {}, ...eventData, auxiliary, internalHour };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(editedEvent);
          this.editedEvent = { location: {}, attachment: {}, ...eventData, auxiliary, startDuration, endDuration };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { location: {}, ...eventData, auxiliary };
          break;
      }

      this.editionModal = true
    },
    resetEditionForm () {
      this.editionType = EDITION;
      this.$v.editedEvent.$reset();
      this.editedEvent = {
        subscription: {},
        location: {},
      };
    },
    async updateEvent () {
      try {
        this.editedEvent.sector = this.selectedSector;
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        if (this.hasConflicts(payload, payload.auxiliary, payload.startDate)) {
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        delete payload.customer;
        delete payload.type;
        delete payload._id
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        this.$emit('refreshEvents');
        this.editionModal = false;
        this.resetEditionForm();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    // Event cancellation
    async cancelEvent () {},
    // Event deletion
    async deleteEvent () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        this.loading = true
        await this.$events.deleteById(this.editedEvent._id);
        this.$emit('refreshEvents');
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Service supprimé.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression du service.');
      } finally {
        this.loading = false
      }
    },
    // Event files
    documentUploaded (uploadedInfo) {
      if (!uploadedInfo.xhr || !uploadedInfo.xhr.response) return;

      const json = JSON.parse(uploadedInfo.xhr.response);
      if (!json || !json.data || !json.data.payload) return;

      if (this.creationModal) this.newEvent.attachment = { ...json.data.payload.attachment }
      if (this.editionModal) this.editedEvent.attachment = { ...json.data.payload.attachment }
    },
    async deleteDocument (driveId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.$gdrive.removeFileById({ id: driveId });
        if (this.creationModal) this.newEvent.attachment = {};
        if (this.editionModal) this.editedEvent.attachment = {};
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    // Drag & drop
    drag (dayIndex, eventId) {
      event.dataTransfer.setData('text', event.target.id);
      // We have source and position saving
      this.beingDragged = this.events.find(ev => ev._id === eventId);
      this.beingDragged.dayIndex = dayIndex;
    },
    async drop (toDay, toAuxiliary) {
      try {
        const data = event.dataTransfer.getData('text');
        if (event.target.nodeName === 'TD') {
          event.target.appendChild(document.getElementById(data));
        }
        if (event.target.nodeName === 'P') {
          event.target.parentNode.parentNode.parentNode.appendChild(document.getElementById(data));
        }
        const daysBetween = this.$moment(this.beingDragged.endDate).diff(this.$moment(this.beingDragged.startDate), 'days');
        await this.$events.updateById(this.beingDragged._id, {
          startDate: this.$moment(toDay).hours(this.$moment(this.beingDragged.startDate).hours())
            .minutes(this.$moment(this.beingDragged.startDate).minutes()).toISOString(),
          endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(this.beingDragged.endDate).hours())
            .minutes(this.$moment(this.beingDragged.endDate).minutes()).toISOString(),
          auxiliary: toAuxiliary._id
        });
        NotifyPositive('Évènement modifié');
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.beingDragged = {};
        this.$emit('refreshEvents');
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  table
    border-collapse: collapse;
    table-layout: fixed;
    border-style: hidden;

  td, th
    border-left: 1px solid $light-grey;
    border-right: 1px solid $light-grey;

  td
    padding: 5px 10px;

    &:before
      content: "";
      display: block;
      margin: 0 auto 5px;
      width: 80%;
      border-bottom: 1px solid $light-grey;

  .planning-container
    background: white
  .event
    border: 1px solid black
    padding: 2px
    margin-bottom: 3px
  .auxiliaries-row
    border-right: 1px solid $light-grey;

  td
    padding: 5px 10px;

    &:before
      content: "";
      display: block;
      margin: 0 auto 5px;
      width: 80%;
      border-bottom: 1px solid $light-grey;

  .planning-container
    background: white
  .event
    border: 1px solid black
    padding: 2px
    margin-bottom: 3px
  .auxiliaries-row
    height: 100px
</style>
