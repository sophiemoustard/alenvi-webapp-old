<template>
  <div :class="[{ 'planning': !toggleDrawer }]">
    <div class="row items-center planning-header">
      <div class="col-xs-12 col-md-5 planning-search">
        <ni-chips-autocomplete ref="refFilter" v-model="terms" />
        <q-btn v-if="!isCustomerPlanning" flat round icon="people" @click="toggleAllSectors"
          :color="displayAllSectors ? 'primary' : ''" />
      </div>
      <div class="col-xs-12 col-md-7 row planning-timeline">
        <planning-navigation class="col-10" :timelineTitle="timelineTitle()" :targetDate="targetDate" :type="PLANNING"
          @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek" @goToToday="goToToday"
          @goToWeek="goToWeek" />
        <q-btn v-if="!isCustomerPlanning" class="planning-view" size="md" icon="playlist_play" flat round
          @click="toggleHistory" :color="displayHistory ? 'primary' : ''" />
      </div>
    </div>
    <div class="planning-container full-width">
      <table style="width: 100%" :class="[staffingView ? 'staffing' : 'non-staffing', 'planning-table']">
        <thead>
          <th>
            <q-btn v-if="!isCustomerPlanning" flat round icon="view_week" :color="staffingView ? 'primary' : ''"
              @click="staffingView = !staffingView" />
          </th>
          <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">
            <div class="row justify-center items-baseline days-header">
              <div class="days-name q-mr-md">{{ day.name }}</div>
              <div :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">{{ day.number }}</div>
            </div>
            <div class="planning-background" v-if="staffingView">
              <template v-for="(hour, hourIndex) in hours">
                <div class="planning-hour" v-if="hourIndex !== 0"  :key="hourIndex"
                  :style="{ left: `${(hourIndex * hourWidth * 2) - 3}%` }">{{ hour.format('H') }}</div>
              </template>
            </div>
          </th>
        </thead>
        <tbody>
          <template v-if="!isCustomerPlanning && filteredSectors.length > 0">
            <tr v-for="sector in filteredSectors" :key="sector._id" class="to-assign person-row">
              <td valign="top">
                <div class="person-inner-cell">
                  <div :class="[!staffingView && 'q-mb-md', 'chip-container']">
                    <img :src="UNKNOWN_AVATAR" class="avatar" >
                  </div>
                  <div class="person-name overflow-hidden">{{ sector.label }}</div>
                </div>
              </td>
              <td @drop="drop(day, sector)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex"
                valign="top" @click="createEvent({ dayIndex, sectorId: sector._id })" class="planning-background">
                <template v-for="hourIndex in 5">
                  <div class="line" :style="{ left: `${(hourIndex * hourWidth * 2)}%` }"
                    :key="`hour_${hourIndex}`" />
                </template>
                <template v-for="(event, eventIndex) in getCellEvents(sector, days[dayIndex])">
                  <ni-planning-event-cell :event="event" :display-staffing-view="staffingView && !isCustomerPlanning"
                    :key="eventIndex" @drag="drag" @editEvent="editEvent" :can-drag="canEdit" :person-key="personKey" />
                </template>
              </td>
            </tr>
          </template>
          <tr class="person-row" v-for="(person, index) in persons" :key="index">
            <td valign="top">
              <div class="person-inner-cell">
                <div :class="[!staffingView && 'q-mb-md']">
                  <ni-chip-customer-indicator v-if="isCustomerPlanning" :person="person"
                    :events="getPersonEvents(person)" />
                  <ni-chip-auxiliary-indicator v-else :person="person" :events="getPersonEvents(person)"
                    :startOfWeekAsString="startOfWeek.toISOString()" :distanceMatrix="distanceMatrix" />
                </div>
                <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatShortIdentity }}</div>
              </div>
            </td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex"
              valign="top" @click="createEvent({ dayIndex, person })" class="planning-background">
              <template v-for="hourIndex in hours.length">
                <div class="line" :style="{ left: `${(hourIndex * hourWidth * 2)}%` }"
                  :key="`hour_${hourIndex}`" />
              </template>
              <template v-for="(event, eventIndex) in getCellEvents(person, days[dayIndex])">
                <ni-planning-event-cell :event="event" :display-staffing-view="staffingView && !isCustomerPlanning"
                  :key="eventIndex" @drag="drag" @editEvent="editEvent" :can-drag="canEdit" :person-key="personKey" />
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ni-event-history-feed v-if="displayHistory" :eventHistories="eventHistories" />
  </div>
</template>

<script>
import {
  PLANNING,
  AUXILIARY_ROLES,
  INVOICED_AND_PAYED,
  SECTOR,
  STAFFING_VIEW_START_HOUR,
  STAFFING_VIEW_END_HOUR,
  UNKNOWN_AVATAR,
} from '../../data/constants';
import { NotifyNegative } from '../popup/notify';
import NiChipAuxiliaryIndicator from './ChipAuxiliaryIndicator';
import NiChipCustomerIndicator from './ChipCustomerIndicator';
import NiPlanningEvent from './PlanningEvent';
import NiEventHistoryFeed from './EventHistoryFeed';
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
    'ni-planning-event-cell': NiPlanningEvent,
    'ni-chips-autocomplete': ChipsAutocomplete,
    'planning-navigation': PlanningNavigation,
    'ni-event-history-feed': NiEventHistoryFeed,
  },
  props: {
    events: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
    filteredSectors: { type: Array, default: () => [] },
    personKey: { type: String, default: 'auxiliary' },
    canEdit: { type: Function, default: () => {} },
    displayAllSectors: { type: Boolean, default: false },
    eventHistories: { type: Array, default: () => [] },
  },
  data () {
    return {
      terms: [],
      loading: false,
      draggedObject: {},
      startOfWeek: this.$moment().startOf('week'),
      days: [],
      maxDays: 7,
      staffingView: false,
      PLANNING,
      distanceMatrix: [],
      hourWidth: 100 / 12,
      UNKNOWN_AVATAR,
      displayHistory: false,
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
    this.updateTimeline();
    this.getTimelineHours();
    if (!this.isCustomerPlanning) await this.getDistanceMatrix();
  },
  watch: {
    // Initial filter getter
    getFilter (val) {
      if (val.length > 0) {
        if (!AUXILIARY_ROLES.includes(this.getUser.role.name)) {
          if (!this.isCustomerPlanning) this.addSavedTerms('Auxiliaries');
          else this.addSavedTerms('Customers');
        } else {
          const userSector = this.getFilter.find(filter => filter.type === SECTOR && filter._id === this.getUser.sector);
          if (userSector) this.$refs.refFilter.add(userSector.label);
        }
      }
    },
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
    toggleAllSectors () {
      this.$emit('update:displayAllSectors', !this.displayAllSectors);
    },
    getTimelineHours () {
      const range = this.$moment.range(this.$moment().hours(STAFFING_VIEW_START_HOUR).minutes(0), this.$moment().hours(STAFFING_VIEW_END_HOUR).minutes(0));
      this.hours = Array.from(range.by('hours', { step: 2, excludeEnd: true }));
    },
    async getDistanceMatrix () {
      this.distanceMatrix = await distanceMatrix.list();
    },
    // Table
    updateTimeline () {
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    // Event display
    getRowEvents (rowId) {
      const rowEvents = this.events.find(group => group._id === rowId);

      return (!rowEvents || !rowEvents.events) ? [] : rowEvents.events;
    },
    getCellEvents (cell, day) {
      return this.getRowEvents(cell._id)
        .filter(event =>
          this.$moment(day).isBetween(event.startDate, event.endDate, 'day', '[]') &&
          (!this.staffingView || !event.isCancelled)
        )
        .map((event) => this.isCustomerPlanning ? event : this.getEventWithStyleInfo(event, day))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getEventWithStyleInfo (event, day) {
      let dayEvent = { ...event };

      const displayedStartHour = Math.max((this.$moment(event.startDate).hours()), STAFFING_VIEW_START_HOUR);
      const displayedEndHour = Math.min(this.$moment(event.endDate).hours(), STAFFING_VIEW_END_HOUR);
      let staffingLeft = (displayedStartHour - STAFFING_VIEW_START_HOUR) * 60 + this.$moment(event.startDate).minutes();
      let staffingRight = (displayedEndHour - STAFFING_VIEW_START_HOUR) * 60 + this.$moment(event.endDate).minutes();
      if (!this.$moment(day).isSame(event.startDate, 'day')) {
        dayEvent.startDate = this.$moment(day).hour(STAFFING_VIEW_START_HOUR).toISOString();
        staffingLeft = 0;
      }
      if (!this.$moment(day).isSame(event.endDate, 'day')) {
        dayEvent.endDate = this.$moment(day).hour(STAFFING_VIEW_END_HOUR).toISOString();
        staffingRight = (STAFFING_VIEW_END_HOUR - STAFFING_VIEW_START_HOUR) * 60;
      }

      dayEvent.staffingLeft = staffingLeft;
      dayEvent.staffingWidth = staffingRight - staffingLeft;

      return dayEvent;
    },
    getPersonEvents (person) {
      return this.getRowEvents(person._id).filter(event =>
        (this.isCustomerPlanning || !event.isCancelled || event.cancel.condition === INVOICED_AND_PAYED));
    },
    // History
    toggleHistory () {
      if (this.persons.length === 0) return;
      this.displayHistory = !this.displayHistory;
    },
    // Drag & drop
    drag (event) {
      this.draggedObject = event;
    },
    async drop (toDay, target) {
      try {
        if (target.type === SECTOR) { // Unassign event
          if (this.draggedObject.sector === target._id && (!this.draggedObject.auxiliary || !this.draggedObject.auxiliary._id) &&
            toDay.isSame(this.draggedObject.startDate, 'd')) return;
        } else { // Update event auxiliary
          if (this.draggedObject[this.personKey] && this.draggedObject[this.personKey]._id === target._id &&
            toDay.isSame(this.draggedObject.startDate, 'd')) return;
        }

        this.$emit('onDrop', { toDay, target, draggedObject: this.draggedObject });
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.draggedObject = {};
      }
    },
    createEvent (eventInfo) {
      let can = true;
      if (this.personKey === 'auxiliary' && eventInfo.sectorId) { // Unassigned event
        can = this.$can({
          user: this.$store.getters['main/user'],
          auxiliarySectorEvent: eventInfo.sectorId,
          permissions: [
            { name: 'planning:create:user', rule: 'isInSameSector' },
          ],
        });
      } else if (this.personKey === 'auxiliary') {
        can = this.$can({
          user: this.$store.getters['main/user'],
          auxiliaryIdEvent: eventInfo.person._id,
          auxiliarySectorEvent: eventInfo.person.sector._id,
          permissions: [
            { name: 'planning:create:user', rule: 'isInSameSector' },
            { name: 'planning:create', rule: 'isOwner' },
          ],
        });
      }
      if (!can) return;

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

  th:first-child
    @media (min-width: 768px) and (max-width: 1024px)
      width: 100px;
    @media (min-width: 1025px)
      width: 110px;

  .person
    &-row
      border-right: 1px solid $light-grey;
      height: 100px;
    &-name
      font-weight: 600;
      font-size: 14px;
      @media (max-width: 1024px)
        font-size: 12px;
      @media (max-width: 420px)
        font-size: 8px;
    &-inner-cell
      margin-top: 4px;

  .staffing
    .person
      &-row
        height: auto;
      &-name
        margin: 2px 0 4px;
    td
      position: relative;
      height: 75px;
      z-index: 0;
    .planning-background
      position: relative;
      margin-top: 2px;
      .line
        width: 1px;
        height: 100%;
        background: $grey-3;
        margin: 0;
        position: absolute;
        z-index: -1;

  .planning-hour
    position: absolute;
    color: $light-grey;
    font-size: 12px;
    bottom: -3px;

  .non-staffing
    .planning-background
      @media screen and (max-width: 1024px)
        padding-bottom: 2rem;
      @media screen and (min-width: 1025px)
        padding-bottom: 1rem;

  .to-assign
    background-color: rgba(253, 243, 229, 0.5);

</style>
