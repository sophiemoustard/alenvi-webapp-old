<template>
  <div class="layout-padding">
    <h5 id="main-title" class="text-center">Bienvenue sur votre espace d'accompagnement privé Alenvi !</h5>
    <div class="row justify-center xl-gutter">
      <div @click="goTo({ name: 'customer planning' })">
        <q-icon name="date range" size="5rem"></q-icon>
        <p class="text-center">Planning</p>
      </div>
      <div @click="goTo({ name: 'customer documents' })">
        <q-icon name="folder" size="5rem"></q-icon>
        <p class="text-center">Facturation</p>
      </div>
    </div>

    <!-- <div class="row justify-center"> -->
      <!-- <br> -->
      <!-- <div style="width: 700px; max-width: 90vw;"> -->
        <!-- <p>Bénéficiaire concerné(e): <span v-if="user.first_name">{{ user.first_name }}</span> {{ user.last_name }}</p> -->
        <!-- <p v-if="auxiliaryRef">Auxiliaire d'envie référent(e): {{ auxiliaryRef }}</p> -->
        <!-- <p v-if="coach">Coach référent(e): {{ coach }}</p> -->
      <!-- </div> -->
    <!-- </div> -->
    <latest-articles />
  </div>
</template>

<script>

import ogust from '../../models/Ogust';
import LatestArticles from './LatestArticles';
import { QIcon } from 'quasar'

export default {
  components: {
    LatestArticles,
    QIcon
  },
  data () {
    return {
      user: '',
      coach: '',
      auxiliaryRef: ''
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
      const managers = await ogust.getList('employee.manager');
      this.coach = managers[this.user.manager];
      const customerDetailsRaw = await ogust.getOgustCustomerDetails(null, this.getUser.customer_id);
      this.auxiliaryRef = customerDetailsRaw.data.data.info.thirdPartyInformations.array_values['REF'];
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    goTo (name) {
      this.$router.push(name);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

#main-title
  margin-bottom: 40px

</style>
