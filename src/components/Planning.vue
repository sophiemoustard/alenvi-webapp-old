<template>
  <div>
    <div class="planning-container full-width q-pa-md">
      <ni-chips-autocomplete v-model="terms" placeholder="Rechercher un(e) commununauté / auxiliaire" @selected="selectedElements"/>
      <div class="row justify-between items-center q-mb-md">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek"></q-btn>
        <span>{{ timelineTitle() }}</span>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek"></q-btn>
      </div>
      <table style="width: 100%">
        <thead>
          <th></th>
          <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">{{day}}</th>
        </thead>
        <tbody>
          <tr class="person-row" v-for="(person, index) in persons" :key="index">
            <td class="event-cell" valign="top">{{person.identity.firstname}} {{person.identity.lastname}}</td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top"
              class="event-cell" @click="$emit('createEvent', { dayIndex, person })" >
              <template v-for="(event, eventIndex) in getOneDayAuxiliaryEvents(person, days[dayIndex])">
                <div :id="event._id" draggable @dragstart="drag(event._id)" class="row cursor-pointer col-12 event"
                  :key="eventIndex" @click.stop="$emit('editEvent', event._id)">
                  <p class="no-margin">{{ getEventHours(event) }}</p>
                  <p v-if="event.type === INTERVENTION" class="no-margin">{{ event.customer.identity.title }} {{
                    event.customer.identity.lastname }}</p>
                  <p v-if="event.type === ABSENCE" class="no-margin">{{ displayAbsenceType(event.absence) }}</p>
                  <p v-if="event.type === UNAVAILABILITY" class="no-margin">Indisponibilité</p>
                  <p v-if="event.type === INTERNAL_HOUR" class="no-margin">{{ event.internalHour.name }}</p>
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
import ChipsAutocomplete from './ChipsAutocomplete';

export default {
  name: 'PlanningManager',
  components: {
    NiChipsAutocomplete: ChipsAutocomplete,
  },
  props: {
    events: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
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
    }
  },
  computed: {
    daysHeader () {
      return this.days.map(day => this.$moment(day).format('dd DD'));
    },
  },
  async mounted () {
    this.startOfWeek = this.$moment().startOf('week');
    this.getTimelineDays();
    this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
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
    selectedElements (el) {
      // Add elements filtered to planning renderer
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

  .planning-container
    background: white

  .event
    border: 1px solid black
    padding: 2px
    margin-bottom: 3px

  .person-row
    border-right: 1px solid $light-grey;
    height: 100px;

</style>
