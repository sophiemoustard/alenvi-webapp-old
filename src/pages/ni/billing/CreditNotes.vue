<template>
  <q-page class="neutral-background" padding>
    <h4>Avoirs</h4>
    <ni-datetime-range v-model="creditNotesDates" disable-hours></ni-datetime-range>
    <div class="q-mb-xl">
      <q-card style="background: white">
        <q-table :data="creditNotes" :columns="creditNotesColumns" binary-state-sort :pagination.sync="pagination" class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions table-actions-margin">
                  <q-btn flat round small color="grey" icon="edit" @click.native="openCreditNoteEditionModal(col.value)" />
                  <q-btn flat round small color="grey" icon="delete" @click="deleteCreditNote(col.value, props.row.__index)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </q-card>
      <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="mdi-credit-card-refund" label="Créer un avoir"
        @click="creditNoteCreationModal = true" />
    </div>

    <!-- Credit note creation modal -->
    <q-modal v-model="creditNoteCreationModal" content-classes="modal-container-sm" @hide="resetCreationCreditNoteData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">avoir</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="creditNoteCreationModal = false" /></span>
          </div>
        </div>
        <q-search caption="Bénéficiaire" v-model="terms" placeholder="Rechercher..." inverted-light color="white" required-field>
          <q-autocomplete @search="search" @selected="selected" :debounce='0'/>
        </q-search>
        <ni-modal-select caption="Tiers payeur" :options="fundingTppOptions" v-model="newCreditNote.thirdPartyPayer"
          :error="$v.newCreditNote.thirdPartyPayer.$error" @blur="$v.newCreditNote.thirdPartyPayer.$touch" required-field />
        <ni-datetime-picker caption="Date de l'avoir" v-model="newCreditNote.date" :error="$v.newCreditNote.date.$error"
          @blur="$v.newCreditNote.date.$touch" in-modal type="date" clearable required-field />
        <q-toggle v-model="hasEvents" label="Lié à des intervention ?" />
        <!-- Has events -->
        <ni-datetime-picker v-if="hasEvents" caption="Début période concernée" v-model="newCreditNote.startDate" :error="$v.newCreditNote.startDate.$error"
          @blur="$v.newCreditNote.startDate.$touch" in-modal type="date" :disable="!hasEvents" clearable />
        <ni-datetime-picker v-if="hasEvents" caption="Fin période concernée" v-model="newCreditNote.endDate" :error="$v.newCreditNote.endDate.$error"
          @blur="$v.newCreditNote.endDate.$touch" in-modal type="date" :disable="!hasEvents" clearable />
        <!-- Add events management here -->
        <ni-modal-select v-if="hasEvents"></ni-modal-select>
        <ni-modal-input v-if="hasEvents" caption="Montant HT" suffix="€" type="number" v-model="newCreditNote.exclTaxes" disable />
        <!-- Has no event -->
        <ni-modal-select v-if="!hasEvents" caption="Souscription concernée" v-model="newCreditNote.subscription"
          :options="subscriptionsOptions" :disable="hasEvents" required-field />
        <ni-modal-input v-if="!hasEvents" caption="Montant TTC" suffix="€" type="number" v-model="newCreditNote.inclTaxes" disable />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary" :loading="loading" @click="createNewCreditNote"
        :disable="disableCreditNoteCreationButton" />
    </q-modal>

  </q-page>
</template>

<script>
import DatetimePicker from '../../../components/form/DatetimePicker';
import DatetimeRange from '../../../components/form/DatetimeRange';
import ModalInput from '../../../components/form/ModalInput';
import ModalSelect from '../../../components/form/ModalSelect';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'CreditNotes',
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-modal-select': ModalSelect,
    'ni-datetime-range': DatetimeRange
  },
  data () {
    return {
      loading: false,
      creditNoteCreationModal: false,
      customers: [],
      terms: '',
      hasEvents: false,
      subscriptionsOptions: [],
      thirdPartyPayersOptions: [],
      creditNotesDates: {
        startDate: null,
        endDate: null,
      },
      newCreditNote: {
        customer: null,
        thirdPartyPayer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxes: '',
        inclTaxes: '',
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
          field: 'startDate',
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: 'endDate',
        },
        {
          name: 'customer',
          label: 'Bénéficiaire',
          align: 'left',
          field: 'customer',
        },
        {
          name: 'thirdPartyPayer',
          label: 'Client',
          align: 'left',
          field: 'thirdPartyPayer',
        },
        {
          name: 'exclTaxes',
          label: 'HT',
          align: 'left',
          field: 'exclTaxes',
        },
        {
          name: 'inclTaxes',
          label: 'TTC',
          align: 'left',
          field: 'inclTaxes',
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
  async mounted () {
    if (this.mainUser.company.customersConfig.billingPeriod === 'two_weeks') {
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
    await this.refreshCustomers();
    await this.refreshCreditNotes();
  },
  validations () {
    return {
      newCreditNote: {
        date: { required },
        startDate: {
          required: requiredIf(() => {
            return this.hasEvents;
          })
        },
        endDate: {
          required: requiredIf(() => {
            return this.hasEvents;
          })
        },
        subscription: {
          required: requiredIf(() => {
            return !this.hasEvents;
          })
        },
        thirdPartyPayer: { required }
      }
    }
  },
  computed: {
    disableCreditNoteCreationButton () {
      return '';
    },
    mainUser () {
      return this.$store.getters['main/user'];
    }
  },
  methods: {
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        done(this.customers.filter(el => el.value.match(regex)));
      } catch (e) {
        done([]);
      }
    },
    selected (value) {
      console.log(value);
    },
    async refreshCustomers () {
      try {
        this.customers = await this.$customers.showAll();
        for (let i = 0, l = this.customers.length; i < l; i++) {
          this.customers[i].label = this.customers[i].identity.lastname;
          this.customers[i].value = this.customers[i].identity.lastname;
        }
        console.log(this.customers);
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de récupérer les bénéficiaires');
      }
    },
    async refreshCreditNotes () {
      try {
        this.creditNotes = await this.$creditNotes.showAll({ startDate: this.creditNotesDates.startDate, endDate: this.creditNotesDates.endDate });
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de récupérer les avoirs');
      }
    },
    async createNewCreditNote () {
      try {
        this.$v.newCreditNote.$touch();
        if (this.$v.newCreditNote.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        await this.$creditNotes.create(this.newCreditNote);
        NotifyPositive('Avoir créé');
        this.resetCreationCreditNoteData();
        await this.refreshCreditNotes();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'avoir');
      } finally {
        this.loading = false;
      }
    },
    resetCreationCreditNoteData () {
      this.newCreditNote = {
        customer: null,
        thirdPartyPayer: null,
        date: null,
        events: [],
        startDate: null,
        endDate: null,
        exclTaxes: '',
        inclTaxes: '',
        subscription: null
      };
    }
  }
}
</script>
