<template>
  <div class="neutral-background layout-padding">
    <div class="col-xs-12 auxiliary-info-header">
      <h4 class="no-margin">Mettre à jour mes informations</h4>
    </div>
    <profile-info />
  </div>
</template>

<script>

import ProfileInfo from '../../components/ProfileInfo'

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
      this.user = await this.$users.getById(this.id, this.token);
      console.log('USER', this.user);
      this.$store.commit('rh/saveUserProfile', this.user);
    } catch (e) {
      console.error(e);
      this.$q.notify({
        color: 'negative',
        icon: 'warning',
        detail: "Erreur lors du chargement des données. Si le problème persiste, tu peux contacter l'équipe technique.",
        position: 'bottom-left',
        timeout: 2500
      });
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .auxiliary-info-header
    margin-bottom: 35px
</style>
