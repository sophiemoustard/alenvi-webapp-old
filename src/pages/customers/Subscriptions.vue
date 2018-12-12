<template>
  <q-page padding>
    <template v-if="customer !== {}">
      <div class="q-mb-lg">
        <p class="title">Services</p>
      </div>
      <div class="q-mb-lg">
        <p class="title">Devis</p>
      </div>
      <div class="q-mb-lg">
        <p class="title">Paiement</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom associé au compte bancaire" v-model="customer.payment.bankAccountOwner" borders />
          <ni-input caption="IBAN" v-model="customer.payment.iban" borders />
          <ni-input caption="BIC" v-model="customer.payment.bic" borders />
        </div>
      </div>
    </template>
    <template v-else>
      <p>Vous n'avez pas de bénéficiaire.</p>
    </template>
  </q-page>
</template>

<script>
import Input from '../../components/form/Input.vue';

export default {
  name: 'Subscriptions',
  components: {
    'ni-input': Input,
  },
  data () {
    return {
      customer: {},
    }
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
    }
  },
  mounted () {
    this.getCustomer();
  },
  methods: {
    async getCustomer () {
      try {
        const customerRaw = await this.$customers.getById(this.helper.customers[0]._id);
        this.customer = customerRaw.data.data.customer;
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.title
  font-size: 1.5em
  margin-bottom: 20px
</style>
