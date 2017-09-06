<template>
  <div class="container">
    <scheduler :events="events" @getData="getEventsData"></scheduler>
  </div>
</template>

<script>
import Scheduler from './scheduler/Scheduler.vue';
import Ogust from './models/Ogust'
import 'dhtmlx-scheduler'

export default {
  components: {
    Scheduler
  },
  data() {
    return {
      events: []
    }
  },
  created() {
    this.getEventsData();
  },
  watch: {
    events: function(value) {
      scheduler.parse(this.events, 'json');
    }
  },
  methods: {
    async getEventsData() {
      try {
        if (!this.$route.query.access_token || !this.$route.query.id_person) {
          throw new Error('Missing alenvi access token and/or employee id');
        } else {
          const token = this.$route.query.access_token;
          const employeeId = this.$route.query.id_person;
          const ogustToken = await Ogust.getOgustToken(this, token);
          this.events = await Ogust.getOgustEvents(this, ogustToken, '/calendar/events', employeeId);
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style>
  .alenvi_event div {
        background-color: #E2007A !important;
        color: white !important;
    }

    .dhx_cal_event_line.alenvi_event {
        background-color: #E2007A !important;
        color: white !important;
    }

    .dhx_cal_event_clear.alenvi_event {
        background-color: #E2007A !important;
        color: white !important;
    }
</style>
