<template>
  <q-page padding class="neutral-background">
    <div class="col-xs-12 auxiliary-info-header">
      <h4 class="no-margin">Mettre à jour mes informations</h4>
    </div>
    <profile-info />
  </q-page>
</template>

<script>

import ProfileInfo from '../../../../components/ProfileInfo'

export default {
  props: {
    id: String,
    token: {
      type: String,
      default: null
    }
  },
  components: {
    ProfileInfo
  },
  data () {
    return {
      user: null
    }
  },
  async mounted () {
    try {
      if (this.token) {
        this.user = await this.$users.getById(this.id, this.token);
        return this.$store.commit('rh/saveUserProfile', this.user);
      }
      this.$store.dispatch('rh/getUserProfile', this.id);
    } catch (e) {
      console.error(e);
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .auxiliary-info-header
    margin-bottom: 35px
</style>
