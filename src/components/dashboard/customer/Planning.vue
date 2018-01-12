<template>
  <div class="container">
    <scheduler :events="events" @getData="getEventsData"></scheduler>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import moment from 'moment'
import Scheduler from '../../scheduler/Scheduler.vue'
import Ogust from '../../models/Ogust'
import 'dhtmlx-scheduler'

moment.locale('fr');

export default {
  components: {
    Scheduler
  },
  data () {
    return {
      events: [],
      title: '',
      personId: ''
    }
  },
  async mounted () {
    this.getEventsData();
  },
  watch: {
    events: function (value) {
      scheduler.parse(this.events, 'json');
    }
  },
  methods: {
    async getEventsData () {
      try {
        this.personId = 345735114; // ID customer
        // this.title = personData.title;
        this.events = await Ogust.getOgustEvents(null, '/calendar/events', this.personId, 'customer');
      } catch (e) {
        console.error(e)
        if (e.status === 404) {
          Toast.create('Aucune intervention dans la période demandée');
        } else {
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contactez l'équipe technique :)")
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
