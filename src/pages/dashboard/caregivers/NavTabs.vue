<template>
  <q-tabs align="justify">
    <q-tab v-for="(tab, index) in tabInfo"
          :key="index"
          :icon="tab.icon"
          slot="title"
          :label="tab.label"
          :default="tab.default"
          :name="tab.name"
          @click="$ga.event('Aidants', 'click', tab.label)" />
    <q-tab-pane class="no-border" v-for="(tab, index) in tabInfo" :key="index" :name="tab.name">
                <!-- Dynamic component loading  -->
      <component :is="tab.component" />
    </q-tab-pane>
  </q-tabs>
</template>

<script>

import AddHelper from './AddHelper.vue'

export default {
  components: {
    AddHelper
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Accueil aidants',
          name: 'add_helper',
          icon: 'person add',
          default: true,
          component: 'AddHelper'
        },
        // {
        //   label: 'Messages envoyés',
        //   name: 'envoi',
        //   icon: 'mail outline',
        //   default: false,
        //   component: 'Sent'
        // }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
