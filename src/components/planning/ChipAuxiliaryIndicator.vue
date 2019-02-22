<template>
  <div class="full-width row relative-position chip-container">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip :class="['absolute-center', { 'busy': isBusy }]" small text-color="white">
      <span class="chip-indicator">{{ indicators.weeklyHours }}h / {{ indicators.contractHours }}</span>
    </q-chip>
  </div>
</template>

<script>
import { DEFAULT_AVATAR, ABSENCE, INTERVENTION, INTERNAL_HOUR } from '../../data/constants.js';

export default {
  name: 'ChipAuxiliaryIndicator',
  props: {
    person: { type: Object, default: () => ({ picture: { link: '' }, administrative: {} }) },
    events: { type: Array, default: () => [] },
    startOfWeek: { type: Object, default: () => ({}) },
    endOfWorkingWeek: { type: Object, default: () => ({}) },
  },
  computed: {
    isBusy () {
      if (this.indicators.contractHours === 0) return false;
      return this.indicators.weeklyHours > this.indicators.contractHours;
    },
    indicators () {
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.type === INTERVENTION || event.type === INTERNAL_HOUR) {
          weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'm', true) / 60;
        }
      });

      return { weeklyHours: Math.round(weeklyHours), contractHours: this.getAuxiliaryContractHours() };
    },
    days () {
      const range = this.$moment.range(this.startOfWeek, this.endOfWorkingWeek);
      return Array.from(range.by('days'));
    }
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
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
    getAuxiliaryContractHours () {
      let contractHours = 0;
      this.days.forEach(day => {
        const absences = this.getAbsencesOnDay(day);
        if (absences.morning && absences.afternoon) return;

        const version = this.getContractVersionOnDay(day);
        if (!version) return;

        if (!absences.morning) contractHours += version.weeklyHours / 10 || 0;
        if (!absences.afternoon) contractHours += version.weeklyHours / 10 || 0;
      });
      return Math.round(contractHours);
    }
  }
}
</script>
