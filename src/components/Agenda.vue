<template>
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
          <td v-for="(day, dayIndex) in days" :key="`day_${dayIndex}`" valign="top" @click="createEvent(dayIndex)">
            <div class="planning-background">
              <template v-if="dayIndex === 0">
                <div class="planning-hour" v-for="(hour, hourIndex) in hours" :key="`hour_${hourIndex}`"
                  :style="{ top: `${(hourIndex * halfHourHeight * 4) - 1.5}%` }">{{ hour.format('HH:mm') }}</div>
              </template>
              <template v-for="(event, eventId) in getOneDayEvents(days[dayIndex])">
                <div :style="{ top: `${PERCENTAGE_BY_MINUTES * event.staffingTop}%`, height: `${PERCENTAGE_BY_MINUTES * event.staffingHeight - 0.2}%` }"
                  :key="eventId"  :class="[!isCustomerPlanning && 'cursor-pointer', 'event', `event-${event.type}`]" @click.stop="editEvent(event._id)">
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
</template>

<script>
import { planningEventMixin } from '../mixins/planningEventMixin';
import { ABSENCE, INTERVENTION, INTERNAL_HOUR, UNAVAILABILITY, PERCENTAGE_BY_MINUTES } from '../data/constants';

export default {
  name: 'Agenda',
  mixins: [planningEventMixin],
  props: {
    events: { type: Array, default: () => [] },
    days: { type: Array, default: () => [] },
    personKey: { type: String, default: '' },
  },
  data () {
    return {
      ABSENCE,
      INTERVENTION,
      INTERNAL_HOUR,
      UNAVAILABILITY,
      PERCENTAGE_BY_MINUTES,
    };
  },
  mounted () {
    this.getTimelineHours();
  },
  methods: {
    getOneDayEvents (day) {
      return this.events
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          let dayEvent = { ...event };

          let staffingTop = (this.$moment(event.startDate).hours() - 8) * 60 + this.$moment(event.startDate).minutes();
          let staffingBottom = (this.$moment(event.endDate).hours() - 8) * 60 + this.$moment(event.endDate).minutes();
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
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    editEvent (value) {
      this.$emit('editEvent', value);
    }
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .agenda-table
    td
      padding: 0px;

      .planning-background
        background: repeating-linear-gradient(
          180deg,
          $white,
          $white 16.2%,
          $grey-3,
          $grey-3 16.4%
        )
        height: 100%
        position: relative;
        margin-top: 2px

      .event
        position: absolute;
        left: 3px;
        right: 3px;
        margin: 0;
        border: 1px solid $white;

      .planning-hour
        position: absolute;
        color: $light-grey;
        background-color: $white;
        font-size: 12px;
        padding: 0 5px
</style>
