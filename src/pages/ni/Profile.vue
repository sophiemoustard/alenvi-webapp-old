<template>
  <q-page padding v-if="userProfile" class="neutral-background">
    <profile-header v-if="currentUser.role.name !== 'Auxiliaire'" :profileId="id" class="header-margin" />
    <profile-tabs v-if="currentUser.role.name !== 'Auxiliaire'" :profileId="id" :tabsContent="tabsContent" />
    <profile-info v-if="currentUser.role.name === 'Auxiliaire'" />
  </q-page>
</template>

<script>

import ProfileHeader from '../../components/ProfileHeader';
import ProfileTabs from '../../components/ProfileTabs';
import ProfileInfo from '../../components/ProfileInfo';
import ProfileTasks from '../../components/ProfileTasks';

export default {
  props: ['id'],
  components: {
    ProfileHeader,
    ProfileTabs,
    ProfileInfo
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
          label: 'Infos personnelles',
          name: 'info',
          default: true,
          component: ProfileInfo,
          notification: 'profiles'
        },
        {
          label: 'Tâches',
          name: 'tasks',
          default: false,
          component: ProfileTasks,
          notification: 'tasks'
        }
      ]
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', this.id);
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications');
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
