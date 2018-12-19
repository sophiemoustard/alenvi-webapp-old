<template>
  <q-page padding class="neutral-background">
    <h4 id="main-title" class="text-center">Bienvenue sur votre espace d'accompagnement privé Alenvi !</h4>
    <div class="row justify-center gutter-xl">
      <div class="cursor-pointer" @click="goTo({ name: 'customer planning' })">
        <q-icon color="grey" name="date range" size="5rem"></q-icon>
        <p class="text-center">Planning</p>
      </div>
      <div class="cursor-pointer" @click="goTo({ name: 'customer documents' })">
        <q-icon color="grey" name="folder" size="5rem"></q-icon>
        <p class="text-center">Facturation</p>
      </div>
    </div>
    <latest-articles />
  </q-page>
</template>

<script>
import LatestArticles from '../../components/LatestArticles';

export default {
  components: {
    LatestArticles
  },
  metaInfo: {
    title: 'Votre espace'
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
      return this.$store.getters['main/user'];
    }
  },
  async created () {
    try {
      this.user = await this.$ogust.getCustomerById(this.getUser.customer_id);
      const managers = await this.$ogust.getList('employee.manager');
      this.coach = managers[this.user.manager];
      const customerDetailsRaw = await this.$ogust.getOgustCustomerDetails(null, this.getUser.customer_id);
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
}
</script>

<style lang="stylus" scoped>
@import '~variables'

#main-title
  margin-bottom: 40px
</style>
