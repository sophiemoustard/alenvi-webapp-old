<template>
  <div style="max-width: 90vw;">
    <h4>Répertoire</h4>
    <q-table
      :data="userList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[30, 40, 50]"
      :pagination.sync="pagination"
      :filter="filter"
      dense
      rows-per-page-label="Lignes"
      :pagination-label="paginationLabel"
      no-data-label="Données non disponibles"
      no-results-label="Pas de résultats">
      <template slot="top" slot-scope="props">
        <q-search hide-underline color="primary" v-model="filter" clearable placeholder="Recherche" class="col-6" />
      </template>
      <q-td slot="body-cell-check" slot-scope="props" :props="props">
        <q-checkbox v-model="props.value.checked" @input="process(props.value.id, props.value.checked, props.row.__index)" val="props.value.checked"></q-checkbox>
      </q-td>
      <q-td slot="body-cell-remove" slot-scope="props" :props="props">
        <q-icon class="cursor-pointer" color="tertiary" name="delete" @click.native="remove(props.value.id, props.row.__index, props.value.userId)" size="1.5rem" />
      </q-td>
    </q-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pagination: {
        sortBy: 'date', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 30 // current rows per page being displayed
      }
    }
  }
}
</script>
