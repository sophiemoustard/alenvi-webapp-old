<template>
  <q-chips-input ref="refFilter" class="input-search" :value="value" @input="inputEvent" @add="addEvent" @remove="removed"
    :before="searchIcon" chips-bg-color="primary" inverted-light color="white" add-icon="x" autofocus>
    <q-autocomplete ref="refAutocomplete" @search="search" @selected="selected" :debounce='0'/>
  </q-chips-input>
</template>

<script>
import { mapGetters } from 'vuex';

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
    ...mapGetters({
      getFilter: 'planning/getFilter',
      getElemAdded: 'planning/getElemAdded'
    }),
  },
  methods: {
    addEvent (value) {
      console.log('@add', value);
      this.$store.commit('planning/setElemAdded', value.val);
      // this.$emit('selected', this.getFilter.find(elem => elem.value === value.val));
    },
    inputEvent (value) {
      this.$emit('input', value);
    },
    selected (el) {
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
    // q-chips-input method trigger
    add (value) {
      return this.$refs.refFilter.add(value);
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
