<template>
  <q-page class="neutral-background q-pb-xl">
    <div class="title-padding">
      <h4>Données</h4>
      <q-btn label="Exporter" @click="exportCsv" />
    </div>
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../../components/popup/notify';
import { downloadFile } from '../../../helpers/downloadFile';

export default {
  name: 'DataExports',
  metaInfo: { title: 'Données' },
  methods: {
    async exportCsv () {
      try {
        const csv = await this.$exports.getCsv({ type: 'service' });
        await downloadFile(csv, 'services.csv');

        NotifyPositive('Document téléchargé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchagement du document');
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
</style>
