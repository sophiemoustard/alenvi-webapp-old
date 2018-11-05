<template>
  <div>
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
      holidays: null
    }
  },
  computed: {
    usePublicTransport () {
      return this.user.administrative.transportInvoice.transportType;
    },
    hasPhoneInvoice () {
      return this.user.administrative.phoneInvoice.driveId;
    }
  },
  async mounted () {
    this.user = await this.$users.getById(this.id);
    this.holidays = currentHolidays;
    console.log(this.holidays);
    this.contracts = this.user.administrative.contracts;
    this.company = this.user.company;
    console.log(moment().monthBusinessDays());
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
