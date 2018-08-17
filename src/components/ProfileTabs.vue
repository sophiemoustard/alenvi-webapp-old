<template>
  <div class="profile-tabs">
    <q-tabs align="justify" color="transparent" text-color="primary">
       <q-route-tab
        v-for="(tab, index) in tabsContent"
        :key="index"
        slot="title"
        :label="tab.label"
        :to="tab.to"
        exact />
    </q-tabs>
  </div>
</template>

<script>
export default {
  name: 'ProfileTabs',
  props: ['tabsContent']
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .profile-tabs
    margin-bottom: 24px
    & /deep/ .q-tabs
      &-scroller
        a
          border-right: 24px solid transparent
          &:last-of-type
            border: 0
      &-normal
        & .q-tab-label
          color: $dark-grey
          opacity: 1
      & > .q-tabs-head
        font-size: 24px
        &:not(.scrollable)
          @media (min-width: 992px)
            padding: 0
        & .q-tab
          text-transform: none
          align-items: start
          &:before
            background: none
          &.active
            & .q-tab-label
              color: $primary
              font-weight: 700
            & .q-tabs-bar
              color: inherit
          @media (min-width: 992px)
            padding-left: 0
          & .q-tabs-bar
            display: block !important
            color: $light-grey
</style>
