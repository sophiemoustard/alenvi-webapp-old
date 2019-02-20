<template>
  <div class="col-xs-12 col-md-7 row planning-navigation">
    <div class="col-10 items-center row justify-center">
      <div class="planning-month col-xs-8 col-md-7 justify-center" @click="datimeModal = !datimeModal">
        <span class="capitalize">{{ timelineTitle }}</span>
        <q-icon name="arrow_drop_down" />
        <q-popover v-model="datimeModal">
          <q-datetime-picker minimal @input="goToWeek" :value="targetDate" />
        </q-popover>
      </div>
      <div class="row justify-between planning-actions col-xs-4 col-md-5">
        <q-btn icon="chevron_left" flat round @click="goToNextWeek(-7)"></q-btn>
        <q-btn icon="chevron_right" flat round @click="goToNextWeek(7)"></q-btn>
        <q-btn icon="today" flat round @click="goToToday"></q-btn>
      </div>
    </div>
    <div class="col-2 row justify-end planning-history-button" style="{ align-items: center, display: flex }">
      <q-btn icon="playlist_play" round flat />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanningNavigation',
  props: {
    timelineTitle: { type: String, default: '' },
    targetDate: { type: String }
  },
  data () {
    return {
      datimeModal: false,
    };
  },
  methods: {
    goToNextWeek (value) {
      this.$emit('goToNextWeek', value)
    },
    goToWeek (value) {
      this.$emit('goToWeek', value)
    },
    goToToday (value) {
      this.$emit('goToToday', value)
    },
  }
}
</script>

<style lang="stylus" scoped>
.planning-history-button
  display: flex;
  align-items: center;

</style>
