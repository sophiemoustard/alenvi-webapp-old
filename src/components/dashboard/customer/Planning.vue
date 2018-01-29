<template>
  <div class="container">
    <scheduler :showTab="false" :customer="true" :events="events" @viewChanged="getEventsData"></scheduler>
  </div>
</template>

<script>
import moment from 'moment'
import 'dhtmlx-scheduler'

import Scheduler from '../../scheduler/Scheduler.vue'
import Ogust from '../../models/Ogust'
import { alenviAlert } from '../../../helpers/alerts'

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
  mounted () {
    // this.getEventsData();
  },
  watch: {
    events: function (value) {
      scheduler.parse(this.events, 'json');
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async getEventsData () {
      try {
        this.personId = this.getUser.customer_id; // ID customer
        this.events = await Ogust.getOgustEvents(null, this.personId, 'customer');
      } catch (e) {
        console.error(e)
        if (e.status === 404) {
          alenviAlert({ color: 'error', icon: 'warning', content: 'Aucune intervention dans la période demandée.', position: 'bottom-right', duration: 2500 });
        } else {
          alenviAlert({ color: 'error', icon: 'warning', content: "Erreur de chargement des données :/ Si le problème persiste, contactez l'équipe technique :)", position: 'bottom-right', duration: 2500 });
        }
      }
    }
  }
}
</script>

<style lang="css" scoped>
  
</style>
