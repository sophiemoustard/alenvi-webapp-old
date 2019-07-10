<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-md-5 person-name" v-if="customer && customer.identity">
          <img :src="getAvatar()" class="avatar">
          <div>{{ customer.identity | formatFullIdentity }}</div>
        </div>
        <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek"
          @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" :viewMode="viewMode" @updateViewMode="updateViewMode"
          :type="AGENDA" />
      </div>
      <agenda :events="events" :days="days" :personKey="personKey" />
    </div>
  </q-page>
</template>

<script>
import { DEFAULT_AVATAR, WEEK_VIEW, AGENDA, CUSTOMER } from '../../data/constants';
import { planningTimelineMixin } from '../../mixins/planningTimelineMixin';
import Agenda from '../../components/Agenda';
import PlanningNavigation from '../../components/planning/PlanningNavigation';
import { formatFullIdentity } from '../../helpers/utils';

export default {
  name: 'CustomerAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
  },
  mixins: [planningTimelineMixin],
  data () {
    return {
      customer: {},
      startOfWeek: '',
      events: [],
      height: 0,
      viewMode: WEEK_VIEW,
      AGENDA,
      personKey: CUSTOMER,
    };
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    await this.refreshCustomer();
    await this.getEvents();
  },
  methods: {
    async refreshCustomer () {
      try {
        this.customer = await this.$customers.getById(this.helper.customers[0]._id);
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
    getAvatar () {
      return DEFAULT_AVATAR;
    },
    // Refresh data
    async updateTimeline () {
      this.getTimelineDays();
      await this.getEvents();
    },
    async getEvents () {
      try {
        const params = {
          startDate: this.startOfWeek.toDate(),
          endDate: this.endOfWeek().toDate(),
          customer: JSON.stringify([this.customer._id]),
        }
        this.events = await this.$events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
  },
  filters: {
    formatFullIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

</style>
