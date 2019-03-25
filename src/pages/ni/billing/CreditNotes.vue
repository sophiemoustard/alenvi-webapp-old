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
        @click="newCreditNoteModal = true" />
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'CreditNotes',
  data () {
    return {
      company: null,
      newCreditNoteModal: false,
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
      loading: false,
      pagination: { rowsPerPage: 0 },
    }
  },
}
</script>
