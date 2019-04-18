<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p class="text-weight-bold">{{ this.customer.identity.title }} {{ this.customer.identity.lastname }}</p>
        <ni-date-range v-model="billingDates" @input="refresh" />
      </div>
      <ni-customer-billing-table v-if="!loading" :documents="customerBillingDocuments" :billingDates="billingDates" />
      <div align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" @click="openPaymentCreationModal(customer)"
          no-caps flat color="white" icon="add" />
      </div>
    </div>
    <template v-for="(tpp, index) in Object.keys(tppBillingDocuments)">
      <div class="q-pa-sm q-mb-lg" :key="index">
        <p class="text-weight-bold">{{ tpp }}</p>
        <ni-customer-billing-table v-if="!loading" :documents="tppBillingDocuments[tpp]" :billingDates="billingDates" />
        <div align="right">
          <q-btn class="add-payment" label="Ajouter un réglement" no-caps flat color="white" icon="add"
            @click="openPaymentCreationModal(customer, tppBillingDocuments[tpp][0].client)"/>
        </div>
      </div>
    </template>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal :newPayment="newPayment" :validations="$v.newPayment" :selectedClient="selectedClient"
      @createPayment="createPayment" :creationModal="paymentCreationModal" :selectedCustomer="selectedCustomer"
      :loading="creationLoading" @resetForm="resetPaymentCreationModal"  />
  </div>
</template>

<script>
import { CREDIT_NOTE, BILL, WITHDRAWAL, BANK_TRANSFER, CHECK, CESU, REFUND } from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';
import PaymentCreationModal from '../../components/customers/PaymentCreationModal';
import DateRange from '../../components/form/DateRange';
import { paymentMixin } from '../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../components/popup/notify';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
    'ni-date-range': DateRange,
    'ni-payment-creation-modal': PaymentCreationModal,
  },
  mixins: [paymentMixin],
  data () {
    return {
      loading: true,
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
      this.loading = true;
      this.customerBillingDocuments = [];
      this.tppBillingDocuments = {};
      await this.getCustomerBalance();
      await Promise.all([this.getBills(), this.getCreditNotes(), this.getPayments()]);
      const customerStartBalance = this.balances.length === 0 ? 0 : this.balances.find(bal => bal.customer._id === this.customer._id).balance;
      this.computeIntermediateBalances(this.customerBillingDocuments, customerStartBalance)
      for (const tpp of Object.keys(this.tppBillingDocuments)) {
        const tppStartBalance = this.balances.length === 0 ? 0 : this.balances.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer._id === tpp).balance;
        this.computeIntermediateBalances(this.tppBillingDocuments[tpp], tppStartBalance)
      }
      this.loading = false;
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
        case BANK_TRANSFER:
        case WITHDRAWAL:
        case CHECK:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
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
    async getPayments () {
      try {
        const payments = await this.$payments.list({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
        for (const payment of payments) {
          if (!payment.client) this.customerBillingDocuments.push(payment);
          else if (payment.client._id && !this.tppBillingDocuments[payment.client.name]) this.tppBillingDocuments[payment.client.name] = [payment]
          else this.tppBillingDocuments[payment.client.name].push(payment);
        }
      } catch (e) {
        console.error(e)
      }
    },
    async createPayment () {
      try {
        this.creationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (this.newPayment.customer === this.newPayment.client) delete this.newPayment.client;
        await this.$payments.create(this.newPayment);
        NotifyPositive('Règlement créé');
        await this.refresh();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.creationLoading = false;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';

  .add-payment
    background-color: $primary;

  .text-weight-bold
    color: $primary

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
</style>
