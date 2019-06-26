<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>À payer</h4>
      <ni-select-sector v-model="selectedSector" allow-null-option />
    </div>
    <q-table :data="displayedDraftPay" :columns="columns" class="q-pa-sm" selection="multiple" row-key="auxiliaryId"
      :selected.sync="selected" :pagination.sync="pagination" :visible-columns="visibleColumns" :loading="tableLoading">
      <q-tr slot="header" slot-scope="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        <q-th auto-width>
          <q-checkbox v-model="props.selected" indeterminate-value="some" />
        </q-th>
      </q-tr>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
          <template v-if="col.name === 'surchargedAndExempt'">
            <div v-if="props.row.surchargedAndExempt" class="cursor-pointer text-primary"
              @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndExemptDetails')">
              {{ col.value }}
            </div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'surchargedAndNotExempt'">
            <div v-if="props.row.surchargedAndNotExempt" class="cursor-pointer text-primary"
              @click="openSurchargeDetailModal(props.row.auxiliary._id, 'surchargedAndNotExemptDetails')">
              {{ col.value }}
            </div>
            <div v-else>{{ col.value }}</div>
          </template>
          <template v-else-if="col.name === 'hoursCounter'">
            <ni-editable-td :props="props.row" edited-field="hoursCounter" edition-boolean-name="hoursCounterEdition"
              :refName="`${props.row.auxiliaryId}Counter`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'overtimeHours'">
              <ni-editable-td :props="props.row" edited-field="overtimeHours" edition-boolean-name="overtimeHoursEdition"
                :refName="`${props.row.auxiliaryId}Overtime`" :value="col.value" @disable="disableEditionField($event)"
                @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'additionalHours'">
            <ni-editable-td :props="props.row" edited-field="additionalHours" edition-boolean-name="additionalHoursEdition"
              :refName="`${props.row.auxiliaryId}Additional`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'bonus'">
            <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean-name="bonusEdition"
              :refName="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="€" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <q-td auto-width style="width: 50px">
          <q-checkbox v-model="props.selected" />
        </q-td>
      </q-tr>
      <ni-billing-pagination slot="bottom" slot-scope="props" :props="props" :pagination.sync="pagination"
        :data="displayedDraftPay"/>
    </q-table>
    <q-btn class="fixed fab-custom" :disable="!hasSelectedRows" no-caps rounded color="primary" icon="done"
      label="Payer" @click="createList" />

    <!-- Surcharge detail modal -->
    <q-modal v-model="surchargeDetailModal" content-classes="modal-container-sm" @hide="resetSurchargeDetail">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Détails des <span class="text-weight-bold">majorations</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="surchargeDetailModal = false" /></span>
          </div>
        </div>
        <div v-for="(surchargePlanDetails, surchargePlanId) in surchargeDetails" :key="surchargePlanId" class="q-mb-xl">
          <div class="text-primary capitalize text-weight-bold q-mb-md">
            {{ surchargePlanDetails.planName }}
          </div>
          <div v-for="(surchage, surchargeName) in getSurcharges(surchargePlanDetails)" :key="surchargeName"
            class="surcharge-line">
            <div class="surcharge-type q-pa-sm">
              {{ SURCHARGES[surchargeName] }} - {{ surchage.percentage }}%
            </div>
            <div class="q-pa-sm">{{ formatHours(surchage.hours) }}</div>
          </div>
        </div>
      </div>
    </q-modal>
  </q-page>
</template>

<script>
import pick from 'lodash/pick';

import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import SelectSector from '../../../components/form/SelectSector';
import EditableTd from '../../../components/table/EditableTd';
import BillingPagination from '../../../components/table/BillingPagination';
import { payMixin } from '../../../mixins/payMixin';
import { editableTdMixin } from '../../../mixins/editableTdMixin';
import { SURCHARGES } from '../../../data/constants';

export default {
  name: 'ToPay',
  metaInfo: { title: 'À payer' },
  mixins: [payMixin, editableTdMixin],
  components: {
    'ni-select-sector': SelectSector,
    'ni-editable-td': EditableTd,
    'ni-billing-pagination': BillingPagination,
  },
  data () {
    return {
      draftPay: [],
      displayedDraftPay: [],
      selected: [],
      pagination: { rowsPerPage: 0 },
      visibleColumns: ['auxiliary', 'sector', 'startDate', 'endDate', 'contractHours', 'workedHours', 'notSurchargedAndExempt', 'surchargedAndExempt',
        'notSurchargedAndNotExempt', 'surchargedAndNotExempt', 'hoursBalance', 'hoursCounter', 'overtimeHours', 'additionalHours', 'mutual', 'transport',
        'otherFees', 'bonus'],
      surchargeDetailModal: false,
      surchargeDetails: {},
      selectedSector: '',
      tableLoading: false,
      SURCHARGES,
    };
  },
  computed: {
    hasSelectedRows () {
      return this.selected.length > 0;
    },
  },
  watch: {
    selectedSector (value) {
      if (value === '') this.displayedDraftPay = [...this.draftPay];
      else this.displayedDraftPay = this.draftPay.filter(dp => dp.auxiliary.sector._id === value);
      this.selected = [];
    }
  },
  async mounted () {
    this.tableLoading = true;
    await this.refreshDraftPay();
    this.tableLoading = false;
  },
  methods: {
    async refreshDraftPay () {
      try {
        const draftPay = await this.$pay.getDraftPay({
          startDate: this.$moment().startOf('M').toISOString(),
          endDate: this.$moment().endOf('M').toISOString(),
        });
        this.draftPay = draftPay.map(dp => ({
          ...dp,
          hoursCounterEdition: false,
          overtimeHoursEdition: false,
          additionalHoursEdition: false,
          bonusEdition: false,
        }));
        this.displayedDraftPay = [...this.draftPay];
      } catch (e) {
        NotifyNegative('Impossible de récupérer les payes');
        this.draftPay = [];
        console.error(e);
      }
    },
    // Surcharge modal
    openSurchargeDetailModal (id, details) {
      const draft = this.draftPay.find(dp => dp.auxiliary._id === id);
      if (!draft) return;

      this.surchargeDetails = draft[details];
      this.surchargeDetailModal = true;
    },
    resetSurchargeDetail () {
      this.surchargeDetails = {};
    },
    getSurcharges (surchargesPlanDetails) {
      return pick(surchargesPlanDetails, Object.keys(SURCHARGES));
    },
    // Creation
    async createList () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Cette opération est définitive. Confirmez-vous ?',
          ok: 'Oui',
          cancel: 'Non'
        });

        if (!this.hasSelectedRows) return;

        const pay = this.selected.map(row => this.formatPayload(row));
        await this.$pay.createList(pay);
        NotifyPositive('Fiches de paie crées');
        await this.refreshDraftPay();
        this.selected = [];
      } catch (e) {
        if (e.message === '') return;
        console.error(e);
        NotifyNegative('Erreur lors de la création des fiches de paie');
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  /deep/ .q-table
    th
      white-space: normal;
      padding: 10px 20px;
      vertical-align: middle;
      padding: 6px
    td
      padding: 6px
    & tbody tr.selected
      background: $white

  .surcharge-line
    display: flex;
    flex-direction: row;
    width: 100%;
    border: 1px solid $light-grey;
    &:not(:nth-child(2)) // first-child is title
      border-top: none;

  .surcharge-type
    width: 60%
    border-right: 1px solid $light-grey;

  .title-padding
    .q-select
      width: 250px
      height: fit-content;
</style>
