<template>
  <div class="col-xs-12 col-md-7 row planning-navigation">
    <div class="col-12 items-center row justify-center">
      <div class="planning-month col-xs-6 col-md-6" @click="datimeModal = !datimeModal">
        <span class="capitalize">{{ timelineTitle }}</span>
        <q-icon name="arrow_drop_down" />
        <q-popover v-model="datimeModal">
          <q-datetime-picker minimal @input="goToWeek" :value="targetDate" />
        </q-popover>
      </div>
      <div class="row planning-actions col-6">
        <q-btn icon="chevron_left" flat round @click="goToPreviousWeek()"></q-btn>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek()"></q-btn>
        <q-btn icon="today" flat round @click="goToToday"></q-btn>
        <q-select v-if="$q.platform.is.mobile" class="col-xs-4 col-md-3" :value="viewMode" :options="viewOptions" @input="updateViewMode" hide-underline />
      </div>
    </div>
  </div>
</template>

<script>
import Select from '../form/Select';
import { VIEW_OPTIONS } from '../../data/constants';

export default {
  name: 'PlanningNavigation',
  components: {
    'ni-select': Select,
  },
  props: {
    timelineTitle: { type: String, default: '' },
    targetDate: { type: String },
    viewMode: { type: String, default: 'week' },
  },
  data () {
    return {
      datimeModal: false,
      viewOptions: VIEW_OPTIONS,
    };
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
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .planning-history-button
    display: flex;
    align-items: center;

  .q-select
    margin-left: 1px
  /deep/ .q-if-control
    color: $black !important;

</style>
