<template>
  <ni-modal :value="openEditedHelperModal" @hide="resetEditedHelperForm">
    <template slot="title">
      Modifier l'<span class="text-weight-bold">aidant</span>
    </template>
    <ni-input in-modal v-model="editedHelper.identity.lastname" :error="$v.editedHelper.identity.lastname.$error"
      caption="Nom" @blur="$v.editedHelper.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="editedHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal v-model.trim="editedHelper.mobilePhone" last :error="$v.editedHelper.mobilePhone.$error"
        caption="Numéro de téléphone" @blur="$v.editedHelper.mobilePhone.$touch"
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
import { required, email } from 'vuelidate/lib/validators';
import { frPhoneNumber } from '../../helpers/vuelidateCustomVal';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';

export default {
  name: 'EditHelperModal',
  props: {
    openEditedHelperModal: { type: Boolean, default: false },
    editedHelper: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  data () {
    return {
      loading: false,
    }
  },
  validations: {
    editedHelper: {
      identity: { lastname: { required } },
      local: {
        email: { required, email },
      },
      mobilePhone: { frPhoneNumber },
    },
  },
  methods: {
    resetEditedHelperForm () {
      this.$v.editedHelper.$reset();
      this.$emit('hide');
    },
    async editHelper () {
      try {
        this.loading = true;
        this.$v.editedHelper.$touch();
        if (this.$v.editedHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = Object.assign({}, this.editedHelper);
        delete payload.local;
        await this.$users.updateById(payload);
        NotifyPositive('Aidant modifié');
        this.$emit('closed');
      } catch (e) {
        e.response ? console.error(e.response) : console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>
