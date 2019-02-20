<template>
  <q-page>
    <scheduler :title="true" :scroll="true" :showTabFilter="true" :events="events" @viewChanged="getEventsData"
      @applyFilter="getEventsData"></scheduler>
  </q-page>
</template>

<script>
/* global scheduler */
import { mapMutations, mapGetters } from 'vuex'
import Scheduler from '../../../components/scheduler/OldScheduler'
import 'dhtmlx-scheduler'
import { NotifyWarning, NotifyNegative } from '../../../components/popup/notify';

export default {
  metaInfo () {
    return {
      title: this.title ? this.title : '-'
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
      events: null,
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
    }),
    auxiliaryComp () {
      return this.auxiliary;
    },
    customerComp () {
      return this.customer;
    }
  },
  methods: {
    async getEventsData (event) {
      try {
        if (this.auxiliaryComp) {
          this.setPersonType('employee');
          this.personId = event && event.personChosen ? this.personChosen : this.user.employee_id;
        } else if (this.customerComp) {
          this.setPersonType('customer');
          const customer = await this.getFirstCustomer();
          this.personId = event && event.personChosen ? this.personChosen : customer.id_customer;
        }
        scheduler.clearAll();
        const personData = await this.$ogust.getOgustPerson(this.personId, this.personType);
        this.setOgustUser(personData);
        this.title = personData.title;
        this.events = await this.$ogust.getOgustEvents(this.personId, this.personType);
        scheduler.parse(this.events, 'json');
        this.toggleFilter(false);
      } catch (e) {
        console.error(e)
        if (e.status === 404) {
          this.events = [];
          this.$store.commit('calendar/toggleFilter', false);
          return NotifyWarning('Aucune intervention dans la période demandée');
        }
        NotifyNegative("Erreur de chargement des données :/ Si le problème persiste, contacte l'équipe technique :)");
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
      setPersonChosen: 'calendar/setPersonChosen',
      toggleFilter: 'calendar/toggleFilter'
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.setOgustUser(null);
    this.setPersonChosen(null);
    next();
  }
}
</script>
