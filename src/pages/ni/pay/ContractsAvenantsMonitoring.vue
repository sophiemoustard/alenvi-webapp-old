<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Suivi Contrats/Avenants</h4>
      <ni-date-range v-model="dates" @input="refresh" borderless :error.sync="datesHasError" />
    </div>
    <q-table :data="contracts" :columns="columns" binary-state-sort :pagination.sync="pagination" class="q-pa-sm">
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
          <template v-if="col.name==='actions'">
            <div v-if="!contracts.endDate" class="row no-wrap table-actions contract-actions">
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
import {formatIdentity} from '../../../helpers/utils';

export default {
  components: {
    'ni-date-range': DateRange,
    'ni-billing-pagination': BillingPagination,
  },
  data () {
    return {
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
        this.contracts = [];
        const startDate = this.$moment(this.dates.startDate);
        const endDate = this.$moment(this.dates.endDate);
        contractsList.forEach(contract => {
          const versions = contract.versions;
          for (var idx = 0; idx < versions.length; idx++) {
            const version = versions[idx];
            const versionStartDate = this.$moment(version.startDate);
            const versionEndDate = this.$moment(version.endDate);
            if ((versionStartDate.isAfter(startDate) && versionStartDate.isBefore(endDate)) ||
            (versionEndDate.isAfter(startDate) && versionEndDate.isBefore(endDate))) {
              const versionToDisplay = version;
              versionToDisplay.user = contract.user;
              versionToDisplay.type = idx ? 'Avenant' : 'Contrat';
              this.contracts.push(versionToDisplay);
            }
          }
        });
        this.contractsLoading = false;
      } catch (e) {
        this.$contracts = [];
        this.contractsLoading = false;
        console.error(e);
      }
    },
    goToUserContractPage (user) {
      this.$router.push({ name: 'personal info', params: { id: user._id, defaultTab: 'contracts' } });
    },
  },
}
</script>
