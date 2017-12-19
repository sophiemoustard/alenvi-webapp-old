<template>
  <q-tabs align="justify">
    <q-tab v-for="(tab, index) in tabInfo"
          :key="index"
          :icon="tab.icon"
          slot="title"
          :label="tab.label"
          :default="tab.default"
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

import SendMessage from './SendMessage.vue'
import Sent from './Sent.vue'

export default {
  components: {
    QTabs,
    QTab,
    QTabPane,
    SendMessage,
    Sent
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Envoi message',
          name: 'message',
          icon: 'message',
          default: false,
          component: 'SendMessage'
        },
        {
          label: 'Messages envoyés',
          name: 'envoi',
          icon: 'mail outline',
          default: false,
          component: 'Sent'
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
