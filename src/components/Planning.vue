<template>
  <div>
    <div :class="['planning-container', 'full-width', 'q-pa-md', { 'q-pl-xl': !toggleDrawer }]">
      <div class="row justify-between items-center q-mb-md">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek"></q-btn>
        <span>{{ timelineTitle() }}</span>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek"></q-btn>
      </div>
      <q-chips-input v-model="value" placeholder="Rechercher un(e) commununauté / auxiliaire">
        <q-autocomplete @search="search" @selected="selected" />
      </q-chips-input>
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
              <div class="q-my-sm">
                <div class="q-mb-md">
                  <ni-chip :data="person"></ni-chip>
                </div>
                <div class="person-name">
                  {{ formatPersonName(person) }}
                </div>
              </div>
            </td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
              @click="$emit('createEvent', { dayIndex, person })" >
              <template v-for="(event, eventIndex) in getOneDayAuxiliaryEvents(person, days[dayIndex])">
                <div :id="event._id" draggable @dragstart="drag(event._id)" :class="['row', 'cursor-pointer', 'event', `event-${event.type}`, 'q-mt-sm']"
                  :key="eventIndex" @click.stop="$emit('editEvent', event._id)">
                  <div class="col-12 event-title">
                    <p v-if="event.type === INTERVENTION" class="no-margin ellipsis">{{ event.customer.identity.title }} {{
                      event.customer.identity.lastname }}</p>
                    <p v-if="event.type === ABSENCE" class="no-margin ellipsis">{{ displayAbsenceType(event.absence) }}</p>
                    <p v-if="event.type === UNAVAILABILITY" class="no-margin ellipsis">Indisponibilité</p>
                    <p v-if="event.type === INTERNAL_HOUR" class="no-margin ellipsis">{{ event.internalHour.name }}</p>
                  </div>
                  <p class="no-margin event-period ellipsis">{{ getEventHours(event) }}</p>
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

export default {
  name: 'PlanningManager',
  components: {
    'ni-chip': NiChip
  },
  props: {
    events: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
  },
  data () {
    return {
      value: [],
      loading: false,
      draggedObject: {},
      startOfWeek: '',
      days: [],
      maxDays: 7,
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
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
    toggleDrawer (val) {
      console.log('toggle drawer', val);
    }
  },
  methods: {
    // Table
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    timelineTitle () {
      return `${this.$moment(this.startOfWeek).format('DD/MM')} - ${this.$moment(this.endOfWeek()).format('DD/MM')}`;
    },
    goToPreviousWeek () {
      this.startOfWeek.subtract(7, 'd');
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    goToNextWeek () {
      this.startOfWeek.add(7, 'd');
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
      return `${person.identity.firstname.slice(0, 1)}. ${person.identity.lastname}`.toUpperCase();
    },
    // Event display
    getOneDayAuxiliaryEvents (auxiliary, day) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliary._id)
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
    async search (terms, done) {
      try {
        console.log('searched');
        const res = [{
          label: 'Commu 1',
          value: '1a*'
        }, {
          label: 'Commu 2',
          value: '1b*'
        }, {
          label: 'Commu 2',
          value: '1c*'
        }, {
          label: 'Ghislaine Dubois',
          value: '111111'
        }, {
          label: 'Irlène Guarrigues',
          value: '222222'
        }];
        done(res);
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    selected () {
      console.log('selected');
    }
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
    padding: 5px 10px;

    &:before
      content: "";
      display: block;
      margin: 0 auto 5px;
      width: 80%;
      border-bottom: 1px solid $light-grey;

  th
    & .days
        &-header
          padding: 8px 0px 16px 0px
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

  .planning-container
    background: white

  .person-row
    border-right: 1px solid $light-grey;
    height: 100px;

  .person-name
    font-weight: 600
    font-size: 14px
    @media(max-width: 1024px)
      font-size: 12px
    @media(max-width: 420px)
      font-size: 8px

  .event
    border-radius: 2px
    padding: 8px 6px
    margin-bottom: 3px
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

</style>
