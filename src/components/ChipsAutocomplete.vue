<template>
  <q-chips-input ref="refFilter" class="input-search" :value="value" @input="input" @add="addEvent" @remove="removeEvent"
    :before="searchIcon" chips-bg-color="primary" inverted-light color="white" add-icon="x" :disable="disable"
    :style="disable && { width: '40px'}">
    <q-autocomplete ref="refAutocomplete" @search="search" :debounce='0'/>
  </q-chips-input>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ChipsAutocomplete',
  props: {
    value: { type: Array, default: () => [] },
    disable: { type: Boolean, default: false },
    filters: { type: Array, default: () => [] },
  },
  data () {
    return {
      searchIcon: [{ icon: 'search' }],
    }
  },
  computed: {
    ...mapGetters({
      elementToAdd: 'planning/getElementToAdd',
    }),
  },
  methods: {
    addEvent (el) {
      this.$store.commit('planning/setElementToAdd', this.filters.find(elem => elem.value === el.val));
    },
    input (el) {
      this.$emit('input', el);
    },
    removeEvent (el) {
      this.$store.commit('planning/setElementToRemove', this.filters.find(elem => elem.value === el.value[0]));
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.filters.filter(el => el.value.match(regex)));
      } catch (e) {
        done([]);
      }
    },
    // q-chips-input 'add' method called from Planning.vue only when planning starts for the first time
    add (el) {
      this.$store.commit('planning/setElementToAdd', this.filters.find(elem => elem.value === el));
      return this.$refs.refFilter.add(el);
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';
  .q-chips-input
    width: 100%
    background: white;
    box-shadow: none;
    padding: 6px 12px 6px 12px;
    cursor: default;
    border-radius: 3px;
    & /deep/ .q-icon
      cursor: default

</style>
