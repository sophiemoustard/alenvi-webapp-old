<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-md-5 person-name" v-if="Object.keys(selectedAuxiliary).length > 0">
          <img :src="getAvatar(selectedAuxiliary)" class="avatar">
          <q-select filter :value="selectedAuxiliary._id" color="white" inverted-light :options="auxiliariesOptions"
            @input="updateAuxiliary" ref="personSelect" :filter-placeholder="placeholder"
            :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { $refs['personSelect'].show() } }]" />
        </div>
        <div class="col-xs-12 col-md-7">
          <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek"
            @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" :viewMode="viewMode" @updateViewMode="updateViewMode"
            :type="AGENDA" />
        </div>
      </div>
      <agenda :events="filteredEvents" :days="days" :personKey="personKey" @createEvent="openCreationModal"
        @editEvent="openEditionModal" />
    </div>

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent="newEvent"
      :creationModal="creationModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetCreationForm" @deleteDocument="deleteDocument" :personKey="personKey"
      @documentUploaded="documentUploaded" @createEvent="createEvent" @close="closeCreationModal" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="deleteDocument" @close="closeEditionModal"
      @documentUploaded="documentUploaded" @updateEvent="updateEvent" @deleteEvent="deleteEvent"
      @deleteEventRepetition="deleteEventRepetition" :personKey="personKey" />
  </q-page>
</template>

<script>
import Agenda from '../../../components/Agenda';
import PlanningNavigation from '../../../components/planning/PlanningNavigation';
import EventCreationModal from '../../../components/planning/EventCreationModal';
import EventEditionModal from '../../../components/planning/EventEditionModal';
import { DEFAULT_AVATAR, INTERVENTION, NEVER, AGENDA, WEEK_VIEW, THREE_DAYS_VIEW, ABSENCE, AUXILIARY, UNKNOWN_AVATAR } from '../../../data/constants';
import { planningTimelineMixin } from '../../../mixins/planningTimelineMixin';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { NotifyWarning } from '../../../components/popup/notify';
import { formatIdentity } from '../../../helpers/utils';

export default {
  name: 'AuxiliaryAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
  },
  mixins: [planningTimelineMixin, planningActionMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      height: 0,
      selectedAuxiliary: {},
      auxiliaries: [],
      customers: [],
      internalHours: [],
      loading: false,
      viewMode: WEEK_VIEW,
      AGENDA,
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
      personKey: AUXILIARY,
    };
  },
  computed: {
    placeholder () {
      if (!this.selectedAuxiliary.identity) return '';
      return formatIdentity(this.selectedAuxiliary.identity, 'FL');
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
    activeAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasCompanyContractOnEvent(aux, this.days[0], this.days[6]) ||
        this.hasCustomerContractOnEvent(aux, this.days[0], this.days[6]));
    },
    auxiliariesOptions () {
      return this.activeAuxiliaries.length === 0
        ? [{ label: this.placeholder, value: this.selectedAuxiliary._id }]
        : this.activeAuxiliaries.map(aux => ({
          label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
          value: aux._id,
        }));
    },
    filteredEvents () {
      return this.events.filter(ev => !ev.isCancelled);
    },
  },
  async mounted () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week').toISOString();
    this.selectedAuxiliary = this.currentUser;
    this.getTimelineDays();
    await Promise.all([this.getAuxiliaries(), this.getCustomers(), this.refresh()]);
    this.setInternalHours();
  },
  methods: {
    getAvatar (aux) {
      if (!aux || !aux._id) return UNKNOWN_AVATAR;

      return aux.picture && aux.picture.link ? aux.picture.link : DEFAULT_AVATAR;
    },
    async updateAuxiliary (auxiliaryId) {
      this.selectedAuxiliary = this.auxiliaries.find(aux => aux._id === auxiliaryId);
      await this.refresh();
    },
    async updateTimeline () {
      this.getTimelineDays();
      await this.refresh();
    },
    // Refresh data
    async refresh () {
      try {
        const params = {
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          auxiliary: this.selectedAuxiliary._id,
        }
        this.events = await this.$events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      try {
        this.auxiliaries = await this.$users.showAll();
      } catch (e) {
        this.auxiliaries = [];
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.listWithSubscriptions();
      } catch (e) {
        this.customers = [];
      }
    },
    // Event creation
    openCreationModal (dayIndex) {
      const can = this.$can({
        user: this.currentUser,
        auxiliaryIdEvent: this.selectedAuxiliary._id,
        auxiliarySectorEvent: this.selectedAuxiliary.sector,
        permissions: [
          { name: 'events:edit' },
          { name: 'events:own:edit', rule: 'isOwner' },
        ],
      });
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');

      const selectedDay = this.days[dayIndex];
      if (!this.canCreateEvent(this.selectedAuxiliary, selectedDay)) return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        address: {},
        attachment: {},
        auxiliary: this.selectedAuxiliary._id,
        sector: this.selectedAuxiliary.sector,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };

      this.selectedAuxiliary.hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(this.selectedAuxiliary, selectedDay);
      this.selectedAuxiliary.hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(this.selectedAuxiliary, selectedDay);

      this.creationModal = true;
    },
    // Event edition
    openEditionModal (event) {
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.formatEditedEvent(event);
      if (event.type !== ABSENCE && this.selectedAuxiliary) {
        this.selectedAuxiliary.hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(this.selectedAuxiliary, event.startDate);
        this.selectedAuxiliary.hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(this.selectedAuxiliary, event.startDate);
      }

      this.editionModal = true
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .person-name
    .q-if-inverted
      background-color: $grey-3 !important;

</style>
