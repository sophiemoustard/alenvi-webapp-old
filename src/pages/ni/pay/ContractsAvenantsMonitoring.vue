<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="Suivi Contrats/Avenants">
      <template slot="content">
        <div class="col-xs-12 col-md-5">
        <ni-date-range v-model="dates" @input="refresh" borderless :error.sync="datesHasError" />
        </div>
      </template>
    </ni-title-header>
    <q-table :data="contracts" :columns="columns" binary-state-sort :pagination.sync="pagination" class="q-pa-smn large-table">
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
          <template v-if="col.name==='actions'">
          <div class="row no-wrap table-actions contract-actions">
            <q-btn flat round small color="grey" icon="remove_red_eye" @click="goToUserContractPage(col.value)" />
            <q-btn flat round small color="grey" icon="edit" />
          </div>
          </template>
          <template v-else>
            {{ col.value }}
          </template>
        </q-td>
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="contracts"/>
    </q-table>
  </q-page>
</template>

<script>
import DateRange from '../../../components/form/DateRange';
import BillingPagination from '../../../components/table/BillingPagination';
import TitleHeader from '../../../components/TitleHeader';
import {formatIdentity} from '../../../helpers/utils';

export default {
  components: {
    'ni-date-range': DateRange,
    'ni-billing-pagination': BillingPagination,
    'ni-title-header': TitleHeader,
  },
  data () {
    return {
      name: 'ContractsAvenantsMonitoring',
      metaInfo: {
        title: 'Suivi Contrats/Avenants',
      },
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      datesHasError: false,
      contracts: [],
      contractsLoading: false,
      pagination: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          field: row => formatIdentity(row.user.identity, 'Fl'),
          align: 'left',
          sortable: true,
        },
        {
          name: 'team',
          label: 'Equipe',
          align: 'left',
          field: row => this.$_.get(row, 'user.sector.name', ''),
          sortable: true,
        },
        {
          name: 'type',
          label: 'Nature',
          field: 'type',
          align: 'left',
          sortable: true,
        },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
          sortable: true,
        },
        {
          name: 'weeklyHours',
          label: 'Nombre d\'heures',
          field: 'weeklyHours',
          align: 'center',
          sortable: true,
        },
        {
          name: 'grossHourlyRate',
          label: 'Taux horaire',
          field: 'grossHourlyRate',
          align: 'center',
          sortable: true,
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '∞',
          align: 'center',
          sortable: true,
        },
        {
          name: 'actions',
          align: 'center',
          field: 'user',
        },
      ],
    }
  },
  async mounted () {
    await this.refresh();
  },
  methods: {
    async refresh () {
      try {
        this.contractsLoading = true;
        if (this.datesHasError) return;
        const contractsList = await this.$contracts.list({ startDate: this.dates.startDate, endDate: this.dates.endDate });
        this.formatContractList(contractsList);
        this.contractsLoading = false;
      } catch (e) {
        this.contracts = [];
        this.contractsLoading = false;
        console.error(e);
      }
    },
    formatContractList (contractsList) {
      this.contracts = [];
      const startDate = this.$moment(this.dates.startDate);
      const endDate = this.$moment(this.dates.endDate);
      contractsList.forEach(contract => {
        const { versions } = contract;
        if (this.isContractEnding(contract, startDate, endDate)) {
          const lastVersion = versions[versions.length - 1];
          const versionToDisplay = {
            ...lastVersion,
            user: contract.user,
            type: 'Contrat',
          }
          this.contracts.push(versionToDisplay);
        }
        for (let idx = 0; idx < versions.length; idx++) {
          const version = versions[idx];
          const versionStartDate = this.$moment(version.startDate);
          if ((versionStartDate.isSameOrAfter(startDate) && versionStartDate.isSameOrBefore(endDate))) {
            const versionToDisplay = {
              ...version,
              user: contract.user,
              type: idx ? 'Avenant' : 'Contrat',
            }
            this.contracts.push(versionToDisplay);
          }
        }
      });
    },
    isContractEnding (contract, startDate, endDate) {
      const contractEndDate = this.$moment(contract.endDate);
      const lastVersionStartDate = this.$moment(contract.startDate);
      return (contractEndDate.isSameOrAfter(startDate) && contractEndDate.isSameOrBefore(endDate)) &&
        (lastVersionStartDate.isSameOrBefore(startDate) && lastVersionStartDate.isSameOrAfter(endDate));
    },
    goToUserContractPage (user) {
      this.$router.push({ name: 'personal info', params: { id: user._id, defaultTab: 'contracts' } });
    },
  },
}
</script>
