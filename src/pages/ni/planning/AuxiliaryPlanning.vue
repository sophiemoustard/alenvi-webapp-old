<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="auxiliaries" @updateStartOfWeek="updateStartOfWeek" @createEvent="openCreationModal"
      @editEvent="openEditionModal" @onDrop="updateEventOnDrop" :selectedFilter="selectedFilter"
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
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="deleteEvent" @deleteEventRepetition="deleteEventRepetition"
      @selectedAddress="selectedAddress" />
  </q-page>
</template>

<script>
import ChipsAutocomplete from '../../../components/ChipsAutocomplete';
import AuxiliaryEventCreationModal from '../../../components/planning/AuxiliaryEventCreationModal';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import Planning from '../../../components/planning/Planning.vue';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { INTERVENTION, NEVER } from '../../../data/constants';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AuxiliaryPlanning',
  mixins: [planningActionMixin],
  components: {
    'ni-planning-manager': Planning,
    'ni-chips-autocomplete-auxiliaries-sectors': ChipsAutocomplete,
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
    await this.fillFilter();
    this.setInternalHours();
  },
  watch: {
    getElemAdded (val) {
      console.log('WATCH GET ELEM ADDED', val);
      this.selectedFilter(this.getFilter.find(elem => elem.value === val));
    }
  },
  computed: {
    ...mapGetters({
      getUser: 'main/user',
      getFilter: 'planning/getFilter',
      getElemAdded: 'planning/getElemAdded'
    }),
    getUser () {
      return this.$store.getters['main/user'];
    },
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      return { picture: {}, identity: {} };
    },
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
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
          endDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
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
    // Event creation
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
    // Filters
    selectedFilter (el) {
      if (el.ogustSector) {
        this.filteredSectors.push(el.ogustSector);
        const auxBySector = this.getFilter.filter(aux => aux.sector === el.ogustSector);
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
