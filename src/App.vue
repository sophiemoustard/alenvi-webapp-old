<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <router-view />
    <q-ajax-bar color="primary" />
  </div>
</template>

<script>
import { QAjaxBar } from 'quasar'
/*
 * Root component
 */
export default {
  components: {
    QAjaxBar
  }
}
</script>

<style lang="stylus">
  @import '~variables'
  body
    color: $tertiary

    h1, h2, h3, h4, h5, h6
    color: $tertiary
</style>
