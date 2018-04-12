<template>
  <q-page>
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
      <q-tr slot="body" slot-scope="props" class="cursor-pointer" @click.native="getAuxiliaryInfo(props.row)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <span v-if="col.name === 'firstSmsDate' || col.name === 'auxiliary'">{{ col.value }}</span>
          <div v-else>
            <q-icon name="done" color="positive" v-if="col.value === true" />
            <q-icon name="clear" color="negative" v-if="col.value === false || col.value === '-'" />
          </div>
        </q-td>
      </q-tr>
    </q-table>
    <q-modal v-if="auxiliary" v-model="isOpened" :content-css="{ maxWidth: '80vw', maxHeight: '90vh', padding: '20px' }">
      <div class="row justify-end">
        <q-btn icon="clear" color="primary" flat @click="isOpened = false" />
      </div>
      <h5 class="q-my-md">Détail {{ auxiliary.name }}</h5>
      <div class="row q-mb-md">
        <q-btn icon="folder" label="Dossier Google Drive" color="primary" flat @click="goTo(auxiliary.driveFolderLink)" />
      </div>
      <div class="row q-mb-md gutter-sm">
        <div v-for="(info, index) in auxiliary.info" :key="index" inline class="col-xs-12 col-md-4 row justify-center">
          <q-card style="width: 100%">
            <q-card-title>{{ info.title }}</q-card-title>
            <q-card-main>
              <q-list>
                <q-item v-for="(data, index) in info.data" :key="index">
                  <q-item-main>{{ data.label }}</q-item-main>
                  <q-item-side>
                    <q-icon name="done" color="positive" v-if="data.done" />
                    <q-icon name="clear" color="negative" v-if="!data.done" />
                  </q-item-side>
                </q-item>
              </q-list>
            </q-card-main>
          </q-card>
        </div>
      </div>
    </q-modal>
  </q-page>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data () {
    return {
      userList: [],
      auxiliary: null,
      isOpened: false,
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
          field: row => row.personalInfo.done,
          align: 'center',
          sortable: true
        },
        {
          name: 'paymentInfo',
          label: 'Informations de paiement',
          field: row => row.paymentInfo.done,
          align: 'center',
          sortable: true
        },
        {
          name: 'miscDocuments',
          label: 'Documents annexes',
          field: row => row.miscDocuments.done,
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
                personalInfo: {
                  data: {
                    dateOfBirth: {
                      label: 'Date de naissance',
                      done: !!ogustUserList[k].date_of_birth
                    },
                    placeOfBirth: {
                      label: 'Lieu de naissance',
                      done: !!ogustUserList[k].place_of_birth
                    },
                    stateOfBirth: {
                      label: 'Département de naissance',
                      done: !!ogustUserList[k].state_of_birth
                    },
                    countryOfBirth: {
                      label: 'Pays de naissance',
                      done: !!ogustUserList[k].country_of_birth
                    },
                  },
                  done: !!ogustUserList[k].date_of_birth &&
                  !!ogustUserList[k].place_of_birth &&
                  !!ogustUserList[k].state_of_birth &&
                  !!ogustUserList[k].country_of_birth
                },
                paymentInfo: {
                  data: {
                    iban: {
                      label: 'IBAN',
                      done: userList[i].administrative &&
                  userList[i].administrative.payment &&
                  userList[i].administrative.payment.rib
                        ? !!userList[i].administrative.payment.rib.iban : false
                    },
                    bic: {
                      label: 'BIC',
                      done: userList[i].administrative &&
                  userList[i].administrative.payment &&
                  userList[i].administrative.payment.rib
                        ? !!userList[i].administrative.payment.rib.bic : false
                    },
                  },
                  done: userList[i].administrative &&
                  userList[i].administrative.payment &&
                  userList[i].administrative.payment.rib
                    ? !!userList[i].administrative.payment.rib.iban &&
                      !!userList[i].administrative.payment.rib.bic
                    : '-'
                },
                miscDocuments: {
                  data: {
                    idCard: {
                      label: 'CNI',
                      done: userList[i].administrative ? !!userList[i].administrative.idCard : false
                    },
                    healthAttest: {
                      label: 'Attestation carte vitale',
                      done: userList[i].administrative ? !!userList[i].administrative.healthAttest : false
                    },
                    certificates: {
                      label: 'Diplômes et/ou certificats',
                      done: userList[i].administrative ? userList[i].administrative.certificates.length !== 0 : false
                    }
                  },
                  done: userList[i].administrative
                    ? !!userList[i].administrative.idCard &&
                  !!userList[i].administrative.healthAttest &&
                  userList[i].administrative.certificates.length !== 0
                    : '-'
                },
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
    getAuxiliaryInfo (row) {
      this.auxiliary = {
        info: {
          personalInfo: {
            title: 'Informations personnelles',
            data: row.personalInfo.data
          },
          paymentInfo: {
            title: 'Informations de paiement',
            data: row.paymentInfo.data
          },
          miscDocuments: {
            title: 'Documents annexes',
            data: row.miscDocuments.data
          }
        },
        name: row.auxiliary,
        driveFolderLink: row.driveFolderLink
      };
      this.isOpened = true;
      console.log(this.auxiliary);
    },
    goTo (url) {
      openURL(url);
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';
</style>
