<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <div style="display: flex">
        <h4>Registre unique du personnel</h4>
      </div>
    </div>
    <q-table :data="staffRegister" :columns="columns" row-key="_id" binary-state-sort :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="q-pa-sm large-table">
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template v-if="col.name ==='idCardOrResidencePermitRecto' || col.name ==='idCardOrResidencePermitVerso'">
              <div  class="row justify-center table-actions">
                <q-btn flat round small color="primary">
                  <a :href="col.value" target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>
import nationalities from '../../../data/nationalities.js';

export default {
  data () {
    return {
      staffRegister: [],
      tableLoading: false,
      pagination: {
        sortBy: 'hiringDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => this.$_.get(row, 'user.identity.lastname').toUpperCase(),
          align: 'left',
        },
        {
          name: 'firstname',
          label: 'Prénom',
          field: row => this.$_.get(row, 'user.identity.firstname'),
          align: 'left',
        },
        {
          name: 'birthDate',
          label: 'Date de naissance',
          field: row => this.$_.get(row, 'user.identity.birthDate'),
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'Non renseignée',
        },
        {
          name: 'gender',
          label: 'Civilité',
          field: row => this.$_.get(row, 'user.identity.title'),
          align: 'left',
        },
        {
          name: 'nationality',
          label: 'Nationalité',
          field: row => nationalities[this.$_.get(row, 'user.identity.nationality')],
          align: 'left',
        },
        {
          name: 'job',
          label: 'Emploi',
          field: row => 'Auxiliaire de vie',
          align: 'left',
        },
        {
          name: 'contract',
          label: 'Type de contrat',
          field: row => 'CDI',
          align: 'center',
        },
        {
          name: 'hiringDate',
          label: 'Date de début',
          field: 'startDate',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: row => row.endDate,
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'idCardOrResidencePermitRecto',
          label: 'Titre de séjour/Identité (R)',
          field: row => this.$_.has(row, 'user.administrative.idCardRecto.link') ? this.$_.get(row, 'user.administrative.idCardRecto.link') : this.$_.get(row, 'user.administrative.residencePermitRecto.link'),
          align: 'left',
          style: 'width: 105px',
        },
        {
          name: 'idCardOrResidencePermitVerso',
          label: 'Titre de séjour/Identité (V)',
          field: row => this.$_.has(row, 'user.administrative.idCardVerso.link') ? this.$_.get(row, 'user.administrative.idCardVerso.link') : this.$_.get(row, 'user.administrative.residencePermitVerso.link'),
          align: 'left',
          style: 'width: 105px',
        },
      ],
    }
  },
  async mounted () {
    await this.getStaffRegister();
  },
  methods: {
    async getStaffRegister () {
      try {
        this.tableLoading = true;
        this.staffRegister = await this.$contracts.getStaffRegister();
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
      }
    },
  },
}
</script>
