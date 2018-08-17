<template>
  <q-select :value="value" :stack-label="stackLabel" ref="selectSector" @change="updateSector" :options="orderedSectors" separator />
</template>

<script>
import _ from 'lodash';

export default {
  name: 'SelectSector',
  props: ['value', 'icon', 'stackLabel'],
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
    }
  }
};
</script>
