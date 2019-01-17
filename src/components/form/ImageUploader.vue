<template>
  <div>
    <div class="row justify-between">
      <p class="input-caption">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <div v-if="image && image.publicId" class="row justify-between" style="background: white">
      <div class="doc-thumbnail">
        <div class="thumbnail">
          <img :src="image.link" :alt="alt" />
        </div>
      </div>
      <div class="self-end doc-delete">
        <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteImage" />
        <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(image.link)" />
      </div>
    </div>
    <q-field v-if="!hasImage" :error="error" :error-label="errorLabel">
      <q-uploader :ref="name" :name="name" :url="url" :headers="headers" :additional-fields="additionalFields" @fail="failMsg" :disable="disable"
        hide-underline :extensions="extensions" color="white" inverted-light hide-upload-button @add="uploadImage" @uploaded="imageUploaded"
        :class="{border: withBorders}"
      />
    </q-field>
  </div>
</template>

<script>
import { Cookies, openURL } from 'quasar';

import { NotifyNegative } from '../popup/notify';

export default {
  name: 'ni-image-uploader',
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: String,
    additionalFields: {
      type: Array,
      default () {
        return [{
          label: '',
          value: ''
        }]
      }
    },
    entity: Object,
    url: String,
    errorLabel: { type: String, default: 'Image requise' },
    disable: { type: Boolean, default: false },
    withBorders: { type: Boolean, default: false },
    extensions: { type: String, default: '' },
  },
  methods: {
    deleteImage () {
      this.$emit('delete');
    },
    imageUploaded (file, xhr) {
      this.$emit('uploaded', { file, xhr });
    },
    uploadImage (files) {
      if (files[0].size > 5000000) {
        this.$refs[this.name].reset();
        NotifyNegative('Image trop volumineuse (> 5 Mo)');
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
      NotifyNegative('Echec de l\'envoi du image');
    },
  },
  computed: {
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    image () {
      return this.$_.get(this.entity, this.path);
    },
    hasImage () {
      return this.image && this.image.publicId
    }
  },
};
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .border
    border: 1px solid $light-grey;
    border-radius: 3px;

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px

  .thumbnail
    position: relative
    width: 150px
    height: 150px
    overflow: hidden

  .thumbnail img
    position: absolute
    left: 50%
    top: 50%
    height: 100%
    width: auto
    -webkit-transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
</style>
