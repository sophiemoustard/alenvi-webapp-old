<template>
  <div class="row q-mb-md">
    <div class="col-11 row person-name">
      <img :src="avatar" class="avatar">
      <div class="displayed-name" v-if="options.length === 0">{{ selectedPerson.identity | formatIdentity('FL') }}</div>
      <q-select v-else filter :value="value" color="white" inverted-light :options="options"
        :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { $refs['personSelect'].show() } }]"
        :filter-placeholder="placeholder" ref="personSelect" @input="$emit('input', $event)" />
    </div>
    <div class="col-1 cursor-pointer modal-btn-close">
      <span><q-icon name="clear" @click.native="$emit('close')" /></span>
    </div>
  </div>
</template>

<script>
import { UNKNOWN_AVATAR, DEFAULT_AVATAR } from '../../data/constants';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'PlanningModalHeader',
  props: {
    value: { type: String },
    options: { type: Array, default: () => [] },
    selectedPerson: { type: Object, default: () => ({}) },
  },
  computed: {
    avatar () {
      return (!this.selectedPerson || !this.selectedPerson._id)
        ? UNKNOWN_AVATAR
        : this.$_.get(this.selectedPerson, 'picture.link') || DEFAULT_AVATAR;
    },
    selectIcon () {
      return [{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { this.$refs['personSelect'].show() } }]
    },
    placeholder () {
      return `${this.selectedPerson.identity.firstname} ${this.selectedPerson.identity.lastname}`;
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .displayed-name
    margin-left: 5px;
</style>
