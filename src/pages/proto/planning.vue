<template>
  <div>
    <div class="planning-container full-width q-pa-md">
      <div class="row justify-between items-center q-mb-md">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek"></q-btn>
        <span>{{ timelineTitle() }}</span>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek"></q-btn>
      </div>
      <table style="width: 100%">
        <thead>
          <th></th>
          <th class="capitalize" v-for="(day, index) in daysHeader" :key="index">
            {{day}}
          </th>
        </thead>
        <tbody>
          <tr class="auxiliaries-row" v-for="(person, index) in persons" :key="index">
            <td class="event-cell" valign="top">
              {{person.firstname}} {{person.lastname}}
            </td>
            <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex" valign="top" class="event-cell"
              @click="$emit('createEvent', { dayIndex, person })">
              <div :id="Math.random().toString(36).substr(2, 5)" draggable @dragstart="drag(dayIndex, event._id)" class="row cursor-pointer"
                v-for="(event, eventIndex) in getOneDayAuxiliaryEvents(person, days[dayIndex])" :key="eventIndex" @click.stop="$emit('editEvent', event._id)">
                <div class="col-12 event">
                  <p class="no-margin">{{ getEventHours(event) }}</p>
                  <p v-if="event.type === INTERVENTION" class="no-margin">{{ event.customer.identity.title }} {{ event.customer.identity.lastname }}</p>
                  <p v-if="event.type === ABSENCE" class="no-margin">{{ displayAbsenceType(event.absence) }}</p>
                  <p v-if="event.type === UNAVAILABILITY" class="no-margin">Indisponibilité</p>
                  <p v-if="event.type === INTERNAL_HOUR" class="no-margin">{{ event.internalHour.name }}</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DatetimePicker from '../../components/form/DatetimePicker.vue';
import ModalSelect from '../../components/form/ModalSelect';
import SearchAddress from '../../components/form/SearchAddress';
import ModalInput from '../../components/form/ModalInput.vue';
import FileUploader from '../../components/form/FileUploader';
import { INTERVENTION, ABSENCE, UNAVAILABILITY, INTERNAL_HOUR, ABSENCE_TYPE } from '../../data/constants';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify';

export default {
  name: 'PlanningManager',
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-search-address': SearchAddress,
    'ni-modal-select': ModalSelect,
    'ni-file-uploader': FileUploader,
  },
  props: {
    events: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
  },
  data () {
    return {
      loading: false,
      beingDragged: {},
      startOfWeek: '',
      days: [],
      maxDays: 7,
      INTERVENTION,
      UNAVAILABILITY,
      ABSENCE,
      INTERNAL_HOUR,
      uploaderKey: 0,
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
    drag (dayIndex, eventId) {
      event.dataTransfer.setData('text', event.target.id);
      // We have source and position saving
      this.beingDragged = this.events.find(ev => ev._id === eventId);
      this.beingDragged.dayIndex = dayIndex;
    },
    async drop (toDay, toPerson) {
      try {
        const data = event.dataTransfer.getData('text');
        if (event.target.nodeName === 'TD') {
          event.target.appendChild(document.getElementById(data));
        }
        if (event.target.nodeName === 'P') {
          event.target.parentNode.parentNode.parentNode.appendChild(document.getElementById(data));
        }
        this.$emit('onDrop', { toDay, toPerson, draggedObject: this.beingDragged });
        NotifyPositive('Évènement modifié');
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.beingDragged = {};
        this.$emit('refreshEvents');
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
  .auxiliaries-row
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

  .auxiliaries-row
    height: 100px
</style>
