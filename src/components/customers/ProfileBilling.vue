<template>
  <div>
    <div class="q-pa-sm">
      <div class="title">
        <p class="text-weight-bold">{{ this.customer.identity.title }} {{ this.customer.identity.lastname }}</p>
        <ni-date-range v-model="billingDates" @input="refresh" />
      </div>
      <ni-customer-billing-table :documents="customerBillingDocuments" :billingDates="billingDates" />
    </div>
    <template v-for="(tpp, index) in Object.keys(tppBillingDocuments)">
      <div class="q-pa-sm" :key="index">
        <p class="text-weight-bold">{{ tpp }}</p>
        <ni-customer-billing-table :documents="tppBillingDocuments[tpp]" :billingDates="billingDates" />
      </div>
    </template>
  </div>
</template>

<script>
import { CREDIT_NOTE, BILL } from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';
import DateRange from '../../components/form/DateRange';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
    'ni-date-range': DateRange,
  },
  data () {
    return {
      customerBillingDocuments: [],
      tppBillingDocuments: {},
      billingDates: {},
      balances: [],
    }
  },
  computed: {
    customer () {
      return this.$store.getters['rh/getUserProfile'];
    },
    user () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    this.setBillingDates();
    await this.refresh();
  },
  methods: {
    setBillingDates () {
      this.billingDates.endDate = this.$moment().toISOString();
      this.billingDates.startDate = this.$moment().subtract(6, 'M').hour(0).minute(0).toISOString();
    },
    async refresh () {
      this.customerBillingDocuments = [];
      this.tppBillingDocuments = {};
      await this.getCustomerBalance();
      await Promise.all([this.getBills(), this.getCreditNotes()]);
      const customerStartBalance = this.balances.length === 0 ? 0 : this.balances.find(bal => bal.customer._id === this.customer._id).balance;
      this.computeIntermediateBalances(this.customerBillingDocuments, customerStartBalance)
      for (const tpp of Object.keys(this.tppBillingDocuments)) {
        const tppStartBalance = this.balances.length === 0 ? 0 : this.balances.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer._id === tpp).balance;
        this.computeIntermediateBalances(this.tppBillingDocuments[tpp], tppStartBalance)
      }
    },
    computeIntermediateBalances (docs, startBalance) {
      docs.sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 0, l = docs.length; i < l; i++) {
        if (i === 0) docs[i].balance = startBalance + this.getInclTaxes(docs[i]);
        else docs[i].balance = docs[i - 1].balance + this.getInclTaxes(docs[i]);
      }
    },
    getInclTaxes (doc) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return doc.inclTaxesCustomer;
      }
    },
    async getCustomerBalance () {
      try {
        this.balances = await this.$balances.showAll({
          customer: this.customer._id,
          date: this.billingDates.startDate,
        });
      } catch (e) {
        this.balances = [];
        console.error(e);
      }
    },
    async getBills () {
      try {
        const bills = await this.$bills.showAll({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
        for (const bill of bills) {
          bill.type = BILL;
          if (!bill.client) this.customerBillingDocuments.push(bill);
          else if (bill.client._id && !this.tppBillingDocuments[bill.client.name]) this.tppBillingDocuments[bill.client.name] = [bill]
          else this.tppBillingDocuments[bill.client.name].push(bill);
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getCreditNotes () {
      try {
        const creditNotes = await this.$creditNotes.showAll({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
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

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
</style>
