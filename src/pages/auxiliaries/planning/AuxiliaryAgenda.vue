<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-md-5 auxiliary-name" v-if="Object.keys(selectedAuxiliary).length > 0">
          <img :src="getAvatar(selectedAuxiliary.picture.link)" class="avatar">
          <q-select filter :value="selectedAuxiliary._id" color="white" inverted-light :options="auxiliariesOptions"
            @input="updateAuxiliary" ref="auxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`" />
        </div>
        <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek"
          @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" :viewMode="viewMode" @updateViewMode="updateViewMode"
          :type="AGENDA" />
      </div>
      <agenda :events="events" :days="days" personKey="auxiliary" @createEvent="openCreationModal" @editEvent="openEditionModal" />
    </div>

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
import Agenda from '../../../components/Agenda';
import PlanningNavigation from '../../../components/planning/PlanningNavigation';
import AuxiliaryEventCreationModal from '../../../components/planning/AuxiliaryEventCreationModal';
import AuxiliaryEventEditionModal from '../../../components/planning/AuxiliaryEventEditionModal';
import { DEFAULT_AVATAR, INTERVENTION, NEVER, AGENDA, WEEK_VIEW, THREE_DAYS_VIEW } from '../../../data/constants';
import { planningTimelineMixin } from '../../../mixins/planningTimelineMixin';
import { planningActionMixin } from '../../../mixins/planningActionMixin';

export default {
  name: 'AuxiliaryAgenda',
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
    };
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
        value: aux._id,
      }));
    },
  },
  async mounted () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week');
    this.selectedAuxiliary = this.currentUser;
    this.getTimelineDays();
    await this.getAuxiliaries();
    await this.getEvents();
    await this.getCustomers();
    this.setInternalHours();
  },
  methods: {
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
    toggleAuxiliarySelect () {
      return this.$refs['auxiliarySelect'].show();
    },
    async updateAuxiliary (auxiliaryId) {
      this.selectedAuxiliary = this.auxiliaries.find(aux => aux._id === auxiliaryId);
      await this.getEvents();
    },
    async updateTimeline () {
      this.getTimelineDays();
      await this.getEvents();
    },
    // Refresh data
    async getEvents () {
      try {
        const params = {
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          auxiliary: JSON.stringify([this.selectedAuxiliary._id]),
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
          { name: 'planning:edit', rule: 'isOwner' }
        ]
      });
      if (!can) return;
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
        auxiliary: this.selectedAuxiliary._id,
        sector: this.selectedAuxiliary.sector,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
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
