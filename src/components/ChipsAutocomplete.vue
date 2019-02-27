<template>
  <q-chips-input ref="refFilter" class="input-search" :value="value" @input="inputEvent" @remove="removed"
    :before="searchIcon" chips-bg-color="primary" inverted-light color="white" add-icon="x" autofocus>
    <q-autocomplete @search="search" @selected="selected" :debounce='0'/>
  </q-chips-input>
</template>

<script>

export default {
  name: 'ChipsAutocomplete',
  props: {
    myRef: String,
    value: { type: Array, default: () => [] },
  },
  data () {
    return {
      searchIcon: [{
        icon: 'search'
      }],
    }
  },
  computed: {
    getFilter () {
      return this.$store.getters['planning/getFilter'];
    },
  },
  methods: {
    inputEvent (value) {
      console.log('test');
      this.$emit('input', value);
    },
    selected (el) {
      console.log('test2');
      this.$emit('selected', el);
    },
    removed (el) {
      this.$emit('remove', this.getFilter.find(elem => elem.value === el.value[0]));
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.getFilter.filter(el => el.value.match(regex)));
      } catch (e) {
        done([]);
      }
    },
    add (value) {
      return this.$refs.refFilter.add(value);
    }
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
