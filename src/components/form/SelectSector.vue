<template>
  <q-select :value="value" color="white" :error="myError" inverted-light :stack-label="stackLabel" ref="selectSector" @change="updateSector"
    :options="orderedSectors" @blur="blurHandler" filter filter-placeholder="Rechercher" separator :class="{border: inModal}" />
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
      return _.sortBy(this.sectors, ['value']);
    },
  },
  methods: {
    async getSectors () {
      try {
        const allSectorsRaw = await this.$ogust.getList('employee.sector');
        for (const k in allSectorsRaw) {
          if (k === '*') {
            continue;
          }
          this.sectors.push({
            label: allSectorsRaw[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    updateSector (value) {
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
  .border
    border: 1px solid $light-grey
</style>
