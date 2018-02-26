<template>
  <q-field :icon="icon" helper="Géré par">
    <q-select :value="value" ref="selectManager" @change="updateManager" :options="orderedManagers" separator />
  </q-field>
</template>

<script>
import _ from 'lodash';

export default {
  props: ['value', 'icon'],
  data () {
    return {
      managers: []
    };
  },
  async mounted () {
    await this.getManagers();
  },
  computed: {
    orderedManagers () {
      return _.sortBy(this.managers, ['label']);
    }
  },
  methods: {
    async getManagers () {
      try {
        const allSectorsRaw = await this.$users.showAll({ role: 'Coach' });
        for (let i = 0, l = allSectorsRaw.length; i < l; i++) {
          this.managers.push({
            label: `${allSectorsRaw[i].firstname} ${allSectorsRaw[i].lastname}`,
            value: allSectorsRaw[i]._id
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    updateManager (value) {
      this.$emit('input', value);
    }
  }
};
</script>
