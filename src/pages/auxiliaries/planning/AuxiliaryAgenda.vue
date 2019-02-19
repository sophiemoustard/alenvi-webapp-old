<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header q-mb-md">
        <div class="col-xs-12 col-md-5 agenda-title">
          <img :src="getAvatar(currentUser.picture.link)" class="avatar">
          <div class="auxiliary-name">
            {{ currentUser.identity.firstname }} {{ currentUser.identity.lastname.toUpperCase() }}
          </div>
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
  name: 'Planning',
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
    };
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    await this.getEvents();
  },
  methods: {
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
    async updateTimeline () {
      this.getTimelineDays();
      await this.getEvents();
    },
    async getEvents () {
      const params = {
        startDate: this.startOfWeek.format('YYYYMMDD'),
        endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
        auxiliary: JSON.stringify([this.currentUser._id]),
      }
      this.events = await this.$events.list(params);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

  .auxiliary-name
    font-size: 24px;
    margin-left: 3px;
    padding: 9px 14px 11px;
    @media screen and (max-width: 677px)
      font-size: 20px;
      padding: 7px;

  .avatar
    @media screen and (max-width: 677px)
      height: 30px
      width: 30px

</style>
