<template>
  <div>
    <scheduler :showTabFilter="true" :events="events" @eventUpdated="updateEventById" @viewChanged="getEventsData"
      @applyFilter="getEventsData"></scheduler>
  </div>
</template>

<script>
/* global scheduler */
import { mapMutations, mapGetters } from 'vuex'
import Scheduler from '../../components/scheduler/Scheduler'
import 'dhtmlx-scheduler'

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
  computed: {
    // personChosen () {
    //   return this.$store.getters['calendar/personChosen'];
    // },
    ...mapGetters({
      personChosen: 'calendar/personChosen',
      personType: 'calendar/personType'
    })
  },
  mounted () {
    // this.getEventsData();
    this.$moment.locale('fr');
  },
  watch: {
    events: function (value) {
      scheduler.parse(value, 'json');
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
          // let personType;
          if (this.$route.query.id_employee) {
            this.personId = this.$route.query.id_employee;
            this.setPersonType('employee');
          } else {
            this.personId = this.$route.query.id_customer;
            this.setPersonType('customer');
          }
          const ogustToken = await this.$ogust.getOgustToken(this.token);
          this.getOgustToken(ogustToken);
          // if (this.personChosen && this.personChosen.length !== 0) {
          //   this.events = [];
          //   for (let i = 0, l = this.personChosen.length; i < l; i++) {
          //     const events = await Ogust.getOgustEvents(ogustToken, this.personChosen[i], this.personType);
          //     this.events = this.events.concat(events);
          //   }
          if (this.personChosen) {
            const personData = await this.$ogust.getOgustPerson(ogustToken, this.personChosen, this.personType);
            this.setOgustUser(personData);
            this.title = personData.title;
            this.events = await this.$ogust.getOgustEvents(ogustToken, this.personChosen, this.personType);
            this.toggleFilter(false);
          } else {
            const personData = await this.$ogust.getOgustPerson(ogustToken, this.personId, this.personType);
            this.setOgustUser(personData);
            this.title = personData.title;
            this.events = await this.$ogust.getOgustEvents(ogustToken, this.personId, this.personType);
          }
        }
      } catch (e) {
        console.error(e)
        if (e.response) {
          console.error(e.response);
          if (e.response.status === 404) {
            this.events = [];
            this.$store.commit('calendar/toggleFilter', false);
            return this.$q.notify({
              color: 'negative',
              icon: 'warning',
              detail: 'Aucune intervention dans la période demandée',
              position: 'bottom-right',
              timeout: 2500
            });
          }
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: "Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)",
            position: 'bottom-right',
            timeout: 2500
          });
        } else {
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: "Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)",
            position: 'bottom-right',
            timeout: 2500
          });
        }
      }
    },
    async updateEventById (event) {
      try {
        this.setDisableInput(true);
        const ogustToken = await this.$ogust.getOgustToken(this.token);
        if (this.personType === 'employee' && this.$route.query.id_employee === event.id_employee && event.dateChanged) {
          const updateServicePayload = {
            startDate: this.$moment(event.start_date).format('YYYYMMDDHHmm'),
            endDate: this.$moment(event.end_date).format('YYYYMMDDHHmm')
          }
          await this.$ogust.updateServiceById(ogustToken, event.id, updateServicePayload);
          const planningUpdateParams = {
            type: 'Modif. Intervention',
            content: `${this.$moment(event.start_date).format('dddd DD/MM')}.\nIntervention chez ${event.text} de ${this.$moment(event.start_date).format('HH:mm')} à ${this.$moment(event.end_date).format('HH:mm')}`,
            involved: event.text,
            check: {
              isChecked: true,
              checkBy: process.env.ALENVI_BOT_ID,
              checkedAt: new Date()
            }
          };
          await this.$planningUpdates.storePlanningupdates(this.personId, this.token, planningUpdateParams);
        }
        const customerDetailsPayload = {
          arrayValues: {
            NIVEAU: event.pathology,
            COMMNIV: event.comments,
            DETAILEVE: event.interventionDetails,
            AUTRESCOMM: event.misc
          }
        };
        await this.$ogust.editOgustCustomerDetails(ogustToken, event.id_customer, customerDetailsPayload);
        const customerCodesPayload = {
          door_code: event.door_code,
          intercom_code: event.intercom_code
        };
        await this.$ogust.editOgustCustomer(ogustToken, event.id_customer, customerCodesPayload);
        // Renders immediately the updated event in calendar
        scheduler.updateEvent(event.id);
        scheduler.setCurrentView();
        // vuex mutations to control input in modal as well as opening and closing modal
        this.setModalBtnLoading(false);
        this.setDisableInput(false);
        this.controlModal(false);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Ta demande a bien été enregistrée',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        if (e.response && e.response.status === 404) {
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: 'Aucune intervention dans la période demandée',
            position: 'bottom-right',
            timeout: 2500
          });
        } else {
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: "Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)",
            position: 'bottom-right',
            timeout: 2500
          });
        }
        this.setDisableInput(false);
        this.setModalBtnLoading(false);
        e.response ? console.error(e.response) : console.error(e);
      }
    },
    ...mapMutations({
      setDisableInput: 'calendar/setDisableInput',
      controlModal: 'calendar/controlModal',
      getOgustToken: 'calendar/getOgustToken',
      toggleFilter: 'calendar/toggleFilter',
      setOgustUser: 'calendar/setOgustUser',
      setPersonType: 'calendar/setPersonType',
      setModalBtnLoading: 'calendar/setModalBtnLoading'
    })
  }
}
</script>

<style lang="stylus">

  // .dhx_cal_header
  //   position: fixed !important
  //   top: 0
  //   background-color: white
  // @media (max-width: 767px)
  //   .dhx_cal_date, .dhx_cal_prev_button, .dhx_cal_next_button
  //     top: 0 !important
  // .dhx_cal_header, .dhx_cal_navline
  //   position: fixed !important
  //   background-color: white
  //   @media (max-width: 767px)
  //     position: absolute !important

  .alenvi_event div
        background-color: #E2007A !important;
        color: white !important;

    .dhx_cal_event_line.alenvi_event
        background-color: #E2007A !important;
        color: white !important;

    .dhx_cal_event_clear.alenvi_event
        background-color: #E2007A !important;
        color: white !important;
</style>
