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
import MainInformation from './MainInformation.vue'
import Salaries from './Salaries.vue'
import More from './MoreInformation.vue'

export default {
  // props: ['navTabs'],
  components: {
    MainInformation,
    Salaries,
    More
  },
  data () {
    return {
      tabInfo: [
        {
          label: 'Profil',
          name: 'profil',
          icon: 'person',
          default: true,
          component: 'MainInformation',
          // disable: true
        },
        {
          label: 'Bulletins',
          name: 'salaries',
          icon: 'euro symbol',
          default: false,
          component: 'Salaries',
          // disable: true
        },
        {
          label: 'Plus...',
          name: 'welcome_auxiliary',
          icon: 'line weight',
          default: false,
          component: 'More',
          // disable: true
        }
      ]
    }
  }
}
</script>

<style lang="stylus">
</style>
