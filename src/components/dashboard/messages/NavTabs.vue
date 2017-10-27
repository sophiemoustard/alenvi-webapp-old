<template>
  <q-tabs align="justify">
    <q-tab v-for="(tab, index) in navTabs"
          :key="index"
          :icon="tab.icon"
          slot="title"
          :label="tab.label"
          :default="tab.default"
          :name="tab.name" />
    <q-tab-pane class="no-border" v-for="(tab, index) in navTabs" :key="index" :name="tab.name">
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

import SendMessage from './SendMessage.vue'
import Sent from './Sent.vue'

export default {
  props: ['navTabs'],
  components: {
    QTabs,
    QTab,
    QTabPane,
    SendMessage,
    Sent
  }
}
</script>

<style lang="stylus">
</style>
