<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Bienvenue sur votre espace d'accompagnement privé Alenvi !</p>
        <br>
        <p>Bénéficiaire concerné(e): <span v-if="user.first_name">{{ user.first_name }}</span> {{ user.last_name }}</p>
        <p v-if="auxiliaryRef">Auxiliaire d'envie référent(e): {{ auxiliaryRef }}</p>
        <p>Coach référent(e): {{ coach }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// import {  } from 'quasar';

import users from '../../models/Users';
import ogust from '../../models/Ogust';

export default {
  components: {
  },
  data () {
    return {
      user: {},
      coach: {},
      auxiliaryRef: {}
    }
  },
  computed: {
    getUser () {
      return this.$store.getters.user;
    }
  },
  async created () {
    try {
      this.user = await ogust.getCustomerById(this.getUser.customer_id);
      console.log(this.user);
      const managers = await ogust.getList('employee.manager');
      this.coach = managers[this.user.manager];
      console.log(this.coach);
      const customerDetailsRaw = await ogust.getOgustCustomerDetails(null, this.getUser.customer_id);
      this.auxiliaryRef = customerDetailsRaw.data.data.info.thirdPartyInformations.array_values['REF'];
      console.log(this.auxiliaryRef);
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
