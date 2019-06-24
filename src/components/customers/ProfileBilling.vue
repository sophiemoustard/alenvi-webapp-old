<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p class="text-weight-bold">{{ this.customer.identity.title }} {{ this.customer.identity.lastname }}</p>
        <ni-date-range v-model="billingDates" @input="refresh" />
      </div>
      <ni-customer-billing-table v-if="!loading" :documents="customerBillingDocuments" :billingDates="billingDates"
        :displayActions="user.role.name === ADMIN || user.role.name === COACH" @openEditionModal="openEditionModal"
        :type="CUSTOMER" :startBalance="getStartBalance()" :endBalance="getEndBalance(customerBillingDocuments)" />
      <div v-if="user.role.name === ADMIN || user.role.name === COACH" align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" @click="openPaymentCreationModal(customer)"
          no-caps flat color="white" icon="add" />
      </div>
    </div>
    <template v-for="(tpp, index) in Object.keys(tppBillingDocuments)">
      <div class="q-pa-sm q-mb-lg" :key="index">
        <p class="text-weight-bold">{{ tpp }}</p>
        <ni-customer-billing-table v-if="!loading" :documents="tppBillingDocuments[tpp]" :billingDates="billingDates"
          :displayActions="user.role.name === ADMIN || user.role.name === COACH" @openEditionModal="openEditionModal"
          :type="THIRD_PARTY_PAYER" :startBalance="getStartBalance(tpp)"
          :endBalance="getEndBalance(tppBillingDocuments[tpp], tpp)" />
        <div v-if="user.role.name === ADMIN || user.role.name === COACH" align="right">
          <q-btn class="add-payment" label="Ajouter un réglement" no-caps flat color="white" icon="add"
            @click="openPaymentCreationModal(customer, tppBillingDocuments[tpp][0].client)"/>
        </div>
      </div>
    </template>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal :newPayment="newPayment" :validations="$v.newPayment" :selectedClientName="selectedClientName"
      @createPayment="createPayment" :creationModal="paymentCreationModal" :selectedCustomer="selectedCustomer"
      :loading="loading" @resetForm="resetPaymentCreationModal" />

    <!-- Payment edition modal -->
    <ni-payment-edition-modal :editedPayment="editedPayment" :validations="$v.editedPayment" :selectedClientName="selectedClientName"
      @updatePayment="updatePayment" :editionModal="paymentEditionModal" :selectedCustomer="selectedCustomer"
      :loading="loading" @resetForm="resetPaymentEditionModal" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { CREDIT_NOTE, BILL, DIRECT_DEBIT, BANK_TRANSFER, CHECK, CESU, REFUND, ADMIN, COACH, CUSTOMER, THIRD_PARTY_PAYER } from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';
import PaymentCreationModal from '../../components/customers/PaymentCreationModal';
import PaymentEditionModal from '../../components/customers/PaymentEditionModal';
import DateRange from '../../components/form/DateRange';
import { paymentMixin } from '../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../components/popup/notify';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
    'ni-date-range': DateRange,
    'ni-payment-creation-modal': PaymentCreationModal,
    'ni-payment-edition-modal': PaymentEditionModal,
  },
  mixins: [paymentMixin],
  data () {
    return {
      loading: true,
      paymentEditionModal: false,
      customerBillingDocuments: [],
      tppBillingDocuments: {},
      billingDates: { startDate: this.$moment().toISOString(), endDate: this.$moment().toISOString() },
      balances: [],
      COACH,
      ADMIN,
      CUSTOMER,
      THIRD_PARTY_PAYER,
      editedPayment: {},
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
  validations: {
    editedPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    },
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    }
  },
  methods: {
    // Billing dates
    setBillingDates () {
      this.billingDates.endDate = this.$moment().endOf('d').toISOString();
      this.billingDates.startDate = this.$moment().subtract(6, 'M').startOf('d').toISOString();
    },
    // Compute balances
    getEndBalance (documents, tpp) {
      if (!documents || documents.length === 0) return this.getStartBalance(tpp);
      return documents[documents.length - 1].balance;
    },
    getStartBalance (tpp = null) {
      const balance = !tpp
        ? this.balances.find(bal => bal.customer._id === this.customer._id && !bal.thirdPartyPayer)
        : this.balances.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer.name === tpp);

      return balance ? balance.balance : 0;
    },
    computeCustomerBalance () {
      const customerStartBalance = this.getStartBalance();
      this.computeIntermediateBalances(this.customerBillingDocuments, customerStartBalance, CUSTOMER)
    },
    computeTppBalances () {
      for (const tpp of Object.keys(this.tppBillingDocuments)) {
        const tppStartBalance = this.getStartBalance(tpp)
        this.computeIntermediateBalances(this.tppBillingDocuments[tpp], tppStartBalance, THIRD_PARTY_PAYER)
      }
    },
    computeIntermediateBalances (docs, startBalance, type) {
      docs.sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 0, l = docs.length; i < l; i++) {
        if (i === 0) docs[i].balance = startBalance + this.getInclTaxes(docs[i], type);
        else docs[i].balance = docs[i - 1].balance + this.getInclTaxes(docs[i], type);
      }
    },
    getInclTaxes (doc, type) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return type === CUSTOMER ? doc.inclTaxesCustomer : doc.inclTaxesTpp;
        case BANK_TRANSFER:
        case DIRECT_DEBIT:
        case CHECK:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    // Refresh data
    async refresh () {
      this.loading = true;
      this.customerBillingDocuments = [];
      this.tppBillingDocuments = {};
      await Promise.all([this.getBills(), this.getCreditNotes(), this.getPayments(), this.getCustomerBalance()]);
      this.computeCustomerBalance();
      this.computeTppBalances();
      this.loading = false;
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
        for (const cd of creditNotes) {
          cd.type = CREDIT_NOTE;
          if (cd.inclTaxesTpp && !this.tppBillingDocuments[cd.thirdPartyPayer.name]) this.tppBillingDocuments[cd.thirdPartyPayer.name] = [cd]
          else if (cd.inclTaxesTpp && this.tppBillingDocuments[cd.thirdPartyPayer.name]) this.tppBillingDocuments[cd.thirdPartyPayer.name].push(cd);

          if (cd.inclTaxesCustomer) this.customerBillingDocuments.push(cd);
        }
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
    // Payments
    async createPayment () {
      try {
        this.loading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.formatPayload(this.newPayment);
        await this.$payments.create(payload);
        this.paymentCreationModal = false;
        NotifyPositive('Règlement créé');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.loading = false;
      }
    },
    openEditionModal (payment) {
      this.editedPayment = {
        _id: payment._id,
        nature: payment.nature,
        netInclTaxes: payment.netInclTaxes,
        type: payment.type,
        date: payment.date,
      };

      this.paymentEditionModal = true;
      this.selectedCustomer = payment.customer;
      this.selectedClientName = payment.client ? payment.client.name : payment.customer.identity.lastname;
    },
    resetPaymentEditionModal () {
      this.paymentEditionModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedClientName = '';
      this.editedPayment = {};
    },
    async updatePayment () {
      try {
        this.loading = true;
        this.$v.editedPayment.$touch();
        if (this.$v.editedPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.$payments.update(this.editedPayment._id, this.$_.omit(this.editedPayment, '_id'));
        this.paymentEditionModal = false;
        NotifyPositive('Règlement créé');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.loading = false;
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
