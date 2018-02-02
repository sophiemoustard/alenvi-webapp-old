<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <div id="picture">
        <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
      </div>
    </div>
    <br>
    <div class="row justify-center">
      <div class="" style="width: 400px; max-width: 90vw;">
        <p v-if="user.alenvi.employee_id">Id Alenvi: {{ user.alenvi._id }}</p>
        <p v-if="user.alenvi.employee_id">Id Ogust: {{ user.alenvi.employee_id }}</p>
        <q-input v-model="user.alenvi.firstname" float-label="Prénom"/>
        <q-input v-model="user.alenvi.lastname" float-label="Nom"/>
        <select-role v-model="user.alenvi.role.name"/>
        <!-- Date de naissance: <input v-model="user.ogust.date_of_birth" type="date" float-label="Date de naissance"/> -->
        <q-field :error="$v.user.alenvi.local.email.$error" :error-label="emailError">
          <q-input v-model="user.alenvi.local.email" float-label="Email" @blur="$v.user.alenvi.local.email.$touch"/>
        </q-field>
        <!-- <q-input v-model="user.alenvi.local.email" float-label="Email"/> -->
        <q-input v-model="user.ogust.mobile_phone" float-label="Mobile"/>
        <select-sector v-if="user.alenvi.sector !== '*'" v-model="user.alenvi.sector"/>
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
    <div class="row justify-center">
      <q-btn big flat @click="updateUser()">Modifier</q-btn>
    </div>
  </div>
</template>

<script>

import { QInput, QBtn, QField } from 'quasar';
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'

import moment from 'moment'

import users from '../../models/Users';
import ogust from '../../models/Ogust';
import SelectSector from '../../SelectSector.vue'
import SelectRole from '../../SelectRole.vue'
import { alenviAlert } from '../../../helpers/alerts'

export default {
  components: {
    QInput,
    QBtn,
    // Toast,
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
  async created () {
    try {
      this.user.alenvi = await users.getById(this.$route.params.id);
      this.user.ogust = await ogust.getEmployeeById(this.user.alenvi.employee_id);
      // console.log('ALENVI=', this.user.alenvi);
      // console.log('OGUST=', this.user.ogust);
      this.user.ogust.date_of_birth = moment(this.user.ogust.date_of_birth, 'YYYYMMDD').format('YYYY-MM-DD');
    } catch (e) {
      console.error(e);
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
  methods: {
    async updateUser () {
      try {
        const userToSendOgust = {
          id_employee: this.user.alenvi.employee_id,
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile_phone: this.user.ogust.mobile_phone,
          sector: this.user.alenvi.sector
          // title: this.user.ogust.title,
          // main_adress: this.user.ogust.main_address
        };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local: {
            email: this.user.alenvi.local.email,
            password: this.user.credentials.password
          },
          sector: this.user.alenvi.sector,
          role: this.user.alenvi.role.name,
        };
        const userUpdatedAlenvi = await users.updateById(userToSendAlenvi);
        // Toast.create(`Utilisateur Alenvi bien mis-à-jour`);
        const userUpdatedOgust = await ogust.setEmployee(userToSendOgust);
        // Toast.create(`Utilisateur Ogust bien mis-à-jour`);
        alenviAlert({ color: 'positive', icon: 'thumb up', content: 'Profil mis à jour.', position: 'bottom-right', duration: 2500 });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
      } catch (e) {
        alenviAlert({ color: 'error', icon: 'warning', content: 'Erreur lors de la mise à jour du profil.', position: 'bottom-right', duration: 2500 });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
        // Toast.create(`Erreur lors de la mise-à-jour de l'utilisateur`);
        console.error(e);
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
@import '~variables';

</style>
