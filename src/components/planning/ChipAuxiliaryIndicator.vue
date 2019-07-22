<template>
  <div :class="[{ 'highlight': hasActiveCompanyContractOnEvent },  'full-width', 'row', 'relative-position', 'chip-container']"
    @click="openIndicatorsModal">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip v-if="hasActiveCompanyContractOnEvent" :class="['absolute-center', { 'busy': isBusy }]" small text-color="white">
      <q-spinner-dots v-if="loading" />
      <span v-else class="chip-indicator">{{ ratio.weeklyHours }}h / {{ ratio.contractHours }}</span>
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
      <q-tabs align="justify" color="transparent" text-color="primary" v-model="selectedTab">
        <q-tab class="col-6" v-for="(tab, index) in tabsContent" :key="index" slot="title" :label="tab.label" :default="tab.default"
          :name="tab.name" />
        <q-tab-pane class="no-border" v-for="(tab, index) in tabsContent" :key="index" :name="tab.name">
          <ni-auxiliary-indicators :total-working-hours="totalWorkingHours" :weekly-interventions="weeklyInterventions"
            :weekly-internal-hours="weeklyInternalHours" :weekly-paid-transports="weeklyPaidTransports"
            :customers-count="customersCount" :average-time-by-customer="averageTimeByCustomer"
            :weekly-break="weeklyBreak" :time-unit="tab.name" />
        </q-tab-pane>
      </q-tabs>
    </q-modal>
  </div>
</template>

<script>
import AuxiliaryIndicators from '../AuxiliaryIndicators';
import {
  DEFAULT_AVATAR,
  ABSENCE,
  INTERVENTION,
  INTERNAL_HOUR,
  TRANSIT,
  DRIVING,
  PUBLIC_TRANSPORT,
  WEEK_STATS,
  MONTH_STATS,
  COMPANY_CONTRACT,
  DAILY,
} from '../../data/constants.js';
import googleMaps from '../../api/GoogleMaps';
import { getPaidTransport } from '../../helpers/planning';

export default {
  name: 'ChipAuxiliaryIndicator',
  components: {
    'ni-auxiliary-indicators': AuxiliaryIndicators,
  },
  props: {
    person: { type: Object, default: () => ({ picture: { link: '' }, administrative: {}, contracts: [] }) },
    events: { type: Array, default: () => [] },
    startOfWeekAsString: { type: String, default: '' },
    distanceMatrix: { type: Array, default: () => [] },
  },
  data () {
    return {
      loading: false,
      ratio: { weeklyHours: 0, contractHours: 0 },
      indicatorsModal: false,
      tabsContent: [
        { label: 'Stats de la semaine', default: true, name: WEEK_STATS },
        { label: 'Stats du mois', default: false, name: MONTH_STATS },
      ],
      breakInfo: [],
      weeklyInternalHours: 0,
      weeklyInterventions: 0,
      weeklyPaidTransports: 0,
      weeklyBreak: 0,
      customersCount: 0,
      averageTimeByCustomer: 0,
      selectedTab: WEEK_STATS,
      monthEvents: [],
    };
  },
  computed: {
    isBusy () {
      return this.ratio.contractHours !== 0 && this.ratio.weeklyHours > this.ratio.contractHours;
    },
    endOfWeek () {
      return this.$moment(this.startOfWeekAsString).endOf('w').toISOString();
    },
    days () {
      let range;
      if (this.selectedTab === WEEK_STATS) range = this.$moment.range(this.startOfWeekAsString, this.endOfWeek);
      else {
        const start = this.$moment(this.startOfWeekAsString).startOf('month');
        const end = this.$moment(this.startOfWeekAsString).endOf('month');
        range = this.$moment.range(start, end);
      }

      return Array.from(range.by('days'));
    },
    totalWorkingHours () {
      return this.weeklyInternalHours + this.weeklyInterventions + this.weeklyPaidTransports;
    },
    transportMode () {
      return this.person.administrative.transportInvoice.transportType === PUBLIC_TRANSPORT ? TRANSIT : DRIVING;
    },
    selectedEvents () {
      return this.selectedTab === WEEK_STATS ? this.events : this.monthEvents;
    },
    hasActiveCompanyContractOnEvent () {
      if (!this.person.contracts || this.person.contracts.length === 0) return false;
      if (!this.person.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = this.person.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return (this.$moment(contract.startDate).isSameOrBefore(this.endOfWeek) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(this.endOfWeek))) ||
          (this.$moment(contract.startDate).isSameOrBefore(this.startOfWeekAsString) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(this.startOfWeekAsString)));
      });
    },
    companyContracts () {
      return this.person.contracts ? this.person.contracts.filter(contract => contract.status === COMPANY_CONTRACT) : [];
    },
  },
  async mounted () {
    if (!this.hasActiveCompanyContractOnEvent) return;
    await this.getRatio();
  },
  watch: {
    async selectedEvents () {
      if (!this.hasActiveCompanyContractOnEvent) return;
      await this.computeIndicators();
    },
    async events () {
      if (!this.hasActiveCompanyContractOnEvent) return;
      this.selectedTab = WEEK_STATS;
      await this.getRatio();
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async computeIndicators () {
      await this.computeBreakInfo();
      this.computeIndicatorsFromBreakInfo();
      this.computeIndicatorsFromEvents();
    },
    async getRatio () {
      try {
        this.loading = true;
        this.ratio = { weeklyHours: 0, contractHours: 0 };
        await this.computeIndicators();
        this.ratio = { weeklyHours: Math.round(this.totalWorkingHours), contractHours: this.getContractHours() };
      } catch (e) {
        this.ratio = { weeklyHours: 0, contractHours: 0 };
      } finally {
        this.loading = false;
      }
    },
    async openIndicatorsModal () {
      if (!this.hasActiveCompanyContractOnEvent) return;
      try {
        this.monthEvents = await this.$events.list({
          startDate: this.$moment(this.startOfWeekAsString).startOf('month').toDate(),
          endDate: this.$moment(this.startOfWeekAsString).endOf('month').toDate(),
          auxiliary: this.person._id,
        });
      } catch (e) {
        this.monthEvents = [];
      } finally {
        this.indicatorsModal = true;
      }
    },
    // Compute indicators
    computeIndicatorsFromBreakInfo () {
      let weeklyPaidTransports = 0;
      let weeklyBreak = 0;
      for (const info of this.breakInfo) {
        if (info.timeBetween) weeklyBreak += info.timeBetween;
        if (info.transportDuration > 0) weeklyPaidTransports += getPaidTransport(info.transportDuration, info.timeBetween);
      };

      this.weeklyBreak = weeklyBreak / 60;
      this.weeklyPaidTransports = weeklyPaidTransports / 60;
    },
    computeIndicatorsFromEvents () {
      let weeklyInternalHours = 0;
      let weeklyInterventions = 0;
      let hoursByCustomer = {}
      for (const event of this.selectedEvents) {
        const interventionTime = this.$moment(event.endDate).diff(event.startDate, 'm', true);
        if (event.type === INTERNAL_HOUR) weeklyInternalHours += interventionTime;
        if (event.type === INTERVENTION) {
          if (!Object.keys(hoursByCustomer).includes(event.customer._id)) hoursByCustomer[event.customer._id] = 0;
          hoursByCustomer[event.customer._id] += interventionTime;
          weeklyInterventions += interventionTime;
        }
      };

      this.weeklyInternalHours = weeklyInternalHours / 60;
      this.weeklyInterventions = weeklyInterventions / 60;
      this.customersCount = Object.keys(hoursByCustomer).length;
      this.averageTimeByCustomer = this.customersCount === 0 ? 0
        : Object.values(hoursByCustomer).reduce((acc, hours) => acc + hours, 0) / 60 / this.customersCount;
    },
    async computeBreakInfo () {
      const breakInfo = [];
      for (const day of this.days) {
        const eventsOnDay = this.getEventsOnDay(day);
        if (eventsOnDay.length <= 1) continue;

        for (let i = 0; i < eventsOnDay.length - 1; i++) {
          const transportInfo = await this.getBreakInfoBetweenTwoEvents(eventsOnDay[i], eventsOnDay[i + 1]);
          if (transportInfo) breakInfo.push(transportInfo);
        }
      }

      this.breakInfo = breakInfo;
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
        .find(dm => dm.origins === origins && dm.destinations === destinations && dm.mode === this.transportMode);
      if (!distanceMatrix) {
        distanceMatrix = await googleMaps.getDistanceMatrix({ origins, destinations, mode: this.transportMode });
      }

      return distanceMatrix && distanceMatrix.duration ? Math.round(distanceMatrix.duration / 60) : 0;
    },
    getEventsOnDay (day) {
      return this.selectedEvents
        .filter(event => day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd') &&
          [INTERVENTION, INTERNAL_HOUR].includes(event.type))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    async getBreakInfoBetweenTwoEvents (eventOrigin, eventDestination) {
      const timeBetween = this.$moment(eventDestination.startDate).diff(this.$moment(eventOrigin.endDate), 'minutes');
      const breakInfo = {
        origin: eventOrigin._id,
        destination: eventDestination._id,
        timeBetween,
      }

      const origins = this.getEventAddress(eventOrigin);
      const destinations = this.getEventAddress(eventDestination);
      if (!origins || !destinations) {
        return { ...breakInfo, transportDuration: 0 };
      }

      const transportDuration = await this.getTransportDuration(origins, destinations);

      return { ...breakInfo, transportDuration };
    },
    // Compute contract hours
    getCurrentContract (contracts, day) {
      if (!contracts || contracts.length === 0) return [];
      return contracts.find(contract =>
        this.$moment(contract.startDate).isSameOrBefore(day) &&
        (!contract.endDate || this.$moment(contract.endDate).isAfter(day))
      );
    },
    getContractVersionOnDay (day) {
      if (!this.companyContracts || this.companyContracts.length === 0) return null;

      const currentContract = this.getCurrentContract(this.companyContracts, day);
      if (!currentContract) return null;

      return this.getCurrentContract(currentContract.versions, day);
    },
    getContractHours () {
      let contractHours = 0;
      const contractDaysRange = Array.from(this.$moment.range(this.startOfWeekAsString, this.$moment(this.endOfWeek).subtract(1, 'd')).by('days')) // from Monday to Saturday
      for (const day of contractDaysRange) {
        const absences = this.events.filter(event =>
          event.type === ABSENCE &&
          day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd')
        );
        const dailyAbsence = absences.find(abs => abs.absenceNature === DAILY);
        if (dailyAbsence) continue;

        const hourlyAbsence = absences.length === 0 ? 0 : absences.reduce(
          (total, abs) => total + (this.$moment(abs.endDate).diff(abs.startDate, 'm') / 60),
          0
        );

        const version = this.getContractVersionOnDay(day);
        if (!version) continue;

        contractHours += version.weeklyHours / 6 || 0; // 6 : from Monday to Saturday, there are 6 half days
        contractHours -= hourlyAbsence;
      };
      return Math.round(contractHours);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .highlight
    cursor: pointer;
  .highlight:hover
    .avatar
    .q-chip
      box-shadow: 0 0 1px 1px $primary-dark;

  .q-tab-pane
    padding: 0;

  /deep/ .q-tabs-head
    margin: 0px 24px;

  .q-tab
    text-transform: none;
    padding: 8px 0;
    display: flex;
    align-items: flex-start;

  /deep/ .q-tabs-position-top > .q-tabs-head .q-tabs-bar
    width: 90%;

  /deep/ .q-tab:hover:before
    background: none;

  /deep/ .q-ripple-container
    display: none;

</style>
