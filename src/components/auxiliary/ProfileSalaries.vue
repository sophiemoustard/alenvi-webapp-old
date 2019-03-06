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
moment.updateLocale('fr', {
  holidays: currentHolidays.map(holiday => holiday.date),
  holidayFormat: 'YYYY-MM-DD HH:mm:ss',
  workingWeekdays: [1, 2, 3, 4, 5, 6]
});

export default {
  name: 'ProfileSalaries',
  data () {
    return {
      user: null,
      contracts: [],
      company: null,
      currentWorkingDays: null
    }
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    userCurrentMonthContracts () {
      return this.contracts.filter(contract => {
        if (contract.endDate) {
          return this.$moment(contract.endDate).isSameOrAfter(this.$moment().startOf('month')) &&
            this.$moment(contract.startDate).isSameOrBefore(this.$moment().endOf('month'));
        }
        return this.$moment(contract.startDate).isSameOrBefore(this.$moment().endOf('month'));
      });
    },
    currentMonth () {
      return this.$moment().format('MMMM YYYY');
    },
    salary () {
      if (this.userCurrentMonthContracts.length === 0) return '0.00';
      const workingDays = this.currentWorkingDays.length;

      let salary = 0;
      for (let contract of this.userCurrentMonthContracts) {
        const { grossHourlyRate, weeklyHours } = contract;
        const effectiveWorkingDays = this.calculateEffectiveWorkingDays(contract);
        if (!effectiveWorkingDays || !grossHourlyRate || !workingDays) salary += 0;
        else salary += Number.parseFloat((effectiveWorkingDays / workingDays) * 4.33 * grossHourlyRate * weeklyHours);
      }

      return salary.toFixed(2);
    }
  },
  async mounted () {
    this.user = await this.$users.getById(this.userProfile._id);
    this.currentWorkingDays = moment().monthBusinessDays();
    for (let contract of this.user.contracts) {
      this.contracts.push(...contract.versions);
    }
    this.company = this.user.company;
  },
  methods: {
    calculateEffectiveWorkingDays (contract) {
      if (!contract.endDate && !contract.isActive) return 0;

      const calculationStart = this.$moment.max([this.$moment().startOf('month'), this.$moment(contract.startDate)]);
      const calculationEnd = contract.endDate
        ? this.$moment.min([this.$moment().endOf('month'), this.$moment(contract.endDate)])
        : this.$moment().endOf('month');

      return calculationStart.businessDiff(moment(calculationEnd));
    },
    calculateRefunding (type) {
      if (!this.userLastContract && this.userCurrentMonthContracts.length === 0) return 0;
      if (!this.user.administrative[`${type}Invoice`]) return 0;
      if (!this.user.administrative[`${type}Invoice`].link) return 0;

      const workingDays = this.currentWorkingDays.length;
      let refundAmount = 0;
      let totalRefund = 0;
      switch (type) {
        case 'transport':
          if (this.user.administrative.transportInvoice.transportType !== 'public') return 'Non concerné(e)';
          if (this.user.contact && this.user.contact.zipCode) {
            const currentSub = this.company.rhConfig.transportSubs.find(sub => sub.department === this.user.contact.zipCode.substring(0, 2));
            refundAmount = currentSub.price;
          }
          break;
        case 'phone':
          refundAmount = this.company.rhConfig.phoneSubRefunding;
          break;
        default:
          break;
      }

      for (let i = 0, l = this.userCurrentMonthContracts.length; i < l; i++) {
        const effectiveWorkingDays = this.calculateEffectiveWorkingDays(this.userCurrentMonthContracts[i]);
        totalRefund += Number.parseFloat((effectiveWorkingDays / workingDays) * refundAmount);
      }
      return totalRefund.toFixed(2);
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
