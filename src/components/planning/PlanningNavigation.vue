<template>
  <div class="col-xs-12 col-md-7 row planning-navigation">
    <div class="col-12 items-center row justify-center">
      <div class="planning-month col-xs-6 col-md-6" @click="datimeModal = !datimeModal">
        <span class="capitalize">{{ timelineTitle }}</span>
        <q-icon name="arrow_drop_down" />
        <q-popover v-model="datimeModal" self="top middle" anchor="bottom middle">
          <q-datetime-picker minimal @input="goToWeek" :value="targetDate" />
        </q-popover>
      </div>
      <div class="row planning-actions col-6">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek()"></q-btn>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek()"></q-btn>
        <q-btn icon="today" flat round @click="goToToday"></q-btn>
        <template v-if="$q.platform.is.mobile && isAgenda">
          <q-btn class="col-2 planning-view" sizs="sm" flat v-if="!isThreeDaysView" label="3J" @click="updateViewMode(THREE_DAYS_VIEW)" />
          <q-btn class="col-2 planning-view" sizs="sm" flat v-else label="7J" @click="updateViewMode(WEEK_VIEW)" />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Select from '../form/Select';
import { AGENDA, PLANNING, THREE_DAYS_VIEW, WEEK_VIEW } from '../../data/constants';

export default {
  name: 'PlanningNavigation',
  components: {
    'ni-select': Select,
  },
  props: {
    timelineTitle: { type: String, default: '' },
    targetDate: { type: String },
    viewMode: { type: String, default: 'week' },
    type: { type: String, default: PLANNING },
  },
  data () {
    return {
      datimeModal: false,
      THREE_DAYS_VIEW,
      WEEK_VIEW,
    };
  },
  computed: {
    isAgenda () {
      return this.type === AGENDA;
    },
    isThreeDaysView () {
      return this.viewMode === THREE_DAYS_VIEW;
    },
  },
  methods: {
    goToNextWeek (value) {
      this.$emit('goToNextWeek', value)
    },
    goToPreviousWeek (value) {
      this.$emit('goToPreviousWeek', value)
    },
    goToWeek (value) {
      this.$emit('goToWeek', value)
    },
    goToToday (value) {
      this.$emit('goToToday', value)
    },
    updateViewMode (value) {
      this.$emit('updateViewMode', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .planning-history-button
    display: flex;
    align-items: center;

  .planning-view
    padding: 4px;

  .q-select
    margin-left: 1px
  /deep/ .q-if-control
    color: $black !important;

</style>
