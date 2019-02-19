<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]" >
      <div class="row items-center planning-header q-mb-md">
        <div class="col-xs-12 col-md-5 auxiliary-agenda-title">
          <img :src="getAvatar(currentUser.picture.link)" class="avatar">
          <div class="auxiliary-name">{{ currentUser.identity.firstname }} {{ currentUser.identity.lastname.toUpperCase() }}</div>
        </div>
        <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" />
      </div>
      <div class="planning-container full-width full-height">
        <table style="width: 100%" class="agenda-table full-height">
          <thead>
            <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">
              <div class="row justify-center items-baseline days-header">
                <div class="days-name q-mr-md">{{ day.name }}</div>
                <div :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">{{ day.number }}</div>
              </div>
            </th>
          </thead>
          <tbody>
            <tr>
              <td v-for="(day, dayIndex) in days" :key="dayIndex" valign="top">
                <div class="planning-background">
                  <template v-if="dayIndex === 0">
                    <div class="planning-hour" v-for="(hour, hourIndex) in hours" :key="hourIndex" :style="{ top: `${(hourIndex * 16) - 1.5}%` }">{{ hour.format('HH:mm') }}</div>
                  </template>
                  <template v-for="(event, eventId) in getOneDayEvents(days[dayIndex])">
                    <div :key="eventId" :style="{ top: `${4 * event.staffingTop}%`, height: `${4 * event.staffingHeight}%` }"
                      :class="['cursor-pointer', 'event', `event-${event.type}`]">
                      <div class="col-12 event-title">
                        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap">{{ eventTitle(event) }}</p>
                        <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">{{ displayAbsenceType(event.absence) }}</p>
                        <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">Indispo.</p>
                        <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">{{ event.internalHour.name }}</p>
                      </div>
                      <p class="no-margin event-period overflow-hidden-nowrap">{{ getEventHours(event) }}</p>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { planningTimelineMixin } from '../../../mixins/planningTimelineMixin';
import { ABSENCE, INTERVENTION, INTERNAL_HOUR, UNAVAILABILITY, DEFAULT_AVATAR } from '../../../data/constants';
import PlanningNavigation from '../../../components/PlanningNavigation';

export default {
  mixins: [planningTimelineMixin],
  name: 'Planning',
  components: {
    'planning-navigation': PlanningNavigation,
  },
  data () {
    return {
      ABSENCE,
      INTERVENTION,
      INTERNAL_HOUR,
      UNAVAILABILITY,
      startOfWeek: '',
      days: [],
      events: [],
      height: 0,
    };
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    hours () {
      const range = this.$moment.range(this.$moment().hours(8).minutes(0), this.$moment().hours(20).minutes(0));
      return Array.from(range.by('hours', { step: 2 }));
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
    getOneDayEvents (day) {
      return this.events
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          if (this.isCustomerPlanning) return event;
          let dayEvent = { ...event };

          let staffingTop = (this.$moment(event.startDate).hours() - 8) * 2 + (this.$moment(event.startDate).minutes() === 30 ? 1 : 0);
          let staffingBottom = (this.$moment(event.endDate).hours() - 8) * 2 + (this.$moment(event.endDate).minutes() === 30 ? 1 : 0);
          if (!this.$moment(day).isSame(event.startDate, 'day')) {
            dayEvent.startDate = this.$moment(day).hour(8).toISOString();
            staffingTop = 0;
          }
          if (!this.$moment(day).isSame(event.endDate, 'day')) {
            dayEvent.endDate = this.$moment(day).hour(20).toISOString();
            staffingBottom = 24;
          }

          dayEvent.staffingTop = staffingTop;
          dayEvent.staffingHeight = staffingBottom - staffingTop;

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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

  .agenda-table
    td
      padding: 0px;

      .planning-background
        background: repeating-linear-gradient(
          180deg,
          $white,
          $white 15.8%,
          $grey-3,
          $grey-3 16%
        )
        height: 100%
        position: relative;
        margin-top: 2px

      .event
        position: absolute
        left: 5px
        right: 5px
        margin: 0

      .planning-hour
        position: absolute;
        color: $light-grey;
        background-color: $white;
        font-size: 12px;
        padding: 0 5px

  .auxiliary-agenda-title
    display: flex;
    flex-direction: row;

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
