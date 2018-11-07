<template>
  <div v-if="user">
    <h6 class="q-mb-lg">Mois de {{ currentMonth }}</h6>
    <div class="row gutter-profile">
      <div class="col-xs-12 col-md-6">
        <p class="text-weight-bold">Abonnement Transport</p>
        <p>{{ calculateRefunding('transport') }} €</p>
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="text-weight-bold">Abonnement Téléphone</p>
        <p>{{ calculateRefunding('phone') }} €</p>
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="text-weight-bold">Salaire mensuel brut</p>
        <p>{{ salary }} €</p>
      </div>
    </div>
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
      const moments = this.contracts.map(contract => this.$moment(contract.startDate));
      return this.contracts.find(contract => { return this.$moment.max(moments).toISOString() === contract.startDate });
    },
    userCurrentMonthContracts () {
      return this.contracts.filter(contract => this.$moment(contract.endDate).month() === this.$moment().month() ||
      this.$moment(contract.startDate).month() === this.$moment().month());
    },
    isCurrentMonthContract () {
      return this.$moment(this.userLastContract.endDate).month() === this.$moment().month() ||
      this.$moment(this.userLastContract.startDate).month() === this.$moment().month();
    },
    currentMonth () {
      return this.$moment().format('MMMM');
    },
    salary () {
      const workingDays = this.currentWorkingDays.length;
      if (this.userCurrentMonthContracts.length > 1) {
        let salary = 0;
        for (let i = 0, l = this.userCurrentMonthContracts.length; i < l; i++) {
          const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userCurrentMonthContracts[i]);
          const { grossHourlyRate, weeklyHours } = this.userCurrentMonthContracts[i];
          salary += Number.parseFloat((effectiveWorkingDays / workingDays) * 4.33 * grossHourlyRate * weeklyHours);
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
    this.contracts = this.user.administrative.contracts;
    this.company = this.user.company;
  },
  methods: {
    calculateEffectiveWorkingDays (contract) {
      const workingDays = this.currentWorkingDays.length;
      let effectiveWorkingDays = 0;
      if (contract.endDate && !contract.isActive && this.isCurrentMonthContract) {
        effectiveWorkingDays = this.currentWorkingDays.filter(day => this.$moment(day).isSameOrBefore(contract.endDate)).length;
      } else if (contract.startDate && contract.isActive && this.isCurrentMonthContract) {
        effectiveWorkingDays = this.currentWorkingDays.filter(day => this.$moment(day).isSameOrAfter(contract.startDate)).length;
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
      if (!this.userLastContract.isActive && !this.isCurrentMonthContract) return 0;
      const workingDays = this.currentWorkingDays.length;
      let refundAmount = 0;
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
      const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userLastContract);
      // console.log('EFF', effectiveWorkingDays);
      return Number.parseFloat((effectiveWorkingDays / workingDays) * refundAmount).toFixed(2);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
