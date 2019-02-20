<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="auxiliaries" @updateStartOfWeek="updateStartOfWeek" @createEvent="openCreationModal"
      :filters="filters" @editEvent="openEditionModal" @onDrop="updateEventOnDrop" :selectedFilter="selectedFilter"
      :removedFilter="removedFilter" />

    <!-- Event creation modal -->
    <ni-auxiliary-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent="newEvent"
      :creationModal="creationModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary" :auxiliaries="auxiliaries"
      :customers="customers" @resetForm="resetCreationForm" @deleteDocument="deleteDocument" @documentUploaded="documentUploaded"
      @createEvent="createEvent" @close="closeCreationModal" @selectedAddress="selectedAddress" />

    <!-- Event edition modal -->
    <ni-auxiliary-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary" :auxiliaries="auxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="deleteDocument" @documentUploaded="documentUploaded"
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="deleteEvent" @deleteEventRepetition="deleteEventRepetition" @selectedAddress="selectedAddress" />
  </q-page>
</template>

<script>
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  MORNING,
  AFTERNOON,
  ALL_DAY,
  NEVER,
  ILLNESS,
} from '../../../data/constants';
import ChipsAutocompleteAuxiliariesSectors from '../../../components/ChipsAutocompleteAuxiliariesSectors';
import AuxiliaryEventCreationModal from '../../../components/Planning/AuxiliaryEventCreationModal';
import AuxiliaryEventEditionModal from '../../../components/Planning/AuxiliaryEventEditionModal';
import Planning from '../../../components/Planning.vue';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';

export default {
  name: 'AuxiliaryPlanning',
  components: {
    'ni-planning-manager': Planning,
    'ni-chips-autocomplete-auxiliaries-sectors': ChipsAutocompleteAuxiliariesSectors,
    'ni-auxiliary-event-creation-modal': AuxiliaryEventCreationModal,
    'ni-auxiliary-event-edition-modal': AuxiliaryEventEditionModal,
  },
  data () {
    return {
      loading: false,
      selectedSectors: [],
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startDate: '',
      internalHours: [],
      // Filters
      filters: [],
      filteredSectors: [],
      filteredAuxiliaries: [],
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
    };
  },
  async mounted () {
    await this.getCustomers();
    await this.initFilters();
    this.setInternalHours();
  },
  validations () {
    return {
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
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) }
        },
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
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) },
        },
        cancel: {
          condition: { required: requiredIf((item, parent) => parent.isCancelled) },
          reason: { required: requiredIf((item, parent) => parent.isCancelled) },
        },
      },
    };
  },
  computed: {
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      return { picture: {}, identity: {} };
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
      if (this.auxiliaries && this.auxiliaries.length) await this.getEvents();
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          auxiliary: JSON.stringify(this.auxiliaries.map(aux => aux._id))
        });
      } catch (e) {
        this.events = [];
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.showAll({ subscriptions: true });
      } catch (e) {
        this.customers = [];
      }
    },
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    // Event creation
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
      if (this.editionModal) this.editedEvent.location = Object.assign({}, this.editedEvent.location, item);
    },
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];
      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        startDuration: '',
        endDuration: '',
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        location: {},
        attachment: {},
        auxiliary: person._id,
        sector: person.sector,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
      this.$v.newEvent.$reset();
      if (!partialReset) this.newEvent = {};
      else {
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
          sector: partialReset ? this.newEvent.sector : '',
          internalHour: '',
          absence: '',
          location: {},
          attachment: {},
        };
      }
    },
    closeCreationModal () {
      this.creationModal = false;
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
          return this.$moment(event.startDate).isBetween(startDate, endDate, 'minutes', '[)') ||
            this.$moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '[)')
        });
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
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);

        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        await this.$events.create(payload);

        this.getEvents();
        this.creationModal = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        NotifyNegative('Erreur lors de la création de l\'évènement');
      } finally {
        this.loading = false
      }
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
          this.editedEvent = { location: {}, shouldUpdateRepetition: false, ...eventData, auxiliary, internalHour, dates };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(editedEvent);
          this.editedEvent = {
            location: {},
            attachment: {},
            ...eventData,
            auxiliary,
            startDuration,
            endDuration,
            dates: { startDate, endDate },
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary, dates };
          break;
      }

      this.editionModal = true
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
    closeEditionModal () {
      this.editionModal = false;
    },
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        if (this.hasConflicts(payload)) {
          this.$v.editedEvent.$reset();
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
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    // Event deletion
    async deleteEvent () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
          ok: 'OK',
          cancel: 'Annuler',
        });

        this.loading = true
        await this.$events.deleteById(this.editedEvent._id);
        this.events = this.events.filter(event => event._id !== this.editedEvent._id);
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
    async deleteEventRepetition () {
      try {
        const shouldDeleteRepetition = await this.$q.dialog({
          title: 'Confirmation',
          message: 'Supprimer l\'événement périodique',
          ok: 'OK',
          cancel: 'Annuler',
          options: {
            type: 'radio',
            model: false,
            items: [
              { label: 'Supprimer uniquement cet évenement', value: false },
              { label: 'Supprimer cet évenement et tous les suivants', value: true },
            ],
          },
        });

        this.loading = true
        if (shouldDeleteRepetition) {
          await this.$events.deleteRepetition(this.editedEvent._id);
          this.getEvents();
        } else {
          await this.$events.deleteById(this.editedEvent._id);
          this.events = this.events.filter(event => event._id !== this.editedEvent._id);
        }

        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
    // Filters
    async initFilters () {
      try {
        await this.addAuxiliariesToFilter();
        await this.addSectorsToFilter();
      } catch (e) {
        console.error(e);
      }
    },
    async addAuxiliariesToFilter () {
      this.filters = await this.$users.showAllActive({ 'role': 'Auxiliaire' });
      for (let i = 0, l = this.filters.length; i < l; i++) {
        this.filters[i].value = `${this.filters[i].identity.firstname} ${this.filters[i].identity.lastname}`;
        this.filters[i].label = `${this.filters[i].identity.firstname} ${this.filters[i].identity.lastname}`;
      }
    },
    async addSectorsToFilter () {
      const allSectorsRaw = await this.$ogust.getList('employee.sector');
      for (const k in allSectorsRaw) {
        if (k === '*') continue;

        this.filters.push({
          label: allSectorsRaw[k],
          value: allSectorsRaw[k],
          ogustSector: k,
        });
      }
    },
    selectedFilter (el) {
      if (el.ogustSector) {
        this.filteredSectors.push(el.ogustSector);
        const auxBySector = this.filters.filter(aux => aux.sector === el.ogustSector);
        for (let i = 0, l = auxBySector.length; i < l; i++) {
          if (!this.auxiliaries.some(aux => auxBySector[i]._id === aux._id)) {
            this.auxiliaries.push(auxBySector[i]);
          }
        }
        this.getEvents();
      } else {
        if (!this.filteredAuxiliaries.some(aux => aux._id === el._id)) this.filteredAuxiliaries.push(el);
        if (!this.auxiliaries.some(aux => aux._id === el._id)) {
          this.auxiliaries.push(el);
          this.getEvents();
        }
      }
    },
    removedFilter (el) {
      if (el.ogustSector) {
        this.filteredSectors.filter(sec => sec !== el.ogustSector);
        this.auxiliaries = this.auxiliaries.filter(auxiliary =>
          auxiliary.sector !== el.ogustSector || this.filteredAuxiliaries.some(filteredAux => filteredAux._id === auxiliary._id)
        );
      } else {
        this.filteredAuxiliaries = this.filteredAuxiliaries.filter(auxiliary => auxiliary._id !== el._id);
        if (this.filteredSectors.includes(el.sector)) return;
        this.auxiliaries = this.auxiliaries.filter(auxiliary => auxiliary._id !== el._id);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

</style>
