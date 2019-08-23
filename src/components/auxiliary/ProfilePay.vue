<template>
  <div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
      </div>
      <pay-document-list class="full-width" :documents="payDocuments" @delete="deletePayDocument"
        :natureOptions="documentNatureOptions" :disable="loading">
      </pay-document-list>

      <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add"
        label="Ajouter un document" @click="documentUpload = true" :disable="loading" />

      <ni-modal v-model="documentUpload" @hide="$refs.documentUploadForm.reset()">
        <template slot="title">
          Ajouter un <span class="text-weight-bold">document</span>
        </template>
        <ni-document-upload inModal :natureOptions="documentNatureOptions" v-model="newDocument"
          ref="documentUploadForm" @valid="formValid = $event">
        </ni-document-upload>
        <template slot="footer">
          <q-btn no-caps class="full-width modal-btn" label="Ajouter le document" icon-right="add"
            color="primary" :loading="loading" @click="createDocument" />
        </template>
      </ni-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import snakeCase from 'lodash/snakeCase';

import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';
import { PAY_DOCUMENT_NATURES, OTHER } from '../../data/constants';
import Modal from '../../components/Modal';
import DocumentUpload from '../../components/documents/DocumentUpload';
import PayDocumentList from '../../components/documents/PayDocumentList';
import PayDocuments from '../../api/PayDocuments';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ProfilePay',
  components: {
    'ni-document-upload': DocumentUpload,
    'pay-document-list': PayDocumentList,
    'ni-modal': Modal,
  },
  data () {
    return {
      documentUpload: false,
      documentNatureOptions: PAY_DOCUMENT_NATURES,
      loading: false,
      newDocument: null,
      formValid: false,
      payDocuments: [],
    };
  },
  computed: {
    ...mapGetters({
      user: 'rh/getUserProfile',
    }),
    driveFolder () {
      return get(this.user, 'administrative.driveFolder.driveId');
    },
  },
  async mounted () {
    await this.getDocuments();
  },
  methods: {
    formatDocumentPayload () {
      const { file, nature, date } = this.newDocument;
      const form = new FormData();
      const formattedDate = this.$moment(date).format('DD-MM-YYYY-HHmm');
      const documentOption = this.documentNatureOptions.find(option => option.value === this.newDocument.nature);
      const fileName = documentOption && this.newDocument.nature !== OTHER
        ? snakeCase(`${documentOption.label} ${formattedDate} ${formatIdentity(this.user.identity, 'FL')}`)
        : snakeCase(`document_paie_${formattedDate}`);

      form.append('nature', nature);
      form.append('date', date.toISOString());
      form.append('payDoc', file);
      form.append('Content-Type', file.type || 'application/octet-stream');
      form.append('fileName', fileName);
      form.append('driveFolderId', this.driveFolder);
      form.append('user', this.user._id);

      return form;
    },
    async createDocument () {
      if (!this.driveFolder) NotifyNegative('Dossier Google Drive manquant.')
      const isValid = await this.$refs.documentUploadForm.validate();
      if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

      this.loading = true;

      try {
        await PayDocuments.create(this.formatDocumentPayload());

        this.documentUpload = false;
        this.$refs.documentUploadForm.reset();
        NotifyPositive('Document sauvegardé');

        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de l'envoi du document");
      }

      this.loading = false;
    },
    async getDocuments () {
      try {
        this.payDocuments = await PayDocuments.list({ user: this.user._id });
      } catch (e) {
        this.payDocuments = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des documents');
      }
    },
    async deletePayDocument (payDocument) {
      this.loading = true;
      try {
        await PayDocuments.remove(payDocument._id);
        NotifyPositive('Document supprimé');
        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
      this.loading = false;
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-card
    background: white;
    width: 100%;
    margin-bottom: 20px;
</style>
