<template>
  <div class="container">
    <scheduler :events="events" @getData="getEventsData"></scheduler>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import Scheduler from './scheduler/Scheduler.vue';
import Ogust from './models/Ogust'
import 'dhtmlx-scheduler'

export default {
  metaInfo: {
    title: 'Planning'
  },
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
        if (!this.$route.query.access_token || (!this.$route.query.id_employee && !this.$route.query.id_customer)) {
          throw new Error('Missing alenvi access token and/or employee/customer id');
        } else if (this.$route.query.id_employee && this.$route.query.id_customer) {
          throw new Error('Only one ID is allowed !')
        } else {
          const token = this.$route.query.access_token;
          let personId;
          let personType;
          if (this.$route.query.id_employee) {
            personId = this.$route.query.id_employee;
            personType = 'employee';
          } else {
            personId = this.$route.query.id_customer;
            personType = 'customer';
          }
          const ogustToken = await Ogust.getOgustToken(this, token);
          this.events = await Ogust.getOgustEvents(this, ogustToken, '/calendar/events', personId, personType);
        }
      } catch (e) {
        console.error(e)
        Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
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
