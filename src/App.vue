<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
/*
 * Root component
 */
export default {}
</script>

<style lang="stylus">
  @import '~variables'
  body
    color: $tertiary

    h1, h2, h3, h4, h5, h6
    color: $tertiary
</style>
