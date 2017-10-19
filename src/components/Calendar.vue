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
  metaInfo() {
    return {
    title: this.title
    }
  },
  components: {
    Scheduler
  },
  data() {
    return {
      events: [],
      title: ''
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
          const personData = await Ogust.getOgustPerson(this, ogustToken, personId, personType);
          this.title = personData.title;
        }
      } catch (e) {
        console.error(e)
        if (e.status === 404 && this.events.length === 0) {
          Toast.create("Aucune intervention dans la période demandée");
        } else {
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
        }
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
