<template>
  <div :class="[{ 'planning': !toggleDrawer }]">
    <div class="row items-center planning-header q-mb-md">
      <div class="col-xs-12 col-md-5 planning-search">
        <ni-chips-autocomplete-auxiliaries-sectors v-model="terms" @updatedFilter="updatedFilter"
          @selected="selectedFilter" @remove="removedFilter" class="planning-search" />
      </div>
      <div class="col-xs-10 col-md-6 row items-center justify-center">
        <div class="planning-month" @click="datimeModal = !datimeModal">
          <span class="capitalize">{{ timelineTitle() }}</span>
          <q-icon name="arrow_drop_down" />
          <q-popover v-model="datimeModal">
            <q-datetime-picker minimal @input="goToWeek" :value="targetDate" />
          </q-popover>
        </div>
        <div class="row justify-around planning-actions">
          <q-btn icon="chevron_left" flat round @click="goToNextWeek(-7)"></q-btn>
          <q-btn icon="chevron_right" flat round @click="goToNextWeek(7)"></q-btn>
          <q-btn icon="today" flat round @click="goToToday"></q-btn>
        </div>
      </div>
      <div class="col-xs-2 col-md-1">
        <div class="row justify-end">
          <q-btn icon="playlist_play" round flat />
        </div>
      </div>
    </div>
    <div class="planning-container full-width">
      <table style="width: 100%">
        <thead>
          <th></th>
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
                <div v-if="personKey === 'auxiliary'" class="q-mb-md">
                  <ni-chip :data="person" />
                </div>
                <div class="person-name overflow-hidden-nowrap">{{ formatPersonName(person) }}</div>
              </div>
            </td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
              @click="$emit('createEvent', { dayIndex, person })">
              <template v-for="(event, eventIndex) in getOneDayPersonEvents(person, days[dayIndex])">
                <div :id="event._id" draggable @dragstart="drag(event._id)" :class="['row', 'cursor-pointer', 'event', `event-${event.type}`]"
                  :key="eventIndex" @click.stop="$emit('editEvent', event._id)">
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
</template>

<script>
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, ABSENCE_TYPE } from '../data/constants';
import { NotifyNegative } from './popup/notify';
import NiChip from './Chip';
import ChipsAutocompleteAuxiliariesSectors from './ChipsAutocompleteAuxiliariesSectors';

export default {
  name: 'PlanningManager',
  components: {
    'ni-chip': NiChip,
    'ni-chips-autocomplete-auxiliaries-sectors': ChipsAutocompleteAuxiliariesSectors,
  },
  props: {
    events: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
    selectedFilter: { type: Function, default: () => {} },
    removedFilter: { type: Function, default: () => {} },
    updatedFilter: { type: Function, default: () => {} },
    personKey: { type: String, default: 'auxiliary' }
  },
  data () {
    return {
      terms: [],
      loading: false,
      draggedObject: {},
      startOfWeek: '',
      days: [],
      maxDays: 7,
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      datimeModal: false,
      targetDate: '',
    }
  },
  computed: {
    toggleDrawer () {
      return this.$store.getters['main/toggleDrawer'];
    },
    daysHeader () {
      return this.days.map(day => {
        return {
          name: this.$moment(day).format('dd'),
          number: this.$moment(day).format('DD'),
          moment: day
        }
      });
    },
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
  },
  watch: {
    startOfWeek: function () {
      this.targetDate = this.startOfWeek.toISOString();
    },
  },
  methods: {
    // Table
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    timelineTitle () {
      if (this.startOfWeek === '') return '';
      if (this.$moment(this.startOfWeek).month() === this.$moment(this.endOfWeek()).month()) return this.$moment(this.startOfWeek).format('MMMM YYYY');
      return `${this.$moment(this.startOfWeek).format('MMM')} - ${this.$moment(this.endOfWeek()).format('MMM YYYY')}`
    },
    goToNextWeek (dayRange) {
      this.startOfWeek.add(dayRange, 'd');
      this.updateTimeline();
    },
    goToToday (value) {
      this.startOfWeek = this.$moment().startOf('week');
      this.updateTimeline();
    },
    goToWeek (value) {
      this.startOfWeek = this.$moment(value).startOf('week');
      this.updateTimeline();
      this.datimeModal = false;
    },
    updateTimeline () {
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    getTimelineDays () {
      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
    },
    isCurrentDay (momentDay) {
      return this.$moment(momentDay).isSame(new Date(), 'day');
    },
    formatPersonName (person) {
      return this.personKey === 'auxiliary'
        ? `${person.identity.firstname.slice(0, 1)}. ${person.identity.lastname}`.toUpperCase()
        : `${person.identity.title} ${person.identity.lastname}`.toUpperCase();
    },
    // Event display
    getOneDayPersonEvents (person, day) {
      return this.events
        .filter(event => event[this.personKey] ? event[this.personKey]._id === person._id : false)
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          let dayEvent = { ...event };
          if (!this.$moment(day).isSame(event.startDate, 'day')) dayEvent.startDate = this.$moment(day).hour(8).toISOString();
          if (!this.$moment(day).isSame(event.endDate, 'day')) dayEvent.endDate = this.$moment(day).hour(20).toISOString();

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPE.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    eventTitle (event) {
      if (this.personKey === 'customer') {
        return `${event.auxiliary.identity.firstname.slice(0, 1)}. ${event.auxiliary.identity.lastname}`.toUpperCase();
      }
      return event.customer.identity.lastname.toUpperCase();
    },
    // Drag & drop
    drag (eventId) {
      this.draggedObject = this.events.find(ev => ev._id === eventId);
    },
    async drop (toDay, toPerson) {
      try {
        this.$emit('onDrop', { toDay, toPerson, draggedObject: this.draggedObject });
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.draggedObject = {};
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  table
    border-collapse: collapse;
    table-layout: fixed;
    border-style: hidden;

  td, th
    border-left: 1px solid $light-grey;
    border-right: 1px solid $light-grey;

  td
    padding: 0px 6px 6px 6px;

    &:before
      content: "";
      display: block;
      margin: 0 auto 5px;
      width: 98%;
      border-bottom: 1px solid $light-grey;

  th
    & .days
        &-header
          padding: 8px 0px 8px 0px
          width: 100%
        &-name
          font-size: 1.125rem
          color: #777777
        &-number
          font-size: 1.5rem
          font-weight: 600
    & .current-day
      border-radius: 4px
      padding: 0px 5px
      background: $primary
      color: white

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

  .event
    border-radius: 2px
    padding: 6px 4px
    margin-bottom: 1px
    margin-top: 6px
    &-title
      font-size: 0.875rem
      font-weight: 600
    &-period
      font-size: 0.6875rem
      color: $dark-grey
    &-intervention
      background: $light-pink
    &-internalHour
      background: rgba($primary-dark, 0.25)
    &-absence
      background: $grey-3
    &-unavailability
      background: repeating-linear-gradient(
        45deg,
        $grey-3,
        $grey-3 3px,
        $white 3px,
        $white 7px
      )

  .planning
    padding-left: 30px;
    @media screen and (max-width: 677px)
      padding-left: 0px;
    &-container
      background: white
      padding: 5px 5px
      @media(max-width: 767px)
        padding: 2px
    &-header
      margin-left: 38px
      margin-right: 38px
      @media(max-width: 767px)
        margin-left: 19px
        margin-right: 19px
    &-month
      font-size: 28px
      @media screen and (max-width: 677px)
        width: 60%;
        font-size: 22px
      .q-icon
        font-size: 0.8em;
        margin: 5px;
    &-search
      @media(max-width: 767px)
        margin-bottom: 5px
    &-actions
      @media screen and (min-width: 678px)
        min-width: 150px;
      @media screen and (max-width: 677px)
        width: 30%;
      display: flex;
</style>
