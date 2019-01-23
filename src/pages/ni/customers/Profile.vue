<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <profile-header :customer="true" :profileId="id" class="header" />
      <profile-tabs :profileId="id" :tabsContent="tabsContent" />
    </div>
  </q-page>
</template>

<script>

import ProfileHeader from '../../../components/ProfileHeader';
import ProfileTabs from '../../../components/ProfileTabs';
import ProfileFollowUp from '../../../components/customers/ProfileFollowUp'
import ProfileInfo from '../../../components/customers/ProfileInfo'

export default {
  props: ['id'],
  components: {
    ProfileHeader,
    ProfileTabs
  },
  metaInfo: {
    title: 'Infos personnelles'
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    currentUser () {
      return this.$store.getters['main/user'];
    }
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Accompagnement',
          name: 'followUp',
          default: true,
          component: ProfileFollowUp
        },
        {
          label: 'Infos',
          name: 'info',
          default: false,
          component: ProfileInfo,
          notification: 'profiles'
        },
      ]
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { customerId: this.id });
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications', 'customer');
    }
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
    @media (max-width: 768px)
      margin-bottom: 40px
</style>
