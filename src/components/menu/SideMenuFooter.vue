<template>
  <div class="sidemenu-footer">
      <q-item class="sidemenu-footer-border full-width">
        <q-item-main class="sidemenu-footer-user" :label="label" />
        <q-item-side v-if="userCanFeedback">
          <q-btn icon="mdi-lightbulb-on-outline" class="text-warning" flat round dense
            @click="openExtenalUrl('https://compani.atlassian.net/servicedesk/customer/portal/2')" />
        </q-item-side>
        <q-item-side v-if="isAuxiliary">
          <q-btn class="messenger-blue-text" icon="mdi-facebook-messenger" flat round dense @click="clickHandler" />
        </q-item-side>
        <q-item-side>
          <q-btn icon="person" flat round dense :to="{ name: 'account info', params: { id: userId } }" exact />
        </q-item-side>
      </q-item>
    </div>
</template>

<script>
import { ADMIN, COACH, AUXILIARY } from '../../data/constants';

export default {
  props: {
    userId: String,
    label: String,
    isAuxiliary: { type: Boolean, default: false },
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    userCanFeedback () {
      return [ COACH, ADMIN, AUXILIARY ].indexOf(this.user.role.name) !== -1;
    },
  },
  methods: {
    clickHandler () {
      this.$emit('myClick');
    },
    openExtenalUrl (url) {
      window.open(url, '_blank');
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .messenger-blue-text
    color: $messenger-blue
</style>
