<template>
  <div v-if="userProfile">
    <div class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <select-sector stackLabel="Communauté" />
      </div>
      <div class="col-xs-12 col-md-6">
        <select-mentor stackLabel="Marraine/parrain" :sector="userProfile.sector" />
      </div>
    </div>
    <div class="row gutter-profile q-mb-xl">
      <div class="row justify-between">
        <p>Identité</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import SelectSector from '../../../../components/SelectSector'
import SelectMentor from '../../../../components/SelectMentor'

export default {
  components: {
    SelectSector,
    SelectMentor
  },
  computed: {
    ...mapGetters({
      userProfile: 'rh/getUserProfile'
    })
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .gutter-profile
    margin-top: -24px
    margin-left: -24px
    & > div
      padding-top: 24px
      padding-left: 24px

  .q-if /deep/
    & .q-if-label
      color: $dark-grey
</style>
