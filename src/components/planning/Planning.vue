<template>
  <div :class="[{ 'planning': !toggleDrawer }]">
    <div class="row items-center planning-header">
      <div class="col-xs-12 col-md-5 planning-search">
        <ni-chips-autocomplete ref="refFilter" v-model="terms" class="planning-search" />
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
                  <ni-chip-auxiliary-indicator v-else :person="person" :events="getPersonEvents(person)" :startOfWeekAsString="startOfWeek.toISOString()"
                    :distanceMatrix="distanceMatrix" />
                </div>
                <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatShortIdentity }}</div>
              </div>
            </td>
            <template v-if="staffingView && !isCustomerPlanning">
              <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
                @click="createEvent({ dayIndex, person })">
                <template v-for="(event, eventIndex) in getOneDayPersonEvents(person, days[dayIndex])">
                  <div :id="event._id" draggable @dragstart="drag(event)" @click.stop="editEvent(event._id)"
                    :class="['row', 'cursor-pointer', 'event', `event-${event.type}`, 'q-mt-sm']" :key="eventIndex"
                    :style="{ left: `${PERCENTAGE_BY_MINUTES * event.staffingLeft}%`, width: `${PERCENTAGE_BY_MINUTES * event.staffingWidth}%` }">
                  </div>
                </template>
              </td>
            </template>
            <template v-else>
              <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
                @click="createEvent({ dayIndex, person })">
                <template v-for="(event, eventIndex) in getOneDayPersonEvents(person, days[dayIndex])">
                  <div :id="event._id" :draggable="canDrag(event)" @dragstart="drag(event)" :key="eventIndex"
                    :class="['row', 'cursor-pointer', 'event', event.isCancelled ? 'event-cancelled' : `event-${event.type}`]"
                    @click.stop="editEvent(event._id)">
                    <div class="event-container">
                      <div class="event-title">
                        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap">
                          {{ eventTitle(event) }}
                        </p>
                        <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">
                          {{ displayAbsenceType(event.absence) }}
                        </p>
                        <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">Indispo.</p>
                        <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">{{
                          event.internalHour.name }}</p>
                      </div>
                      <p class="no-margin event-subtitle overflow-hidden-nowrap">{{ getEventHours(event) }}</p>
                      <p v-if="event.isBilled" class="no-margin event-subtitle event-billed">F</p>
                    </div>
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
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  PLANNING,
  PERCENTAGE_BY_MINUTES,
  AUXILIARY_ROLES,
  PLANNING_VIEW_START_HOUR,
  PLANNING_VIEW_END_HOUR,
  INVOICED_AND_PAYED,
} from '../../data/constants';
import { NotifyNegative } from '../popup/notify';
import NiChipAuxiliaryIndicator from '../planning/ChipAuxiliaryIndicator';
import NiChipCustomerIndicator from '../planning/ChipCustomerIndicator';
import ChipsAutocomplete from '../ChipsAutocomplete';
import { planningTimelineMixin } from '../../mixins/planningTimelineMixin';
import { planningEventMixin } from '../../mixins/planningEventMixin';
import PlanningNavigation from './PlanningNavigation.vue';
import distanceMatrix from '../../api/DistanceMatrix';
import { formatShortIdentity } from '../../helpers/utils';

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
    personKey: { type: String, default: 'auxiliary' },
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
    if (!AUXILIARY_ROLES.includes(this.getUser.role.name)) {
      if (!this.isCustomerPlanning) {
        this.$q.localStorage.set('lastSearchAuxiliaries', JSON.stringify(this.terms));
      } else {
        this.$q.localStorage.set('lastSearchCustomers', JSON.stringify(this.terms));
      }
    }
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    if (!this.isCustomerPlanning) await this.getDistanceMatrix();
  },
  watch: {
    // Initial filter getter
    getFilter (val) {
      if (val.length > 0) {
        if (!AUXILIARY_ROLES.includes(this.getUser.role.name)) {
          if (!this.isCustomerPlanning) {
            this.addSavedTerms('Auxiliaries');
          } else {
            this.addSavedTerms('Customers');
          }
        } else {
          const userSector = this.getFilter.find(filter => filter.sectorId === this.getUser.sector);
          if (userSector) {
            this.$refs.refFilter.add(userSector.label);
          }
        }
      }
    }
  },
  computed: {
    getFilter () {
      return this.$store.getters['planning/getFilter'];
    },
    getUser () {
      return this.$store.getters['main/user'];
    },
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
    // Event display
    getOneDayPersonEvents (person, day) {
      return this.events
        .filter(event =>
          event[this.personKey] && event[this.personKey]._id === person._id &&
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day') &&
          (!this.staffingView || !event.isCancelled)
        )
        .map((event) => {
          if (this.isCustomerPlanning) return event;
          let dayEvent = { ...event };

          let staffingLeft = (this.$moment(event.startDate).hours() - PLANNING_VIEW_START_HOUR) * 60 + this.$moment(event.startDate).minutes();
          let staffingRight = (this.$moment(event.endDate).hours() - PLANNING_VIEW_START_HOUR) * 60 + this.$moment(event.endDate).minutes();
          if (!this.$moment(day).isSame(event.startDate, 'day')) {
            dayEvent.startDate = this.$moment(day).hour(PLANNING_VIEW_START_HOUR).toISOString();
            staffingLeft = 0;
          }
          if (!this.$moment(day).isSame(event.endDate, 'day')) {
            dayEvent.endDate = this.$moment(day).hour(PLANNING_VIEW_END_HOUR).toISOString();
            staffingRight = (PLANNING_VIEW_END_HOUR - PLANNING_VIEW_START_HOUR) * 60;
          }

          dayEvent.staffingLeft = staffingLeft;
          dayEvent.staffingWidth = staffingRight - staffingLeft;

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getPersonEvents (person) {
      return this.events.filter(event =>
        (event[this.personKey] ? event[this.personKey]._id === person._id : false) &&
        (this.isCustomerPlanning || !event.isCancelled || event.cancel.condition === INVOICED_AND_PAYED)
      );
    },
    // Drag & drop
    drag (event) {
      this.draggedObject = event;
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
    canDrag (event) {
      return this.$can({
        user: this.$store.getters['main/user'],
        auxiliaryIdEvent: event.auxiliary._id,
        auxiliarySectorEvent: event.sector,
        permissions: [
          { name: 'planning:edit:user', rule: 'isInSameSector' },
          { name: 'planning:edit', rule: 'isOwner' }
        ],
      });
    },
    createEvent (eventInfo) {
      if (this.personKey === 'auxiliary') {
        const can = this.$can({
          user: this.$store.getters['main/user'],
          auxiliaryIdEvent: eventInfo.person.id,
          auxiliarySectorEvent: eventInfo.person.sector._id,
          permissions: [
            { name: 'planning:create:user', rule: 'isInSameSector' },
            { name: 'planning:create', rule: 'isOwner' }
          ],
        });
        if (!can) return;
      }
      this.$emit('createEvent', eventInfo);
    },
    editEvent (eventId) {
      this.$emit('editEvent', eventId);
    },
    addSavedTerms (endPath) {
      if (this.$q.localStorage.has(`lastSearch${endPath}`) && this.$q.localStorage.get.item(`lastSearch${endPath}`).length > 0) {
        const lastSearch = JSON.parse(this.$q.localStorage.get.item(`lastSearch${endPath}`));
        for (let i = 0, l = lastSearch.length; i < l; i++) {
          setTimeout(() => this.$refs.refFilter.add(lastSearch[i]), 1);
        }
      }
    },
  },
  filters: {
    formatShortIdentity,
  },
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
