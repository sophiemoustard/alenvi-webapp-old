<template>
  <div>
    <profile-header :user="user" class="header-margin" />
    <profile-tabs :tabsContent="tabsContent" />
    <router-view></router-view>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

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
      user: null,
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
    this.user = await this.$users.getById(this.id);
    this.saveUserProfile(this.user);
  },
  methods: {
    ...mapMutations({
      saveUserProfile: 'rh/saveUserProfile'
    })
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .header-margin
    margin-bottom: 60px
</style>
