<template>
  <div style="max-width: 90vw;">
    <h4>Vue planning</h4>
    <p class="caption">Voir planning en tant que:</p>
    <select-sector @input="getEmployeesIdBySector" v-model="selectedSector"></select-sector>
    <q-field icon="person" helper="Choix auxiliaire" >
      <q-select inverted-light color="white" v-model="selectedAuxiliary" :options="orderedAuxiliary" separator :disable="!selectedSector"/>
    </q-field>
    <div class="row justify-end">
      <q-btn color="primary" :disable="!selectedAuxiliary" @click="goUrl(getPlanningLink)" flat>Accéder au planning</q-btn>
    </div>
  </div>
</template>

<script>
import { openURL } from 'quasar'

import _ from 'lodash'

import SelectSector from '../../../components/SelectSector'

export default {
  components: {
    SelectSector
  },
  data () {
    return {
      selectedSector: '',
      selectedAuxiliary: '',
      sectors: [],
      auxiliaries: []
    }
  },
  computed: {
    orderedAuxiliary () {
      return _.sortBy(this.auxiliaries, ['label']);
    },
    getPlanningLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/bot/calendar?id_employee=${this.selectedAuxiliary}&access_token=${this.$q.cookies.get('alenvi_token')}&self=true`;
    }
  },
  methods: {
    async getEmployeesIdBySector () {
      try {
        this.auxiliaries = [];
        this.selectedAuxiliary = '';
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
    goUrl (url) {
      openURL(url);
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .q-field
    margin: 16px 0
</style>
