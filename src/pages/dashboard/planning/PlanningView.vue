<template>
  <div>
    <h4>Vue planning</h4>
    <p class="caption">Voir planning en tant que:</p>
    <p class="input-caption">Communauté</p>
    <select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    <p class="input-caption">Auxiliaire</p>
    <q-select class="q-mb-lg" inverted-light color="white" v-model="selectedAuxiliary" :options="orderedAuxiliary" separator :disable="!selectedSector"
      @input="getEventsData" />
    <scheduler :title="false" :scroll="false" :events="events" @viewChanged="getEventsData" />
  </div>
</template>

<script>
/* global scheduler */
import { mapMutations, mapGetters } from 'vuex'
import 'dhtmlx-scheduler'

import SelectSector from '../../../components/SelectSector'
import Scheduler from '../../../components/scheduler/Scheduler'

export default {
  metaInfo () {
    return {
      title: this.ogustUser ? this.ogustUser.title : ''
    }
  },
  components: {
    SelectSector,
    Scheduler
  },
  watch: {
    events (value) {
      console.log(value);
    }
  },
  data () {
    return {
      events: null,
      selectedSector: '',
      sectors: [],
      auxiliaries: [],
      selectedAuxiliary: '',
      firstSelection: false
    }
  },
  computed: {
    ...mapGetters({
      user: 'main/user',
      personType: 'calendar/personType',
      ogustUser: 'calendar/ogustUser'
    }),
    orderedAuxiliary () {
      return this.$_.sortBy(this.auxiliaries, ['label']);
    }
  },
  methods: {
    async getEmployeesBySector () {
      try {
        this.auxiliaries = [];
        this.selectedAuxiliary = '';
        scheduler.clearAll();
        const employees = await this.$ogust.getEmployees({ sector: this.selectedSector });
        for (const k in employees) {
          this.auxiliaries.push({
            label: `${employees[k].first_name} ${employees[k].last_name}`,
            value: employees[k].id_employee
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getEventsData (event) {
      try {
        if (!this.selectedAuxiliary) return;
        this.setPersonType('employee');
        this.personId = this.selectedAuxiliary;
        scheduler.clearAll();
        const personData = await this.$ogust.getOgustPerson(this.personId, this.personType);
        this.setOgustUser(personData);
        this.events = await this.$ogust.getOgustEvents(this.personId, this.personType);
        scheduler.parse(this.events, 'json');
      } catch (e) {
        console.error(e)
        if (e.status === 404) {
          this.events = [];
          this.$store.commit('calendar/toggleFilter', false);
          return this.$q.notify({
            color: 'secondary',
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
      }
    },
    changeAuxiliary () {
      if (!this.firstSelection) {
        this.getEventsData();
      }
    },
    ...mapMutations({
      setOgustUser: 'calendar/setOgustUser',
      setPersonType: 'calendar/setPersonType',
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.setOgustUser(null);
    this.setPersonChosen(null);
    next();
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .q-field
    margin: 16px 0
</style>
