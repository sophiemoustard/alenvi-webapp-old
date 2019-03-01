<template>
  <div class="full-width row relative-position chip-container" @click="indicatorsModal = true">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip :class="['absolute-center', { 'busy': isBusy }]" small text-color="white">
      <span class="chip-indicator">{{ indicators.weeklyHours }}h / {{ indicators.contractHours }}</span>
    </q-chip>

    <!-- Indicators modal -->
    <q-modal v-model="indicatorsModal" content-classes="modal-container-md">
      <div class="row q-mb-md modal-padding">
        <div class="col-11 row person-name">
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
        <q-tab-pane class="no-border economic-indicators" key="week_stats" name="week_stats">
          <p style="font-weight:bold">Heures travaillées</p>
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
            <q-progress :percentage="Math.round(weeklyPaidTransportsPercentage)" class="transports" />
            <div class="progress-caption">
              <div>Transports</div>
              <div>{{ `${Math.round(this.weeklyPaidTransports)}h` }} -
                {{`${Math.round(weeklyPaidTransportsPercentage)}%`}}</div>
            </div>
          </div>
        </q-tab-pane>
      </q-tabs>
      <div class="quality-indicators">
        <div class="quality-indicators-item"><span class="highlight">{{ `${Math.round(weeklyTotalTransports)}h` }}</span>
          de transports dont <span class="highlight">{{ `${Math.round(weeklyPaidTransports)}h` }}</span> remunérées</div>
        <div class="quality-indicators-item"><span class="highlight">{{ customersCount }}</span> bénéficiaires
          accompagnés, <span class="highlight">{{ `${Math.round(averageTimeByCustomer)}h` }}</span> en moyenne</div>
        <div class="quality-indicators-item"><span class="highlight">{{ `${Math.round(weeklyBreak)}h` }}</span> de
          coupure, incluant transport</div>
      </div>
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
      breakInfo: [],
      weeklyInternalHours: 0,
      weeklyInterventions: 0,
      weeklyPaidTransports: 0,
      weeklyTotalTransports: 0,
      weeklyBreak: 0,
      customersCount: 0,
      averageTimeByCustomer: 0,
    };
  },
  computed: {
    isBusy () {
      return this.indicators.contractHours !== 0 && this.indicators.weeklyHours > this.indicators.contractHours;
    },
    days () {
      const range = this.$moment.range(this.startOfWeek, this.endOfWorkingWeek);
      return Array.from(range.by('days'));
    },
    weeklyHours () {
      return Math.round(this.weeklyInternalHours + this.weeklyInterventions + this.weeklyPaidTransports);
    },
    totalWorkingHours () {
      return this.weeklyInternalHours + this.weeklyInterventions + this.weeklyPaidTransports;
    },
    weeklyInternalHoursPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInternalHours / this.totalWorkingHours * 100;
    },
    weeklyInterventionsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInterventions / this.totalWorkingHours * 100;
    },
    weeklyPaidTransportsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyPaidTransports / this.totalWorkingHours * 100;
    },
    transportMode () {
      return this.person.administrative.transportInvoice.transportType === PUBLIC_TRANSPORT ? TRANSIT : DRIVING;
    },
  },
  async mounted () {
    await this.getIndicators();
  },
  watch: {
    async events () {
      await this.getIndicators();
    },
    breakInfo () {
      this.computeIndicatorsFromBreakInfo();
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async getIndicators () {
      await this.getBreakInfo();
      this.computeIndicatorsFromEvents();
      this.indicators = { weeklyHours: this.weeklyHours, contractHours: this.getContractHours() };
    },
    // Compute indicators
    computeIndicatorsFromBreakInfo () {
      let weeklyPaidTransports = 0;
      let weeklyTotalTransports = 0;
      let weeklyBreak = 0;
      for (const info of this.breakInfo) {
        if (info.timeBetween) weeklyBreak += info.timeBetween;
        if (!info.isFirstOrLast) weeklyPaidTransports += info.transportDuration;
        weeklyTotalTransports += info.transportDuration;
      };

      this.weeklyBreak = weeklyBreak / 60;
      this.weeklyPaidTransports = weeklyPaidTransports / 60;
      this.weeklyTotalTransports = weeklyTotalTransports / 60;
    },
    computeIndicatorsFromEvents () {
      let weeklyInternalHours = 0;
      let weeklyInterventions = 0;
      let hoursByCustomer = {}
      for (const event of this.events) {
        if (event.type === INTERNAL_HOUR) weeklyInternalHours += this.$moment(event.endDate).diff(event.startDate, 'm', true);
        if (event.type === INTERVENTION) {
          weeklyInterventions += this.$moment(event.endDate).diff(event.startDate, 'm', true);
          if (!Object.keys(hoursByCustomer).includes(event.customer._id)) hoursByCustomer[event.customer._id] = 0;
          const interventionTime = this.$moment(event.endDate).diff(event.startDate, 'm', true);
          hoursByCustomer[event.customer._id] += interventionTime;
        }
      };

      this.weeklyInternalHours = weeklyInternalHours / 60;
      this.weeklyInterventions = weeklyInterventions / 60;
      this.customersCount = Object.keys(hoursByCustomer).length;
      this.averageTimeByCustomer = this.customersCount === 0 ? 0
        : Object.values(hoursByCustomer).reduce((acc, hours) => acc + hours, 0) / 60 / this.customersCount;
    },
    async getBreakInfo () {
      const breakInfo = [];
      for (const day of this.days) {
        const eventsOnDay = this.getEventsOnDay(day);
        if (eventsOnDay.length <= 1) continue;

        const firstTransportInfo = await this.getFirstTransportInfo(eventsOnDay[0]);
        if (firstTransportInfo) breakInfo.push(firstTransportInfo);
        const lastTransportInfo = await this.getLastTransportInfo(eventsOnDay[eventsOnDay.length - 1]);
        if (lastTransportInfo) breakInfo.push(lastTransportInfo);

        for (let i = 0; i < eventsOnDay.length - 1; i++) {
          const transportInfo = await this.getBreakInfoBetweenTwoEvents(eventsOnDay[i], eventsOnDay[i + 1]);
          if (transportInfo) breakInfo.push(transportInfo);
        }
      }

      this.breakInfo = breakInfo;
    },
    async getFirstTransportInfo (event) {
      if (!this.person.contact || !this.person.contact.address || !this.person.contact.address.fullAddress) return null;
      const destinations = this.getEventAddress(event);
      if (!destinations) return null;
      const transportDuration = await this.getTransportDuration(this.person.contact.address.fullAddress, destinations);

      return { destination: event._id, transportDuration, isFirstOrLast: true };
    },
    async getLastTransportInfo (event) {
      if (!this.person.contact || !this.person.contact.address || !this.person.contact.address.fullAddress) return null;
      const origins = this.getEventAddress(event);
      if (!origins) return null;
      const transportDuration = await this.getTransportDuration(origins, this.person.contact.address.fullAddress);

      return { origin: event._id, transportDuration, isFirstOrLast: true };
    },
    getEventAddress (event) {
      let address;
      if (event.type === INTERVENTION && event.customer && event.customer.contact && event.customer.contact.address) {
        address = event.customer.contact.address.fullAddress;
      } else if (event.type === INTERNAL_HOUR && event.location) address = event.location.fullAddress;

      return !address ? null : address;
    },
    async getTransportDuration (origins, destinations) {
      let distanceMatrix = this.distanceMatrix
        .find(dm => dm.origin === origins && dm.destination === destinations && dm.mode === this.transportMode);
      if (!distanceMatrix) {
        distanceMatrix = await googleMaps.getDistanceMatrix({ origins, destinations, mode: this.transportMode });
      }

      return distanceMatrix && distanceMatrix.duration ? Math.round(distanceMatrix.duration / 60) : 0;
    },
    getEventsOnDay (day) {
      return this.events
        .filter(event => day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd') &&
          [INTERVENTION, INTERNAL_HOUR].includes(event.type))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    async getBreakInfoBetweenTwoEvents (eventOrigin, eventDestination) {
      const origins = this.getEventAddress(eventOrigin);
      const destinations = this.getEventAddress(eventDestination);
      if (!origins || !destinations) return {};

      const transportDuration = await this.getTransportDuration(origins, destinations);
      const timeBetween = this.$moment(eventDestination.startDate).diff(this.$moment(eventOrigin.endDate), 'minutes');

      return {
        origin: eventOrigin._id,
        destination: eventDestination._id,
        transportDuration,
        timeBetween,
        isFirstOrLast: false,
      };
    },
    // Compute contract hours
    getAbsencesOnDay (day) {
      const absences = this.events.filter(event =>
        event.type === ABSENCE && day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd')
      );

      let morning = false;
      let afternoon = false;
      if (!absences || absences.length === 0) return { morning, afternoon };

      for (const abs of absences) {
        if (day.hours(8).isSameOrAfter(abs.startDate)) morning = true;
        if (day.hours(20).isSameOrBefore(abs.endDate)) afternoon = true;
      };

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
      for (const day of this.days) {
        const absences = this.getAbsencesOnDay(day);
        if (absences.morning && absences.afternoon) continue;

        const version = this.getContractVersionOnDay(day);
        if (!version) continue;

        /* 12 : from Monday to Saturday, there are 12 half days */
        if (!absences.morning) contractHours += version.weeklyHours / 12 || 0;
        if (!absences.afternoon) contractHours += version.weeklyHours / 12 || 0;
      };
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

  .highlight
    color: $primary
    font-weight: bold

  .economic-indicators
    padding: 0 24px;
    margin: 24px 0;
    border-left: 5px solid $primary-dark !important;

  .quality-indicators
    padding: 0 24px;
    margin-bottom: 24px;
    border-left: 5px solid $primary !important;

  .quality-indicators-item
    border-top: 1px solid $light-grey;
    padding: 10px 0;

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

  .q-tab
    text-transform: none;
    padding: 8px 0;
    display: flex;
    align-items: flex-start;

  /deep/ .q-tabs-position-top > .q-tabs-head .q-tabs-bar
    width: 90%;

</style>
