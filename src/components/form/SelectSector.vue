<template>
  <q-select :value="value" color="white" :error="myError" inverted-light :stack-label="stackLabel" ref="selectSector" @change="updateSector"
    :options="orderedSectors" @blur="blurHandler" @focus="focusHandler" filter filter-placeholder="Rechercher" separator :class="{border: inModal}" :company-id="companyId" />
</template>

<script>
import _ from 'lodash';

export default {
  name: 'SelectSector',
  props: {
    value: String,
    stackLabel: String,
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
    companyId: String
  },
  data () {
    return {
      sectors: []
    };
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    orderedSectors () {
      return _.sortBy(this.sectors, ['label']);
    },
  },
  methods: {
    async getSectors () {
      try {
        const sectors = await this.$sectors.showAll();
        console.log('sectors', sectors);
        this.sectors = sectors.map(sector => ({ label: sector.name, value: sector._id }));
      } catch (e) {
        console.error(e);
      }
    },
    updateSector (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
    focusHandler () {
      this.$emit('focus');
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'
  .border
    border: 1px solid $light-grey
</style>
