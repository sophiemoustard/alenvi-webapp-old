<template>
  <q-page padding class="neutral-background">
    <h4>Contrats</h4>
    <ni-contracts v-if="contracts" :contracts="contracts" :user="getUser" :columns="contractVisibleColumns" />
  </q-page>
</template>

<script>
import { contractMixin } from '../../../mixins/contractMixin.js';
import NiContracts from '../../../components/contracts/Contracts';

export default {
  mixins: [contractMixin],
  components: {
    NiContracts
  },
  metaInfo: {
    title: 'Contrats'
  },
  data () {
    return {
      contracts: [],
      contractVisibleColumns: ['weeklyHours', 'startDate', 'endDate', 'grossHourlyRate', 'contractSigned'],
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['main/user'];
    }
  },
  async mounted () {
    await this.refreshContracts();
  }
}
</script>

<style lang="stylus" scoped>
</style>
