<template>
  <div class="full-width row relative-position chip-container" @click="indicatorsModal = true">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip :class="['absolute-center', { 'busy': isBusy }]" small text-color="white">
      <span class="chip-indicator">{{ indicators.weeklyHours }}h / {{ indicators.contractHours }}</span>
    </q-chip>

    <q-modal v-model="indicatorsModal" content-classes="modal-container-md">
      <div class="row q-mb-md modal-padding">
        <div class="col-11 row customer-name">
          <img :src="getAvatar(person.picture)" class="avatar">
          <div>{{ person.identity.firstname }} {{ person.identity.lastname.toUpperCase() }}</div>
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span>
            <q-icon name="clear" @click.native="indicatorsModal = false" /></span>
        </div>
      </div>
      <q-tabs align="justify" color="transparent" text-color="primary">
        <q-tab class="col-6" v-for="(tab, index) in tabsContent" :key="index" slot="title" :label="tab.label" :default="tab.default"
          :name="tab.name" :disable="tab.disable" />
        <q-tab-pane class="no-border" key="week_stats" name="week_stats">
          <p style="font-weight:bold">Heures travailées</p>
          <div class="progress-indicator">
            <q-progress :percentage="Math.round(weeklyInterventionsPercentage)" class="intervention" />
            <div class="progress-caption">
              <div>Interventions</div>
              <div> {{ `${Math.round(this.weeklyInterventions)}h` }} -
                {{`${Math.round(weeklyInterventionsPercentage)}%`}}</div>
            </div>
          </div>
          <div class="progress-indicator">
            <q-progress :percentage="Math.round(weeklyInternalHoursPercentage)" class="internal-hours" />
            <div class="progress-caption">
              <div>Interne</div>
              <div>{{ `${Math.round(this.weeklyInternalHours)}h` }} -
                {{`${Math.round(weeklyInternalHoursPercentage)}%`}} </div>
            </div>
          </div>
          <div class="progress-indicator">
            <q-progress :percentage="Math.round(weeklyTravelPercentage)" class="transports" />
            <div class="progress-caption">
              <div>Transports</div>
              <div>{{ `${Math.round(this.weeklyTransports)}h` }} - {{`${Math.round(weeklyTravelPercentage)}%`}}</div>
            </div>
          </div>
        </q-tab-pane>
      </q-tabs>
    </q-modal>
  </div>
</template>

<script>
import { DEFAULT_AVATAR, ABSENCE, INTERVENTION, INTERNAL_HOUR, TRANSIT, DRIVING, PUBLIC_TRANSPORT } from '../../data/constants.js';
import googleMaps from '../../api/GoogleMaps';

export default {
  name: 'ChipAuxiliaryIndicator',
  props: {
    person: { type: Object, default: () => ({ picture: { link: '' }, administrative: {} }) },
    events: { type: Array, default: () => [] },
    startOfWeek: { type: Object, default: () => ({}) },
    endOfWorkingWeek: { type: Object, default: () => ({}) }, // Saturday
    distanceMatrix: { type: Array, default: () => [] },
  },
  data () {
    return {
      indicators: { weeklyHours: 0, contractHours: 0 },
      indicatorsModal: false,
      tabsContent: [
        { label: 'Stats de la semaine', default: true, name: 'week_stats', disable: false },
        { label: 'Stats du mois', default: false, name: 'month_stat', disable: true },
      ],
      weeklyTransports: 0,
    };
  },
  computed: {
    isBusy () {
      if (this.indicators.contractHours === 0) return false;
      return this.indicators.weeklyHours > this.indicators.contractHours;
    },
    days () {
      const range = this.$moment.range(this.startOfWeek, this.endOfWorkingWeek);
      return Array.from(range.by('days'));
    },
    weeklyInternalHours () {
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.type === INTERNAL_HOUR) weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'm', true) / 60;
      });

      return weeklyHours;
    },
    weeklyInternalHoursPercentage () {
      return this.weeklyInternalHours / this.workinHoursTotal * 100;
    },
    weeklyInterventions () {
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.type === INTERVENTION) weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'm', true) / 60;
      });

      return weeklyHours;
    },
    weeklyInterventionsPercentage () {
      return this.weeklyInterventions / this.workinHoursTotal * 100;
    },
    weeklyTravelPercentage () {
      return this.weeklyTransports / this.workinHoursTotal * 100;
    },
    workinHoursTotal () {
      return this.weeklyInternalHours + this.weeklyInterventions + this.weeklyTransports;
    },
  },
  async mounted () {
    await this.getIndicators();
  },
  watch: {
    async events () {
      await this.getIndicators();
    }
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async getIndicators () {
      await this.getTravelHours();
      this.indicators = { weeklyHours: await this.getWeeklyHours(), contractHours: this.getContractHours() };
    },
    // Compute weekly hours
    getWeeklyHours () {
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.type === INTERVENTION || event.type === INTERNAL_HOUR) {
          weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'm', true) / 60;
        }
      });

      weeklyHours += this.weeklyTransports;

      return Math.round(weeklyHours);
    },
    async getTravelHours () {
      let weeklyTransports = 0;
      for (const day of this.days) {
        const eventsOnDay = this.getEventsOnDay(day);
        if (eventsOnDay.length <= 1) continue;

        for (let i = 0; i < eventsOnDay.length - 1; i++) {
          weeklyTransports += await this.getTravelTimeBetweenTwoEvents(eventsOnDay[i], eventsOnDay[i + 1]);
        }
      }

      this.weeklyTransports = weeklyTransports;
    },
    getEventsOnDay (day) {
      return this.events.filter(event => day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd'));
    },
    async getTravelTimeBetweenTwoEvents (eventOrigin, eventDestination) {
      let origins;
      let destinations;
      if (eventOrigin.type === INTERVENTION) origins = eventOrigin.customer.contact.address.fullAddress;
      else if (eventOrigin.type === INTERNAL_HOUR) origins = eventOrigin.location.fullAddress;

      if (eventDestination.type === INTERVENTION) destinations = eventDestination.customer.contact.address.fullAddress;
      else if (eventDestination.type === INTERNAL_HOUR) destinations = eventDestination.location.fullAddress;

      if (!origins || !destinations) return 0;
      const mode = this.person.administrative.transportInvoice.transportType === PUBLIC_TRANSPORT ? TRANSIT : DRIVING;
      let distanceMatrix = this.distanceMatrix.find(dm => dm.origin === origins && dm.destination === destinations && dm.mode === mode);
      if (!distanceMatrix) {
        distanceMatrix = await googleMaps.getDistanceMatrix({ origins, destinations, mode });
      }

      const duration = distanceMatrix && distanceMatrix.duration ? Math.round(distanceMatrix.duration / 60) : 0;
      const timeBetweenEvents = this.$moment(eventDestination.startDate).diff(this.$moment(eventOrigin.endDate), 'minutes');

      /** If there is less than 15 min free between two events (without transport), the remaining time is paid as
       * the auxiliary has not enough time to be free
       */
      return (duration + 15 > timeBetweenEvents) ? timeBetweenEvents / 60 : duration / 60;
    },
    // Compute contract hours
    getAbsencesOnDay (day) {
      const absences = this.events.filter(event =>
        event.type === ABSENCE && day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd')
      );

      let morning = false;
      let afternoon = false;
      if (!absences || absences.length === 0) return { morning, afternoon };

      absences.forEach(abs => {
        if (day.hours(8).isSameOrAfter(abs.startDate)) morning = true;
        if (day.hours(20).isSameOrBefore(abs.endDate)) afternoon = true;
      });

      return { morning, afternoon };
    },
    getCurrentContract (contracts, day) {
      if (!contracts || contracts.length === 0) return [];
      return contracts.find(contract =>
        this.$moment(contract.startDate).isSameOrBefore(this.day) &&
        (!contract.endDate || this.$moment(contract.endDate).isAfter(this.endOfWorkingWeek))
      );
    },
    getContractVersionOnDay (day) {
      if (!this.person || !this.person.administrative || !this.person.administrative.contracts) return null;

      const currentContract = this.getCurrentContract(this.person.administrative.contracts, day);
      if (!currentContract) return null;

      return this.getCurrentContract(currentContract.versions, day);
    },
    getContractHours () {
      let contractHours = 0;
      this.days.forEach(day => {
        const absences = this.getAbsencesOnDay(day);
        if (absences.morning && absences.afternoon) return;

        const version = this.getContractVersionOnDay(day);
        if (!version) return;

        /* 12 : from Monday to Saturday, there are 12 half days */
        if (!absences.morning) contractHours += version.weeklyHours / 12 || 0;
        if (!absences.afternoon) contractHours += version.weeklyHours / 12 || 0;
      });
      return Math.round(contractHours);
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .progress-indicator
    padding: 3px
    border-top: 1px solid $light-grey;
    border-left: 1px solid $light-grey;
    border-right: 1px solid $light-grey;
    &:last-child
      border-bottom: 1px solid $light-grey;

  .progress-caption
    display: flex;
    justify-content: space-between;

  /deep/.q-progress
    height: 10px !important;

    /deep/ .q-progress-track
      background: repeating-linear-gradient(
        45deg,
        $grey-3,
        $grey-3 1px,
        $white 1px,
        $white 3px
      )
      opacity: 0.8;

    &.intervention
      /deep/ .q-progress-model
        color: $light-pink;

    &.internal-hours
      /deep/ .q-progress-model
        color: $light-purple;

    &.transports
      /deep/ .q-progress-model
        color: $primary-dark;

  /deep/ .q-tabs-head
    margin: 0px 24px;

  .q-tab-pane
    padding: 0 24px;
    margin: 24px 0;
    border-left: 5px solid $primary-dark !important;

  .q-tab
    text-transform: none;
    padding: 8px 0;
    display: flex;
    align-items: flex-start;

  /deep/ .q-tabs-position-top > .q-tabs-head .q-tabs-bar
    width: 90%;

</style>
