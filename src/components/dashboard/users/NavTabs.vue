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

import Users from './Users.vue'
import PigiAccounts from './PigiAccounts.vue'

export default {
  // props: ['navTabs'],
  components: {
    QTabs,
    QTab,
    QTabPane,
    PigiAccounts,
    Users
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Vue utilisateurs',
          name: 'users',
          icon: 'supervisor account',
          default: true,
          component: 'Users',
          // disable: true
        },
        {
          label: 'Accueil Pigi',
          name: 'pigi',
          icon: 'person add',
          default: false,
          component: 'PigiAccounts',
          // disable: true
        },
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
