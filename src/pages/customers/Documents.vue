<template>
  <q-page padding class="neutral-background">
  </q-page>
</template>

<script>
export default {
  metaInfo: {
    title: 'Facturation',
  },
  data () {
    return {};
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    }
  },
  methods: {}
}
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
