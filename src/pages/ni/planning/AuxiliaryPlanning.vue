<template>
  <q-page class="neutral-background">
    <div class="layout-padding">
      <p class="input-caption">Communauté</p>
      <ni-select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    </div>
    <div style="margin: 2%; background-color: white">
      <ni-chips-autocomplete-auxiliaries-sectors v-model="terms" placeholder="Rechercher un(e) commununauté / auxiliaire"
        @selected="selectedElements" />
    </div>
    <ni-planning-manager @refreshEvents="getEvents" :events="events" :customers="customers" :persons="auxiliaries"
      @updateStartOfWeek="updateStartOfWeek" @createEvent="openCreationModal" @editEvent="openEditionModal" @onDrop="updateEventOnDrop" />

    <!-- Event creation modal -->
    <q-modal v-model="creationModal" content-classes="modal-container-md" @hide="resetCreationForm(false)">
      <div class="modal-padding">
        <div class="row q-mb-lg">
          <div class="col-11 row modal-auxiliay-header">
            <img :src="getAvatar(selectedAuxiliary.picture.link)" class="avatar">
            <q-select filter v-model="newEvent.auxiliary" color="white" inverted-light :options="auxiliariesOptions"
              ref="newEventAuxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
              :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`" />
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="creationModal = false" /></span>
          </div>
        </div>
        <q-btn-toggle no-wrap v-model="newEvent.type" toggle-color="primary" :options="eventTypeOptions" @input="resetCreationForm(true, newEvent.type)" />
        <template v-if="newEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'intervention" v-model="newEvent.dates" requiredField />
        </template>
        <template v-if="newEvent.type === INTERVENTION">
          <ni-modal-select caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions" :error="$v.newEvent.customer.$error"
            icon="face" requiredField />
          <ni-modal-select caption="Service" v-model="newEvent.subscription" :options="customerSubscriptionsOptions(newEvent.customer)"
            :error="$v.newEvent.subscription.$error" requiredField />
          <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency" :options="repetitionOptions"
            requiredField />
        </template>
        <template v-if="newEvent.type === ABSENCE">
          <ni-datetime-picker caption="Date de debut" v-model="newEvent.dates.startDate" type="date" :error="$v.newEvent.dates.startDate.$error"
            inModal requiredField />
          <ni-modal-select caption="Durée" :error="$v.newEvent.startDuration.$error" :options="dateOptions" v-model="newEvent.startDuration"
            separator requiredField />
          <ni-datetime-picker caption="Date de fin" v-model="newEvent.dates.endDate" type="date" :error="$v.newEvent.dates.endDate.$error"
            inModal :min="newEvent.dates.startDate" requiredField />
          <ni-modal-select caption="Durée" :error="$v.newEvent.endDuration.$error" :options="dateOptions" v-model="newEvent.endDuration"
            separator :requiredField="isEndDurationRequired" />
          <ni-modal-select caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions" :error="$v.newEvent.absence.$error"
            requiredField />
          <ni-file-uploader v-if="newEvent.absence && newEvent.absence === ILLNESS" caption="Justificatif d'absence"
            path="attachment" :entity="newEvent" alt="justificatif absence" name="proofOfAbsence" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additionalValue="additionalValue" requiredField :disable="!selectedAuxiliary._id"
            @delete="deleteDocument(newEvent.attachment.driveId)" withBorders />
        </template>
        <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-modal-select caption="Type d'heure interne" v-model="newEvent.internalHour" :options="internalHourOptions"
            requiredField :error="$v.newEvent.internalHour.$error" />
          <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency" :options="repetitionOptions"
            requiredField />
          <ni-search-address v-model="newEvent.location.fullAddress" @selected="selectedAddress" @blur="$v.newEvent.location.fullAddress.$touch"
            :error="$v.newEvent.location.fullAddress.$error" :error-label="addressError" inModal />
        </template>
        <ni-modal-input v-model="newEvent.misc" caption="Notes" />
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary" @click="createEvent"
        :disable="disableCreationButton" icon-right="add" />
    </q-modal>

    <!-- Event edition modal -->
    <q-modal v-if="Object.keys(editedEvent).length !== 0" v-model="editionModal" content-classes="modal-container-md" @hide="resetEditionForm()">
      <div class="modal-padding">
        <div class="row q-mb-lg">
          <div class="col-11 row modal-auxiliay-header">
            <img :src="getAvatar(selectedAuxiliary.picture.link)" class="avatar">
            <q-select filter v-model="editedEvent.auxiliary" color="white" inverted-light :options="auxiliariesOptions"
              ref="editedEventAuxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
              :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`"
              popupCover=false />
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="editionModal = false" />
            </span>
          </div>
        </div>
        <div class="modal-subtitle" style="display: flex">
          <q-btn-toggle no-wrap v-model="editedEvent.type" toggle-color="primary" :options="eventTypeOptions.filter(option => option.value === editedEvent.type)" />
          <q-btn icon="delete" no-caps flat color="grey" @click="deleteEvent" />
        </div>
        <template v-if="editedEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" />
        </template>
        <template v-if="editedEvent.type === INTERVENTION">
          <ni-modal-select caption="Bénéficiaire" v-model="editedEvent.customer._id" :options="customersOptions" :error="$v.editedEvent.customer.$error"
            icon="face" requiredField disable />
          <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
            :error="$v.editedEvent.subscription.$error" />
          <template v-if="editedEvent.repetition && editedEvent.repetition.frequency !== NEVER">
            <div class="row q-mb-lg light-checkbox">
              <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition" @input="toggleRepetition" />
            </div>
          </template>
        </template>
        <template v-if="editedEvent.type === ABSENCE">
          <ni-datetime-picker caption="Date de debut" v-model="editedEvent.dates.startDate" type="date" :error="$v.editedEvent.dates.startDate.$error"
            inModal />
          <ni-modal-select caption="Durée" :error="$v.editedEvent.startDuration.$error" :options="dateOptions" v-model="editedEvent.startDuration"
            separator />
          <ni-datetime-picker caption="Date de fin" v-model="editedEvent.dates.endDate" type="date" :error="$v.editedEvent.dates.endDate.$error"
            inModal />
          <ni-modal-select caption="Durée" :error="$v.editedEvent.endDuration.$error" :options="dateOptions" v-model="editedEvent.endDuration"
            separator />
          <ni-modal-select caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions" :error="$v.editedEvent.absence.$error" />
          <ni-file-uploader caption="Justificatif d'absence" path="attachment" :entity="editedEvent" alt="justificatif absence"
            name="proofOfAbsence" :url="docsUploadUrl" @uploaded="documentUploaded" :additionalValue="additionalValue"
            :disable="!selectedAuxiliary._id" @delete="deleteDocument(editedEvent.attachment.driveId)" withBorders />
        </template>
        <template v-if="editedEvent.type === INTERNAL_HOUR">
          <ni-modal-select caption="Type d'heure interne" v-model="editedEvent.internalHour" :options="internalHourOptions"
            :error="$v.editedEvent.internalHour.$error" />
          <ni-search-address v-model="editedEvent.location.fullAddress" @selected="selectedAddress" @blur="$v.editedEvent.location.fullAddress.$touch"
            :error="$v.editedEvent.location.fullAddress.$error" :error-label="addressError" inModal />
        </template>
        <ni-modal-input v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes" />
        <template v-if="editedEvent.type === INTERVENTION && !editedEvent.shouldUpdateRepetition">
          <div class="row q-mb-lg light-checkbox">
            <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
          </div>
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
            :options="cancellationConditions" requiredField />
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif" :options="cancellationReasons"
            requiredField />
        </template>
      </div>
      <div v-if="editedEvent.type === INTERVENTION" class="cutomer-info">
        <p class="input-caption">Infos bénéficiaire</p>
        <div>{{ editedEvent.customer.contact.address.fullAddress }}</div>
      </div>
      <q-btn class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement" @click="updateEvent"
        icon-right="check" :disable="disableEditionButton" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js'
import Planning from '../../../components/Planning.vue';
import SelectSector from '../../../components/form/SelectSector';
import DatetimePicker from '../../../components/form/DatetimePicker.vue';
import DatetimeRange from '../../../components/form/DatetimeRange.vue';
import ModalSelect from '../../../components/form/ModalSelect';
import ModalInput from '../../../components/form/ModalInput';
import SearchAddress from '../../../components/form/SearchAddress';
import FileUploader from '../../../components/form/FileUploader';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  ABSENCE_TYPE,
  DATE_OPTIONS,
  MORNING,
  AFTERNOON,
  ALL_DAY,
  DEFAULT_AVATAR,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  ILLNESS,
  INVOICED_AND_PAYED,
  INVOICED_AND_NOT_PAYED,
  NOT_INVOICED_AND_NOT_PAYED,
  CUSTOMER_INITIATIVE,
  AUXILIARY_INITIATIVE,
} from '../../../data/constants';
import ChipsAutocompleteAuxiliariesSectors from '../../../components/ChipsAutocompleteAuxiliariesSectors';

export default {
  name: 'AuxiliaryPlanning',
  components: {
    'ni-planning-manager': Planning,
    'ni-select-sector': SelectSector,
    'ni-datetime-picker': DatetimePicker,
    'ni-search-address': SearchAddress,
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-file-uploader': FileUploader,
    'ni-datetime-range': DatetimeRange,
    'ni-chips-autocomplete-auxiliaries-sectors': ChipsAutocompleteAuxiliariesSectors
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
      // Event options
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      ILLNESS,
      absenceOptions: ABSENCE_TYPE,
      dateOptions: DATE_OPTIONS,
      internalHours: [],
      eventTypeOptions: [
        {label: 'Intervention', value: INTERVENTION},
        {label: 'Interne', value: INTERNAL_HOUR},
        {label: 'Absence', value: ABSENCE},
        {label: 'Indispo', value: UNAVAILABILITY}
      ],
      cancellationConditions: [
        { label: 'Facturée & payée', value: INVOICED_AND_PAYED },
        { label: 'Facturée & non payée', value: INVOICED_AND_NOT_PAYED },
        { label: 'Non facturée & non payée', value: NOT_INVOICED_AND_NOT_PAYED },
      ],
      cancellationReasons: [
        { label: 'Initiative du client', value: CUSTOMER_INITIATIVE },
        { label: 'Initiative du de l\'intervenant', value: AUXILIARY_INITIATIVE },
      ],
      NEVER,
      // Event Creation
      creationModal: false,
      newEvent: {
        type: INTERVENTION,
        dates: {
          startDate: '',
          startHour: '',
          endDate: '',
          endHour: '',
        },
        repetition: { frequency: NEVER },
        startDuration: '',
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
      // Event edition
      editionModal: false,
      editedEvent: {},
      terms: []
    };
  },
  validations: {
    newEvent: {
      type: { required },
      dates: {
        startDate: { required },
        endDate: { required },
      },
      startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
      endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
      auxiliary: { required },
      sector: { required },
      customer: { required: requiredIf((item) => item.type === INTERVENTION) },
      subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
      internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
      absence: { required: requiredIf((item) => item.type === ABSENCE) },
      location: { fullAddress: { frAddress } },
      attachment: {
        driveId: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
        link: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
      },
    },
    editedEvent: {
      dates: {
        startDate: { required },
        endDate: { required },
      },
      startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
      endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
      auxiliary: { required },
      sector: { required },
      customer: { required: requiredIf((item) => item.type === INTERVENTION) },
      subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
      internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
      absence: { required: requiredIf((item) => item.type === ABSENCE) },
      location: { fullAddress: { frAddress } },
      cancel: {
        condition: { required: requiredIf((item) => item.isCancelled) },
        reason: { required: requiredIf((item) => item.isCancelled) },
      },
    },
  },
  async mounted () {
    await this.getCustomers();
    this.setInternalHours();
  },
  computed: {
    minEndDate () {
      return this.$moment(this.newEvent.startDate).toISOString()
    },
    maxEndDate () {
      return this.$moment(this.newEvent.startDate).hours(23).minutes(59).toISOString();
    },
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      return { picture: {}, identity: {} };
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
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
          return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
            !this.newEvent.dates.endDate || !this.newEvent.startDuration;
        case INTERVENTION:
          return !this.newEvent.auxiliary || !this.newEvent.customer || !this.newEvent.subscription || !this.newEvent.dates.startDate ||
            !this.newEvent.dates.endDate || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case INTERNAL_HOUR:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.internalHour || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
      }
    },
    disableEditionButton () {
      switch (this.editedEvent.type) {
        case ABSENCE:
          return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate || !this.editedEvent.startDuration;
        case INTERVENTION:
          const shouldDisableButton = !this.editedEvent.auxiliary || !this.editedEvent.subscription || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
          if (this.editedEvent.isCancelled) return shouldDisableButton || !this.editedEvent.cancel.condition || !this.editedEvent.cancel.reason;
          else return shouldDisableButton;
        case INTERNAL_HOUR:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.internalHour || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
      }
    },
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
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
    oneDayRepetitionLabel () {
      if (this.creationModal) return `Tous les ${this.$moment(this.newEvent.dates.startDate).day()}`;
      if (this.editionModal) return `Tous les ${this.$moment(this.editedEvent.dates.startDate).day()}`;
      return 'Tous les lundis';
    },
    repetitionOptions () {
      const oneDayRepetitionLabel = this.creationModal
        ? `Tous les ${this.$moment(this.newEvent.dates.startDate).format('dddd')}s`
        : 'Tous les lundis';

      return [
        { label: 'Jamais', value: NEVER },
        { label: 'Tous les jours', value: EVERY_DAY },
        { label: 'Tous les jours de la semaine (lundi au vendredi)', value: EVERY_WEEK_DAY },
        { label: oneDayRepetitionLabel, value: EVERY_WEEK },
      ];
    },
    isEndDurationRequired () {
      if (this.newEvent.type !== ABSENCE) return false;

      return this.$moment(this.newEvent.dates.endDate).isAfter(this.$moment(this.newEvent.dates.startDate));
    },
  },
  methods: {
    // Dates
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeek = startOfWeek;

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (this.selectedSector !== '') await this.getEvents();
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
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
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
    toggleAuxiliarySelect () {
      if (this.creationModal) return this.$refs['newEventAuxiliarySelect'].show();
      if (this.editionModal) return this.$refs['editedEventAuxiliarySelect'].show();
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
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
      if (this.editionModal) this.editedEvent.location = Object.assign({}, this.editedEvent.location, item);
    },
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];
      this.newEvent = {
        ...this.newEvent,
        auxiliary: person._id,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
    },
    resetCreationForm (partialReset, type = INTERVENTION) {
      this.$v.newEvent.$reset();
      this.newEvent = {
        type,
        dates: {
          startDate: partialReset ? this.newEvent.dates.startDate : '',
          startHour: partialReset ? this.newEvent.dates.startHour : '',
          endDate: partialReset ? this.newEvent.dates.endDate : '',
          endHour: partialReset ? this.newEvent.dates.endHour : '',
        },
        repetition: { frequency: NEVER },
        startDuration: '',
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
    hasConflicts (scheduledEvent) {
      const auxiliaryEvents = this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate);
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
        });
    },
    getPayload (event) {
      let payload = { ...this.$_.omit(event, ['dates', '__v']) }
      payload = this.$_.pickBy(payload);

      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }
      if (event.type === ABSENCE) {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.startDuration[0].startHour).toISOString();
        if (event.endDuration !== '') {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.endDuration[0].endHour).toISOString();
        } else {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.startDuration[0].endHour).toISOString();
        }

        this.$_.unset(payload, 'startDuration');
        this.$_.unset(payload, 'endDuration');
      } else {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.dates.startHour.split(':')[0])
          .minutes(event.dates.startHour.split(':')[1]).toISOString();
        payload.endDate = this.$moment(event.dates.endDate).hours(event.dates.endHour.split(':')[0])
          .minutes(event.dates.endHour.split(':')[1]).toISOString();
      }

      if (event.location && event.location.fullAddress) delete payload.location.location;
      if (event.location && Object.keys(event.location).length === 0) delete payload.location;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;

      return payload;
    },
    async createEvent () {
      try {
        this.newEvent.sector = this.selectedSector;
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);

        if (this.hasConflicts(payload)) {
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
    // Event edition
    openEditionModal (eventId) {
      const editedEvent = this.events.find(ev => ev._id === eventId);
      const { createdAt, updatedAt, startDate, endDate, ...eventData } = editedEvent;
      const auxiliary = editedEvent.auxiliary._id;
      const dates = {
        startDate,
        endDate,
        startHour: `${this.$moment(startDate).hours() < 10
          ? `0${this.$moment(startDate).hours()}`
          : this.$moment(startDate).hours()}:${this.$moment(startDate).minutes() || '00'}`,
        endHour: `${this.$moment(endDate).hours() < 10
          ? `0${this.$moment(endDate).hours()}`
          : this.$moment(endDate).hours()}:${this.$moment(endDate).minutes() || '00'}`,
      };
      switch (editedEvent.type) {
        case INTERVENTION:
          const subscription = editedEvent.subscription._id;
          this.editedEvent = { isCancelled: false, cancel: {}, shouldUpdateRepetition: false, ...eventData, dates, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = editedEvent.internalHour._id;
          this.editedEvent = { location: {}, ...eventData, auxiliary, internalHour, dates };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(editedEvent);
          this.editedEvent = {
            location: {},
            ...eventData,
            auxiliary,
            startDuration,
            endDuration,
            dates: { startDate, endDate },
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { ...eventData, auxiliary, dates };
          break;
      }

      this.editionModal = true
    },
    toggleCancellationForm (value) {
      if (!value) this.editedEvent.cancel = {};
    },
    toggleRepetition () {
      this.editedEvent.cancel = {};
      this.editedEvent.isCancelled = false;
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {
        subscription: {},
        location: {},
        dates: {},
        repetition: {},
        cancel: {},
        shouldUpdateRepetition: false,
      };
    },
    async updateEvent () {
      try {
        this.editedEvent.sector = this.selectedSector;
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        delete payload.customer;
        delete payload.type;
        delete payload._id
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        this.getEvents();
        this.editionModal = false;
        this.resetEditionForm();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    async updateEventOnDrop (vEvent) {
      const { toDay, toPerson, draggedObject } = vEvent;
      const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');

      const payload = {
        startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
          .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
          .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
        auxiliary: toPerson._id
      };

      if (this.hasConflicts(payload)) {
        return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
      }

      const updatedEvent = await this.$events.updateById(draggedObject._id, payload);
      this.events = this.events.map(event => (event._id === updatedEvent._id) ? updatedEvent : event);

      NotifyPositive('Évènement modifié');
    },
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
        this.getEvents();
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
    selectedElements (el) {
      // Add elements filtered to planning renderer
    }
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .q-btn-group
    border: none;
    box-shadow: none;

    & .q-btn-item
      border-radius: 20px;
      margin: 5px;
      background-color: $light-grey;

  /deep/ .modal-auxiliay-header
    align-items: center
    .q-if-inverted
      border: none;
      font-size: 24px;
      margin-left: 3px;
      &.q-if-focused
        box-shadow: none;
      @media screen and (max-width: 677px)
        font-size: 20px;
        padding: 7px;
    .q-input-target
      line-height: normal
    .q-icon
      display: none;
    .avatar
      @media screen and (max-width: 677px)
        height: 30px
        width: 30px

  /deep/ .select-icon
    display: flex !important;
    margin: 0 0 0 10px;

  /deep/ .pink-icon
    color: $primary !important;
    font-size: 22px;

  /deep/ .q-btn-toggle
    @media screen and (max-width: 677px)
      display: inline-flex;
      flex-wrap: wrap;
      & .q-btn
        width: 45%

  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    .q-btn-group
      width: 30%;
      margin-bottom: 0;
      cursor: default;
    .delete-action
      display: flex;
      flex-direction: row;
      align-items: center;

  .cutomer-info
    background: $light-grey;
    padding: 10px 25px 20px;
    /deep/ .q-if-inverted
      background: $light-grey !important;
      border: none;

  .light-checkbox
    color: $grey

</style>
