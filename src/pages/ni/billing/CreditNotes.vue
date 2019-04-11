<template>
  <q-page class="neutral-background">
    <div class="title layout-padding">
      <h4>Avoirs</h4>
      <ni-date-range v-model="creditNotesDates" @input="refreshCreditNotes" />
    </div>
    <div class="q-pa-sm">
      <q-card class="q-mb-xl neutral-background" flat>
        <q-table :data="creditNotes" :columns="creditNotesColumns" binary-state-sort :pagination.sync="pagination"
          class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions table-actions-margin">
                  <q-btn flat round small color="grey" icon="edit" @click.native="openCreditNoteEditionModal(props.row)" />
                  <q-btn flat round small color="grey" icon="delete" @click="deleteCreditNote(col.value, props.row.__index)" />
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
          required-field @input="getEvents" />
        <ni-datetime-picker caption="Date de l'avoir" v-model="newCreditNote.date" :error="$v.newCreditNote.date.$error"
          @blur="$v.newCreditNote.date.$touch" in-modal type="date" clearable required-field />
        <div class="row q-mb-md light">
          <q-toggle v-model="hasLinkedEvents" label="Lié à des interventions ?" />
        </div>
        <!-- Has linked events -->
        <template v-if="hasLinkedEvents">
          <ni-datetime-picker caption="Début période concernée" v-model="newCreditNote.startDate"
            :error="$v.newCreditNote.startDate.$error" @blur="$v.newCreditNote.startDate.$touch" in-modal type="date"
            :disable="!hasLinkedEvents" clearable @input="getEvents" />
          <ni-datetime-picker caption="Fin période concernée" v-model="newCreditNote.endDate"
            :error="$v.newCreditNote.endDate.$error" @blur="$v.newCreditNote.endDate.$touch" in-modal type="date"
            :disable="!hasLinkedEvents" clearable @input="getEvents" />
          <template v-if="events.length > 0">
            <ni-option-group v-model="newCreditNote.events" :options="eventsOptions" caption="Évènements"
              type="checkbox" required-field inline />
          </template>
          <div class="row justify-between items-baseline">
            <div class="col-6 light">
              <p>Montant HT : {{ formatPrice(newCreditNote.exclTaxesCustomer) }}</p>
            </div>
            <div class="col-6 light">
              <p>Montant TTC : {{ formatPrice(newCreditNote.inclTaxesCustomer) }}</p>
            </div>
          </div>
        </template>
        <!-- Hasn't linked event -->
        <template v-else>
          <ni-modal-select v-if="!hasLinkedEvents" caption="Souscription concernée" v-model="newCreditNote.subscription"
            :options="subscriptionsOptions" :disable="!hasLinkedEvents && !newCreditNote.customer" required-field />
          <ni-modal-input v-if="!hasLinkedEvents" caption="Montant TTC" suffix="€" type="number"
            v-model="newCreditNote.inclTaxesCustomer" />
        </template>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary"
        :loading="loading" @click="createNewCreditNote" :disable="$v.newCreditNote.$error" />
    </q-modal>

    <!-- Credit note edition modal -->
    <q-modal v-model="creditNoteEditionModal" content-classes="modal-container-sm" @hide="resetEditionCreditNoteData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer un <span class="text-weight-bold">avoir</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="creditNoteEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Bénéficiaire" v-model="editedCreditNote.customer" :options="customersOptions"
          required-field @input="getEvents" />
        <ni-datetime-picker caption="Date de l'avoir" v-model="editedCreditNote.date" in-modal type="date" clearable
          required-field />
        <!-- Has linked events -->
        <template v-if="hasLinkedEvents">
          <ni-datetime-picker caption="Début période concernée" v-model="editedCreditNote.startDate" in-modal
            type="date" :disable="!editedCreditNote.events" clearable @input="getEvents" />
          <ni-datetime-picker caption="Fin période concernée" v-model="editedCreditNote.endDate" in-modal type="date"
            :disable="!editedCreditNote.events" clearable @input="getEvents" />
          <template v-if="events.length > 0">
            <ni-option-group v-model="editedCreditNote.events" :options="eventsOptions" caption="Évènements"
              type="checkbox" required-field />
          </template>
          <div class="row justify-between items-baseline">
            <div class="col-6 light">
              <p>Montant HT : {{ formatPrice(editedCreditNote.exclTaxesCustomer) }}</p>
            </div>
            <div class="col-6 light">
              <p>Montant TTC : {{ formatPrice(editedCreditNote.inclTaxesCustomer) }}</p>
            </div>
          </div>
        </template>
        <!-- Hasn't linked event -->
        <template v-else>
          <ni-modal-select caption="Souscription concernée" v-model="editedCreditNote.subscription"
            :options="subscriptionsOptions" :disable="!hasLinkedEvents && !editedCreditNote.customer" required-field />
          <ni-modal-input caption="Montant TTC" suffix="€" type="number" v-model="editedCreditNote.inclTaxesCustomer" />
        </template>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer l'avoir" icon-right="add" color="primary"
        :loading="loading" @click="updateCreditNote" :disable="$v.editedCreditNote.$error" />
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
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import { TWO_WEEKS } from '../../../data/constants';

export default {
  name: 'CreditNotes',
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-modal-select': ModalSelect,
    'ni-date-range': DateRange,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      loading: false,
      creditNoteCreationModal: false,
      creditNoteEditionModal: false,
      hasLinkedEvents: false,
      customersOptions: [],
      events: [],
      creditNotesDates: {
        startDate: null,
        endDate: null,
      },
      newCreditNote: {
        customer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        subscription: null
      },
      editedCreditNote: {
        customer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        subscription: null
      },
      creditNotes: [],
      creditNotesColumns: [
        {
          name: 'number',
          label: '#',
          align: 'left',
          field: 'number',
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
          field: row => `${row.customer.identity.lastname}`,
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'left',
          field: 'exclTaxesCustomer',
          format: value => this.formatPrice(value),
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'left',
          field: 'inclTaxesCustomer',
          format: value => this.formatPrice(value),
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      pagination: { rowsPerPage: 0 },
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
    'newCreditNote.events' (value) {
      const prices = this.computePrices(this.newCreditNote.events);
      this.newCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
      this.newCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
    },
    'editedCreditNote.events' (value) {
      const prices = this.computePrices(this.editedCreditNote.events);
      this.editedCreditNote.exclTaxesCustomer = prices.exclTaxesCustomer;
      this.editedCreditNote.inclTaxesCustomer = prices.inclTaxesCustomer;
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
    if (this.mainUser.company.customersConfig.billingPeriod === TWO_WEEKS) {
      if (this.$moment().date() > 16) {
        this.creditNotesDates.startDate = this.$moment().set('date', 16).toISOString();
        this.creditNotesDates.endDate = this.$moment().endOf('month').toISOString()
      } else {
        this.creditNotesDates.startDate = this.$moment().startOf('month').toISOString()
        this.creditNotesDates.endDate = this.$moment().set('date', 15).toISOString();
      }
    } else {
      this.creditNotesDates.startDate = this.$moment().startOf('month').toISOString();
      this.creditNotesDates.endDate = this.$moment().endOf('month').toISOString();
    }
    await Promise.all([this.refreshCreditNotes(), this.refreshCustomersOptions()]);
  },
  validations () {
    return {
      newCreditNote: {
        date: { required },
        startDate: {
          required: requiredIf(() => {
            return this.hasLinkedEvents;
          })
        },
        endDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        subscription: {
          required: requiredIf(() => !this.hasLinkedEvents)
        },
      },
      editedCreditNote: {
        date: { required },
        startDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        endDate: {
          required: requiredIf(() => this.hasLinkedEvents)
        },
        subscription: {
          required: requiredIf(() => !this.hasLinkedEvents)
        },
      },
    }
  },
  computed: {
    mainUser () {
      return this.$store.getters['main/user'];
    },
    subscriptionsOptions () {
      if (this.newCreditNote.customer) {
        const selectedCustomer = this.customersOptions.find(customer => customer.value === this.newCreditNote.customer);
        if (!selectedCustomer) return [];
        return selectedCustomer.subscriptions.map(sub => ({
          label: sub.service.name,
          value: { _id: sub._id, service: sub.service.name, vat: sub.service.vat },
        }));
      }
      return [];
    },
    eventsOptions () {
      return this.events.map(event => ({
        label: `${this.$moment(event.startDate).format('DD/MM/YYYY HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`,
        value: event._id,
      }))
    }
  },
  methods: {
    formatPrice (value) {
      return value ? `${parseFloat(value).toFixed(2)}€` : '0€';
    },
    // Refresh data
    async refreshCustomersOptions () {
      try {
        this.customersOptions = [];
        const customers = await this.$customers.showAll({ isActive: true, subscriptions: true });
        for (let i = 0, l = customers.length; i < l; i++) {
          this.customersOptions.push({
            subscriptions: customers[i].subscriptions,
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
        this.creditNotes = await this.$creditNotes.showAll({
          startDate: this.creditNotesDates.startDate,
          endDate: this.creditNotesDates.endDate
        });
      } catch (e) {
        this.creditNotes = [];
        console.error(e);
        NotifyNegative('Impossible de récupérer les avoirs');
      }
    },
    async getEvents () {
      try {
        if (this.hasLinkedEvents && this.newCreditNote.customer && this.newCreditNote.startDate && this.newCreditNote.endDate) {
          this.events = await this.$events.list({
            startDate: this.newCreditNote.startDate,
            endDate: this.newCreditNote.endDate,
            customer: this.newCreditNote.customer,
            isBilled: true
          });
        } else if (this.editedCreditNote.customer && this.editedCreditNote.startDate && this.editedCreditNote.endDate) {
          this.events = await this.$events.list({
            startDate: this.editedCreditNote.startDate,
            endDate: this.editedCreditNote.endDate,
            customer: this.editedCreditNote.customer,
            isBilled: true
          });
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
      const creditNoteEvents = this.events.filter(ev => events.includes(ev._id));
      for (let i = 0, l = creditNoteEvents.length; i < l; i++) {
        exclTaxesCustomer += creditNoteEvents[i].bills.exclTaxesCustomer;
        inclTaxesCustomer += creditNoteEvents[i].bills.inclTaxesCustomer;
      }

      return { exclTaxesCustomer, inclTaxesCustomer };
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
      const { date, inclTaxesCustomer, customer } = creditNote;
      const payload = { date, inclTaxesCustomer, customer };

      if (!this.hasLinkedEvents) {
        const vat = creditNote.subscription.vat;
        payload.exclTaxesCustomer = Number.parseFloat((creditNote.inclTaxesCustomer / (1 + (vat / 100))).toFixed(2));
        payload.subscription = creditNote.subscription
      } else {
        payload.startDate = creditNote.startDate;
        payload.endDate = creditNote.endDate;
        payload.events = creditNote.events;
        payload.exclTaxesCustomer = creditNote.exclTaxesCustomer;
      }

      return payload;
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
      this.editedCreditNote = { ...creditNote }; // spread to not update by reference
      this.editedCreditNote.customer = creditNote.customer._id;

      this.hasLinkedEvents = creditNote.events && creditNote.events.length > 0;
      if (this.hasLinkedEvents) {
        await this.getEvents();
        for (let i = 0, l = creditNote.events.length; i < l; i++) {
          if (!this.events.some(event => creditNote.events[i]._id === event._id)) {
            this.events.push(creditNote.events[i]);
          }
        }
      }

      this.editedCreditNote.events = creditNote.events.map(ev => ev._id);

      this.creditNoteEditionModal = true
    },
    resetEditionCreditNoteData () {
      this.editedCreditNote = {
        customer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxesCustomer: 0,
        inclTaxesCustomer: 0,
        subscription: null
      };
    },
    async updateCreditNote () {
      try {
        this.$v.editedCreditNote.$touch();
        if (this.$v.editedCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await this.$creditNotes.updateById(this.editedCreditNote._id, this.formatPayload(this.editedCreditNote));

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
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cet avoirs ?',
          ok: 'OK',
          cancel: 'Annuler'
        });
        await this.$creditNotes.remove(id);
        this.creditNotes.splice(cell, 1);
        NotifyPositive('Avoir supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
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

  /deep/ .modal-container-md
    width: 45vw;

  /deep/ .q-table-bottom
    border-top: none;
  /deep/ .q-table-middle
    margin-bottom: 0;

</style>
