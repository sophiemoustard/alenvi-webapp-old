<template>
  <q-field :icon="icon">
    <q-select :value="value" ref="selectRoles" @change="updateRoles" :options="orderedRoles" separator />
  </q-field>
</template>

<script>
import _ from 'lodash';

export default {
  props: ['value', 'icon'],
  data () {
    return {
      roles: []
    };
  },
  async mounted () {
    await this.getRoles();
  },
  computed: {
    orderedRoles () {
      return _.sortBy(this.roles, ['value']);
    }
  },
  methods: {
    async getRoles () {
      try {
        const allRoles = await this.$users.getRoles();
        for (const k in allRoles) {
          this.roles.push({
            label: allRoles[k].name,
            value: allRoles[k].name
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    updateRoles (value) {
      this.$emit('input', value);
    }
  }
};
</script>
