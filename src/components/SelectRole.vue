<template>
  <q-field :icon="icon">
    <q-select :value="value" ref="selectRoles" @change="updateRoles" :options="orderedRoles" separator />
  </q-field>
</template>

<script>
import { QField, QSelect } from 'quasar';
import _ from 'lodash';

import users from './models/Users';

export default {
  props: ['value', 'icon'],
  components: {
    QField,
    QSelect
  },
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
        const allRoles = await users.getRoles();
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