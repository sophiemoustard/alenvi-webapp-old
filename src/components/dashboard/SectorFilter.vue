<template>
  <q-icon name="filter list" size="1.5rem" flat>
    <q-popover v-model="showFilter">
      <q-list link style="min-width: 200px">
        <q-list-header>
          <q-field icon="search">
            <!-- <q-input v-model="search" placeholder="Recherche" /> -->
          </q-field>
        </q-list-header>
        <q-collapsible group="sectors" v-if="sectors.length !== 0" v-for="(sector, index) in filteredSectors" :key="index" :label="sector.label" @open="getEmployeesBySector(sector.value)">
          <q-list link no-border>
            <q-inner-loading :visible="auxiliaries.length === 0">
              <q-spinner size="30px" />
            </q-inner-loading>
            <q-item v-for="(auxiliary, index) in auxiliaries" :key="index">
                <q-checkbox v-model="auxiliaryId" :val="auxiliary.value" :label="auxiliary.label" />
            </q-item>
          </q-list>
        </q-collapsible>
        <!-- <q-item v-for="n in 3" :key="n" @click="showToast(), $refs.popover2.close()">
          <q-item-main label="Label" />
        </q-item> -->
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
  QCollapsible,
  QInnerLoading,
  QCheckbox,
  QSpinner,
  QAutocomplete
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
    QCollapsible,
    QInnerLoading,
    QCheckbox,
    QSpinner,
    QAutocomplete
  },
  data () {
    return {
      sectors: [],
      auxiliaries: [],
      auxiliaryId: [],
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
    filteredSectors () {
      return this.sectors.filter((item) => {
        return item.label.match(this.search);
      })
    }
  },
  watch: {
    auxiliaryId: (value) => {
      console.log('AUXILIARY IDS', value);
    }
  },
  async mounted () {
    await this.getSectors();
    console.log(this.sectors);
  },
  methods: {
    async getSectors () {
      try {
        this.sectors = [];
        const allSectorsRaw = await ogust.getList('employee.sector');
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
    async getEmployeesBySector (sector) {
      try {
        this.auxiliaries = [];
        const employees = await ogust.getEmployees({ sector });
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
