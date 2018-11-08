<template>
  <div v-if="user">
    <h6 class="q-mb-lg text-weight-bold">{{ currentMonth }}</h6>
    <p>Salaire brut mensuel : {{ salary }} €</p>
    <p>Remboursement Navigo : {{ calculateRefunding('transport') }} €</p>
    <p>Remboursement forfait téléphone : {{ calculateRefunding('phone') }} €</p>
  </div>
</template>

<script>
import moment from 'moment-business-days';
import Holidays from 'date-holidays';

const holidays = new Holidays('FR');
const date = new Date();
const currentYear = date.getFullYear();
const currentHolidays = holidays.getHolidays(currentYear);
moment.locale('fr', {
  holidays: currentHolidays.map(holiday => holiday.date),
  holidayFormat: 'YYYY-MM-DD HH:mm:ss',
  workingWeekdays: [1, 2, 3, 4, 5, 6]
});

export default {
  props: {
    id: String
  },
  data () {
    return {
      user: null,
      contracts: null,
      company: null,
      currentWorkingDays: null
    }
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    usePublicTransport () {
      return this.user.administrative.transportInvoice.transportType;
    },
    hasPhoneInvoice () {
      return this.user.administrative.phoneInvoice.driveId;
    },
    userLastContract () {
      return this.contracts.find(contract => contract.isActive);
      // const moments = this.contracts.map(contract => this.$moment(contract.startDate));
      // return this.contracts.find(contract => { return this.$moment.max(moments).toISOString() === contract.startDate });
    },
    userCurrentMonthContracts () {
      return this.contracts.filter(contract => this.$moment(contract.endDate).month() === this.$moment().month() ||
      this.$moment(contract.startDate).month() === this.$moment().month());
    },
    currentMonth () {
      return this.$moment().format('MMMM YYYY');
    },
    salary () {
      if (!this.userLastContract || this.userCurrentMonthContracts.length === 0) return 0;
      // console.log('CURRENT CONTRACTS', this.userCurrentMonthContracts);
      const workingDays = this.currentWorkingDays.length;
      if (this.userCurrentMonthContracts.length > 1) {
        let salary = 0;
        for (let i = 0, l = this.userCurrentMonthContracts.length; i < l; i++) {
          const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userCurrentMonthContracts[i]);
          // console.log('EFF', effectiveWorkingDays);
          const { grossHourlyRate, weeklyHours } = this.userCurrentMonthContracts[i];
          salary += Number.parseFloat((effectiveWorkingDays / workingDays) * 4.33 * grossHourlyRate * weeklyHours);
          // console.log('SALARY', Number.parseFloat((effectiveWorkingDays / workingDays) * 4.33 * grossHourlyRate * weeklyHours));
        }
        return salary.toFixed(2);
      } else {
        const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userLastContract);
        const { grossHourlyRate, weeklyHours } = this.userLastContract;
        return Number.parseFloat((effectiveWorkingDays / workingDays) * 4.33 * grossHourlyRate * weeklyHours).toFixed(2);
      }
    }
  },
  async mounted () {
    this.user = await this.$users.getById(this.userProfile._id);
    this.currentWorkingDays = moment().monthBusinessDays();
    this.contracts = this.user.administrative.contracts.filter(contract => contract.status === 'Prestataire');
    this.company = this.user.company;
  },
  methods: {
    isCurrentMonthContract (contract) {
      return this.$moment(contract.endDate).month() === this.$moment().month() ||
      this.$moment(contract.startDate).month() === this.$moment().month();
    },
    calculateEffectiveWorkingDays (contract) {
      const workingDays = this.currentWorkingDays.length;
      let effectiveWorkingDays = 0;
      if (contract.endDate && this.isCurrentMonthContract(contract)) {
        effectiveWorkingDays = this.currentWorkingDays.filter(day => this.$moment(day).isSameOrBefore(contract.endDate, 'day')).length;
      } else if (contract.startDate && contract.isActive && this.isCurrentMonthContract(contract)) {
        effectiveWorkingDays = this.currentWorkingDays.filter(day => this.$moment(day).isSameOrAfter(contract.startDate, 'day')).length;
      } else if (!contract.isActive) {
        effectiveWorkingDays = 0;
      } else {
        effectiveWorkingDays = workingDays;
      }
      return effectiveWorkingDays;
    },
    calculateRefunding (type) {
      if (!this.user.administrative[`${type}Invoice`]) return 0;
      if (!this.user.administrative[`${type}Invoice`].link) return 0;
      if (!this.userLastContract || this.userCurrentMonthContracts.length === 0) return 0;
      const workingDays = this.currentWorkingDays.length;
      let refundAmount = 0;
      let totalRefund = 0;
      switch (type) {
        case 'transport':
          if (this.user.administrative.transportInvoice.transportType !== 'public') return 'Non concerné(e)';
          const currentSub = this.company.rhConfig.transportSubs.find(sub => sub.department === this.user.administrative.contact.zipCode.substring(0, 2));
          refundAmount = currentSub.price;
          break;
        case 'phone':
          refundAmount = this.company.rhConfig.phoneSubRefunding;
          break;
        default:
          break;
      }
      if (this.userCurrentMonthContracts.length > 1) {
        for (let i = 0, l = this.userCurrentMonthContracts.length; i < l; i++) {
          const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userCurrentMonthContracts[i]);
          totalRefund += Number.parseFloat((effectiveWorkingDays / workingDays) * refundAmount);
        }
        return totalRefund.toFixed(2);
      } else {
        const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userLastContract);
        return Number.parseFloat((effectiveWorkingDays / workingDays) * refundAmount).toFixed(2);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables';

  h6
    text-transform: capitalize
  p
    white-space: pre
</style>
