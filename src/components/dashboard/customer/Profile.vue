<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <h5>Votre profil</h5>
    </div>
    <br>
    <div class="row justify-center">
      <div style="width: 500px; max-width: 90vw;">
        <q-input v-model="user.alenvi.firstname" float-label="Prénom"/>
        <q-input v-model="user.alenvi.lastname" float-label="Nom"/>
        <!-- Date de naissance: <input v-model="user.ogust.date_of_birth" type="date" float-label="Date de naissance"/> -->
        <q-field :error="$v.user.alenvi.local.email.$error" :error-label="emailError">
          <q-input v-model="user.alenvi.local.email" float-label="Email" @blur="$v.user.alenvi.local.email.$touch"/>
        </q-field>
        <q-input v-model="user.ogust.mobile_phone" float-label="Mobile"/>
        <q-input v-model="user.ogust.landline" float-label="Fixe"/>
        <p class="caption">Changement de mot de passe</p>
        <q-field helper="Entrez votre nouveau mot de passe. Il doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.credentials.password.$error"
          error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
          <q-input type="password" float-label="Nouveau mot de passe" v-model.trim="user.credentials.password" @blur="$v.user.credentials.password.$touch" />
        </q-field>
        <q-field :error="$v.user.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input type="password" float-label="Confirmation nouveau mot de passe" v-model.trim="user.credentials.passwordConfirm" @blur="$v.user.credentials.passwordConfirm.$touch" />
        </q-field>
      </div>
    </div>
    <div class="row justify-center layout-padding">
      <q-btn color="primary" icon="done" @click="updateUser" :disable="$v.user.$invalid">Enregistrer modifications</q-btn>
    </div>
  </div>
</template>

<script>

import { QInput, QBtn, QField } from 'quasar'
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'

import users from '../../models/Users'
import ogust from '../../models/Ogust'
import SelectSector from '../../SelectSector.vue'
import SelectRole from '../../SelectRole.vue'
import { alenviAlert } from '../../../helpers/alerts'

export default {
  components: {
    QInput,
    QBtn,
    QField,
    SelectSector,
    SelectRole
  },
  data () {
    return {
      user: {
        credentials: {
          password: '',
          passwordConfirm: ''
        },
        alenvi: {
          role: {},
          local: {}
        },
        ogust: {}
      }
    }
  },
  validations: {
    user: {
      credentials: {
        password: {
          minLength: minLength(6),
          maxLength: maxLength(20)
        },
        passwordConfirm: {
          sameAsPassword: sameAs('password')
        }
      },
      alenvi: {
        local: {
          email: { required, email }
        }
      }
    }
  },
  computed: {
    emailError () {
      if (!this.$v.user.alenvi.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.local.email.email) {
        return 'Email invalide'
      }
    }
  },
  async mounted () {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getCustomerById(this.user.alenvi.customer_id);
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async updateUser () {
      try {
        const userToSendOgust = {
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile_phone: this.user.ogust.mobile_phone,
          landline: this.user.ogust.landline
        };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local: {
            email: this.user.alenvi.local.email,
            password: this.user.credentials.password
          }
        };
        await ogust.editOgustCustomer(null, this.user.alenvi.customer_id, userToSendOgust);
        await users.updateById(userToSendAlenvi);
        alenviAlert({ color: 'positive', icon: 'thumb up', content: 'Profil mis à jour.', position: 'bottom-right', duration: 2500 });
      } catch (e) {
        alenviAlert({ color: 'error', icon: 'warning', content: 'Erreur lors de la mise à jour de votre profil.', position: 'bottom-right', duration: 2500 });
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
