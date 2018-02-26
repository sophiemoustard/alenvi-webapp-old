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

import Rights from './Rights.vue'

export default {
  components: {
    Rights
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Droits',
          name: 'rights',
          icon: 'verified user',
          default: true,
          component: 'Rights'
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
