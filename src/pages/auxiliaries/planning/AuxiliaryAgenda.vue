<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header q-mb-md">
        <div class="col-xs-12 col-md-5 auxiliary-name" v-if="Object.keys(selectedAuxiliary).length > 0">
          <img :src="getAvatar(selectedAuxiliary.picture.link)" class="avatar">
          <q-select filter v-model="selectedAuxiliary._id" color="white" inverted-light :options="auxiliariesOptions" @input="updateAuxiliary"
            ref="auxiliarySelect" :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { toggleAuxiliarySelect(); }, }]"
            :filter-placeholder="`${selectedAuxiliary.identity.firstname} ${selectedAuxiliary.identity.lastname}`" />
        </div>
        <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToToday="goToToday"
          @goToWeek="goToWeek" :targetDate="targetDate" />
      </div>
      <agenda :events="events" :days="days" personKey="auxiliary" />
    </div>
  </q-page>
</template>

<script>
import { DEFAULT_AVATAR } from '../../../data/constants';
import { planningTimelineMixin } from '../../../mixins/planningTimelineMixin';
import Agenda from '../../../components/Agenda';
import PlanningNavigation from '../../../components/PlanningNavigation';

export default {
  name: 'AuxiliaryAgenda',
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
  },
  mixins: [planningTimelineMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      height: 0,
      selectedAuxiliary: {},
      auxiliaries: [],
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
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week');
    this.selectedAuxiliary = this.currentUser;
    this.getTimelineDays();
    await this.getAuxiliaries();
    await this.getEvents();
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
    async getEvents () {
      try {
        const params = {
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          auxiliary: JSON.stringify([this.selectedAuxiliary._id]),
        }
        this.events = await this.$events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      try {
        const params = {
          sector: this.currentUser.sector,
        }
        this.auxiliaries = await this.$users.showAll(params);
      } catch (e) {
        this.auxiliaries = [];
      }
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
