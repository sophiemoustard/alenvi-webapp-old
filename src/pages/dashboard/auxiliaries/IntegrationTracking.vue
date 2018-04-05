<template>
    <q-table
      :data="filteredUserList"
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
        <q-search
          hide-underline
          color="primary"
          v-model="filter"
          clearable
          placeholder="Recherche"
          class="col-9" />
        <q-toggle
          color="primary"
          v-model="isComplete"
          label="Historique intégration"
          class="col-3" />
      </template>
      <q-tr slot="body" slot-scope="props" class="cursor-pointer" @click.native="goToDriveFolder(props.row)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <span v-if="col.name === 'firstSmsDate' || col.name === 'auxiliary'">{{ col.value }}</span>
          <div v-else>
            <q-icon name="done" color="positive" v-if="col.value === true" />
            <q-icon name="clear" color="negative" v-if="col.value === false || col.value === '-'" />
          </div>
        </q-td>
      </q-tr>
    </q-table>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data () {
    return {
      userList: [],
      isChecked: false,
      isComplete: false,
      filter: '',
      pagination: {
        sortBy: 'firstSmsDate', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 30 // current rows per page being displayed
      },
      columns: [
        {
          name: 'firstSmsDate',
          label: 'Date SMS Accueil',
          field: 'firstSmsDate',
          align: 'left',
          sortable: true,
          sort: (a, b) => new Date(a) - new Date(b),
          format (value) {
            if (value === '-') {
              return '-';
            }
            return new Date(value).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        },
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          field: 'auxiliary',
          align: 'left',
          sortable: true
        },
        {
          name: 'secondSmsDate',
          label: 'SMS confirmation inscription',
          field: 'secondSmsDate',
          align: 'center',
          sortable: true
        },
        {
          name: 'pigiConnection',
          label: 'Connexion Pigi',
          field: 'pigiConnection',
          align: 'center',
          sortable: true
        },
        {
          name: 'personalInfo',
          label: 'Informations personnelles',
          field: 'personalInfo',
          align: 'center',
          sortable: true
        },
        {
          name: 'paymentInfo',
          label: 'Informations de paiement',
          field: 'paymentInfo',
          align: 'center',
          sortable: true
        },
        {
          name: 'miscDocuments',
          label: 'Documents annexes',
          field: 'miscDocuments',
          align: 'center',
          sortable: true
        }
      ]
    };
  },
  async mounted () {
    await this.getAuxiliaries();
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    filteredUserList () {
      if (!this.isComplete) {
        return this.userList.filter(auxiliary => !auxiliary.complete);
      }
      return this.userList.filter(auxiliary => auxiliary.complete && auxiliary.firstSmsDate !== '-');
    }
  },
  methods: {
    async getAuxiliaries () {
      try {
        const userList = await this.$users.showAll({ role: 'Auxiliaire' });
        const ogustUserList = await this.$ogust.getEmployees();
        for (let i = 0, l = userList.length; i < l; i++) {
          for (const k in ogustUserList) {
            if (userList[i].employee_id === Number(ogustUserList[k].id_employee)) {
              this.userList.push({
                firstSmsDate:
                  userList[i].administrative &&
                  userList[i].administrative.signup.firstSmsDate
                    ? userList[i].administrative.signup.firstSmsDate
                    : '-',
                auxiliary: `${userList[i].firstname} ${userList[i].lastname}`,
                secondSmsDate:
                  userList[i].administrative &&
                  userList[i].administrative.signup.secondSmsDate
                    ? !!userList[i].administrative.signup.secondSmsDate
                    : '-',
                pigiConnection: userList[i].facebook
                  ? !!userList[i].facebook.address
                  : '-',
                personalInfo:
                  !!ogustUserList[k].date_of_birth &&
                  !!ogustUserList[k].place_of_birth &&
                  !!ogustUserList[k].state_of_birth &&
                  !!ogustUserList[k].country_of_birth,
                paymentInfo:
                  userList[i].administrative &&
                  userList[i].administrative.payment &&
                  userList[i].administrative.payment.rib
                    ? !!userList[i].administrative.payment.rib.iban &&
                      !!userList[i].administrative.payment.rib.iban
                    : '-',
                miscDocuments: userList[i].administrative
                  ? !!userList[i].administrative.idCard &&
                    !!userList[i].administrative.healthAttest &&
                    !!userList[i].administrative.certificates &&
                    !!userList[i].administrative.phoneInvoice
                  : '-',
                complete: userList[i].administrative.signup.complete,
                driveFolderLink: userList[i].administrative.driveFolder ? userList[i].administrative.driveFolder.link : false
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    paginationLabel (start, end, total) {
      return `${start} - ${end} de ${total}`;
    },
    goToDriveFolder (row) {
      if (row.driveFolderLink) {
        openURL(row.driveFolderLink);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
