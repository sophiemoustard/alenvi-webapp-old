<template>
  <q-field icon="group" helper="Choix communauté">
    <q-select :value="value" ref="selectSector" @change="updateSector" :options="orderedSectors" separator />
  </q-field>
</template>

<script>
import { QField, QSelect } from 'quasar';
import _ from 'lodash';

import ogust from './models/Ogust';

export default {
  props: ['value'],
  components: {
    QField,
    QSelect
  },
  data() {
    return {
      sectors: []
    };
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    orderedSectors() {
      return _.sortBy(this.sectors, ['value']);
    }
  },
  methods: {
    async getSectors() {
      try {
        const allSectorsRaw = await ogust.getOgustSectors();
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
  },
};
</script>