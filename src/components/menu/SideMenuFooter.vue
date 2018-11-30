<template>
  <div class="sidemenu-footer">
      <q-item class="sidemenu-footer-border full-width">
        <q-item-main class="sidemenu-footer-user" :label="label" />
        <q-item-side v-if="isAuxiliary">
          <q-btn class="messenger-blue-text" icon="mdi-facebook-messenger" big flat round dense @click="clickHandler" />
        </q-item-side>
        <q-item-side>
          <q-btn icon="person" big flat round dense :to="{ name: 'account info', params: { id: userId } }" exact />
        </q-item-side>
      </q-item>
    </div>
</template>

<script>
export default {
  props: {
    userId: String,
    label: String,
    isAuxiliary: { type: Boolean, default: false },
  },
  methods: {
    clickHandler () {
      this.$emit('myClick');
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .messenger-blue-text
    color: $messenger-blue
</style>
