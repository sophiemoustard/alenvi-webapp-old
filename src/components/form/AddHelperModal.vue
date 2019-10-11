<template>
  <ni-modal :value="openNewHelperModal" @hide="hide">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal v-model="newHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="newHelper.local.email" :error="validations.local.email.$error" caption="Email"
      @blur="validations.local.email.$touch" :error-label="emailError" required-field />
    <ni-input in-modal v-model.trim="newHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Numéro de téléphone" @blur="validations.contact.phone.$touch" :error-label="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
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
    openNewHelperModal: { type: Boolean, default: false },
    newHelper: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  computed: {
    emailError () {
      if (!this.validations.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.validations.local.email.email) {
        return 'Email non valide';
      }
    },
    phoneNbrError () {
      if (!this.$_.get(this.validations, 'contact.phone.frPhoneNumber', null) ||
        !this.$_.get(this.validations, 'contact.phone.maxLength')) {
        return 'Numéro de téléphone non valide';
      }
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    submit () {
      this.$emit('submit');
    },
  },
}

</script>
