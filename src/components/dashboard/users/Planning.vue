<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
    <p class="caption">Voir planning en tant que:</p>
    <q-field icon="group" helper="Choix communauté">
      <q-select @change="getEmployeesIdBySector" v-model="selectedSector" :options="orderedSectors" separator />
    </q-field>
    <q-field icon="person" helper="Choix auxiliaire" >
      <q-select v-model="selectedAuxiliary" :options="orderedAuxiliary" separator :disable="!selectedSector"/>
    </q-field>
    <div class="row justify-center">
      <q-btn class="justify-center" color="primary" :disable="!selectedAuxiliary"><a target="_blank" id="planning-button" :href="getPlanningLink">Accéder au planning</a></q-btn>
      <!-- <q-btn class="justify-center" color="primary" :disable="!selectedAuxiliary"><router-link class="planning-button" :to="{ path: '/calendar', query: { id_employee: selectedAuxiliary, access_token: getUserToken }}">Accéder au planning</router-link></q-btn> -->
    </div>
    </div>
  </div>
</template>

<script>
import {
  QSelect,
  QField,
  QBtn,
  Cookies } from 'quasar'

import _ from 'lodash'

import ogust from '../../models/Ogust'

export default {
  components: {
    QSelect,
    QField,
    QBtn
  },
  async mounted () {
    await this.getSectors();
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
    orderedSectors () {
      return _.sortBy(this.sectors, ['value']);
    },
    orderedAuxiliary () {
      return _.sortBy(this.auxiliaries, ['label']);
    },
    // getUserToken () {
    //   return Cookies.get('alenvi_token');
    // },
    getPlanningLink () {
      return `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '' )}/calendar?id_employee=${this.selectedAuxiliary}&access_token=${Cookies.get('alenvi_token')}`;
    }
  },
  methods: {
    async getSectors () {
      try {
        const allSectorsRaw = await ogust.getOgustSectors();
        for (const k in allSectorsRaw) {
          if (k === '*') {
            continue;
          }
          this.sectors.push({
            label: allSectorsRaw[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getEmployeesIdBySector () {
      try {
        this.auxiliaries = [];
        const employees = await ogust.getEmployees({ sector: this.selectedSector });
        for (const k in employees) {
          this.auxiliaries.push({
            label: `${employees[k].first_name} ${employees[k].last_name}`,
            value: employees[k].id_employee
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  #planning-button
    color: $white
</style>
