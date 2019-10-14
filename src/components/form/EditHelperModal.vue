<template>
  <ni-modal :value="openEditedHelperModal" @hide="emitHide">
    <template slot="title">
      Modifier l'<span class="text-weight-bold">aidant</span>
    </template>
    <ni-input in-modal v-model="editedHelper.identity.lastname" :error="validationsEditedHelper.identity.lastname.$error"
      caption="Nom" @blur="validationsEditedHelper.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="editedHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal v-model.trim="editedHelper.mobilePhone" last :error="validationsEditedHelper.mobilePhone.$error"
        caption="Numéro de téléphone" @blur="validationsEditedHelper.mobilePhone.$touch"
        error-label="Numéro de téléphone invalide" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Modifier l'aidant" icon-right="add" color="primary"
        :loading="loading" @click="editHelper" />
    </template>
  </ni-modal>
</template>

<script>

import Modal from '../Modal';
import Input from '../form/Input';

export default {
  name: 'EditHelperModal',
  props: {
    openEditedHelperModal: { type: Boolean, default: false },
    editedHelper: { type: Object, default: () => ({}) },
    validationsEditedHelper: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    editHelper () {
      this.$emit('editHelper');
    },
    async emitHide () {
      this.$emit('hide');
    },
  },
}
</script>
