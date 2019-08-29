<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="activeAuxiliaries" @updateStartOfWeek="updateStartOfWeek"
      @createEvent="openCreationModal" @editEvent="openEditionModal" @onDrop="updateEventOnDrop"
      :filteredSectors="filteredSectors" :can-edit="canEditEvent" :personKey="personKey"
      @toggleAllSectors="toggleAllSectors" :eventHistories="eventHistories" ref="planningManager"
      :displayAllSectors="displayAllSectors" @toggleHistory="toggleHistory" />

    <!-- Event creation modal -->
    <ni-auxiliary-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent="newEvent"
      :creationModal="creationModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary"
      :activeAuxiliaries="activeAuxiliaries" :customers="customers" @resetForm="resetCreationForm" @deleteDocument="deleteDocument"
      @documentUploaded="documentUploaded" @createEvent="createEvent" @close="closeCreationModal" />

    <!-- Event edition modal -->
    <ni-auxiliary-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="deleteDocument" @documentUploaded="documentUploaded"
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="deleteEvent" @deleteEventRepetition="deleteEventRepetition" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import ChipsAutocomplete from '../../../components/ChipsAutocomplete';
import AuxiliaryEventCreationModal from '../../../components/planning/AuxiliaryEventCreationModal';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import Planning from '../../../components/planning/Planning.vue';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { INTERVENTION, NEVER, PERSON, AUXILIARY, ABSENCE, DAILY, HOURLY, INTERNAL_HOUR, ILLNESS, SECTOR, AUXILIARY_ROLES, OTHER } from '../../../data/constants';
import { mapGetters, mapActions } from 'vuex';
import { NotifyNegative, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'AuxiliaryPlanning',
  mixins: [planningActionMixin],
  metaInfo: { title: 'Plannnig auxiliaires' },
  components: {
    'ni-planning-manager': Planning,
    'ni-chips-autocomplete-auxiliaries-sectors': ChipsAutocomplete,
    'ni-auxiliary-event-creation-modal': AuxiliaryEventCreationModal,
    'ni-auxiliary-event-edition-modal': AuxiliaryEventEditionModal,
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      internalHours: [],
      // Filters
      filteredSectors: [],
      filteredAuxiliaries: [],
      savedSearch: [],
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
      startOfWeekAsString: null,
      personKey: AUXILIARY,
      displayAllSectors: false,
      eventHistories: [],
      displayHistory: false,
    };
  },
  validations () {
    return {
      newEvent: {
        type: { required },
        dates: {
          startDate: { required },
          endDate: { required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === DAILY)) },
          startHour: { required: requiredIf((item, parent) => parent && (parent.type === ABSENCE && parent.absenceNature === HOURLY)) },
          endHour: { required: requiredIf((item, parent) => parent && (parent.type === ABSENCE && parent.absenceNature === HOURLY)) },
        },
        auxiliary: { required: requiredIf((item) => item.type !== INTERVENTION) },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        absenceNature: { required: requiredIf((item) => item.type === ABSENCE) },
        address: {
          zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
          street: { required: requiredIf(item => item && !!item.fullAddress) },
          city: { required: requiredIf(item => item && !!item.fullAddress) },
          fullAddress: { frAddress },
        },
        repetition: {
          frequency: { required: requiredIf((item, parent) => parent && parent.type !== ABSENCE) },
        },
        attachment: {
          driveId: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absence === ILLNESS),
          link: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absence === ILLNESS),
        },
        misc: { required: requiredIf(item => item.type === ABSENCE && item.absence === OTHER) },
      },
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
          startHour: { required: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absenceNature === HOURLY) },
          endHour: { required: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absenceNature === HOURLY) },
        },
        auxiliary: { required: requiredIf((item) => item.type !== INTERVENTION) },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        absenceNature: { required: requiredIf((item) => item.type === ABSENCE) },
        address: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item, parent) => parent && parent.type !== ABSENCE) },
        },
        cancel: {
          condition: { required: requiredIf((item, parent) => parent && parent.type === INTERVENTION && parent.isCancelled) },
          reason: { required: requiredIf((item, parent) => parent && parent.type === INTERVENTION && parent.isCancelled) },
        },
        misc: { required: requiredIf(item => item.type === ABSENCE && item.absence === OTHER) },
      },
    };
  },
  async mounted () {
    try {
      await Promise.all([this.fillFilter(AUXILIARY), this.getCustomers()]);
      this.initFilters();
      this.setInternalHours();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes');
    }
  },
  watch: {
    async elementToAdd (val) {
      await this.addElementToFilter(val);
    },
    elementToRemove (val) {
      this.removeElementFromFilter(val);
    },
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
        const hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(aux, this.newEvent.dates.startDate);
        const hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(aux, this.newEvent.dates.startDate);

        return { ...aux, hasActiveCustomerContractOnEvent, hasActiveCompanyContractOnEvent };
      }
      if (this.editionModal && this.editedEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
        const hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(aux, this.editedEvent.dates.startDate);
        const hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(aux, this.editedEvent.dates.startDate);

        return { ...aux, hasActiveCustomerContractOnEvent, hasActiveCompanyContractOnEvent };
      }
      return { picture: {}, identity: { lastname: '' } };
    },
    activeAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasActiveCustomerContractOnEvent(aux, this.$moment(this.startOfWeekAsString), this.endOfWeek) ||
        this.hasActiveCompanyContractOnEvent(aux, this.$moment(this.startOfWeekAsString), this.endOfWeek));
    },
    endOfWeek () {
      return this.$moment(this.startOfWeekAsString).endOf('w');
    },
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
    // Dates
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeekAsString = startOfWeek.startOf('d').toISOString();

      const range = this.$moment.range(this.startOfWeekAsString, this.$moment(this.startOfWeekAsString).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (this.auxiliaries && this.auxiliaries.length) await this.refresh();
    },
    // Filters
    initFilters () {
      if (!AUXILIARY_ROLES.includes(this.mainUser.role.name)) {
        this.addSavedTerms('Auxiliaries');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.mainUser.sector);
        if (userSector && this.$refs.planningManager) this.$refs.planningManager.restoreFilter([userSector.label]);
      }
    },
    // History
    async toggleHistory (displayHistory) {
      this.displayHistory = displayHistory;
      if (displayHistory) await this.getEventHistories();
      else this.eventHistories = [];
    },
    // Refresh data
    async toggleAllSectors (search) {
      this.displayAllSectors = !this.displayAllSectors;
      if (!this.displayAllSectors) {
        this.auxiliaries = [];
        this.filteredSectors = [];
        this.events = [];
        this.$refs.planningManager.restoreFilter(this.savedSearch);
      } else {
        this.savedSearch = search;
        this.filteredAuxiliaries = [];
        this.auxiliaries = this.filters.filter(fil => fil.type === PERSON);
        this.filteredSectors = this.filters.filter(fil => fil.type === SECTOR);
        await this.refresh();
      }
    },
    async refresh () {
      try {
        let params = {
          startDate: this.$moment(this.startOfWeekAsString).toDate(),
          endDate: this.endOfWeek.toDate(),
          groupBy: AUXILIARY,
        };
        if (!this.displayAllSectors) {
          params.auxiliary = this.auxiliaries.map(aux => aux._id);
          params.sector = this.filteredSectors.map(sector => sector._id);
        }

        this.events = await this.$events.list(params);
        if (this.displayHistory) await this.getEventHistories();
      } catch (e) {
        console.error(e);
        this.events = [];
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.listWithSubscriptions();
      } catch (e) {
        console.error(e);
        this.customers = [];
      }
    },
    async getEventHistories () {
      try {
        this.eventHistories = await this.$eventHistories.list({
          sectors: this.filteredSectors.map(sector => sector._id),
          auxiliaries: this.auxiliaries.map(aux => aux._id),
        });
      } catch (e) {
        console.error(e);
        this.eventHistories = [];
      }
    },
    // Event creation
    openCreationModal (vEvent) {
      const { dayIndex, person, sectorId } = vEvent;
      const selectedDay = this.days[dayIndex];

      if (person && !this.canCreateEvent(person, selectedDay)) return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        address: {},
        attachment: {},
        auxiliary: person ? person._id : '',
        sector: person ? person.sector._id : sectorId,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
    },
    // Event edition
    openEditionModal ({ eventId, rowId }) {
      const rowEvents = this.getRowEvents(rowId);

      const event = rowEvents.find(ev => ev._id === eventId);
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.formatEditedEvent(event);

      this.editionModal = true;
    },
    // Filter
    async addElementToFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors.push(el);
        const auxBySector = this.filters.filter(aux => aux.sector && aux.sector._id === el._id);
        for (let i = 0, l = auxBySector.length; i < l; i++) {
          if (!this.auxiliaries.some(aux => auxBySector[i]._id === aux._id)) {
            this.auxiliaries.push(auxBySector[i]);
          }
        }
        await this.refresh();
      } else { // el = auxiliary
        if (!this.filteredAuxiliaries.some(aux => aux._id === el._id)) this.filteredAuxiliaries.push(el);
        if (!this.auxiliaries.some(aux => aux._id === el._id)) {
          this.auxiliaries.push(el);
          await this.refresh();
        }
      }
    },
    removeElementFromFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec._id !== el._id);
        this.auxiliaries = this.auxiliaries.filter(auxiliary =>
          auxiliary.sector._id !== el._id || this.filteredAuxiliaries.some(filteredAux => filteredAux._id === auxiliary._id));
        this.eventHistories = this.eventHistories.filter(history =>
          !history.sectors.includes(el._id) ||
            this.filteredAuxiliaries.some(filteredAux => history.auxiliaries.map(aux => aux._id).includes(filteredAux._id)));
      } else { // el = auxiliary
        this.filteredAuxiliaries = this.filteredAuxiliaries.filter(auxiliary => auxiliary._id !== el._id);
        if (this.filteredSectors.some(sector => sector._id === el.sector._id)) return;
        this.auxiliaries = this.auxiliaries.filter(auxiliary => auxiliary._id !== el._id);
        this.eventHistories = this.eventHistories.filter(history =>
          !history.auxiliaries.map(aux => aux._id).includes(el._id) ||
            this.filteredAuxiliaries.some(filteredAux => history.auxiliaries.map(aux => aux._id).includes(filteredAux._id)));
      }
    },
  },
}
</script>
