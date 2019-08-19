<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-md-5 auxiliary-name" v-if="Object.keys(selectedAuxiliary).length > 0">
          <img :src="getAvatar(selectedAuxiliary)" class="avatar">
          <q-select filter :value="selectedAuxiliary._id" color="white" inverted-light :options="auxiliariesOptions"
            @input="updateAuxiliary" ref="auxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`" />
        </div>
        <div class="col-xs-12 col-md-7 row">
          <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek"
            @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" :viewMode="viewMode" @updateViewMode="updateViewMode"
            :type="AGENDA" />
        </div>
      </div>
      <agenda :events="filteredEvents" :days="days" :personKey="personKey" @createEvent="openCreationModal" @editEvent="openEditionModal" />
    </div>

    <!-- Event creation modal -->
    <ni-auxiliary-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent="newEvent"
      :creationModal="creationModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary"
      :activeAuxiliaries="activeAuxiliaries" :customers="customers" @resetForm="resetCreationForm"
      @deleteDocument="deleteDocument" @documentUploaded="documentUploaded" @createEvent="createEvent"
      @close="closeCreationModal" />

    <!-- Event edition modal -->
    <ni-auxiliary-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :selectedAuxiliary="selectedAuxiliary"
      :activeAuxiliaries="activeAuxiliaries" :customers="customers" @resetForm="resetEditionForm"
      @deleteDocument="deleteDocument" @documentUploaded="documentUploaded" @updateEvent="updateEvent"
      @close="closeEditionModal" @deleteEvent="deleteEvent" @deleteEventRepetition="deleteEventRepetition" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import Agenda from '../../../components/Agenda';
import PlanningNavigation from '../../../components/planning/PlanningNavigation';
import AuxiliaryEventCreationModal from '../../../components/planning/AuxiliaryEventCreationModal';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import { DEFAULT_AVATAR, INTERVENTION, NEVER, AGENDA, WEEK_VIEW, THREE_DAYS_VIEW, ABSENCE, DAILY, HOURLY, INTERNAL_HOUR, ILLNESS, AUXILIARY, UNKNOWN_AVATAR } from '../../../data/constants';
import { planningTimelineMixin } from '../../../mixins/planningTimelineMixin';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'AuxiliaryAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
    'ni-auxiliary-event-creation-modal': AuxiliaryEventCreationModal,
    'ni-auxiliary-event-edition-modal': AuxiliaryEventEditionModal,
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
    currentUser () {
      return this.$store.getters['main/user'];
    },
    activeAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasActiveCompanyContractOnEvent(aux, this.days[0]) || this.hasActiveCustomerContractOnEvent(aux, this.days[0]));
    },
    auxiliariesOptions () {
      return this.activeAuxiliaries.length === 0 ? [] : this.activeAuxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
        value: aux._id,
      }));
    },
    filteredEvents () {
      return this.events.filter(ev => !ev.isCancelled);
    },
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
        address: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item, parent) => parent && parent.type !== ABSENCE) },
        },
        attachment: {
          driveId: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absence === ILLNESS),
          link: requiredIf((item, parent) => parent && parent.type === ABSENCE && parent.absence === ILLNESS),
        },
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
      },
    };
  },
  async mounted () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week');
    this.selectedAuxiliary = this.currentUser;
    this.getTimelineDays();
    await this.getAuxiliaries();
    await this.refresh();
    await this.getCustomers();
    this.setInternalHours();
  },
  methods: {
    getAvatar (aux) {
      if (!aux || !aux._id) return UNKNOWN_AVATAR;

      return aux.picture && aux.picture.link ? aux.picture.link : DEFAULT_AVATAR;
    },
    toggleAuxiliarySelect () {
      return this.$refs['auxiliarySelect'].show();
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
          startDate: this.startOfWeek.toDate(),
          endDate: this.endOfWeek().toDate(),
          auxiliary: this.selectedAuxiliary._id,
        }
        this.events = await this.$events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      try {
        this.auxiliaries = await this.$users.showAll({ sector: this.currentUser.sector });
      } catch (e) {
        this.auxiliaries = [];
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
    openCreationModal (dayIndex) {
      const can = this.$can({
        user: this.currentUser,
        auxiliaryIdEvent: this.selectedAuxiliary._id,
        permissions: [
          'planning:create:user',
          { name: 'planning:create', rule: 'isOwner' },
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

      this.selectedAuxiliary.hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(this.selectedAuxiliary, selectedDay);
      this.selectedAuxiliary.hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(this.selectedAuxiliary, selectedDay);

      this.creationModal = true;
    },
    // Event edition
    openEditionModal (event) {
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.formatEditedEvent(event);
      if (event.type !== ABSENCE && this.selectedAuxiliary) {
        this.selectedAuxiliary.hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(this.selectedAuxiliary, event.startDate);
        this.selectedAuxiliary.hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(this.selectedAuxiliary, event.startDate);
      }

      this.editionModal = true
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

  .auxiliary-name
    .q-if-inverted
      background-color: $grey-3 !important;

</style>
