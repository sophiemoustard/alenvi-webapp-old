<template>
  <q-page padding class="neutral-background">
    <p class="input-caption">Communauté</p>
    <ni-select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    <ni-planning-manager @refreshEvents="getEvents" :events="events" :customers="customers" :persons="auxiliaries" @updateStartOfWeek="updateStartOfWeek"
      @createEvent="openCreationModal" />

     <!-- Event creation modal -->
    <q-modal v-model="creationModal" content-classes="modal-container-md" @hide="resetCreationForm(false)">
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
        <q-btn-toggle no-wrap v-model="newEvent.type" toggle-color="primary" :options="eventTypeOptions" @input="resetCreationForm(true, newEvent.type)" />
        <ni-modal-select caption="Auxiliaire" v-model="newEvent.auxiliary" :options="auxiliariesOptions" :error="$v.newEvent.auxiliary.$error" />
        <template v-if="newEvent.type !== ABSENCE">
          <ni-datetime-picker caption="Date de debut" v-model="newEvent.startDate" type="datetime" :error="$v.newEvent.startDate.$error" inModal />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.endDate" type="datetime" :error="$v.newEvent.endDate.$error" inModal
            :min="minEndDate" :max="maxEndDate" />
        </template>
        <template v-if="newEvent.type === INTERVENTION">
          <ni-modal-select caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions" :error="$v.newEvent.customer.$error" />
          <ni-modal-select caption="Service" v-model="newEvent.subscription" :options="customerSubscriptionsOptions(newEvent.customer)"
            :error="$v.newEvent.subscription.$error" />
        </template>
        <template v-if="newEvent.type === ABSENCE">
          <ni-datetime-picker caption="Date de debut" v-model="newEvent.startDate" type="date" :error="$v.newEvent.startDate.$error" inModal />
          <ni-modal-select caption="Durée" :error="$v.newEvent.startDuration.$error" :options="dateOptions" v-model="newEvent.startDuration"
            separator />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.endDate" type="date" :error="$v.newEvent.endDate.$error" inModal />
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
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js'
import Planning from '../../proto/planning.vue';
import SelectSector from '../../../components/form/SelectSector';
import DatetimePicker from '../../../components/form/DatetimePicker.vue';
import ModalSelect from '../../../components/form/ModalSelect';
import SearchAddress from '../../../components/form/SearchAddress';
import FileUploader from '../../../components/form/FileUploader';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, ABSENCE_TYPE, DATE_OPTIONS } from '../../../data/constants';

export default {
  name: 'AuxiliaryPlanning',
  components: {
    'ni-planning-manager': Planning,
    'ni-select-sector': SelectSector,
    'ni-datetime-picker': DatetimePicker,
    'ni-search-address': SearchAddress,
    'ni-modal-select': ModalSelect,
    'ni-file-uploader': FileUploader,
  },
  data () {
    return {
      loading: false,
      selectedSector: '',
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startDate: '',
      // Event Creation
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
        attachment: {},
      },
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      internalHours: [],
      eventTypeOptions: [
        {label: 'Intervention', value: INTERVENTION},
        {label: 'Absence', value: ABSENCE},
        {label: 'Heure interne', value: INTERNAL_HOUR},
        {label: 'Indisponibilité', value: UNAVAILABILITY}
      ],
      absenceOptions: ABSENCE_TYPE,
      dateOptions: DATE_OPTIONS,
      uploaderKey: 0,
    };
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
  },
  async mounted () {
    await this.getCustomers();
    this.setInternalHours();
  },
  computed: {
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    minEndDate () {
      return this.$moment(this.newEvent.startDate).toISOString()
    },
    maxEndDate () {
      return this.$moment(this.newEvent.startDate).hours(23).minutes(59).toISOString();
    },
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      // if (this.editionModal && this.editedEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      return {};
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
    internalHourOptions () {
      return this.internalHours.map(hour => ({
        label: hour.name,
        value: hour._id,
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
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.lastname}`;
    },
    docsUploadUrl () {
      return !this.selectedAuxiliary._id
        ? ''
        : `${process.env.API_HOSTNAME}/events/${this.selectedAuxiliary._id}/gdrive/${this.selectedAuxiliary.administrative.driveFolder.id}/upload`;
    },
    addressError () {
      if (!this.$v.newEvent.location.fullAddress.required) return 'Champ requis';

      return 'Adresse non valide';
    },
  },
  methods: {
    // Dates
    async updateStartOfWeek (vEvent) {
      this.startOfWeek = vEvent.startOfWeek;

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (this.selectedSector !== '') await this.getEvents();
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek.format('YYYYMMDD'),
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
      this.getEvents({});
    },
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    // Event creation
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
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
    },
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];
      this.newEvent = {
        ...this.newEvent,
        auxiliary: person._id,
        startDate: selectedDay.hours(8).toISOString(),
        endDate: selectedDay.hours(20).toISOString(),
      };
      this.creationModal = true;
    },
    resetCreationForm (partialReset, type = INTERVENTION) {
      this.$v.newEvent.$reset();
      this.newEvent = {
        type,
        startDate: partialReset ? this.newEvent.startDate : '',
        startDuration: '',
        endDate: partialReset ? this.newEvent.endDate : '',
        endDuration: '',
        auxiliary: partialReset ? this.newEvent.auxiliary : '',
        customer: '',
        subscription: '',
        sector: '',
        internalHour: '',
        absence: '',
        location: {},
        attachment: {},
      };
    },
    hasConflicts (scheduledEvent, auxiliaryId) {
      const auxiliaryEvents = this.getAuxiliaryEventsBetweenDates(auxiliaryId, scheduledEvent.startDate, scheduledEvent.endDate);
      return auxiliaryEvents.some(ev => {
        if (scheduledEvent._id && scheduledEvent._id === ev._id) return false;
        return this.$moment(scheduledEvent.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          this.$moment(ev.startDate).isBetween(scheduledEvent.startDate, scheduledEvent.endDate, 'minutes', '[]');
      });
    },
    getAuxiliaryEventsBetweenDates (auxiliaryId, startDate, endDate) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliaryId)
        .filter(event => {
          return this.$moment(event.startDate).isBetween(startDate, endDate, 'minutes', '()') ||
            this.$moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '()')
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getPayload (event) {
      let payload = { ...event }
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

        if (this.hasConflicts(payload, payload.auxiliary, payload.startDate)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        await this.$events.create(payload);

        this.getEvents(this.startDate, this.endDate, this.selectedSector);
        this.creationModal = false;
        this.loading = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        NotifyNegative('Erreur lors de la création de l\'évènement');
        this.loading = false;
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
  },
}
</script>
