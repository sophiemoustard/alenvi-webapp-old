import { ABSENCE_TYPES, PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '../data/constants';
import { formatIdentityShort } from '../helpers/utils';

export const planningEventMixin = {
  data () {
    return {
      hours: [],
      halfHourHeight: 100 / 30, // (100 => % total heigth - 30: nomber of half hours)
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
      const range = this.$moment.range(this.$moment().hours(PLANNING_VIEW_START_HOUR).minutes(0), this.$moment().hours(PLANNING_VIEW_END_HOUR).minutes(0));
      this.hours = Array.from(range.by('hours', { step: 2 }));
    },
    isCurrentDay (momentDay) {
      return this.$moment(momentDay).isSame(new Date(), 'day');
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPES.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    eventTitle (event) {
      const person = this.isCustomerPlanning ? 'auxiliary' : 'customer';
      return formatIdentityShort(event[person].identity);
    },
  },
};
