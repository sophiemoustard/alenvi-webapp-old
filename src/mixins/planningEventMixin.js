import { ABSENCE_TYPE } from '../data/constants';

export const planningEventMixin = {
  data () {
    return {
      hours: [],
      halfHourHeight: 4.1,
    };
  },
  computed: {
    daysHeader () {
      if (!this.days) return [];
      return this.days.map(day => {
        return {
          name: this.$moment(day).format('dd'),
          number: this.$moment(day).format('DD'),
          moment: day
        }
      });
    },
    isCustomerPlanning () {
      return this.personKey === 'customer';
    }
  },
  methods: {
    getTimelineHours () {
      const range = this.$moment.range(this.$moment().hours(8).minutes(0), this.$moment().hours(20).minutes(0));
      this.hours = Array.from(range.by('hours', { step: 2 }));
    },
    isCurrentDay (momentDay) {
      return this.$moment(momentDay).isSame(new Date(), 'day');
    },
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
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
