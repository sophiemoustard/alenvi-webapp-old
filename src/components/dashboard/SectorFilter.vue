<template>
  <q-icon name="person" size="1.5rem" flat>
    <q-popover v-model="showFilter" @open="getEmployeesBySector(ogustUser.sector)">
      <q-list link no-border style="min-width: 200px">
        <q-list-header v-if="auxiliaries.length !== 0">
          <q-field icon="search">
            <q-input v-model="search" placeholder="Recherche" />
          </q-field>
        </q-list-header>
        <q-inner-loading :visible="auxiliaries.length === 0">
          <q-spinner size="50px" />
        </q-inner-loading>
        <q-item v-for="(auxiliary, index) in filteredAuxiliaries" :key="index">
          <!-- <q-checkbox v-model="auxiliariesIds" :val="auxiliary.value" :label="auxiliary.label" @change="chooseAuxiliaries" /> -->
          <q-radio v-model="auxiliaryId" :val="auxiliary.value" :label="auxiliary.label" @change="chooseAuxiliaries" />
        </q-item>
      </q-list>
    </q-popover>
  </q-icon>
</template>


<script>
import {
  QIcon,
  QPopover,
  QList,
  QListHeader,
  QItem,
  QItemMain,
  QItemSide,
  QInnerLoading,
  QCheckbox,
  QRadio,
  QSpinner,
  QField,
  QInput
} from 'quasar'

import ogust from '../models/Ogust'

export default {
  components: {
    QIcon,
    QPopover,
    QList,
    QListHeader,
    QItem,
    QItemMain,
    QItemSide,
    QInnerLoading,
    QCheckbox,
    QRadio,
    QSpinner,
    QField,
    QInput
  },
  data () {
    return {
      sectors: [],
      auxiliaries: [],
      auxiliaryId: '',
      // auxiliariesIds: [],
      search: ''
    }
  },
  computed: {
    showFilter: {
      get () {
        return this.$store.state.showFilter;
      },
      set (value) {
        this.$store.commit('toggleFilter', value);
      }
    },
    ogustUser () {
      return this.$store.getters.ogustUser;
    },
    ogustToken () {
      return this.$store.getters.ogustToken;
    },
    filteredAuxiliaries () {
      return this.auxiliaries.filter((item) => {
        return item.label.match(new RegExp(`${this.search}`, 'i'));
      })
    }
  },
  mounted () {
    // this.auxiliariesIds.push(this.$store.state.ogustUser.id_employee);
    this.auxiliaryId = this.$store.state.ogustUser.id_employee;
  },
  methods: {
    async getEmployeesBySector (sector) {
      try {
        this.auxiliaries = [];
        const employees = await ogust.getEmployees({ sector }, this.ogustToken);
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
    chooseAuxiliaries () {
      this.$emit('auxiliariesChosen');
      this.$store.commit('setAuxiliariesChosen', this.auxiliaryId);
    }
  }
}
</script>
