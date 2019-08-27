<template>
  <div>
    <q-table :data="documents" :columns="columns" hide-bottom :pagination="pagination"
      class="q-pa-sm large-table">
      <q-td slot="body-cell-actions" slot-scope="props" :props="props">
        <div class="row justify-center table-actions">
          <q-btn flat round small color="primary" :disabled="!props.row.file.link" class="q-mx-sm" :disable="disable">
            <a :href="props.row.file.link || false" target="_blank">
              <q-icon name="file download" color="primary" />
            </a>
          </q-btn>
          <q-btn v-if="!isAuxiliary" flat round small color="primary" icon="delete" class="q-mx-sm" :disable="disable"
            @click="removeDocument(documents[props.row.__index])">
          </q-btn>
        </div>
      </q-td>
    </q-table>
    <div v-if="documents.length === 0" class="q-px-md q-my-sm">
      <span class="no-document">Aucun document</span>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

import { PAY_DOCUMENT_NATURES } from '../../data/constants';

export default {
  name: 'PayDocumentList',
  data () {
    const payDocumentNaturesKeyedByValue = keyBy(PAY_DOCUMENT_NATURES, 'value');

    return {
      documentNatureLabels: mapValues(payDocumentNaturesKeyedByValue, 'label'),
      columns: [
        {
          name: 'nature',
          label: 'Type',
          align: 'left',
          field: 'nature',
          format: value => this.documentNatureLabels[value],
        },
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => value ? moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: row => row,
        },
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        rowsPerPage: 0,
      },
    };
  },
  props: {
    documents: { type: Array, default: null },
    disable: { type: Boolean, default: false },
    isAuxiliary: { type: Boolean, default: false },
  },
  methods: {
    async removeDocument (document) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        });

        this.$emit('delete', document);
      } catch (e) {
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .no-document
    color: $grey;
</style>
