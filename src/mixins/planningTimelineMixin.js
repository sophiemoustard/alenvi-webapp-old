import { THREE_DAYS_VIEW } from '../data/constants';

export const planningTimelineMixin = {
  data () {
    return {
      targetDate: '',
      datimeModal: false,
      days: [],
    };
  },
  computed: {
    toggleDrawer () {
      return this.$store.getters['main/toggleDrawer'];
    },
    isThreeDaysView () {
      if (this.viewMode) return this.viewMode === THREE_DAYS_VIEW;
      return false;
    },
  },
  watch: {
    startOfWeekAsString () {
      this.targetDate = this.startOfWeekAsString;
    },
  },
  methods: {
    getTimelineDays () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      const range = this.$moment.range(this.startOfWeekAsString, this.$moment(this.startOfWeekAsString).add(gapDays, 'd'));
      this.days = Array.from(range.by('days'));
    },
    endOfWeek () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      return this.$moment(this.startOfWeekAsString).add(gapDays, 'd').endOf('d');
    },
    timelineTitle () {
      if (this.startOfWeekAsString === '') return '';
      if (this.$moment(this.startOfWeekAsString).month() === this.$moment(this.endOfWeek()).month()) return this.$moment(this.startOfWeekAsString).format('MMMM YYYY');
      return `${this.$moment(this.startOfWeekAsString).format('MMM')} - ${this.$moment(this.endOfWeek()).format('MMM YYYY')}`
    },
    goToNextWeek () {
      const gapDays = this.isThreeDaysView ? 3 : 7;
      this.startOfWeekAsString = this.$moment(this.startOfWeekAsString).add(gapDays, 'd').toISOString();
      this.updateTimeline();
    },
    goToPreviousWeek () {
      const gapDays = this.isThreeDaysView ? -3 : -7;
      this.startOfWeekAsString = this.$moment(this.startOfWeekAsString).add(gapDays, 'd').toISOString();
      this.updateTimeline();
    },
    goToToday () {
      this.startOfWeekAsString = this.isThreeDaysView ? this.$moment().toISOString() : this.$moment().startOf('week').toISOString();
      this.updateTimeline();
    },
    goToWeek (value) {
      this.startOfWeekAsString = this.isThreeDaysView ? this.$moment(value).toISOString() : this.$moment(value).startOf('week').toISOString();
      this.updateTimeline();
      this.datimeModal = false;
    },
    updateViewMode (viewMode) {
      this.viewMode = viewMode;
      if (!this.isThreeDaysView) this.startOfWeekAsString = this.startOfWeekAsString.startOf('week').toISOString();
      this.updateTimeline();
    },
  },
};
