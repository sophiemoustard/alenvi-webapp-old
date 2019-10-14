<template>
  <ni-modal :value="addHelper" @hide="emitHide">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal v-model="newHelper.identity.lastname" :error="validationsNewHelper.identity.lastname.$error"
      caption="Nom" @blur="validationsNewHelper.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="newHelper.local.email" :error="validationsNewHelper.local.email.$error" caption="Email"
      @blur="validationsNewHelper.local.email.$touch" :error-label="emailError()" required-field />
    <ni-input in-modal v-model.trim="newHelper.mobilePhone" last :error="validationsNewHelper.mobilePhone.$error"
        caption="Numéro de téléphone" @blur="validationsNewHelper.mobilePhone.$touch"
        error-label="Numéro de téléphone invalide" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary"
        :loading="loading" @click="submitHelper" />
    </template>
  </ni-modal>
</template>

<script>

import Modal from '../Modal';
import Input from '../form/Input';
import { REQUIRED_LABEL } from '../../data/constants.js';

export default {
  name: 'AddHelperModal',
  props: {
    addHelper: { type: Boolean, default: false },
    newHelper: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
    validationsNewHelper: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  methods: {
    emailError () {
      if (!this.validationsNewHelper.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.validationsNewHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    async sendWelcomingEmail () {
      this.$emit('sendWelcomingEmail');
    },
    async emitHide () {
      this.$emit('hide');
    },
    async submitHelper () {
      this.$emit('submitHelper');
    },
  },
}

</script>
