<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p class="text-weight-bold">{{ this.customer.identity | formatIdentity('FL') }}</p>
        <ni-date-range v-model="billingDates" @input="refresh" :error.sync="billingDatesHasError" />
      </div>
      <div v-if="user.role.name === HELPER && !tableLoading" class="message">
        Si vous souhaitez obtenir une facture non disponible sur cette page, adressez un email à support@alenvi.io.
      </div>
      <ni-customer-billing-table :documents="customerBillingDocuments" :billingDates="billingDates"
        :displayActions="user.role.name === ADMIN" @openEditionModal="openEditionModal"
        :type="CUSTOMER" :startBalance="getStartBalance()" :endBalance="getEndBalance(customerBillingDocuments)" />
      <div v-if="user.role.name === ADMIN || user.role.name === COACH" align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" @click="openPaymentCreationModal(customer)"
          no-caps flat color="white" icon="add" />
      </div>
    </div>
    <div class="q-pa-sm q-mb-lg" v-for="tpp in tppBillingDocuments" :key="tpp._id">
      <p class="text-weight-bold">{{ tpp.name }}</p>
      <ni-customer-billing-table :documents="tpp.documents" :billingDates="billingDates"
        :displayActions="user.role.name === ADMIN || user.role.name === COACH" @openEditionModal="openEditionModal"
        :type="THIRD_PARTY_PAYER" :startBalance="getStartBalance(tpp)"
        :endBalance="getEndBalance(tpp.documents, tpp)" />
      <div v-if="user.role.name === ADMIN || user.role.name === COACH" align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" no-caps flat color="white" icon="add"
          @click="openPaymentCreationModal(customer, tpp.documents[0].client)"/>
      </div>
    </div>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal :newPayment="newPayment" :validations="$v.newPayment" :selectedClientName="selectedClientName"
      @createPayment="createPayment" :creationModal="paymentCreationModal" :selectedCustomer="selectedCustomer"
      :loading="modalLoading" @resetForm="resetPaymentCreationModal" />

    <!-- Payment edition modal -->
    <ni-payment-edition-modal :editedPayment="editedPayment" :validations="$v.editedPayment" :selectedClientName="selectedClientName"
      @updatePayment="updatePayment" :editionModal="paymentEditionModal" :selectedCustomer="selectedCustomer"
      :loading="modalLoading" @resetForm="resetPaymentEditionModal" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { CREDIT_NOTE, BILL, DIRECT_DEBIT, BANK_TRANSFER, CHECK, CESU, REFUND, ADMIN, COACH, CUSTOMER, THIRD_PARTY_PAYER, HELPER } from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';
import PaymentCreationModal from '../../components/customers/PaymentCreationModal';
import PaymentEditionModal from '../../components/customers/PaymentEditionModal';
import DateRange from '../../components/form/DateRange';
import { paymentMixin } from '../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../components/popup/notify';
import { formatIdentity } from '../../helpers/utils';

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
      modalLoading: false,
      tableLoading: false,
      paymentEditionModal: false,
      customerBillingDocuments: [],
      tppBillingDocuments: [],
      billingDates: { startDate: this.$moment().toISOString(), endDate: this.$moment().toISOString() },
      billingDatesHasError: false,
      balances: [],
      COACH,
      ADMIN,
      CUSTOMER,
      THIRD_PARTY_PAYER,
      editedPayment: {},
      HELPER,
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
    },
  },
  methods: {
    // Billing dates
    setBillingDates () {
      this.billingDates.endDate = this.$moment().endOf('d').toISOString();
      this.billingDates.startDate = this.$moment().subtract(2, 'M').startOf('M').toISOString();
    },
    // Compute balances
    getEndBalance (documents, tpp) {
      if (!documents || documents.length === 0) return this.getStartBalance(tpp);
      return documents[documents.length - 1].balance;
    },
    getStartBalance (tpp = null) {
      const balance = !tpp
        ? this.balances.find(bal => bal.customer._id === this.customer._id && !bal.thirdPartyPayer)
        : this.balances.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer._id === tpp);

      return balance ? balance.balance : 0;
    },
    computeCustomerBalance () {
      const customerStartBalance = this.getStartBalance();
      this.computeIntermediateBalances(this.customerBillingDocuments, customerStartBalance, CUSTOMER)
    },
    computeTppBalances () {
      for (const tpp of this.tppBillingDocuments) {
        const tppStartBalance = this.getStartBalance(tpp)
        this.computeIntermediateBalances(tpp.documents, tppStartBalance, THIRD_PARTY_PAYER)
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
      if (this.billingDatesHasError) return;

      this.tableLoading = true;
      await Promise.all([this.getBills(), this.getCreditNotes(), this.getPayments(), this.getCustomerBalance()]);
      this.formatDocumentList();
      this.computeCustomerBalance();
      this.computeTppBalances();
      this.tableLoading = false;
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
        this.bills = await this.$bills.showAll({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
      } catch (e) {
        console.error(e)
      }
    },
    async getCreditNotes () {
      try {
        this.creditNotes = await this.$creditNotes.showAll({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
      } catch (e) {
        console.error(e)
      }
    },
    async getPayments () {
      try {
        this.payments = await this.$payments.list({
          customer: this.customer._id,
          startDate: this.billingDates.startDate,
          endDate: this.billingDates.endDate,
        });
      } catch (e) {
        console.error(e)
      }
    },
    formatDocumentList () {
      this.customerBillingDocuments = [];
      const tppBillingDocuments = {};

      for (const bill of this.bills) {
        bill.type = BILL;
        if (!bill.client) this.customerBillingDocuments.push(bill);
        else if (bill.client._id && !tppBillingDocuments[bill.client._id]) {
          tppBillingDocuments[bill.client._id] = {
            documents: [bill],
            name: bill.client.name,
            _id: bill.client._id,
          };
        } else tppBillingDocuments[bill.client._id].documents.push(bill);
      }

      for (const cd of this.creditNotes) {
        cd.type = CREDIT_NOTE;
        if (cd.inclTaxesTpp && !tppBillingDocuments[cd.thirdPartyPayer._id]) tppBillingDocuments[cd.thirdPartyPayer._id].documents = [cd]
        else if (cd.inclTaxesTpp && tppBillingDocuments[cd.thirdPartyPayer._id]) tppBillingDocuments[cd.thirdPartyPayer._id].documents.push(cd);

        if (cd.inclTaxesCustomer) this.customerBillingDocuments.push(cd);
      }

      for (const payment of this.payments) {
        if (!payment.client) this.customerBillingDocuments.push(payment);
        else if (payment.client._id && !tppBillingDocuments[payment.client._id]) tppBillingDocuments[payment.client._id].documents = [payment]
        else tppBillingDocuments[payment.client._id].documents.push(payment);
      }

      this.tppBillingDocuments = Object.values(tppBillingDocuments);
    },
    // Payments
    async createPayment () {
      try {
        this.modalLoading = true;
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
        this.modalLoading = false;
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
      this.selectedClientName = payment.client ? payment.client.name : formatIdentity(payment.customer.identity, 'FL');
    },
    resetPaymentEditionModal () {
      this.paymentEditionModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedClientName = '';
      this.editedPayment = {};
    },
    async updatePayment () {
      try {
        this.modalLoading = true;
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
        this.modalLoading = false;
      }
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
@import '~variables';

  .add-payment
    background-color: $primary;

  .text-weight-bold
    color: $primary;

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;

  .message
    font-style: italic;
    margin: 5px 0;
</style>
