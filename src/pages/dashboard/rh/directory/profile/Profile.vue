<template>
  <q-page padding v-if="userProfile" class="neutral-background">
    <profile-header :profileId="id" class="header-margin" />
    <profile-tabs :profileId="id" :tabsContent="tabsContent" />
    <router-view></router-view>
  </q-page>
</template>

<script>

import ProfileHeader from '../../../../../components/ProfileHeader'
import ProfileTabs from '../../../../../components/ProfileTabs'

export default {
  props: ['id'],
  components: {
    ProfileHeader,
    ProfileTabs
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    }
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Profil',
          to: { name: 'profile info', params: { id: this.id } },
          notification: 'profiles'
        },
        {
          label: 'Test',
          to: { name: 'planning' },
          notification: 'profiles'
        },
        {
          label: 'Test',
          to: { name: 'planning' },
          notification: 'profiles'
        },
        {
          label: 'Test',
          to: { name: 'planning' },
          notification: 'profiles'
        }
      ]
    }
  },
  async mounted () {
    this.$store.dispatch('rh/getUserProfile', this.id);
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .header-margin
    margin-bottom: 60px
</style>
