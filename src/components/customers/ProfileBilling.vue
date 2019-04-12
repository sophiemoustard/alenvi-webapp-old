<template>
  <div>
    <div class="q-pa-sm">
      <p class="text-weight-bold">{{ this.userProfile.identity.title }} {{ this.userProfile.identity.lastname }}</p>
      <ni-customer-billing-table :documents="customerBillingDocuments" />
    </div>
    <template v-for="(tpp, index) in Object.keys(tppBillingDocuments)">
      <div class="q-pa-sm" :key="index">
        <p class="text-weight-bold">{{ tpp }}</p>
        <ni-customer-billing-table :documents="tppBillingDocuments[tpp]" />
      </div>
    </template>
  </div>
</template>

<script>
import { CREDIT_NOTE, BILL } from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
  },
  data () {
    return {
      customerBillingDocuments: [],
      tppBillingDocuments: {},
    }
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    await Promise.all([this.getBills(), this.getCreditNotes()]);
  },
  methods: {
    async getBills () {
      try {
        const bills = await this.$bills.showAll({ customer: this.userProfile._id });
        for (const bill of bills) {
          bill.type = BILL;
          if (!bill.client) this.customerBillingDocuments.push(bill);
          else if (bill.client._id && !this.tppBillingDocuments[bill.client.name]) this.tppBillingDocuments[bill.client.name] = [bill]
          else this.tppBillingDocuments[bill.client.name].push(bill);
        }
        console.log(this.tppBillingDocuments)
      } catch (e) {
        console.error(e)
      }
    },
    async getCreditNotes () {
      try {
        const creditNotes = await this.$creditNotes.showAll({ customer: this.userProfile._id });
        this.customerBillingDocuments.push(...creditNotes.map(cn => ({ ...cn, type: CREDIT_NOTE })));
      } catch (e) {
        console.error(e)
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';

  .text-weight-bold
    color: $primary
</style>
