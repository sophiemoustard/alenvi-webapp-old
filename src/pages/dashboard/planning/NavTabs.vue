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
import Planning from './Planning.vue'
import PlanningModification from './PlanningModification'
import ConstrainedCoaches from './ConstrainedCoaches'

export default {
  // props: ['navTabs'],
  components: {
    Planning,
    PlanningModification,
    ConstrainedCoaches
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
          label: 'Coach(s) de permanence',
          name: 'constrained',
          icon: 'perm contact calendar',
          default: false,
          component: 'ConstrainedCoaches'
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
