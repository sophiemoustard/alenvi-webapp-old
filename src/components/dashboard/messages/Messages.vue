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
          label: 'Envoi message',
          name: 'message',
          icon: 'message',
          default: true,
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
