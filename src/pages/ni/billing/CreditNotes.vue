<template>
  <q-page class="neutral-background" padding>
    <h4>Avoirs</h4>
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
        [Tiers payeurs à venir]
        <!-- <ni-modal-select caption="Tiers payeur" :options="fundingTppOptions" v-model="newFunding.thirdPartyPayer"
          :error="$v.newFunding.thirdPartyPayer.$error" @blur="$v.newFunding.thirdPartyPayer.$touch" required-field /> -->
        <ni-datetime-picker caption="Date de l'avoir" v-model="newCreditNote.date" :error="$v.newCreditNote.date.$error"
          @blur="$v.newCreditNote.date.$touch" in-modal type="date" clearable required-field />
        <q-toggle v-model="hasEvents" label="Lié à des intervention ?" />
        <ni-datetime-picker v-if="hasEvents" caption="Début période concernée" v-model="newCreditNote.startDate" :error="$v.newCreditNote.startDate.$error"
          @blur="$v.newCreditNote.startDate.$touch" in-modal type="date" :disable="!hasEvents" clearable />
        <ni-datetime-picker v-if="hasEvents" caption="Fin période concernée" v-model="newCreditNote.endDate" :error="$v.newCreditNote.endDate.$error"
          @blur="$v.newCreditNote.endDate.$touch" in-modal type="date" :disable="!hasEvents" clearable />
        <!-- Add events management here -->
        <ni-modal-input v-if="hasEvents" caption="Montant HT" suffix="€" type="number" v-model="newCreditNote.exclTaxes" disable />
        <ni-modal-input v-if="!hasEvents" caption="Montant TTC" suffix="€" type="number" v-model="newCreditNote.inclTaxes" disable />
        <ni-modal-select v-if="!hasEvents" caption="Souscription concernée" v-model="newCreditNote.subscription"
          :options="subscriptionsOptions" :disable="hasEvents" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary" :loading="loading" @click="createNewCreditNote"
        :disable="disableCreditNoteCreationButton" />
    </q-modal>

  </q-page>
</template>

<script>
import DatetimePicker from '../../../components/form/DatetimePicker.vue';
import ModalInput from '../../../components/form/ModalInput.vue';
import ModalSelect from '../../../components/form/ModalSelect.vue';
import { required, requiredIf } from 'vuelidate/lib/validators';

export default {
  name: 'CreditNotes',
  components: {
    'ni-datetime-picker': DatetimePicker,
    'ni-modal-input': ModalInput,
    'ni-modal-select': ModalSelect,
  },
  data () {
    return {
      loading: false,
      company: null,
      creditNoteCreationModal: false,
      customers: [],
      terms: '',
      hasEvents: false,
      subscriptionsOptions: [],
      thirdPartyPayersOptions: [],
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
    this.customers = await this.$customers.showAll();
    for (let i = 0, l = this.customers.length; i < l; i++) {
      this.customers[i].label = this.customers[i].identity.lastname;
      this.customers[i].value = this.customers[i].identity.lastname;
    }
    console.log(this.customers);
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
      }
    }
  },
  computed: {
    disableCreditNoteCreationButton () {
      return '';
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
    createNewCreditNote () {
      console.log('test');
    },
    resetCreationCreditNoteData () {
      console.log('test2');
    }
  }
}
</script>
