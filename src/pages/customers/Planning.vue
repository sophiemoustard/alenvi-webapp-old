<template>
  <q-page padding class="neutral-background container">
    <h5>{{ customerName }}</h5>
    <scheduler :scroll="true" :showTabCustomer="false" :customer="true" :events="events" @viewChanged="getEventsData"></scheduler>
  </q-page>
</template>

<script>
/* global scheduler */
import 'dhtmlx-scheduler'

import Scheduler from '../../components/scheduler/OldScheduler'
import { NotifyNegative } from '../../components/popup/notify';

export default {
  components: {
    Scheduler
  },
  metaInfo: {
    title: 'Planning',
  },
  data () {
    return {
      events: [],
      title: '',
      personId: ''
    }
  },
  mounted () {
    this.$moment.locale('fr');
  },
  watch: {
    events: function (value) {
      scheduler.parse(this.events, 'json');
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    },
    customerName () {
      return `${this.getUser.customers[0].identity.title} ${this.getUser.customers[0].identity.lastname}`
    }
  },
  methods: {
    async getEventsData () {
      try {
        this.personId = this.getUser.customers[0].customerId;
        this.events = await this.$ogust.getOgustEvents(this.personId, 'customer');
      } catch (e) {
        console.error(e)
        if (e.status === 404) {
          NotifyNegative('Aucune intervention dans la période demandée.');
        } else {
          NotifyNegative('Erreur de chargement des données :/ Si le problème persiste, contactez l\'équipe technique : support@alenvi.io :)');
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  h5
    padding: 10px 0px 0px 50px
    margin-bottom: 0px
</style>
