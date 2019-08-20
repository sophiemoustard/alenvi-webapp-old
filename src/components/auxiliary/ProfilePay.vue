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

import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';
import { PAY_DOCUMENT_NATURES } from '../../data/constants';
import Modal from '../../components/Modal';
import DocumentUpload from '../../components/documents/DocumentUpload';
import PayDocumentList from '../../components/documents/PayDocumentList';

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
    };
  },
  computed: {
    ...mapGetters({
      user: 'rh/getUserProfile',
    }),
    payDocuments () {
      return get(this.user, 'administrative.payDocuments') || [];
    },
  },
  methods: {
    formatDocumentPayload () {
      const { file, nature, date } = this.newDocument;
      const form = new FormData();
      const now = (new Date()).toISOString();

      form.append('nature', nature);
      form.append('date', date.toISOString());
      form.append('payDocuments', file);
      form.append('Content-Type', file.type || 'application/octet-stream');
      form.append('fileName', `pay-document-${now}`);

      return form;
    },
    async createDocument () {
      const isValid = await this.$refs.documentUploadForm.validate();
      if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

      this.loading = true;

      try {
        await this.$users.addPayDocument(this.user, this.formatDocumentPayload());

        this.documentUpload = false;
        this.$refs.documentUploadForm.reset();
        NotifyPositive('Document sauvegardé');

        await this.$store.dispatch('rh/getUserProfile', { userId: this.user._id });
      } catch (e) {
        NotifyNegative("Erreur lors de l'envoi du document");
      }

      this.loading = false;
    },
    async deletePayDocument (payDocument) {
      this.loading = true;
      try {
        await this.$users.deletePayDocument(this.user._id, payDocument._id);
        NotifyPositive('Document supprimé');
        await this.$store.dispatch('rh/getUserProfile', { userId: this.user._id });
      } catch (e) {
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
