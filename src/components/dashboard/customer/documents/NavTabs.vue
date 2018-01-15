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

import Invoices from './Invoices.vue'
import TaxCertificate from './TaxCertificate.vue';

export default {
  components: {
    QTabs,
    QTab,
    QTabPane,
    Invoices,
    TaxCertificate
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Factures',
          name: 'invoices',
          icon: 'euro symbol',
          default: true,
          component: 'Invoices'
        },
        {
          label: 'Attestations fiscales',
          name: 'envoi',
          icon: 'check',
          default: false,
          component: 'TaxCertificate'
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
