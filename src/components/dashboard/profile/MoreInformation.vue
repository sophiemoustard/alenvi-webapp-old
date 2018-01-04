<template>
  <div class="layout-padding">
    <div class="">
      <!-- Picture -->
      <q-input v-model="user.alenvi.firstname" />
      <q-input v-model="user.alenvi.lastname" />
      <q-input v-model="user.alenvi.role.name" />
      <q-input v-model="user.ogust.date_of_birth" />
      <q-input v-model="user.alenvi.local.email" />
      <q-input v-model="user.ogust.mobile_phone" />
      <q-input v-model="user.alenvi.employee_id" />
      <q-input v-model="user.alenvi.sector" />
      <!-- First name -->
      <!-- Last name -->
      <!-- Role -->
      <!-- Date of birth -->
      <!-- Email -->
      <!-- Mobile phone -->
      <!-- Employee id -->
      <!-- Communauté (Sector), ex: "Girafe (1b*)" -->
    </div>
    <!-- EN CONSTRUCTION -->
  </div>
</template>

<script>

import { QInput, Cookies } from "quasar";

import _ from 'lodash'

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
    QInput
  },
  data() {
    return {
      user: {
        alenvi: {},
        ogust: {}
      }
    }
  },
  async created() {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getEmployeeById(this.user.alenvi.employee_id);
      console.log(this.user);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
