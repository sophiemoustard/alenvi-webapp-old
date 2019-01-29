<template>
  <q-select
    :value="value"
    color="white"
    :error="errorProp"
    inverted-light
    :stack-label="stackLabel"
    ref="selectSector"
    @change="updateSector"
    :options="orderedSectors"
    @blur="blurHandler"
    filter
    filter-placeholder="Rechercher"
    separator />
</template>

<script>
import _ from 'lodash';

export default {
  name: 'SelectSector',
  props: ['value', 'icon', 'stackLabel', 'myError'],
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
    errorProp () {
      if (this.myError) {
        return this.myError
      }
      return null
    }
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
  .q-if-inverted
    border: 1px solid $light-grey
</style>
