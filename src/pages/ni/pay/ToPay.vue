<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>À payer</h4>
    </div>
    <div class="sector-filter">
      <ni-select-sector v-model="selectedSector" allow-null-option />
    </div>
    <q-table :data="displayedDraftPay" :columns="columns" class="q-pa-sm" selection="multiple" row-key="auxiliaryId"
      :selected.sync="selected">
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
            <ni-editable-td :props="props.row" edited-field="hoursCounter" edition-boolean="hoursCounterEdition"
              :refName="`${props.row.auxiliaryId}Counter`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'overtimeHours'">
              <ni-editable-td :props="props.row" edited-field="overtimeHours" edition-boolean="overtimeHoursEdition"
                :refName="`${props.row.auxiliaryId}Overtime`" :value="col.value" @disable="disableEditionField($event)"
                @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'additionalHours'">
            <ni-editable-td :props="props.row" edited-field="additionalHours" edition-boolean="additionalHoursEdition"
              :refName="`${props.row.auxiliaryId}Additional`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="h" />
          </template>
          <template v-else-if="col.name === 'bonus'">
            <ni-editable-td :props="props.row" edited-field="bonus" edition-boolean="bonusEdition"
              :refName="`${props.row.auxiliaryId}Bonus`" :value="col.value" @disable="disableEditionField($event)"
              @click="editField($event)" @change="setEditionField($event)" suffix="€" />
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <q-td auto-width style="width: 50px">
          <q-checkbox v-model="props.selected" />
        </q-td>
      </q-tr>
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
        <div v-for="surchargePlan in Object.keys(surchargeDetails)" :key="surchargePlan" class="q-mb-xl">
          <div class="text-primary capitalize text-weight-bold q-mb-md">{{ surchargePlan }}</div>
          <div v-for="surcharge in Object.keys(surchargeDetails[surchargePlan])" :key="surcharge"
            class="surcharge-line">
            <div class="surcharge-type q-pa-sm">{{ surcharge }}</div>
            <div class="q-pa-sm">{{ formatHours(surchargeDetails[surchargePlan][surcharge]) }}</div>
          </div>
        </div>
      </div>
    </q-modal>
  </q-page>
</template>

<script>
import { formatPrice } from '../../../helpers/utils';
import { NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import SelectSector from '../../../components/form/SelectSector';
import EditableTd from '../../../components/table/EditableTd';

export default {
  name: 'ToPay',
  metaInfo: { title: 'À payer' },
  components: {
    'ni-select-sector': SelectSector,
    'ni-editable-td': EditableTd,
  },
  data () {
    return {
      draftPay: [],
      displayedDraftPay: [],
      selected: [],
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          align: 'left',
          field: 'auxiliary',
          format: value => value && value.identity ? `${value.identity.firstname.slice(0, 1)}. ${value.identity.lastname}` : ''
        },
        {
          name: 'sector',
          label: 'Secteur',
          align: 'left',
          field: 'auxiliary',
          format: value => value && value.sector ? value.sector.name : '',
        },
        {
          name: 'startDate',
          label: 'Début de paye',
          align: 'left',
          field: 'startDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endDate',
          label: 'Fin de paye',
          align: 'left',
          field: 'endDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'contractHours',
          label: 'Heures contrat',
          align: 'center',
          field: 'contractHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'workedHours',
          label: 'Total heures travaillées',
          align: 'center',
          field: 'workedHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo SAP non majorées',
          align: 'center',
          field: 'notSurchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont majorées et exo SAP',
          align: 'center',
          field: 'surchargedAndExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non majorées non exo SAP',
          align: 'center',
          field: 'notSurchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont majorées et non exo SAP',
          align: 'center',
          field: 'surchargedAndNotExempt',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures période',
          align: 'center',
          field: 'hoursBalance',
          format: value => this.formatHours(value),
        },
        {
          name: 'hoursCounter',
          label: 'Compteur d\'heures',
          align: 'center',
          field: row => row.hoursCounter - row.additionalHours - row.overtimeHours,
          format: value => this.formatHours(value),
        },
        {
          name: 'overtimeHours',
          label: 'Heures sup à payer',
          align: 'center',
          field: 'overtimeHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'additionalHours',
          label: 'Heures complémentaires à payer',
          align: 'center',
          field: 'additionalHours',
          format: value => this.formatHours(value),
        },
        {
          name: 'mutual',
          label: 'Mutuelle',
          align: 'center',
          field: 'mutual',
          format: value => value ? 'Oui' : 'Non',
        },
        {
          name: 'transport',
          label: 'Transport',
          align: 'center',
          field: 'transport',
          format: value => formatPrice(value),
        },
        {
          name: 'otherFees',
          label: 'Autres frais',
          align: 'center',
          field: 'otherFees',
          format: value => formatPrice(value),
        },
        {
          name: 'bonus',
          label: 'Prime',
          align: 'center',
          field: 'bonus',
          format: value => formatPrice(value),
        },
      ],
      surchargeDetailModal: false,
      surchargeDetails: {},
      selectedSector: '',
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
      else this.displayedDraftPay = [...this.draftPay].filter(dp => dp.auxiliary.sector._id === value);
      this.selected = [];
    }
  },
  async mounted () {
    await this.refreshDraftPay();
  },
  methods: {
    async refreshDraftPay () {
      try {
        const draftPay = await this.$pay.getDraftPay({
          startDate: this.$moment().startOf('M').startOf('d').toISOString(),
          endDate: this.$moment().endOf('M').endOf('d').toISOString(),
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
        this.draftPay = [];
        console.error(e);
      }
    },
    formatPrice (value) {
      return formatPrice(value);
    },
    formatHours (value) {
      return value ? `${parseFloat(value).toFixed(2)}h` : '0.00h';
    },
    editField ({ obj, path, ref }) {
      obj[path] = true;
      this.$nextTick(() => {
        ref.focus();
      })
    },
    setEditionField ({ value, obj, path }) {
      obj[path] = !value || isNaN(value) ? 0 : value;
    },
    disableEditionField ({ obj, path }) {
      obj[path] = false;
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
    // Creation
    formatPayload (payload) {
      return {
        ...this.$_.omit(payload, ['auxiliaryId', 'additionalHoursEdition', 'overtimeHoursEdition', 'bonusEdition', 'hoursCounterEdition', 'paidKm', '__index']),
        hoursCounter: payload.hoursCounter - payload.overtimeHours - payload.additionalHours,
        auxiliary: payload.auxiliary._id,
      };
    },
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
        NotifyPositive('Clients facturés');
        await this.refreshDraftPay();
        this.selected = [];
      } catch (e) {
        if (e.message === '') return;
        console.error(e);
        NotifyNegative('Erreur lors de la facturation des clients');
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

  .sector-filter
    padding: 1rem 3rem;
    display: flex;
    flex-direction: row;

    .q-select
      width: 250px
</style>
