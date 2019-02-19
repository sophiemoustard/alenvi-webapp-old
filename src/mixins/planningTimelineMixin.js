import { ABSENCE_TYPE } from '../data/constants';

export const planningTimelineMixin = {
  data () {
    return {
      targetDate: '',
      datimeModal: false,
    };
  },
  computed: {
    toggleDrawer () {
      return this.$store.getters['main/toggleDrawer'];
    },
    daysHeader () {
      return this.days.map(day => {
        return {
          name: this.$moment(day).format('dd'),
          number: this.$moment(day).format('DD'),
          moment: day
        }
      });
    },
  },
  watch: {
    startOfWeek: function () {
      this.targetDate = this.startOfWeek.toISOString();
    },
  },
  methods: {
    getTimelineDays () {
      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
    },
    isCurrentDay (momentDay) {
      return this.$moment(momentDay).isSame(new Date(), 'day');
    },
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    timelineTitle () {
      if (this.startOfWeek === '') return '';
      if (this.$moment(this.startOfWeek).month() === this.$moment(this.endOfWeek()).month()) return this.$moment(this.startOfWeek).format('MMMM YYYY');
      return `${this.$moment(this.startOfWeek).format('MMM')} - ${this.$moment(this.endOfWeek()).format('MMM YYYY')}`
    },
    goToNextWeek (dayRange) {
      this.startOfWeek.add(dayRange, 'd');
      this.updateTimeline();
    },
    goToToday () {
      this.startOfWeek = this.$moment().startOf('week');
      this.updateTimeline();
    },
    goToWeek (value) {
      this.startOfWeek = this.$moment(value).startOf('week');
      this.updateTimeline();
      this.datimeModal = false;
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPE.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    eventTitle (event) {
      if (this.isCustomerPlanning) {
        return `${event.auxiliary.identity.firstname.slice(0, 1)}. ${event.auxiliary.identity.lastname}`.toUpperCase();
      }
      return event.customer.identity.lastname.toUpperCase();
    },
  },
};
