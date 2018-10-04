<template>
  <scheduler :showTabFilter="true" :events="events" @viewChanged="getEventsData"
    @applyFilter="getEventsData"></scheduler>
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
  props: {
    auxiliary: {
      type: String,
      default: null
    },
    customer: {
      type: String,
      default: null
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
    ...mapGetters({
      user: 'main/user',
      personChosen: 'calendar/personChosen',
      personType: 'calendar/personType'
    })
  },
  watch: {
    events: function (value) {
      scheduler.parse(value, 'json');
    }
  },
  methods: {
    async getEventsData () {
      try {
        if (this.auxiliary) {
          this.setPersonType('employee');
          this.personId = this.user.employee_id;
        } else {
          this.setPersonType('customer');
          const customer = await this.getFirstCustomer();
          this.personId = customer.id_customer;
        }
        if (this.personChosen) {
          const personData = await this.$ogust.getOgustPerson(this.personChosen, this.personType);
          this.setOgustUser(personData);
          this.title = personData.title;
          this.events = await this.$ogust.getOgustEvents(this.personChosen, this.personType);
          this.toggleFilter(false);
        } else {
          const personData = await this.$ogust.getOgustPerson(this.personId, this.personType);
          this.setOgustUser(personData);
          this.title = personData.title;
          this.events = await this.$ogust.getOgustEvents(this.personId, this.personType);
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
    async getFirstCustomer () {
      const customers = await this.$ogust.getCustomers({ sector: this.user.sector });
      const filteredCustomers = this.$_.filter(customers, customer => !customer.last_name.match(/^ALENVI/i));
      return filteredCustomers[0];
    },
    ...mapMutations({
      setOgustUser: 'calendar/setOgustUser',
      setPersonType: 'calendar/setPersonType',
      toggleFilter: 'calendar/toggleFilter'
    })
  }
}
</script>

<style lang="stylus">

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
