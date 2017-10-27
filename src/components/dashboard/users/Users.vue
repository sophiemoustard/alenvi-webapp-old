<template>
  <div>
    <nav-tabs :navTabs="tabInfo"></nav-tabs>
  </div>
</template>

<script>
import NavTabs from './NavTabs.vue'

export default {
  components: {
    NavTabs
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Vue planning',
          name: 'planning',
          icon: 'date range',
          default: false,
          component: 'Planning'
        },
        {
          label: 'Comptes Pigi',
          name: 'pigi',
          icon: 'supervisor account',
          default: true,
          component: 'PigiAccounts'
        },
        {
          label: 'Contrat Travail',
          name: 'rh',
          icon: 'subject',
          default: false,
          component: 'EmploymentContract'
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
