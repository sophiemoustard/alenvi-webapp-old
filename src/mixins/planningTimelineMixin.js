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
    }
  },
  watch: {
    startOfWeek: function () {
      this.targetDate = this.startOfWeek.toISOString();
    },
  },
  methods: {
    getTimelineDays () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(gapDays, 'd'));
      this.days = Array.from(range.by('days'));
    },
    endOfWeek () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      return this.$moment(this.startOfWeek).add(gapDays, 'd');
    },
    timelineTitle () {
      if (this.startOfWeek === '') return '';
      if (this.$moment(this.startOfWeek).month() === this.$moment(this.endOfWeek()).month()) return this.$moment(this.startOfWeek).format('MMMM YYYY');
      return `${this.$moment(this.startOfWeek).format('MMM')} - ${this.$moment(this.endOfWeek()).format('MMM YYYY')}`
    },
    goToNextWeek () {
      const gapDays = this.isThreeDaysView ? 3 : 7;
      this.startOfWeek.add(gapDays, 'd');
      this.updateTimeline();
    },
    goToPreviousWeek () {
      const gapDays = this.isThreeDaysView ? -3 : -7;
      this.startOfWeek.add(gapDays, 'd');
      this.updateTimeline();
    },
    goToToday () {
      this.startOfWeek = this.isThreeDaysView ? this.$moment() : this.$moment().startOf('week');
      this.updateTimeline();
    },
    goToWeek (value) {
      this.startOfWeek = this.isThreeDaysView ? this.$moment(value) : this.$moment(value).startOf('week');
      this.updateTimeline();
      this.datimeModal = false;
    },
    updateViewMode (viewMode) {
      this.viewMode = viewMode;
      if (!this.isThreeDaysView) this.startOfWeek = this.startOfWeek.startOf('week');
      this.updateTimeline();
    },
  },
};
