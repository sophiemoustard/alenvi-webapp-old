<template>
  <q-chips-input class="input-search" :value="terms" @input="inputEvent" :placeholder="placeholder" @remove="removed"
    :before="searchIcon" chips-bg-color="primary" inverted-light color="white" add-icon="x">
    <q-autocomplete @search="search" @selected="selected"/>
  </q-chips-input>
</template>

<script>

export default {
  name: 'ChipsAutocomplete',
  props: {
    terms: { type: Array, default: () => [] },
    placeholder: String,
  },
  data () {
    return {
      filter: [],
      searchIcon: [{
        icon: 'search'
      }]
    }
  },
  mounted () {
    this.initFilter();
  },
  methods: {
    inputEvent (value) {
      this.$emit('input', value);
    },
    selected (el) {
      this.$emit('selected', el);
    },
    removed (el) {
      this.$emit('remove', this.filter.find(elem => elem.value === el.value[0]));
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.filter.filter(el => el.value.match(regex)));
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    async initFilter () {
      try {
        await this.addAuxiliariesToFilter();
        await this.addSectorsToFilter();
        this.$emit('updatedFilter', this.filter);
      } catch (e) {
        console.error(e);
      }
    },
    async addAuxiliariesToFilter () {
      this.filter = await this.$users.showAllActive({ 'role': 'Auxiliaire' });
      for (let i = 0, l = this.filter.length; i < l; i++) {
        this.filter[i].value = `${this.filter[i].identity.firstname} ${this.filter[i].identity.lastname}`;
        this.filter[i].label = `${this.filter[i].identity.firstname} ${this.filter[i].identity.lastname}`;
      }
    },
    async addSectorsToFilter () {
      const allSectorsRaw = await this.$ogust.getList('employee.sector');
      for (const k in allSectorsRaw) {
        if (k === '*') {
          continue;
        }
        this.filter.push({
          label: allSectorsRaw[k],
          value: allSectorsRaw[k],
          ogustSector: k
        });
      }
    },
  }
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

  .q-if:not(.q-if-disabled):not(.q-if-error):not(.q-if-warning):hover:before
    color: $primary
</style>
