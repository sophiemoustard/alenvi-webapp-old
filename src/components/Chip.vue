<template>
  <div class="full-width row relative-position">
    <img :src="avatar" class="avatar">
    <q-chip class="absolute-center" small text-color="white">TEST</q-chip>
  </div>
</template>

<script>
export default {
  name: 'ni-chip',
  props: {
    avatar: String
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  img
    z-index: 10
    &.avatar
      box-shadow: none
      border: 1px solid #979797
      @media(min-width: 1025px)
        width: 2.5rem
        height: 2.5rem
      @media(max-width: 1024px)
        width: 1.5rem
        height: 1.5rem

  /deep/ .q-chip
    background: $dark-grey
    width: 80%
    @media(max-width: 1024px)
      font-size: 10px
    &-main
      text-align: center
    &-small
      @media(max-width: 1024px)
        min-height: 20px

</style>
