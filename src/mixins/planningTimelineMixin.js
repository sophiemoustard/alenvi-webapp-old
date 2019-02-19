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
  },
};
