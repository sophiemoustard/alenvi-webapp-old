<template>
  <div class="profile-tabs">
    <q-tabs align="justify" color="transparent" text-color="primary">
       <q-tab
        v-for="(tab, index) in tabsContent"
        :key="index"
        slot="title"
        :label="tab.label"
        :default="tab.default"
        :name="tab.name"
        :alert="tab.notification && notifications[tab.notification][profileId] ? notifications[tab.notification][profileId] : false"
        />
      <q-tab-pane class="no-border" v-for="(tab, index) in tabsContent" :key="index" :name="tab.name">
      <!-- Dynamic component loading  -->
      <component :is="tab.component" />
    </q-tab-pane>
    </q-tabs>
  </div>
</template>

<script>
export default {
  name: 'ProfileTabs',
  props: ['tabsContent', 'profileId'],
  computed: {
    notifications () {
      return this.$store.getters['rh/getNotifications'];
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .profile-tabs
    & /deep/ .q-tabs
      &-scroller
        & div:nth-last-child(2)
          margin-right: 0 !important
        & .q-tab
          flex: 1 1 0
          margin-right: 24px
      &-normal
        & .q-tab-label
          color: $dark-grey
          opacity: 1
      & .q-tabs-panes .q-tab-pane
        padding: 0
        padding-top: 24px
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
          & .q-dot
            background: $secondary
</style>
