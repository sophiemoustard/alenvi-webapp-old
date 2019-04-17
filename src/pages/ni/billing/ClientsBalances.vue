<template>
  <q-page class="neutral-background" padding>
    <h4>Balances Clients</h4>
    <div>
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="balances" :columns="columns" row-key="rowId" binary-state-sort :loading="tableLoading"
          :pagination.sync="pagination" selection="multiple" :selected.sync="selected">
          <q-tr slot="header" slot-scope="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
            <q-th auto-width>
              <q-checkbox v-model="props.selected" indeterminate-value="some" />
            </q-th>
          </q-tr>
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'client' || col.name === 'customer'">
                  <span class="uppercase text-weight-bold">{{ col.value }}</span>
                </template>
                <template v-else-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn flat round small color="grey" icon="remove_red_eye" @click="goToCustomerBillingPage(col.value)" />
                    <q-btn flat round small color="grey" icon="add" @click="openPaymentCreationModal(props.row)" />
                  </div>
                </template>
                <template v-else-if="col.name === 'balance'">
                  <ni-prefixed-cell-content :cell-value="col.value" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
              <q-td auto-width>
                <q-checkbox v-model="props.selected" />
              </q-td>
            </q-tr>
          </template>
          <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination" :data="balances" />
        </q-table>
      </q-card>
    </div>
    <q-modal v-model="paymentCreationModal" content-classes="modal-container-md" @hide="resetPaymentCreationModal">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter un <span class="text-weight-bold">{{ creationModalNature }}</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="paymentCreationModal = false" /></span>
          </div>
        </div>
        <div class="modal-subtitle">
          <q-btn-toggle no-wrap v-model="newPayment.nature" :options="paymentNatureOptions" toggle-color="primary" />
        </div>
        <ni-modal-input caption="Bénéficiaire" v-model="selectedCustomer" required-field read-only />
        <ni-modal-input caption="Client" v-model="selectedClient" required-field read-only />
        <ni-modal-input :caption="`Montant du ${creationModalNature}`" suffix="€" type="number" v-model="newPayment.netInclTaxes"
          required-field :error="$v.newPayment.netInclTaxes.$error"
          @blur="$v.newPayment.netInclTaxes.$touch" :error-label="netInclTaxesError" />
        <ni-modal-select :caption="`Type du ${creationModalNature}`" v-model="newPayment.type" :options="paymentOptions"
          required-field @blur="$v.newPayment.type.$touch" :error="$v.newPayment.type.$error" />
        <ni-datetime-picker :caption="`Date du ${creationModalNature}`" v-model="newPayment.date" :error="$v.newPayment.date.$error"
          @blur="$v.newPayment.date.$touch" in-modal type="date" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" :label="creationButtonLabel" icon-right="add" color="primary"
        :loading="creationLoading" @click="createPayment" :disable="$v.newPayment.$error || disableCreationButton" />
    </q-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import BillingPagination from '../../../components/table/BillingPagination';
import ModalSelect from '../../../components/form/ModalSelect';
import ModalInput from '../../../components/form/ModalInput';
import DatetimePicker from '../../../components/form/DatetimePicker';
import PrefixedCellContent from '../../../components/table/PrefixedCellContent';
import { REQUIRED_LABEL, PAYMENT, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '../../../data/constants';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'ClientsBalances',
  components: {
    'ni-billing-pagination': BillingPagination,
    'ni-modal-select': ModalSelect,
    'ni-modal-input': ModalInput,
    'ni-datetime-picker': DatetimePicker,
    'ni-prefixed-cell-content': PrefixedCellContent,
  },
  data () {
    return {
      creationLoading: false,
      tableLoading: false,
      selected: [],
      balances: [],
      columns: [
        {
          name: 'client',
          label: 'Client',
          align: 'left',
          field: row => row.thirdPartyPayer ? row.thirdPartyPayer.name : row.customer.identity.lastname,
          format: val => val.length > 30 ? `${val.slice(0, 30)}...` : val,
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => row.customer.identity.lastname,
        },
        {
          name: 'billed',
          label: 'Facturé TTC',
          align: 'left',
          field: row => row.billed,
          format: val => this.formatPrices(val),
        },
        {
          name: 'paid',
          label: 'Payé TTC',
          align: 'left',
          field: row => row.paid,
          format: val => this.formatPrices(val),
        },
        {
          name: 'balance',
          label: 'Solde',
          align: 'left',
          field: row => row.balance,
        },
        {
          name: 'toPay',
          label: 'A Prélever',
          align: 'left',
          field: row => this.formatPrices(row.toPay),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: row => row.customer._id,
        },
      ],
      pagination: {
        sortBy: 'customer',
        ascending: true,
        rowsPerPage: 0,
      },
      paymentCreationModal: false,
      paymentOptions: PAYMENT_OPTIONS,
      paymentNatureOptions: PAYMENT_NATURE_OPTIONS,
      selectedCustomer: '',
      selectedClient: '',
      newPayment: {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      }
    }
  },
  computed: {
    netInclTaxesError () {
      if (!this.$v.newPayment.netInclTaxes.required) {
        return REQUIRED_LABEL;
      }
      return 'Montant TTC non valide'
    },
    disableCreationButton () {
      return this.$_.some(this.newPayment, (el) => !el);
    },
    creationModalNature () {
      return this.paymentNatureOptions.find(option => option.value === this.newPayment.nature).label.toLowerCase();
    },
    creationButtonLabel () {
      return `Créer le ${this.creationModalNature.toLowerCase()}`;
    }
  },
  validations: {
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    }
  },
  async mounted () {
    await this.getBalances();
  },
  methods: {
    formatPrices (val) {
      return val ? `${val.toFixed(2)} €` : '0 €';
    },
    goToCustomerBillingPage (customerId) {
      this.$router.replace({ name: 'customers profile', params: { id: customerId, defaultTab: 'billing' } });
    },
    async getBalances () {
      try {
        this.tableLoading = true;
        this.balances = await this.$balances.showAll();
        this.balances = this.balances.map(balance => ({ ...balance, rowId: this.$_.uniqueId() }))
      } catch (e) {
        this.balances = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    openPaymentCreationModal (row) {
      this.selectedCustomer = row.customer.identity.lastname;
      this.selectedClient = row._id.tpp ? row.thirdPartyPayer.name : row.customer.identity.lastname;
      this.newPayment.customer = row._id.customer;
      this.newPayment.client = row._id.tpp ? row._id.tpp : row._id.customer;
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.selectedCustomer = '';
      this.selectedClient = '';
      this.newPayment = {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: '',
      };
    },
    async createPayment () {
      try {
        this.creationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (this.newPayment.customer === this.newPayment.client) delete this.newPayment.client;
        await this.$payments.create(this.newPayment);
        NotifyPositive('Règlement créé');
        await this.getBalances();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.creationLoading = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .q-table
    & tbody tr.selected
      background: $white
    &-bottom > .q-icon
      display: none

  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    .q-btn-toggle
      margin-bottom: 0;
      cursor: default;
      width: 50%;
      @media screen and (max-width: 767px)
        width: 100%
      & .q-btn-item
          width: 100%
    .delete-action
      display: flex;
      flex-direction: row;
      align-items: center;
    & /deep/ .q-btn-toggle
      border: none;
      box-shadow: none;
      @media screen and (max-width: 767px)
        display: inline-flex;
        flex-wrap: wrap;
      & .q-btn-item
        width: 45%
        border-radius: 20px;
        margin: 5px;
        background-color: $light-grey;

</style>
