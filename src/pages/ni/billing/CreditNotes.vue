<template>
  <q-page class="neutral-background">
    <div class="title layout-padding">
      <h4>Avoirs</h4>
    </div>
    <div class="q-pa-sm">
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="creditNotes" :columns="creditNotesColumns" binary-state-sort :pagination.sync="pagination">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions table-actions-margin">
                  <q-btn flat round small color="grey" icon="edit" @click.native="openCreditNoteEditionModal(props.row)" />
                  <q-btn flat round small color="grey" icon="delete"
                    @click="deleteCreditNote(col.value, props.row.__index)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </q-card>
      <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un avoir"
        @click="creditNoteCreationModal = true" />
    </div>

    <!-- Credit note creation modal -->
    <q-modal v-model="creditNoteCreationModal" content-classes="modal-container-md" @hide="resetCreationCreditNoteData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">avoir</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="creditNoteCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Bénéficiaire" v-model="newCreditNote.customer" :options="customersOptions"
          required-field @input="getEvents" @blur="$v.newCreditNote.customer.$touch"
          :error="$v.newCreditNote.customer.$error" />
        <ni-modal-select caption="Tiers payeur" v-model="newCreditNote.thirdPartyPayer" :options="thirdPartyPayerOptions"
          required-field @input="getEvents" :disable="thirdPartyPayerOptions.length === 0" clearable />
        <ni-datetime-picker caption="Date de l'avoir" v-model="newCreditNote.date" :error="$v.newCreditNote.date.$error"
          @blur="$v.newCreditNote.date.$touch" in-modal type="date" required-field />
        <div class="row q-mb-md light">
          <q-toggle v-model="hasLinkedEvents" label="Lié à des interventions ?" />
        </div>
        <!-- Has linked events -->
        <template v-if="hasLinkedEvents">
          <ni-datetime-picker caption="Début période concernée" v-model="newCreditNote.startDate"
            :error="$v.newCreditNote.startDate.$error" @blur="$v.newCreditNote.startDate.$touch" in-modal type="date"
            :disable="!hasLinkedEvents" @input="getEvents" required-field />
          <ni-datetime-picker caption="Fin période concernée" v-model="newCreditNote.endDate"
            :error="$v.newCreditNote.endDate.$error" @blur="$v.newCreditNote.endDate.$touch" in-modal type="date"
            :disable="!hasLinkedEvents" @input="getEvents" required-field />
          <template v-if="events.length > 0">
            <ni-option-group v-model="newCreditNote.events" :options="eventsOptions" caption="Évènements"
              type="checkbox" required-field inline />
          </template>
          <div v-if="newCreditNote.customer && newCreditNote.startDate && newCreditNote.endDate && events.length === 0"
            class="light warning">
            <p>{{ eventsNotFoundMessage }}</p>
          </div>
          <div class="row justify-between items-baseline">
            <div class="col-6 light">
              <p v-if="newCreditNote.exclTaxesCustomer">Montant HT bénéficiaire : {{ formatPrice(newCreditNote.exclTaxesCustomer) }}</p>
              <p v-if="newCreditNote.exclTaxesTpp">Montant HT tiers-payeur : {{ formatPrice(newCreditNote.exclTaxesTpp) }}</p>
            </div>
            <div class="col-6 light">
              <p v-if="newCreditNote.inclTaxesCustomer">Montant TTC bénéficiaire : {{ formatPrice(newCreditNote.inclTaxesCustomer) }}</p>
              <p v-if="newCreditNote.inclTaxesTpp">Montant TTC tiers-payeur : {{ formatPrice(newCreditNote.inclTaxesTpp) }}</p>
            </div>
          </div>
        </template>
        <!-- Hasn't linked event -->
        <template v-else>
          <ni-modal-select v-if="!hasLinkedEvents" caption="Souscription concernée" :options="subscriptionsOptions"
            v-model="newCreditNote.subscription" :disable="!hasLinkedEvents && !newCreditNote.customer" required-field
            :error="$v.newCreditNote.subscription.$error" @blur="$v.newCreditNote.subscription.$touch" />
          <ni-modal-input v-if="!hasLinkedEvents && !newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
            v-model="newCreditNote.inclTaxesCustomer" required-field :error="$v.newCreditNote.inclTaxesCustomer.$error"
            @blur="$v.newCreditNote.inclTaxesCustomer.$touch" :error-label="inclTaxesError" />
          <ni-modal-input v-if="!hasLinkedEvents && newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
            v-model="newCreditNote.inclTaxesTpp" required-field :error="$v.newCreditNote.inclTaxesTpp.$error"
            @blur="$v.newCreditNote.inclTaxesTpp.$touch" :error-label="inclTaxesError" />
        </template>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary"
        :loading="loading" @click="createNewCreditNote" :disable="$v.newCreditNote.$error ||disableCreationButton" />
    </q-modal>

    <!-- Credit note edition modal -->
    <q-modal v-if="Object.keys(editedCreditNote).length > 0" v-model="creditNoteEditionModal"
      content-classes="modal-container-md" @hide="resetEditionCreditNoteData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer un <span class="text-weight-bold">avoir</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="creditNoteEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Bénéficiaire" v-model="editedCreditNote.customer.identity.lastname" required-field disable />
        <ni-modal-input v-if="editedCreditNote.thirdPartyPayer" caption="Tiers payeur"
          v-model="editedCreditNote.thirdPartyPayer.name" required-field disable />
        <ni-datetime-picker caption="Date de l'avoir" v-model="editedCreditNote.date" in-modal type="date"
          required-field :error="$v.editedCreditNote.date.$error" @blur="$v.editedCreditNote.date.$touch" />
        <!-- Has linked events -->
        <template v-if="hasLinkedEvents">
          <ni-datetime-picker caption="Début période concernée" v-model="editedCreditNote.startDate" in-modal
            type="date" :disable="!editedCreditNote.events" @input="getEvents" required-field
            :error="$v.editedCreditNote.startDate.$error" @blur="$v.editedCreditNote.startDate.$touch" />
          <ni-datetime-picker caption="Fin période concernée" v-model="editedCreditNote.endDate" in-modal type="date"
            :disable="!editedCreditNote.events" @input="getEvents" required-field
            :error="$v.editedCreditNote.endDate.$error" @blur="$v.editedCreditNote.endDate.$touch" />
          <template v-if="events.length > 0">
            <ni-option-group v-model="editedCreditNote.events" :options="eventsOptions" caption="Évènements"
              type="checkbox" required-field inline />
          </template>
          <div v-if="editedCreditNote.customer && editedCreditNote.startDate && editedCreditNote.endDate && events.length === 0"
            class="light warning">
            <p>{{ eventsNotFoundMessage }}</p>
          </div>
          <div class="row justify-between items-baseline">
            <div class="col-6 light">
              <p v-if="editedCreditNote.exclTaxesCustomer">Montant HT bénéficiaire : {{ formatPrice(editedCreditNote.exclTaxesCustomer) }}</p>
              <p v-if="editedCreditNote.exclTaxesTpp">Montant HT tiers-payeur : {{ formatPrice(editedCreditNote.exclTaxesTpp) }}</p>
            </div>
            <div class="col-6 light">
              <p v-if="editedCreditNote.inclTaxesCustomer">Montant TTC bénéficiaire : {{ formatPrice(editedCreditNote.inclTaxesCustomer) }}</p>
              <p v-if="editedCreditNote.inclTaxesTpp">Montant TTC tiers-payeur : {{ formatPrice(editedCreditNote.inclTaxesTpp) }}</p>
            </div>
          </div>
        </template>
        <!-- Hasn't linked event -->
        <template v-else>
          <ni-modal-select caption="Souscription concernée" v-model="editedCreditNote.subscription"
            :options="subscriptionsOptions" :disable="!hasLinkedEvents && !editedCreditNote.customer" required-field
            :error="$v.editedCreditNote.subscription.$error" @blur="$v.editedCreditNote.subscription.$touch" />
          <ni-modal-input v-if="!editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
            v-model="editedCreditNote.inclTaxesCustomer" :error="$v.editedCreditNote.inclTaxesCustomer.$error"
            @blur="$v.editedCreditNote.inclTaxesCustomer.$touch" :error-label="inclTaxesError" required-field />
          <ni-modal-input v-if="editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€"
            v-model="editedCreditNote.inclTaxesTpp" required-field :error="$v.editedCreditNote.inclTaxesTpp.$error"
            @blur="$v.editedCreditNote.inclTaxesTpp.$touch" :error-label="inclTaxesError" type="number" />
        </template>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer l'avoir" icon-right="add" color="primary"
        :loading="loading" @click="updateCreditNote" :disable="$v.editedCreditNote.$error || disableEditionButton" />
    </q-modal>
  </q-page>
</template>

<script>
import DatetimePicker from '../../../components/form/DatetimePicker';
import DateRange from '../../../components/form/DateRange';
import ModalInput from '../../../components/form/ModalInput';
import ModalSelect from '../../../components/form/ModalSelect';
import OptionGroup from '../../../components/form/OptionGroup';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { positiveNumber } from '../../../helpers/vuelidateCustomVal.js';
import { formatPrice } from '../../../helpers/utils.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'CreditNotes',
  metaInfo: {
    title: 'Avoirs',
  },
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-modal-select': ModalSelect,
    'ni-date-range': DateRange,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      eventsNotFoundMessage: "Il n'y a aucune intervention facturée pour le bénéficiaire aux dates données",
      loading: false,
      creditNoteCreationModal: false,
      creditNoteEditionModal: false,
      hasLinkedEvents: false,
      customersOptions: [],
      events: [],
      newCreditNote: {
        customer: null,
        thirdPartyPayer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        subscription: null
      },
      editedCreditNote: {},
      creditNotes: [],
      creditNotesColumns: [
        {
          name: 'number',
          label: '#',
          align: 'left',
          field: 'number',
        },
        {
          name: 'date',
          label: 'Date de l\'avoir',
          align: 'left',
          field: row => row.date ? this.$moment(row.date).format('DD/MM/YYYY') : '',
        },
        {
          name: 'startDate',
          label: 'Début',
          align: 'left',
          field: row => row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: row => row.endDate ? this.$moment(row.endDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: row => this.getCustomerName(row.customer),
        },
        {
          name: 'thirdPartyPayer',
          label: 'Tiers payeur',
          align: 'left',
          field: row => row.thirdPartyPayer ? `${row.thirdPartyPayer.name}` : '',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'left',
          field: row => row.thirdPartyPayer ? row.exclTaxesTpp : row.exclTaxesCustomer,
          format: value => formatPrice(value),
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'left',
          field: row => row.thirdPartyPayer ? row.inclTaxesTpp : row.inclTaxesCustomer,
          format: value => formatPrice(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'date',
        descending: true,
      },
    }
  },
  watch: {
    hasLinkedEvents () {
      this.events = [];
      this.newCreditNote.events = [];
      this.newCreditNote.subscription = null;
      this.newCreditNote.startDate = null;
      this.newCreditNote.endDate = null;
      this.newCreditNote.exclTaxesCustomer = 0;
      this.newCreditNote.inclTaxesCustomer = 0;
      this.$v.newCreditNote.startDate.$reset();
      this.$v.newCreditNote.endDate.$reset();
    },
    'newCreditNote.customer' (value) {
      this.newCreditNote.thirdPartyPayer = null;
    },
    'newCreditNote.events' (value) {
      const prices = this.computePrices(this.newCreditNote.events);
      this.newCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
      this.newCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
      this.newCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
      this.newCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
    },
    'editedCreditNote.events' (value) {
      if (this.hasLinkedEvents) {
        const prices = this.computePrices(this.editedCreditNote.events);
        this.editedCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
        this.editedCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
        this.editedCreditNote.exclTaxesTpp = prices.exclTaxesTpp;
        this.editedCreditNote.inclTaxesTpp = prices.inclTaxesTpp;
      }
    },
    'newCreditNote.startDate' (value) {
      if (value === null) {
        this.events = [];
      }
    },
    'newCreditNote.endDate' (value) {
      if (value === null) {
        this.events = [];
      }
    }
  },
  async mounted () {
    await Promise.all([this.refreshCreditNotes(), this.refreshCustomersOptions()]);
  },
  validations () {
    return {
      newCreditNote: {
        date: { required },
        customer: { required },
        startDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        endDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        subscription: {
          required: requiredIf(() => !this.hasLinkedEvents)
        },
        inclTaxesCustomer: {
          positiveNumber,
          required: requiredIf(() => !this.thirdPartyPayer),
        },
        inclTaxesTpp: {
          positiveNumber,
          required: requiredIf(() => this.thirdPartyPayer),
        },
      },
      editedCreditNote: {
        date: { required },
        customer: { required },
        startDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        endDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        subscription: {
          required: requiredIf(() => !this.hasLinkedEvents)
        },
        inclTaxesCustomer: {
          required: requiredIf(() => !this.thirdPartyPayer),
          positiveNumber,
        },
        inclTaxesTpp: {
          positiveNumber,
          required: requiredIf(() => this.thirdPartyPayer),
        },
      },
    }
  },
  computed: {
    mainUser () {
      return this.$store.getters['main/user'];
    },
    subscriptionsOptions () {
      let selectedCustomer;
      if (this.newCreditNote.customer) {
        selectedCustomer = this.customersOptions.find(cus => cus.value === this.newCreditNote.customer);
      }
      if (this.editedCreditNote.customer) {
        selectedCustomer = this.editedCreditNote.customer;
      }

      if (!selectedCustomer) return [];
      return selectedCustomer.subscriptions.map(sub => ({
        label: sub.service.name,
        value: sub._id,
      }));
    },
    eventsOptions () {
      return this.events.map(event => ({
        label: `${this.$moment(event.startDate).format('DD/MM/YYYY HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`,
        value: event._id,
      }))
    },
    thirdPartyPayerOptions () {
      let customer;
      if (this.creditNoteCreationModal) customer = this.newCreditNote.customer;
      if (this.creditNoteEditionModal) customer = this.editedCreditNote.customer;
      const selectedCustomer = this.customersOptions.find(cus => cus.value === customer);
      if (!selectedCustomer) return [];

      return selectedCustomer.thirdPartyPayers.map(tpp => ({
        label: tpp.name,
        value: tpp._id,
      }));
    },
    disableCreationButton () {
      return !(this.newCreditNote.customer && this.newCreditNote.date &&
      ((this.newCreditNote.events && this.newCreditNote.events.length > 0) ||
      (this.newCreditNote.subscription &&
        ((this.newCreditNote.thirdPartyPayer && this.newCreditNote.inclTaxesTpp) || this.newCreditNote.inclTaxesCustomer))));
    },
    disableEditionButton () {
      return !(this.editedCreditNote.customer && this.editedCreditNote.date &&
      ((this.editedCreditNote.events && this.editedCreditNote.events.length > 0) ||
      (this.editedCreditNote.subscription &&
        ((this.editedCreditNote.thirdPartyPayer && this.editedCreditNote.inclTaxesTpp) || this.editedCreditNote.inclTaxesCustomer))));
    },
    inclTaxesError () {
      return 'Montant TTC non valide';
    },
  },
  methods: {
    getCustomerName (customer) {
      return `${customer.identity.firstname ? `${customer.identity.firstname.charAt(0, 1)}. ` : ''}${customer.identity.lastname}`;
    },
    formatPrice (value) {
      return formatPrice(value);
    },
    // Refresh data
    async refreshCustomersOptions () {
      try {
        this.customersOptions = [];
        const customers = await this.$customers.showAllWithBilledEvents();
        for (let i = 0, l = customers.length; i < l; i++) {
          this.customersOptions.push({
            subscriptions: customers[i].subscriptions,
            thirdPartyPayers: customers[i].thirdPartyPayers,
            label: customers[i].identity.lastname,
            value: customers[i]._id
          });
        }
      } catch (e) {
        this.customersOptions = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les bénéficiaires');
      }
    },
    async refreshCreditNotes () {
      try {
        this.creditNotes = await this.$creditNotes.showAll();
      } catch (e) {
        this.creditNotes = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les avoirs');
      }
    },
    async getEvents () {
      try {
        if (this.hasLinkedEvents && this.newCreditNote.customer && this.newCreditNote.startDate && this.newCreditNote.endDate) {
          const query = {
            startDate: this.newCreditNote.startDate,
            endDate: this.newCreditNote.endDate,
            customer: this.newCreditNote.customer,
            isBilled: true
          };
          if (this.newCreditNote.thirdPartyPayer) query.thirdPartyPayer = this.newCreditNote.thirdPartyPayer;
          this.events = await this.$events.listForCreditNotes(query);
        } else if (this.hasLinkedEvents && this.editedCreditNote.customer && this.editedCreditNote.startDate && this.editedCreditNote.endDate) {
          const query = {
            startDate: this.editedCreditNote.startDate,
            endDate: this.editedCreditNote.endDate,
            customer: this.editedCreditNote.customer._id,
            isBilled: true
          };
          if (this.editedCreditNote.thirdPartyPayer) query.thirdPartyPayer = this.editedCreditNote.thirdPartyPayer._id;
          else if (this.editedCreditNote.linkedCreditNote) {
            const creditNote = this.creditNotes.find(cd => cd._id === this.editedCreditNote.linkedCreditNote);
            query.thirdPartyPayer = creditNote.thirdPartyPayer._id;
          }
          this.events = await this.$events.listForCreditNotes(query);
        }
      } catch (e) {
        this.events = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les évènements facturés de ce bénéficiaire');
      }
    },
    // Compute
    computePrices (events) {
      let exclTaxesCustomer = 0, inclTaxesCustomer = 0;
      let exclTaxesTpp = 0, inclTaxesTpp = 0;
      if (this.events) {
        const creditNoteEvents = this.events.filter(ev => events.includes(ev._id));
        for (let i = 0, l = creditNoteEvents.length; i < l; i++) {
          if (creditNoteEvents[i].bills.exclTaxesCustomer) {
            exclTaxesCustomer += creditNoteEvents[i].bills.exclTaxesCustomer;
            inclTaxesCustomer += creditNoteEvents[i].bills.inclTaxesCustomer;
          }
          if (creditNoteEvents[i].bills.exclTaxesTpp) {
            exclTaxesTpp += creditNoteEvents[i].bills.exclTaxesTpp;
            inclTaxesTpp += creditNoteEvents[i].bills.inclTaxesTpp;
          }
        }
      }

      return { exclTaxesCustomer, inclTaxesCustomer, exclTaxesTpp, inclTaxesTpp };
    },
    // Creation
    resetCreationCreditNoteData () {
      this.newCreditNote = {
        customer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        subscription: null
      };
      this.events = [];
      this.hasLinkedEvents = false;
      this.$v.newCreditNote.$reset();
    },
    formatPayload (creditNote) {
      const { date, customer } = creditNote;
      const payload = { date, customer };

      if (!this.hasLinkedEvents) {
        const selectedCustomer = customer._id ? customer : this.customersOptions.find(cus => cus.value === customer) || customer;
        const subscription = selectedCustomer.subscriptions.find(sub => sub._id === creditNote.subscription);
        const vat = subscription.service.vat;
        if (creditNote.inclTaxesCustomer) {
          payload.inclTaxesCustomer = creditNote.inclTaxesCustomer;
          payload.exclTaxesCustomer = Number.parseFloat((creditNote.inclTaxesCustomer / (1 + (vat / 100))).toFixed(2));
        } else {
          payload.inclTaxesTpp = creditNote.inclTaxesTpp;
          payload.exclTaxesTpp = Number.parseFloat((creditNote.inclTaxesTpp / (1 + (vat / 100))).toFixed(2));
          payload.thirdPartyPayer = creditNote.thirdPartyPayer;
        }
        payload.subscription = { _id: subscription._id, service: subscription.service.name, vat };
      } else {
        payload.startDate = creditNote.startDate;
        payload.endDate = creditNote.endDate;
        payload.events = creditNote.events.length > 0 ? creditNote.events : null;
        payload.exclTaxesCustomer = creditNote.exclTaxesCustomer;
        payload.inclTaxesCustomer = creditNote.inclTaxesCustomer;
        payload.exclTaxesTpp = creditNote.exclTaxesTpp;
        payload.inclTaxesTpp = creditNote.inclTaxesTpp;
        payload.thirdPartyPayer = creditNote.thirdPartyPayer;
      }

      return this.$_.pickBy(payload);
    },
    async createNewCreditNote () {
      try {
        this.$v.newCreditNote.$touch();
        if (this.$v.newCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await this.$creditNotes.create(this.formatPayload(this.newCreditNote));

        NotifyPositive('Avoir créé');
        await this.refreshCreditNotes();
        this.creditNoteCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'avoir');
      } finally {
        this.loading = false;
      }
    },
    // Edition
    async openCreditNoteEditionModal (creditNote) {
      this.editedCreditNote = { inclTaxesCustomer: 0, inclTaxesTpp: 0, ...creditNote };
      this.editedCreditNote.customer = creditNote.customer;
      if (creditNote.thirdPartyPayer) this.editedCreditNote.thirdPartyPayer = creditNote.thirdPartyPayer;

      this.hasLinkedEvents = creditNote.events && creditNote.events.length > 0;
      if (this.hasLinkedEvents) {
        await this.getEvents();
        for (let i = 0, l = creditNote.events.length; i < l; i++) {
          if (!this.events.some(event => creditNote.events[i]._id === event._id)) {
            this.events.push(creditNote.events[i]);
          }
        }
        this.editedCreditNote.events = creditNote.events.map(ev => ev._id);
      } else {
        this.editedCreditNote.subscription = creditNote.subscription._id;
      }

      this.creditNoteEditionModal = true
    },
    resetEditionCreditNoteData () {
      this.creditNoteEditionModal = false;
      this.editedCreditNote = {};
      this.events = [];
      this.hasLinkedEvents = false;
      this.$v.editedCreditNote.$reset();
    },
    async updateCreditNote () {
      try {
        this.$v.editedCreditNote.$touch();
        if (this.$v.editedCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = { ...this.formatPayload(this.editedCreditNote), customer: this.editedCreditNote.customer_id };
        if (this.editedCreditNote.thirdPartyPayer) payload.thirdPartyPayer = this.editedCreditNote.thirdPartyPayer._id;
        await this.$creditNotes.updateById(this.editedCreditNote._id, payload);

        NotifyPositive('Avoir édité');
        await this.refreshCreditNotes();
        this.creditNoteEditionModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'avoir');
      } finally {
        this.loading = false;
      }
    },
    // Deletion
    async deleteCreditNote (id, cell) {
      try {
        const deletedCreditNote = this.creditNotes.find(cd => cd._id === id);
        await this.$q.dialog({
          title: 'Confirmation',
          message: `Etes-vous sûr de vouloir supprimer cet avoir ${deletedCreditNote.linkedCreditNote ? 'et l\'avoir relié aux mêmes évènements' : ''} ?`,
          ok: 'OK',
          cancel: 'Annuler'
        });
        await this.$creditNotes.remove(id);
        await this.refreshCreditNotes();
        NotifyPositive('Avoir supprimé');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'avoir');
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables';

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;

  .light
    font-size: 14px;

  .warning
    color: $red;

  /deep/ .modal-container-md
    width: 45vw;

</style>
