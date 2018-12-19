<template>
  <q-page padding class="neutral-background">
    <div class="row justify-center">
      <h5>Votre profil</h5>
    </div>
    <br>
    <div class="row justify-center">
      <div style="width: 500px; max-width: 90vw;">
        <q-field icon="person">
          <q-input v-model="user.alenvi.firstname" placeholder="à compléter" stack-label="Prénom" :disable="!isEditMode"/>
        </q-field>
        <q-field icon="person">
          <q-input v-model="user.alenvi.lastname" placeholder="à compléter" stack-label="Nom" :disable="!isEditMode"/>
        </q-field>
        <q-field icon="email" :error="$v.user.alenvi.local.email.$error" :error-label="emailError">
          <q-input v-model="user.alenvi.local.email" stack-label="Email" @blur="$v.user.alenvi.local.email.$touch" placeholder="à compléter" :disable="!isEditMode"/>
        </q-field>
        <q-field icon="smartphone">
          <q-input v-model="user.ogust.mobile" stack-label="Téléphone mobile" placeholder="à compléter" :disable="!isEditMode"/>
        </q-field>
        <q-field icon="local phone">
          <q-input v-model="user.ogust.landline" stack-label="Téléphone fixe" placeholder="à compléter" :disable="!isEditMode"/>
        </q-field>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn color="primary" @click="activateEditMode" :disable="$v.user.$invalid">{{ editModeButtonName }}</q-btn>
    </div>
    <br>
    <div class="row justify-center">
      <div class="align-left">
        <p style="text-align: left">Mot de passe</p>
      </div>
    </div>
    <div class="row justify-center">
      <div class="align-left">
        <div id="changePassword" v-if="isChangePassword">
          <q-field :error="$v.user.credentials.password.$error"
            error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
            <q-input type="password" stack-label="Nouveau mot de passe" v-model.trim="user.credentials.password" @blur="$v.user.credentials.password.$touch" />
          </q-field>
          <q-field :error="$v.user.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
            <q-input type="password" stack-label="Confirmation nouveau mot de passe" v-model.trim="user.credentials.passwordConfirm" @blur="$v.user.credentials.passwordConfirm.$touch" />
          </q-field>
        </div>
      </div>
    </div>
    <div v-if="!isChangePassword" class="row justify-center">
      <q-btn color="primary" @click="isChangePassword = true">Changement de mot de passe</q-btn>
    </div>
    <div v-if="isChangePassword" class="row justify-center">
      <q-btn color="primary" @click="updateUser" :disable="$v.user.credentials.$invalid">Modifier mon mot de passe</q-btn>
    </div>
  </q-page>
</template>

<script>
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  metaInfo: {
    title: 'Mes informations',
  },
  data () {
    return {
      contacts: null,
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
      },
      isChangePassword: false,
      isEditMode: false,
      editModeButtonName: 'Modifier'
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
      this.user.alenvi = await this.$users.getById(this.$route.params.id);
      this.contacts = await this.$ogust.getContacts({ email: this.user.alenvi.local.email });
      this.user.ogust = this.contacts['0'];
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async updateUser () {
      try {
        const userToSendOgust = {
          id_interloc: this.user.ogust.id_interloc,
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile: this.user.ogust.mobile,
          landline: this.user.ogust.landline
        };
        const local = this.isChangePassword ? {
          email: this.user.alenvi.local.email,
          password: this.user.credentials.password
        } : { email: this.user.alenvi.local.email };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local
        };
        await this.$ogust.setContact(userToSendOgust);
        await this.$users.updateById(userToSendAlenvi);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Profil mis à jour',
          position: 'bottom-right',
          timeout: 2500
        });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la mise à jour du profil',
          position: 'bottom-right',
          timeout: 2500
        });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
        console.error(e);
      }
    },
    activateEditMode () {
      if (!this.isEditMode) {
        this.isEditMode = true;
        this.editModeButtonName = 'Enregistrer mes modifications'
      } else {
        this.updateUser();
        this.isEditMode = false;
        this.editModeButtonName = 'Modifier'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables';

.q-field
  margin: 16px 0

.align-left
  width: 500px
  max-width: 90vw
</style>
