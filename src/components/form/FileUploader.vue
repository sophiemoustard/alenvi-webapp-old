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
    <q-field v-if="(!document || !document.driveId) && displayUpload" :error="error" :error-label="errorLabel">
      <q-uploader :ref="name" :name="name" :url="url" :headers="headers" :additional-fields="additionalFields" @fail="failMsg"
        hide-underline :extensions="extensions" color="white" inverted-light hide-upload-button @add="uploadDocument" @uploaded="documentUploaded"
      />
    </q-field>
  </div>
</template>

<script>
import { Cookies, openURL } from 'quasar';

import CustomImg from './CustomImg';
import { NotifyNegative } from '../popup/notify';

export default {
  components: {
    'ni-custom-img': CustomImg,
  },
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: String,
    additionalValue: String,
    entity: Object,
    url: String,
    errorLabel: { type: String, default: 'Document requis' },
    displayUpload: { type: Boolean, default: true },
    displayCaption: { type: Boolean, default: true },
    extensions: { type: String, default: '' },
  },
  methods: {
    deleteDocument () {
      this.$emit('delete');
    },
    documentUploaded () {
      this.$emit('uploaded');
    },
    uploadDocument (files) {
      if (files[0].size > 5000000) {
        this.$refs[this.name].reset();
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
        return '';
      } else {
        this.$refs[this.name].upload();
      }
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
  },
  computed: {
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    additionalFields () {
      return [{ name: 'fileName', value: this.additionalValue }];
    },
    document () {
      return this.$_.get(this.entity, this.path);
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
