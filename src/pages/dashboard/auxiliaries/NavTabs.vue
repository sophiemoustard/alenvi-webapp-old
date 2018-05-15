<template>
  <q-tabs align="justify">
    <q-tab v-for="(tab, index) in tabInfo"
          :key="index"
          :icon="tab.icon"
          slot="title"
          :label="tab.label"
          :default="tab.default"
          :disable="tab.disable || false"
          :name="tab.name"
          @click="pushGAEvents(tab.label)"/>
    <q-tab-pane class="no-border" v-for="(tab, index) in tabInfo" :key="index" :name="tab.name">
                <!-- Dynamic component loading  -->
      <component :is="tab.component" />
    </q-tab-pane>
  </q-tabs>
</template>

<script>
import Users from './Users.vue'
import AddAuxiliary from './AddAuxiliary'
import IntegrationTracking from './IntegrationTracking'

export default {
  // props: ['navTabs'],
  components: {
    Users,
    AddAuxiliary,
    IntegrationTracking
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
          label: 'Accueil auxiliaire',
          name: 'welcome_auxiliary',
          icon: 'person add',
          default: false,
          component: 'AddAuxiliary',
          // disable: true
        },
        {
          label: 'Suivi intégration',
          name: 'integration_tracking',
          icon: 'playlist add check',
          default: false,
          component: 'IntegrationTracking',
          // disable: true
        }
      ]
    }
  },
  methods: {
    pushGAEvents (label) {
      if (process.env.NODE_ENV === 'production') {
        this.$ga.event('Auxiliaires', 'click', label);
      }
    }
  }
}
</script>

<style lang="stylus">
</style>
