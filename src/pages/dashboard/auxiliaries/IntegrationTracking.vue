<template>
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
        <q-search
          hide-underline
          color="primary"
          v-model="filter"
          clearable
          placeholder="Recherche"
          class="col-6" />
      </template>
       <q-td slot="body-cell-secondSmsDate" slot-scope="props" :props="props">
        <q-icon name="done" color="positive" v-if="props.value === true" />
        <q-icon name="clear" color="negative" v-if="props.value === false || props.value === '-'" />
       </q-td>
      <q-td slot="body-cell-pigiConnection" slot-scope="props" :props="props">
        <q-icon name="done" color="positive" v-if="props.value === true" />
        <q-icon name="clear" color="negative" v-if="props.value === false || props.value === '-'" />
       </q-td>
      <q-td slot="body-cell-personalInfo" slot-scope="props" :props="props">
        <q-icon name="done" color="positive" v-if="props.value === true" />
        <q-icon name="clear" color="negative" v-if="props.value === false || props.value === '-'" />
       </q-td>
      <q-td slot="body-cell-paymentInfo" slot-scope="props" :props="props">
        <q-icon name="done" color="positive" v-if="props.value === true" />
        <q-icon name="clear" color="negative" v-if="props.value === false || props.value === '-'" />
       </q-td>
      <q-td slot="body-cell-miscDocuments" slot-scope="props" :props="props">
        <q-icon name="done" color="positive" v-if="props.value === true" />
        <q-icon name="clear" color="negative" v-if="props.value === false || props.value === '-'" />
       </q-td>
    </q-table>
</template>

<script>
export default {
  data () {
    return {
      userList: [],
      isChecked: false,
      filter: '',
      pagination: {
        sortBy: 'date', // String, column "name" property value
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
    }
  },
  methods: {
    async getAuxiliaries () {
      try {
        const userListRaw = await this.$users.showAll({ role: 'Auxiliaire' });
        const userList = userListRaw.filter(auxiliary => auxiliary.administrative && !auxiliary.administrative.signup.complete)
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
                  ? !!userList[i].administrative.vitalCard &&
                    !!userList[i].administrative.idCard &&
                    !!userList[i].administrative.healthAttest &&
                    !!userList[i].administrative.certificates &&
                    !!userList[i].administrative.phoneInvoice &&
                    !!userList[i].administrative.mutualFund &&
                    !!userList[i].administrative.navigoInvoice
                  : '-'
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
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
