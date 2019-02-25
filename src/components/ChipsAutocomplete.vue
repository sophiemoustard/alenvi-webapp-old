<template>
  <q-chips-input class="input-search" :value="value" @input="inputEvent" @remove="removed"
    :before="searchIcon" chips-bg-color="primary" inverted-light color="white" add-icon="x" autofocus>
    <q-autocomplete @search="search" @selected="selected" :debounce='0'/>
  </q-chips-input>
</template>

<script>

export default {
  name: 'ChipsAutocomplete',
  props: {
    value: { type: Array, default: () => [] },
    filters: { type: Array, default: () => [] },
  },
  data () {
    return {
      searchIcon: [{
        icon: 'search'
      }],
    }
  },
  methods: {
    inputEvent (value) {
      this.$emit('input', value);
    },
    selected (el) {
      this.$emit('selected', el);
    },
    removed (el) {
      this.$emit('remove', this.filters.find(elem => elem.value === el.value[0]));
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.filters.filter(el => el.value.match(regex)));
      } catch (e) {
        done([]);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .q-chips-input
    background: white;
    box-shadow: none;
    padding: 6px 12px 6px 12px;
    cursor: default;
    border-radius: 3px;
    & /deep/ .q-icon
      cursor: default

</style>
