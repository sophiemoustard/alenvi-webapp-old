<template>
  <q-page padding class="neutral-background">
    <p class="input-caption">Communauté</p>
    <ni-select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    <div class="planning-container full-width q-pa-md">
      <div class="row justify-between items-center q-mb-md">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek"></q-btn>
        <span>{{ timelineTitle() }}</span>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek"></q-btn>
      </div>
      <table style="width: 100%">
        <tbody>
          <tr>
            <td></td>
            <td class="capitalize" v-for="(day, index) in daysHeader" :key="index">
              {{day}}
            </td>
          </tr>
          <tr class="auxiliaries-row" v-for="(auxiliary, index) in auxiliaries" :key="index">
            <td>
              {{auxiliary.firstname}} {{auxiliary.lastname}}
            </td>
            <td @drop="drop" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top" class="event-cell">
              <div :id="Math.random().toString(36).substr(2, 5)" draggable @dragstart="drag" class="row cursor-pointer" v-for="(event, eventIndex) in getAuxiliaryEvents(auxiliary, dayIndex)" :key="eventIndex" @click="openEditionModal(event)">
                <div class="col-12 event">
                  <p class="no-margin">{{ getEventHours(event) }}</p>
                  <p v-if="event.type === INTERVENTION" class="no-margin">{{ event.customer.identity.title }} {{ event.customer.identity.lastname }}</p>
                  <p v-if="event.type === ABSENCE">{{ displayAbsenceType(event.absence) }}</p>
                  <p v-if="event.type === UNAVAILABILITY">Indisponibilité</p>
                  <p v-if="event.type === INTERNAL_HOUR">{{ event.internalHour.name }}</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="ion-document" label="Ajouter un évènement"
      @click="creationModal = true" :disable="auxiliaries.length === 0" />

    <q-modal v-model="creationModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Création d'un <span class="text-weight-bold">évènement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="creationModal = false" /></span>
          </div>
        </div>
        <div class="row" style="margin-bottom: 20px">
          <q-btn-toggle v-model="newEvent.type" toggle-color="primary" :options="eventTypeOptions" @input="resetCreationForm(newEvent.type)"/>
        </div>
        <ni-modal-select caption="Auxiliaire" v-model="newEvent.auxiliary" :options="auxiliariesOptions" :error="$v.newEvent.auxiliary.$error" />
        <template v-if="newEvent.type !== ABSENCE">
          <ni-modal-datetime-picker caption="Date de debut" v-model="newEvent.startDate" type="datetime" :error="$v.newEvent.startDate.$error" />
          <ni-modal-datetime-picker caption="Date de fin" v-model="newEvent.endDate" type="datetime" :error="$v.newEvent.endDate.$error"
            :min="minEndDate" :max="maxEndDate" />
        </template>
        <template v-if="newEvent.type === INTERVENTION">
          <ni-modal-select caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions" :error="$v.newEvent.customer.$error" />
          <ni-modal-select caption="Service" v-model="newEvent.subscription" :options="customerSubscriptionsOptions(newEvent.customer)"
            :error="$v.newEvent.subscription.$error" />
        </template>
        <template v-if="newEvent.type === ABSENCE">
          <ni-modal-datetime-picker caption="Date de debut" v-model="newEvent.startDate" type="date" :error="$v.newEvent.startDate.$error" />
          <ni-modal-select caption="Durée" :error="$v.newEvent.startDuration.$error" :options="dateOptions" v-model="newEvent.startDuration"
            separator />
          <ni-modal-datetime-picker caption="Date de fin" v-model="newEvent.endDate" type="date" :error="$v.newEvent.endDate.$error" />
          <ni-modal-select caption="Durée" :error="$v.newEvent.endDuration.$error" :options="dateOptions" v-model="newEvent.endDuration"
            separator />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions" :error="$v.newEvent.absence.$error" />
          <ni-file-uploader caption="Justificatif d'absence" path="attachment" :entity="newEvent" alt="justificatif absence" name="proofOfAbsence"
            :url="docsUploadUrl" @uploaded="documentUploaded" :additionalValue="additionalValue" :key="uploaderKey" :disable="!selectedAuxiliary._id"
            @delete="deleteDocument(newEvent.attachment.driveId)" withBorders />
        </template>
        <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-modal-select caption="Type d'heure interne" v-model="newEvent.internalHour" :options="internalHourOptions" :error="$v.newEvent.internalHour.$error" />
        </template>
        <ni-search-address v-model="newEvent.location.fullAddress" @selected="selectedAddress" @blur="$v.newEvent.location.fullAddress.$touch"
          :error="$v.newEvent.location.fullAddress.$error" :error-label="addressError" inModal/>
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary" @click="createEvent"
        :disable="disableCreationButton"/>
    </q-modal>

     <q-modal v-model="editionModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Edition d'un <span class="text-weight-bold">evenement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="editionModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Auxiliaire" v-model="editedEvent.auxiliary" :options="auxiliariesOptions" :error="$v.editedEvent.auxiliary.$error" />
        <template v-if="editedEvent.type !== ABSENCE">
          <ni-modal-datetime-picker caption="Date de début" v-model="editedEvent.startDate" type="datetime"/>
          <ni-modal-datetime-picker caption="Date de fin" v-model="editedEvent.endDate" type="datetime" />
        </template>
        <template v-if="editedEvent.type === INTERVENTION">
          <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer)"
            :error="$v.editedEvent.subscription.$error" />
        </template>
        <template v-if="editedEvent.type === ABSENCE">
          <ni-modal-datetime-picker caption="Date de debut" v-model="editedEvent.startDate" type="date" :error="$v.editedEvent.startDate.$error" />
          <ni-modal-select caption="Durée" :error="$v.editedEvent.startDuration.$error" :options="dateOptions" v-model="editedEvent.startDuration"
            separator />
          <ni-modal-datetime-picker caption="Date de fin" v-model="editedEvent.endDate" type="date" :error="$v.editedEvent.endDate.$error" />
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
      </div>
      <q-btn class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement" @click="updateEvent" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../helpers/vuelidateCustomVal.js'
import ModalDatetimePicker from '../../components/form/ModalDatetimePicker.vue';
import ModalSelect from '../../components/form/ModalSelect';
import SelectSector from '../../components/form/SelectSector';
import ModalInput from '../../components/form/ModalInput.vue';
import FileUploader from '../../components/form/FileUploader';
import SearchAddress from '../../components/form/SearchAddress';
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, ABSENCE_TYPE, DATE_OPTIONS, MORNING, AFTERNOON, ALL_DAY } from '../../data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../../components/popup/notify';

export default {
  name: 'PlanningManager',
  components: {
    'ni-modal-datetime-picker': ModalDatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-select-sector': SelectSector,
    'ni-modal-select': ModalSelect,
    'ni-file-uploader': FileUploader,
    'ni-search-address': SearchAddress,
  },
  data () {
    return {
      loading: false,
      selectedSector: '',
      startOfWeek: '',
      days: [],
      auxiliaries: [],
      customers: [],
      events: [],
      maxDays: 7,
      editedEvent: {
        subscription: {},
        location: {},
        customer: '',
      },
      editionModal: false,
      creationModal: false,
      newEvent: {
        type: INTERVENTION,
        startDate: '',
        startDuration: '',
        endDate: '',
        endDuration: '',
        auxiliary: '',
        customer: '',
        subscription: '',
        sector: '',
        internalHour: '',
        absence: '',
        location: {},
      },
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      eventTypeOptions: [
        {label: 'Intervention', value: INTERVENTION},
        {label: 'Absence', value: ABSENCE},
        {label: 'Heure interne', value: INTERNAL_HOUR},
        {label: 'Indisponibilité', value: UNAVAILABILITY}
      ],
      internalHours: [],
      absenceOptions: ABSENCE_TYPE,
      dateOptions: DATE_OPTIONS,
      uploaderKey: 0,
    }
  },
  validations: {
    newEvent: {
      type: { required },
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
      customer: { required: requiredIf((item) => {
        return item.type === INTERVENTION;
      }) },
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
      return this.days.map(day => this.$moment(day).format('dddd DD/MM'));
    },
    minEndDate () {
      return this.$moment(this.newEvent.startDate).toISOString()
    },
    maxEndDate () {
      return this.$moment(this.newEvent.startDate).hours(23).minutes(59).toISOString();
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
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
    disableCreationButton () {
      if (!this.newEvent.type) return true;
      switch (this.newEvent.type) {
        case ABSENCE:
          return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.startDate || !this.newEvent.endDate;
        case INTERVENTION:
          return !this.newEvent.auxiliary || !this.newEvent.customer || !this.newEvent.subscription || !this.newEvent.startDate || !this.newEvent.endDate;
        case INTERNAL_HOUR:
          return !this.newEvent.auxiliary || !this.newEvent.startDate || !this.newEvent.endDate || !this.newEvent.internalHour;
        case UNAVAILABILITY:
        default:
          return !this.newEvent.auxiliary || !this.newEvent.startDate || !this.newEvent.endDate;
      }
    },
    docsUploadUrl () {
      return !this.selectedAuxiliary._id
        ? ''
        : `${process.env.API_HOSTNAME}/events/${this.selectedAuxiliary._id}/gdrive/${this.selectedAuxiliary.administrative.driveFolder.id}/upload`;
    },
    selectedAuxiliary () {
      return this.newEvent.auxiliary === '' ? {} : this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
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
      if (!this.$v.newEvent.location.fullAddress.required) return 'Champ requis';

      return 'Adresse non valide';
    }
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    await this.getCustomers();
    this.setInternalHours();
  },
  methods: {
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
      this.getEvents();
    },
    goToNextWeek () {
      this.startOfWeek.add(7, 'd');
      this.getTimelineDays();
      this.getEvents();
    },
    getTimelineDays () {
      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
    },
    // Event display
    getAuxiliaryEvents (auxiliary, dayIndex) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliary._id)
        .filter(event => this.$moment(event.startDate).isSame(this.days[dayIndex], 'day'))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPE.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().format('YYYYMMDD'),
          sector: this.selectedSector,
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.showAll();
      } catch (e) {
        console.error(e);
      }
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive({ sector: this.selectedSector });
      await this.getEvents();
    },
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    // Event creation
    selectedAddress (item) {
      this.newEvent.location = Object.assign({}, this.newEvent.location, item);
    },
    customerSubscriptionsOptions (customerId) {
      if (!customerId) return [];
      const selectedCustomer = this.customers.find(customer => customer._id === customerId);

      return !selectedCustomer || !selectedCustomer.subscriptions || selectedCustomer.subscriptions.length === 0
        ? []
        : selectedCustomer.subscriptions.map(sub => ({
          label: sub.service.name,
          value: sub._id,
        }));
    },
    resetCreationForm (type = INTERVENTION) {
      this.$v.newEvent.$reset();
      this.newEvent = {
        type,
        startDate: '',
        startDuration: '',
        endDate: '',
        endDuration: '',
        auxiliary: '',
        customer: '',
        subscription: '',
        sector: '',
        internalHour: '',
        absence: '',
        location: {},
      };
    },
    getPayload (event) {
      const { _id, ...eventData } = event;
      let payload = { ...eventData }
      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }
      if (event.type === ABSENCE) {
        payload.startDate = this.$moment(event.startDate).hours(event.startDuration[0].startHour).toISOString();
        if (event.endDuration !== '') {
          payload.endDate = this.$moment(event.endDate).hours(event.endDuration[0].endHour).toISOString();
        } else {
          payload.endDate = this.$moment(event.endDate).hours(event.startDuration[0].endHour).toISOString();
        }

        this.$_.unset(payload, 'startDuration');
        this.$_.unset(payload, 'endDuration');
      }

      if (event.location && event.location.fullAddress) delete payload.location.location;

      return this.$_.pickBy(payload)
    },
    async createEvent () {
      try {
        this.newEvent.sector = this.selectedSector;
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);
        await this.$events.create(payload);

        await this.getEvents();
        this.creationModal = false;
        this.loading = false;
        this.resetCreationForm();
        NotifyPositive('Évènement créé');
      } catch (e) {
        NotifyNegative('Erreur lors de la création de l\'évènement');
        this.loading = false;
      }
    },
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
    openEditionModal (event) {
      const { createdAt, updatedAt, ...eventData } = event;
      const auxiliary = event.auxiliary._id;
      switch (event.type) {
        case INTERVENTION:
          const subscription = event.subscription._id;
          this.editedEvent = { location: {}, ...eventData, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = event.internalHour._id;
          this.editedEvent = { location: {}, ...eventData, auxiliary, internalHour };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(event);
          this.editedEvent = { location: {}, ...eventData, auxiliary, startDuration, endDuration };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { location: {}, ...eventData, auxiliary };
          break;
      }

      this.editionModal = true
    },
    resetEditionForm () {
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
        delete payload.customer;
        delete payload.type;
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        await this.getEvents();
        this.editionModal = false;
        this.resetEditionForm();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    // Event files
    documentUploaded (uploadedInfo) {
      if (!uploadedInfo.xhr || !uploadedInfo.xhr.response) return;

      const json = JSON.parse(uploadedInfo.xhr.response);
      if (!json || !json.data || !json.data.payload) return;

      this.newEvent.attachment = { ...json.data.payload.attachment }
      this.rerenderUploader();
    },
    rerenderUploader () {
      this.uploaderKey += 1;
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
        NotifyPositive('Document supprimé');
        this.$_.unset(this.newEvent, 'attachment');
        this.rerenderUploader();
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    // Drag & drop
    drag (event) {
      event.dataTransfer.setData('text', event.target.id);
    },
    drop (event) {
      event.preventDefault();
      const data = event.dataTransfer.getData('text');
      if (event.target.nodeName === 'TD') {
        event.target.appendChild(document.getElementById(data));
      }
      if (event.target.nodeName === 'P') {
        event.target.parentNode.parentNode.parentNode.appendChild(document.getElementById(data));
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  table
    border-collapse: collapse
    table-layout: fixed
  td
    border: 1px solid black
    padding: 5px
  .planning-container
    background: white
  .event
    border: 1px solid black
    padding: 2px
    margin-bottom: 3px
  .auxiliaries-row
    height: 100px
  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2
  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px
</style>
