<template>
  <q-chips-input :value="terms" @input="inputEvent" :placeholder="placeholder">
    <q-autocomplete @search="search" @selected="selected" />
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
      toFilter: [],
    }
  },
  mounted () {
    this.initFilter();
  },
  methods: {
    inputEvent (value) {
      this.$emit('input', value);
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.toFilter.filter(el => el.value.match(regex)));
      } catch (e) {
        console.error(e);
        done([]);
      }
    },
    selected (selected) {
      this.$emit('selected', selected);
    },
    async initFilter () {
      try {
        await this.addAuxiliariesToFilter();
        await this.addSectorsToFilter();
      } catch (e) {
        console.error(e);
      }
    },
    async addSectorsToFilter () {
      const allSectorsRaw = await this.$ogust.getList('employee.sector');
      for (const k in allSectorsRaw) {
        if (k === '*') {
          continue;
        }
        this.toFilter.push({
          label: allSectorsRaw[k],
          value: allSectorsRaw[k],
          ogustSector: k
        });
      }
    },
    async addAuxiliariesToFilter () {
      this.toFilter = await this.$users.showAll({ 'role': 'Auxiliaire' });
      for (let i = 0, l = this.toFilter.length; i < l; i++) {
        this.toFilter[i].value = `${this.toFilter[i].identity.firstname} ${this.toFilter[i].identity.lastname}`;
        this.toFilter[i].label = `${this.toFilter[i].identity.firstname} ${this.toFilter[i].identity.lastname}`;
      }
    }
  }
}
</script>
