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
  },
  components: {
    ProfileInfo
  },
  mounted () {
    this.$store.dispatch('rh/getUserProfile', this.id);
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .auxiliary-info-header
    margin-bottom: 35px
</style>
