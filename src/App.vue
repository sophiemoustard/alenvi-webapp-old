<template>
  <div id="q-app">
    <router-view />
    <q-ajax-bar color="primary" size="1px"/>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    // title: 'Webapp',
    titleTemplate: (titleChunk) => titleChunk ? `Compani - ${titleChunk}` : 'Compani',
    htmlAttrs: {
      lang: 'fr'
    }
  }
}
</script>

<style>
</style>
