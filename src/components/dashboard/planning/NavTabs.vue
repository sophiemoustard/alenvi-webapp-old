<template>
  <q-tabs align="justify">
    <q-tab v-for="(tab, index) in tabInfo"
          :key="index"
          :icon="tab.icon"
          slot="title"
          :label="tab.label"
          :default="tab.default"
          :disable="tab.disable || false"
          :name="tab.name" />
    <q-tab-pane class="no-border" v-for="(tab, index) in tabInfo" :key="index" :name="tab.name">
                <!-- Dynamic component loading  -->
      <component :is="tab.component" />
    </q-tab-pane>
  </q-tabs>
</template>

<script>
import {
  QTabs,
  QTab,
  QTabPane } from 'quasar'

import Planning from './Planning.vue'
import PlanningModification from './PlanningModification'
import Calendar from '../customer/Calendar'

export default {
  // props: ['navTabs'],
  components: {
    QTabs,
    QTab,
    QTabPane,
    Planning,
    PlanningModification,
    Calendar
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Vue planning',
          name: 'planning',
          icon: 'date range',
          default: true,
          component: 'Planning'
        },
        {
          label: 'Modifications Planning',
          name: 'modifs-planning',
          icon: 'update',
          default: false,
          component: 'PlanningModification'
        },
        {
          label: 'Test Planning',
          name: 'calendar',
          icon: 'date range',
          default: false,
          component: 'Calendar'
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
