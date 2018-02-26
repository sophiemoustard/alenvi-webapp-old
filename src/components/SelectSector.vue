<template>
  <q-field :icon="icon" helper="Choix communauté (si elle n'est pas disponible, il faut la créer dans Ogust)">
    <q-select :value="value" ref="selectSector" @change="updateSector" :options="orderedSectors" separator />
  </q-field>
</template>

<script>
import _ from 'lodash';

export default {
  props: ['value', 'icon'],
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
