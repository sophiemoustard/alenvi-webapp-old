<template>
  <div>
    <profile-header class="header-margin" />
    <profile-tabs :tabsContent="tabsContent" />
    <router-view></router-view>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import ProfileHeader from '../../../../components/ProfileHeader'
import ProfileTabs from '../../../../components/ProfileTabs'

export default {
  props: ['id'],
  components: {
    ProfileHeader,
    ProfileTabs
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Profil',
          to: { name: 'profile info', params: { id: this.id } }
        },
        {
          label: 'Test',
          to: { name: 'planning' }
        },
        {
          label: 'Test',
          to: { name: 'planning' }
        },
        {
          label: 'Test',
          to: { name: 'planning' }
        }
      ]
    }
  },
  async mounted () {
    this.getUserProfile(this.id);
  },
  methods: {
    ...mapActions({
      getUserProfile: 'rh/getUserProfile'
    })
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .header-margin
    margin-bottom: 60px
</style>
