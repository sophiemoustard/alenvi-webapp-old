<template>
  <div class="row justify-center layout-padding">
    <q-card style="width: 600px; max-width: 90vw;">
      <q-card-title class="text-italic">Bienvenue chez Alenvi ! Afin de créer ton compte, nous avons besoin de certaines informations. Peux-tu renseigner les
        champs suivants :</q-card-title>
      <q-card-separator />
      <q-card-main>
        <q-field :label-width="3" label="Civilité">
          <q-select :options="civilityOptions" v-model="user.civility" separator :error="$v.user.civility.$error" error-label="Champ requis"
            @blur="$v.user.civility.$touch" />
        </q-field>
        <q-field :label-width="3" label="Nom" :error="$v.user.lastname.$error" error-label="Champ requis">
          <q-input type="text" v-model.trim="user.lastname" @blur="$v.user.lastname.$touch" />
        </q-field>
        <q-field :label-width="3" label="Prénom" :error="$v.user.firstname.$error" error-label="Champ requis">
          <q-input type="text" v-model.trim="user.firstname" @blur="$v.user.firstname.$touch" />
        </q-field>
        <q-field :label-width="3" label="Adresse" :error="$v.user.address.line.$error" error-label="Champ requis">
          <q-input type="text" v-model.trim="user.address.line" @blur="$v.user.address.line.$touch" />
        </q-field>
        <q-field :label-width="3" label="Code postal" :error="$v.user.address.zipCode.$error" :error-label="zipCodeError">
          <q-input type="text" v-model.trim="user.address.zipCode" @blur="$v.user.address.zipCode.$touch" :max-length="5" />
        </q-field>
        <q-field :label-width="3" label="Ville" :error="$v.user.address.city.$error" error-label="Champ requis">
          <q-input type="text" v-model.trim="user.address.city" @blur="$v.user.address.city.$touch" />
        </q-field>
        <q-field :label-width="3" label="Email" :error="$v.user.email.$error" :error-label="emailError">
          <q-input type="email" v-model.trim="user.email" @blur="$v.user.email.$touch" />
        </q-field>
        <q-field :label-width="3" label="Confirmation email" helper="Entre une nouvelle fois ton adresse mail" :error="$v.user.emailConfirmation.$error"
          error-label="L'email entré et la confirmation sont différents.">
          <q-input type="email" v-model.trim="user.emailConfirmation" @blur="$v.user.emailConfirmation.$touch" />
        </q-field>
        <q-field :label-width="3" label="Mot de passe" helper="Doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.password.$error"
          :error-label="passwordError">
          <q-input type="password" v-model.trim="user.password" @blur="$v.user.password.$touch" />
        </q-field>
        <q-field :label-width="3" label="Confirmation mot de passe" helper="Entre une nouvelle fois ton mot de passe" :error="$v.user.passwordConfirmation.$error"
          error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input type="password" v-model.trim="user.passwordConfirmation" @blur="$v.user.passwordConfirmation.$touch" />
        </q-field>
      </q-card-main>
      <q-card-actions class="row justify-center">
        <q-btn color="primary" :disable="!$v.user.$error">Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>


<script>
import { QInput, QField, QSelect, QCard, QCardTitle, QCardMain, QCardSeparator, QCardActions, QBtn } from 'quasar';
import { required, email, sameAs, numeric, minLength, maxLength } from 'vuelidate/lib/validators';
// import { zipCode } from '../../helpers/validation/zipCode'

export default {
  components: {
    QInput,
    QField,
    QSelect,
    QCard,
    QCardTitle,
    QCardMain,
    QCardSeparator,
    QCardActions,
    QBtn
  },
  data () {
    return {
      user: {
        civility: '',
        lastname: '',
        firstname: '',
        address: {
          line: '',
          zipCode: '',
          city: ''
        },
        phoneNbr: '',
        email: '',
        emailConfirmation: '',
        password: '',
        passwordConfirmation: ''
      },
      civilityOptions: [
        {
          label: 'Monsieur',
          value: 'M.'
        },
        {
          label: 'Madame',
          value: 'Mme'
        }
      ]
    }
  },
  validations: {
    user: {
      civility: { required },
      lastname: { required },
      firstname: { required },
      address: {
        line: { required },
        zipCode: {
          required,
          numeric,
          minLength: minLength(5)
        },
        city: { required }
      },
      email: { required, email },
      emailConfirmation: {
        required,
        sameAsEmail: sameAs('email')
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20)
      },
      passwordConfirmation: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  },
  computed: {
    emailError () {
      if (!this.$v.user.email.required) {
        return 'Champ requis';
      } else if (!this.$v.user.email.email) {
        return 'Email invalide'
      }
    },
    zipCodeError () {
      if (!this.$v.user.address.zipCode.required) {
        return 'Champ requis';
      } else if (!this.$v.user.address.zipCode.minLength || !this.$v.user.address.zipCode.numeric) {
        return 'Code postal invalide';
      }
    },
    passwordError () {
      if (!this.$v.user.password.required) {
        return 'Champ requis';
      } else if (!this.$v.user.password.minLength) {
        return 'Le mot de passe doit contenir entre 6 et 20 caractères.'
      }
    }
  }
};
</script>
