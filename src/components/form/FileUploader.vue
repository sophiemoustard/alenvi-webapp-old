<template>
  <div>
    <div v-if="displayCaption && displayUpload" class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <div v-if="document && document.driveId" class="row justify-between" style="background: white">
      <div class="doc-thumbnail">
        <ni-custom-img :driveId="document.driveId" :alt="alt" />
      </div>
      <div class="self-end doc-delete">
        <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument" />
        <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(document.link)" />
      </div>
    </div>
    <q-field v-if="document && !document.driveId && displayUpload" :error="error" :error-label="errorLabel">
      <q-uploader :ref="name" :name="name" :url="docsUploadUrl" :headers="headers" :additional-fields="additionalFields" @fail="failMsg"
        hide-underline :extensions="extensions" color="white" inverted-light hide-upload-button @add="uploadDocument" @uploaded="documentUploaded"
      />
    </q-field>
  </div>
</template>

<script>
import { Cookies, openURL } from 'quasar';

import CustomImg from './CustomImg';

export default {
  components: {
    'ni-custom-img': CustomImg,
  },
  data () {
    return {
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    };
  },
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: String,
    additionalFieldsName: String,
    userProfile: Object,
    errorLabel: { type: String, default: 'Document requis' },
    displayUpload: { type: Boolean, default: true },
    displayCaption: { type: Boolean, default: true },
  },
  methods: {
    deleteDocument () {
      this.$emit('delete');
    },
    documentUploaded () {
      this.$emit('uploaded');
    },
    uploadDocument (files) {
      this.$emit('upload', files);
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
    failMsg () {
      this.$q.notify({
        color: 'negative',
        icon: 'warning',
        detail: 'Echec de l\'envoi du document',
        position: 'bottom-left',
        timeout: 2500,
      });
    },
  },
  computed: {
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.userProfile._id}/gdrive/${this.userProfile.administrative.driveFolder.id}/upload`;
    },
    additionalFields () {
      return [{ name: 'fileName', value: `${this.additionalFieldsName}_${this.userProfile.firstname}_${this.userProfile.lastname}` }];
    },
    document () {
      return this.$_.get(this.userProfile, this.path);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
