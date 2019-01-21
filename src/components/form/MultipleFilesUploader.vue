<template>
  <div>
    <div class="row">
      <p class="input-caption">{{ caption }}</p>
    </div>
    <q-field v-if="documents.length === 0">
      <q-uploader :ref="name" :name="name" :url="url" :headers="headers"  @uploaded="documentUploaded" :additional-fields="additionalFields"
        hide-underline :extensions="extensions" color="white" inverted-light hide-upload-button @add="uploadDocument" @fail="failMsg"
      />
    </q-field>
    <template v-if="documents && documents.length > 0">
      <div v-for="(certificate, index) in documents" :key="index">
        <div v-if="certificate.driveId" class="row justify-between" style="background: white; margin-bottom: 24px">
          <div class="doc-thumbnail">
            <ni-custom-img :driveId="certificate.driveId" alt="diplôme" />
          </div>
          <div class="self-end doc-delete">
            <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(certificate.driveId)" />
            <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(certificate.link)" />
          </div>
        </div>
      </div>
    </template>
    <div v-if="documents && documents.length > 0">
      <q-collapsible v-model="collapsibleOpened" :label="collapsibleLabel" :collapseIcon="collapsibleIcon">
        <q-uploader :ref="name" :name="name" :url="url" :headers="headers" :additional-fields="additionalFields" @uploaded="documentUploaded"
          hide-underline :extensions="extensions" color="white" inverted-light hide-upload-button @add="uploadDocument" @fail="failMsg"
        />
      </q-collapsible>
    </div>
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
  data () {
    return {
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
      collapsibleOpened: false,
    };
  },
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: String,
    url: String,
    additionalFieldsName: String,
    userProfile: Object,
    collapsibleLabel: String,
  },
  methods: {
    deleteDocument (documentId) {
      this.$emit('delete', documentId);
    },
    documentUploaded () {
      this.$emit('uploaded');
    },
    uploadDocument (files) {
      this.$emit('upload', files);
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
  },
  computed: {
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    collapsibleIcon () {
      return !this.collapsibleOpened ? 'add' : 'mdi-checkbox-blank';
    },
    additionalFields () {
      return [{ name: 'fileName', value: `${this.additionalFieldsName}_${this.userProfile.firstname}_${this.userProfile.lastname}` }];
    },
    documents () {
      return this.$_.get(this.userProfile, this.path);
    }
  },
};
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px

  /deep/ .q-collapsible-inner
    & .q-item
      font-size: 12px
      padding-left: 0
      padding: 8px 0px
      &-side
        color: $primary
        & > .q-icon
          font-size: 16px

  /deep/ .q-collapsible-sub-item
    padding-left: 0
    padding: 8px 0px
</style>
