<template>
  <div :class="[{ 'planning': !toggleDrawer }]">
    <div class="row items-center planning-header">
      <div class="col-xs-12 col-md-5 planning-search">
        <ni-chips-autocomplete v-model="terms" @selected="selectedFilter" @remove="removedFilter"
          class="planning-search" :filters="filters" />
      </div>
      <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek"
        @goToToday="goToToday" @goToWeek="goToWeek" :targetDate="targetDate" :type="PLANNING" />
    </div>
    <div class="planning-container full-width">
      <table style="width: 100%" :class="[staffingView && 'staffing', 'planning-table']">
        <thead>
          <th>
            <q-btn v-if="!isCustomerPlanning" flat round icon="view_week" :color="staffingView ? 'primary' : ''" @click="staffingView = !staffingView" />
          </th>
          <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">
            <div class="row justify-center items-baseline days-header">
              <div class="days-name q-mr-md">{{ day.name }}</div>
              <div :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">{{ day.number }}</div>
            </div>
          </th>
        </thead>
        <tbody>
          <tr class="person-row" v-for="(person, index) in persons" :key="index">
            <td valign="top">
              <div class="person-inner-cell">
                <div :class="[!staffingView && 'q-mb-md']">
                  <ni-chip-customer-indicator v-if="isCustomerPlanning" :person="person" :events="getPersonEvents(person)" />
                  <ni-chip-auxiliary-indicator v-else :person="person" :events="getPersonEvents(person)" :startOfWeek="startOfWeek"
                    :endOfWorkingWeek="endOfWeek().subtract(1, 'd')" :distanceMatrix="distanceMatrix" />
                </div>
                <div class="person-name overflow-hidden-nowrap">{{ formatPersonName(person) }}</div>
              </div>
            </td>
            <template v-if="staffingView && !isCustomerPlanning">
              <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
                @click="$emit('createEvent', { dayIndex, person })">
                <template v-for="(event, eventIndex) in getOneDayPersonEvents(person, days[dayIndex])">
                  <div :id="event._id" draggable @dragstart="drag(event._id)" @click.stop="$emit('editEvent', event._id)"
                    :class="['row', 'cursor-pointer', 'event', `event-${event.type}`, 'q-mt-sm']" :key="eventIndex"
                    :style="{ left: `${PERCENTAGE_BY_MINUTES * event.staffingLeft + 2}%`, width: `${PERCENTAGE_BY_MINUTES * event.staffingWidth}%` }">
                  </div>
                </template>
              </td>
            </template>
            <template v-else>
              <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
                @click="$emit('createEvent', { dayIndex, person })">
                <template v-for="(event, eventIndex) in getOneDayPersonEvents(person, days[dayIndex])">
                  <div :id="event._id" draggable @dragstart="drag(event._id)" :class="['row', 'cursor-pointer', 'event', `event-${event.type}`]"
                    :key="eventIndex" @click.stop="$emit('editEvent', event._id)">
                    <div class="col-12 event-title">
                      <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap">
                        {{eventTitle(event) }}
                      </p>
                      <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">
                        {{ displayAbsenceType(event.absence) }}
                      </p>
                      <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">Indispo.</p>
                      <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">{{
                        event.internalHour.name }}</p>
                    </div>
                    <p class="no-margin event-period overflow-hidden-nowrap">{{ getEventHours(event) }}</p>
                  </div>
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, PLANNING, PERCENTAGE_BY_MINUTES } from '../../data/constants';
import { NotifyNegative } from '../popup/notify';
import NiChipAuxiliaryIndicator from '../planning/ChipAuxiliaryIndicator';
import NiChipCustomerIndicator from '../planning/ChipCustomerIndicator';
import ChipsAutocomplete from '../ChipsAutocomplete';
import { planningTimelineMixin } from '../../mixins/planningTimelineMixin';
import { planningEventMixin } from '../../mixins/planningEventMixin';
import PlanningNavigation from './PlanningNavigation.vue';
import distanceMatrix from '../../api/DistanceMatrix';

export default {
  name: 'PlanningManager',
  mixins: [planningTimelineMixin, planningEventMixin],
  components: {
    'ni-chip-customer-indicator': NiChipCustomerIndicator,
    'ni-chip-auxiliary-indicator': NiChipAuxiliaryIndicator,
    'ni-chips-autocomplete': ChipsAutocomplete,
    'planning-navigation': PlanningNavigation,
  },
  props: {
    events: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
    selectedFilter: { type: Function, default: () => {} },
    removedFilter: { type: Function, default: () => {} },
    personKey: { type: String, default: 'auxiliary' },
    filters: { type: Array, default: () => [] },
    mySector: Object
  },
  data () {
    return {
      terms: [],
      loading: false,
      draggedObject: {},
      startOfWeek: {},
      days: [],
      maxDays: 7,
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      staffingView: false,
      PLANNING,
      PERCENTAGE_BY_MINUTES,
      distanceMatrix: [],
    }
  },
  beforeDestroy () {
    this.$q.localStorage.set('lastSearch', JSON.stringify(this.terms));
    console.log('beforeDestroy', this.terms);
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek })
    if (!this.isCustomerPlanning) await this.getDistanceMatrix();
    // this.$q.localStorage.clear();
    if (this.$q.localStorage.has('lastSearch')) {
      const lastSearch = JSON.parse(this.$q.localStorage.get.item('lastSearch'));
      for (let i = 0, l = lastSearch.length; i < l; i++) {
        this.terms.push(lastSearch[i]);
      }
    }
  },
  methods: {
    async getDistanceMatrix () {
      this.distanceMatrix = await distanceMatrix.list();
    },
    // Table
    updateTimeline () {
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    formatPersonName (person) {
      return this.isCustomerPlanning
        ? `${person.identity.title} ${person.identity.lastname}`.toUpperCase()
        : `${person.identity.firstname.slice(0, 1)}. ${person.identity.lastname}`.toUpperCase();
    },
    // Event display
    getOneDayPersonEvents (person, day) {
      return this.events
        .filter(event => event[this.personKey] ? event[this.personKey]._id === person._id : false)
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          if (this.isCustomerPlanning) return event;
          let dayEvent = { ...event };

          let staffingLeft = (this.$moment(event.startDate).hours() - 8) * 60 + this.$moment(event.startDate).minutes();
          let staffingRight = (this.$moment(event.endDate).hours() - 8) * 60 + this.$moment(event.endDate).minutes();
          if (!this.$moment(day).isSame(event.startDate, 'day')) {
            dayEvent.startDate = this.$moment(day).hour(8).toISOString();
            staffingLeft = 0;
          }
          if (!this.$moment(day).isSame(event.endDate, 'day')) {
            dayEvent.endDate = this.$moment(day).hour(20).toISOString();
            staffingRight = 720;
          }

          dayEvent.staffingLeft = staffingLeft;
          dayEvent.staffingWidth = staffingRight - staffingLeft;

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getPersonEvents (person) {
      return this.events
        .filter(event => (event[this.personKey] ? event[this.personKey]._id === person._id : false))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    // Drag & drop
    drag (eventId) {
      this.draggedObject = this.events.find(ev => ev._id === eventId);
    },
    async drop (toDay, toPerson) {
      try {
        if (this.draggedObject[this.personKey]._id === toPerson._id && toDay.isSame(this.draggedObject.startDate, 'd')) return;
        this.$emit('onDrop', { toDay, toPerson, draggedObject: this.draggedObject });
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.draggedObject = {};
      }
    },
  },
  watch: {
    mySector (val) {
      if (val) {
        if (this.$q.localStorage.has('lastSearch')) {
          console.log('not pushing mySector props init');
          return;
        }
        this.terms.push(this.mySector.label);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .person
    &-row
      border-right: 1px solid $light-grey;
      height: 100px;
    &-name
      font-weight: 600
      font-size: 14px
      @media(max-width: 1024px)
        font-size: 12px
      @media(max-width: 420px)
        font-size: 8px
    &-inner-cell
      margin-top: 4px

  .staffing
    .person
      &-row
        height: auto
      &-name
        margin: 2px 0 4px;
    td
      position: relative;
    .event
      position: absolute;
      top: 2px;
      bottom: 1px;
      padding: 0;
      margin: 0;
      border: 1px solid white;
</style>
