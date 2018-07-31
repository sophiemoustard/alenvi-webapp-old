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
    title: 'Webapp',
    titleTemplate: 'Alenvi - %s',
    htmlAttrs: {
      lang: 'fr'
    }
  }
}
</script>

<style>
</style>
