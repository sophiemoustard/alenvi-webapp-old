<template>
  <div class="container">
    <scheduler :events="events" @progressDone="progressDone" @eventUpdated="updateEventById" @viewChanged="getEventsData"></scheduler>
  </div>
</template>

<script>
import { Toast } from 'quasar'
import { mapMutations } from 'vuex'
import moment from 'moment'
import Scheduler from './scheduler/Scheduler.vue'
import Ogust from './models/Ogust'
import PlanningUpdates from './models/PlanningUpdates'
import 'dhtmlx-scheduler'

moment.locale('fr');

export default {
  metaInfo () {
    return {
      title: this.title
    }
  },
  components: {
    Scheduler
  },
  data () {
    return {
      events: [],
      title: '',
      token: '',
      personId: '',
      done: null
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
  methods: {
    async getEventsData () {
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
          this.events = await Ogust.getOgustEvents(ogustToken, this.personId, personType);
        }
      } catch (e) {
        console.error(e)
        if (e.response) {
          console.error(e.response);
          if (e.response.status === 404) {
            return Toast.create('Aucune intervention dans la période demandée');
          }
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
        } else {
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
        }
      }
    },
    async updateEventById (event) {
      try {
        this.setDisableInput(true);
        const ogustToken = await Ogust.getOgustToken(this.token);
        const updateServicePayload = {
          startDate: moment(event.start_date).format('YYYYMMDDHHmm'),
          endDate: moment(event.end_date).format('YYYYMMDDHHmm')
        }
        await Ogust.updateServiceById(ogustToken, event.id, updateServicePayload);
        const planningUpdateParams = {
          type: 'Modif. Intervention',
          content: `${moment(event.start_date).format('dddd DD/MM')}.\nIntervention chez ${event.text} de ${moment(event.start_date).format('HH:mm')} à ${moment(event.end_date).format('HH:mm')}`,
          involved: event.text,
          check: {
            isChecked: true,
            checkBy: process.env.ALENVI_BOT_ID,
            checkedAt: new Date()
          }
        };
        await PlanningUpdates.storePlanningupdates(this.personId, this.token, planningUpdateParams);
        const customerDetailsPayload = {
          arrayValues: {
            NIVEAU: event.pathology,
            COMMNIV: event.comments,
            DETAILEVE: event.interventionDetail,
            AUTRESCOMM: event.misc
          }
        };
        await Ogust.editOgustCustomerDetails(ogustToken, event.id_customer, customerDetailsPayload);
        const customerCodesPayload = {
          doorCode: event.door_code,
          interCode: event.intercom_code
        };
        await Ogust.editOgustCustomerCodes(ogustToken, event.id_customer, customerCodesPayload);
        
        // vuex mutations to control input in modal as well as opening and closing modal
        this.done();
        this.setDisableInput(false);
        this.controlModal(false);
        Toast.create('Ta demande a bien été enregistrée');
      } catch (e) {
        if (e.response && e.response.status === 404) {
          Toast.create('Aucune intervention dans la période demandée');
        } else {
          Toast.create("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)")
        }
        console.error(e);
      }
    },
    progressDone (event) {
      console.log(event);
      this.done = event;
    },
    ...mapMutations([
      'setDisableInput',
      'controlModal'
    ])
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
