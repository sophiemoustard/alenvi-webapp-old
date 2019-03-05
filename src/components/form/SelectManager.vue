<template>
  <q-select color="white" inverted-light :value="value" ref="selectManager" @change="updateManager" :options="orderedManagers"
    :error="myError" @blur="blurHandler" filter filter-placeholder="Rechercher" separator :class="{border: inModal}" />
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    value: String,
    icon: String,
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
  },
  data () {
    return {
      managers: []
    };
  },
  async mounted () {
    await this.getManagers();
  },
  computed: {
    orderedManagers () {
      return _.sortBy(this.managers, ['label']);
    },
  },
  methods: {
    async getManagers () {
      try {
        const allManagers = await this.$ogust.getList('employee.manager');
        for (const k in allManagers) {
          this.managers.push({
            label: allManagers[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    updateManager (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .border
    border: 1px solid $light-grey
</style>
