<template>
  <ni-modal v-model="addHelper" @hide="resetHelperForm">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal v-model="newHelper.identity.lastname" :error="$v.newHelper.identity.lastname.$error"
      caption="Nom" @blur="$v.newHelper.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="newHelper.local.email" :error="$v.newHelper.local.email.$error" caption="Email"
      @blur="$v.newHelper.local.email.$touch" :error-label="emailError()" required-field />
    <ni-input in-modal v-model.trim="newHelper.mobilePhone" last :error="$v.newHelper.mobilePhone.$error"
        caption="Numéro de téléphone" @blur="$v.newHelper.mobilePhone.$touch"
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
import { REQUIRED_LABEL, HELPER } from '../../data/constants.js';
import { clear } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import { required, email } from 'vuelidate/lib/validators';
import { frPhoneNumber } from '../../helpers/vuelidateCustomVal';
import randomize from 'randomatic';

export default {
  data () {
    return {
      loading: false,
      newHelper: {
        identity: {
          lastname: '',
          firstname: '',
        },
        local: {
          email: '',
        },
        mobilePhone: '',
      },
    }
  },
  props: {
    addHelperParent: { type: Boolean, default: false },
    company: { type: Object, default: () => ({}) },
  },
  computed: {
    addHelper () {
      return this.addHelperParent;
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    resetHelperForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
    },
    emailError () {
      if (!this.$v.newHelper.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    async createAlenviHelper () {
      this.newHelper.local.password = randomize('0', 6);
      this.newHelper.customers = [this.userProfile._id];
      const roles = await this.$roles.showAll({ name: HELPER });
      if (roles.length === 0) throw new Error('Role not found');
      this.newHelper.role = roles[0]._id;
      this.newHelper.company = this.company._id;
      this.newHelper.identity = this.$_.pickBy(this.newHelper.identity);
      const payload = this.$_.pickBy(this.newHelper);
      await this.$users.create(payload);
    },
    async sendWelcomingEmail () {
      await this.$email.sendWelcome({
        receiver: {
          email: this.newHelper.local.email,
          password: this.newHelper.local.password,
        },
      });
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.createAlenviHelper();
        NotifyPositive('Aidant créé');
        await this.sendWelcomingEmail();
        NotifyPositive('Email envoyé');
        this.$emit('closed');
      } catch (e) {
        e.response ? console.error(e.response) : console.error(e);
        if (e && e.response && e.response.status === 409) return NotifyNegative('Cet email est déjà utilisé par un compte existant');
        NotifyNegative('Erreur lors de la création de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
  },
  validations: {
    newHelper: {
      identity: { lastname: { required } },
      local: {
        email: { required, email },
      },
      mobilePhone: { frPhoneNumber },
    },
  },
}

</script>
