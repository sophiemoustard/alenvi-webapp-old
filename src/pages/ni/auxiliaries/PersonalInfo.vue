<template>
  <q-page padding class="neutral-background">
    <div v-if="userProfile">
      <profile-header v-if="!isAuxiliary" :profileId="id" class="header" />
      <profile-tabs v-if="!isAuxiliary" :profileId="id" :tabsContent="tabsContent" />
      <h4 v-if="isAuxiliary">Informations personnelles</h4>
      <profile-info v-if="isAuxiliary" />
    </div>
  </q-page>
</template>

<script>

import ProfileHeader from '../../../components/ProfileHeader';
import ProfileTabs from '../../../components/ProfileTabs';
import ProfileInfo from '../../../components/auxiliary/ProfileInfo';
import ProfileTasks from '../../../components/auxiliary/ProfileTasks';
import ProfileContracts from '../../../components/auxiliary/ProfileContracts';
import ProfileSalaries from '../../../components/auxiliary/ProfileSalaries';
// import ProfileAbsences from '../../../components/auxiliary/ProfileAbsences';
import { AUXILIARY, PLANNING_REFERENT } from '../../../data/constants.js';

export default {
  props: ['id'],
  components: {
    ProfileHeader,
    ProfileTabs,
    ProfileInfo
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
    },
    isAuxiliary () {
      return this.currentUser.role.name === AUXILIARY || this.currentUser.role.name === PLANNING_REFERENT;
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
        },
        {
          label: 'Contrats',
          name: 'contracts',
          default: false,
          component: ProfileContracts,
        },
        {
          label: 'Données de paie',
          name: 'salaries',
          default: false,
          component: ProfileSalaries,
        },
        // {
        //   label: 'Absences',
        //   name: 'absences',
        //   default: false,
        //   component: ProfileAbsences,
        // },
      ]
    }
  },
  async mounted () {
    await this.$store.dispatch('rh/getUserProfile', { userId: this.id });
  },
  watch: {
    async userProfile () {
      await this.$store.dispatch('rh/updateNotifications', 'user');
    }
  },
  beforeDestroy () {
    this.$store.commit('rh/saveUserProfile', null);
  }
}
</script>

<style lang="stylus" scoped>
</style>
