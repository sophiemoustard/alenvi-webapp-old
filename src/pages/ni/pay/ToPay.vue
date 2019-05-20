<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>À payer</h4>
    </div>
    <q-table :data="darftPay" :columns="columns" class="q-pa-sm" />
  </q-page>
</template>

<script>
export default {
  name: 'ToPay',
  metaInfo: { title: 'À payer' },
  data () {
    return {
      darftPay: [],
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
      ],
    };
  },
  async mounted () {
    await this.refreshDraftPay();
  },
  methods: {
    async refreshDraftPay () {
      try {
        this.darftPay = await this.$pay.getDraftPay({
          startDate: this.$moment().startOf('M').startOf('d').toISOString(),
          endDate: this.$moment().endOf('M').endOf('d').toISOString(),
        });
      } catch (e) {
        this.darftPay = [];
        console.error(e);
      }
    },
    formatHours (value) {
      return value ? `${parseFloat(value).toFixed(2)}h` : '';
    },
  },
}
</script>

<style lang="stylus" scoped>
</style>
