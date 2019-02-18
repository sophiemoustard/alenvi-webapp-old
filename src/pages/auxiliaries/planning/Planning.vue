<template>
  <q-page class="neutral-background">
    <div :class="[{ 'planning': !toggleDrawer }]">
      <div class="row items-center planning-header q-mb-md">
        <div class="col-xs-12 col-md-5">
        </div>
        <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" />
      </div>
      <div class="planning-container full-width">
        <table style="width: 100%" class="agenda-table">
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
                  <template v-for="(event, eventId) in getOneDayEvents(days[dayIndex])">
                    <div :key="eventId" :style="{ top: `${4 * event.staffingTop + 2}%`, height: `${4 * event.staffingHeight}%` }"
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
import { ABSENCE, INTERVENTION, INTERNAL_HOUR, UNAVAILABILITY } from '../../../data/constants';
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
    };
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    await this.getEvents();
  },
  methods: {
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
      position: relative
      height: 600px;

      .event
        position: absolute
        left: 5px
        right: 5px

</style>
