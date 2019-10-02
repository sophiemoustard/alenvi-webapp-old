<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-7">
        <h4 class="no-margin">Registre unique du personnel</h4>
      </div>
    </div>
    <q-table :data="staffRegister" :columns="columns" row-key="name" binary-state-sort :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="people-list q-pa-sm">
      <q-tr slot="body" slot-scope="props" :props="props" class="datatable-row">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template v-if="col.name ==='idCardRecto' && col.value !== 'N/A'">
            <a v-bind:href= "col.value"> lien </a>
          </template>
          <template v-else-if="col.name ==='idCardVerso' && col.value !== 'N/A'">
            <a v-bind:href= "col.value"> lien </a>
          </template>
          <template v-else-if="col.name ==='residencePermitRecto' && col.value !== 'N/A'">
            <a v-bind:href= "col.value"> lien </a>
          </template>
          <template v-else-if="col.name ==='residencePermitVerso' && col.value !== 'N/A'">
            <a v-bind:href= "col.value"> lien </a>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      staffRegister: [],
      tableLoading: true,
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
          field: row => row.fullname,
          align: 'left',
          style: 'width: 450px',
        },
        {
          name: 'birthDate',
          label: 'Date de naissance',
          field: row => row.user.identity.birthDate,
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'Non renseignée',
          style: 'width: 170px',
        },
        {
          name: 'gender',
          label: 'Sexe',
          field: row => row.user.identity.title,
          align: 'left',
          style: 'width: 450px',
        },
        {
          name: 'nationality',
          label: 'Nationalité',
          field: row => row.user.identity.nationality,
          align: 'left',
          style: 'width: 450px',
        },
        {
          name: 'job',
          label: 'Emploi',
          field: row => 'Auxiliaire de vie',
          align: 'left',
          style: 'width: 450px',
        },
        {
          name: 'contract',
          label: 'Type de contrat',
          field: row => 'CDI',
          align: 'left',
          style: 'width: 450px',
        },
        {
          name: 'hiringDate',
          label: 'Date de début',
          field: 'startDate',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          style: 'width: 170px',
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: row => row.endDate,
          align: 'left',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : 'N/A',
          style: 'width: 170px',
        },
        {
          name: 'idCardRecto',
          label: 'Recto carte d\'identité',
          field: row => row.user.administrative.idCardRecto ? row.user.administrative.idCardRecto.link : 'N/A',
          align: 'left',
          style: 'width: 170px',
        },
        {
          name: 'idCardVerso',
          label: 'Verso carte d\'identité',
          field: row => row.user.administrative.idCardVerso ? row.user.administrative.idCardVerso.link : 'N/A',
          align: 'left',
          style: 'width: 170px',
        },
        {
          name: 'residencePermitRecto',
          label: 'Recto titre de séjour',
          field: row => row.user.administrative.residencePermitRecto ? row.user.administrative.residencePermitRecto.link : 'N/A',
          align: 'left',
          style: 'width: 170px',
        },
        {
          name: 'residencePermitVerso',
          label: 'Verso titre de séjour',
          field: row => row.user.administrative.residencePermitVerso ? row.user.administrative.residencePermitVerso.link : 'N/A',
          align: 'left',
          style: 'width: 170px',
        },
      ],
    }
  },
  mounted () {
    this.getStaffRegister();
  },
  methods: {
    async getStaffRegister () {
      try {
        const staffRegister = await this.$contracts.getStaffRegister();
        this.staffRegister = staffRegister.map((auxiliary) => {
          auxiliary.fullname = `${auxiliary.user.identity.firstname} ${auxiliary.user.identity.lastname}`;
          return auxiliary;
        });
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
      }
    },
  },
}
</script>
