<template>
  <q-select color="white"
    inverted-light
    :value="value"
    ref="selectManager"
    @change="updateManager"
    :options="orderedManagers"
    :error="errorProp"
    @blur="blurHandler"
    filter
    filter-placeholder="Rechercher"
    separator />
</template>

<script>
import _ from 'lodash';

export default {
  props: ['value', 'icon', 'myError'],
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
    errorProp () {
      if (this.myError) {
        return this.myError
      }
      return null
    }
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
      this.$emit('myBlur');
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .q-if-inverted
    border: 1px solid $light-grey
</style>
