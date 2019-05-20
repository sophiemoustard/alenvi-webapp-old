<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>À payer</h4>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'ToPay',
  metaInfo: { title: 'À payer' },
  data () {
    return {
      darftPay: [],
    };
  },
  async mounted () {
    await this.refreshDraftPay();
  },
  methods: {
    async refreshDraftPay () {
      try {
        this.darftPay = await this.$pay.getDraftPay({
          startDate: this.$moment().startOf('m').startOf('d').toISOString(),
          endDate: this.$moment().endOf('m').endOf('d').toISOString(),
        });
      } catch (e) {
        this.darftPay = [];
        console.error(e);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
</style>
