<template>
  <q-select color="white"
    inverted-light
    :value="value"
    ref="selectList"
    @change="updateList"
    :options="orderedList"
    :error="errorProp"
    @blur="blurHandler"
    :filter="filter"
    filter-placeholder="Rechercher"
    separator />
</template>

<script>
import _ from 'lodash';

export default {
  props: ['value', 'icon', 'myError', 'listType', 'filter'],
  data () {
    return {
      list: []
    };
  },
  async mounted () {
    await this.getList(this.listType);
  },
  computed: {
    orderedList () {
      return _.sortBy(this.list, ['label']);
    },
    errorProp () {
      if (this.myError) {
        return this.myError
      }
      return null
    }
  },
  methods: {
    async getList (type) {
      try {
        const list = await this.$ogust.getList(type);
        for (const k in list) {
          this.list.push({
            label: list[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    updateList (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('myBlur');
    }
  }
};
</script>
