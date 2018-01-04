<template>
  <div class="container">
    <scheduler :events="events" @getData="getEventsData"></scheduler>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import moment from 'moment'
import Scheduler from './scheduler/Scheduler.vue'
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
      title: '',
      token: '',
      personId: ''
    }
  },
  mounted() {
    this.getEventsData();
    scheduler.attachEvent("onEventChanged", (id, e) => {
      this.updateEventById(e);
      console.log('EVENT', e);
    });
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
          // const token = this.$route.query.access_token;
          this.token = this.$route.query.access_token;
          // let personId;
          let personType;
          if (this.$route.query.id_employee) {
            this.personId = this.$route.query.id_employee;
            personType = 'employee';
          } else {
            this.personId = this.$route.query.id_customer;
            personType = 'customer';
          }
          const ogustToken = await Ogust.getOgustToken(this.token);
          const personData = await Ogust.getOgustPerson(ogustToken, this.personId, personType);
          this.title = personData.title;
          this.events = await Ogust.getOgustEvents(ogustToken, '/calendar/events', this.personId, personType);
        }
      } catch (e) {
        console.error(e.response)
        if (e.response.status === 404) {
          Toast.create("Aucune intervention dans la période demandée");
        } else {
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
        }
      }
    },
    async updateEventById(event) {
      try {
        const ogustToken = await Ogust.getOgustToken(this.token);
        const payload = {
          startDate: moment(event.start_date).format('YYYYMMDDHHmm'),
          endDate: moment(event.end_date).format('YYYYMMDDHHmm')
        }
        await Ogust.updateServiceById(ogustToken, event.id, payload);
        Toast.create("Ta demande a bien été enregistrée");
      } catch (e) {
        Toast.create("Erreur lors de la modification de l'intervention :/ Si le problème persiste, contacte l'équipe technique :)");
        console.error(e);
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
