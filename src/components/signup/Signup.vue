<template>
  <div class="row justify-center layout-padding">
    <q-card class="layout-padding" style="width: 600px; max-width: 90vw;">
      <q-card-media class="justify-start">
        <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="alenvi-logo">
      </q-card-media>
      <q-card-title>
        <div class="text-center">Bienvenue chez Alenvi !</div><br /> <span slot="subtitle">Afin de créer ton compte, nous avons besoin de certaines informations. Peux-tu renseigner les
        champs suivants (<span class="text-italic">tous les champs sont à remplir</span>) :</span></q-card-title>
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
        <q-field :label-width="3" label="Mot de passe" helper="Crée ton mot de passe. Il doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.password.$error"
          :error-label="passwordError">
          <q-input type="password" v-model.trim="user.password" @blur="$v.user.password.$touch" />
        </q-field>
        <q-field :label-width="3" label="Confirmation mot de passe" helper="Entre une nouvelle fois ton mot de passe" :error="$v.user.passwordConfirmation.$error"
          error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input type="password" v-model.trim="user.passwordConfirmation" @blur="$v.user.passwordConfirmation.$touch" />
        </q-field>
      </q-card-main>
      <q-card-actions class="row justify-end">
        <q-btn color="primary" @click="submit" :disable="$v.user.$invalid" flat>Envoyer</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>


<script>
import { QInput, QField, QSelect, QCard, QCardTitle, QCardMain, QCardSeparator, QCardActions, QCardMedia, QBtn, Cookies, Loading } from 'quasar'
import { required, email, sameAs, numeric, minLength, maxLength } from 'vuelidate/lib/validators'

// import { phoneNumber } from '../../helpers/validation/phoneNbr'
import ogust from '../models/Ogust'
import users from '../models/Users'
import activationCode from '../models/ActivationCode'
import { alenviAlert } from '../../helpers/alerts'

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
    QCardMedia,
    QBtn
  },
  data () {
    return {
      user: {
        civility: '',
        lastname: '',
        firstname: '',
        sector: '',
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
      // phoneNbr: { required, phoneNumber },
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
  mounted () {
    this.user.sector = Cookies.get('sector');
  },
  computed: {
    emailError () {
      if (!this.$v.user.email.required) {
        return 'Champ requis';
      } else if (!this.$v.user.email.email) {
        return 'Email invalide'
      }
    },
    // phoneNumberError () {
    //   if (!this.$v.user.phoneNbr.required) {
    //     return 'Champ requis';
    //   } else if (!this.$v.user.phoneNbr.phoneNumber) {
    //     return 'Numéro invalide: il doit être de la forme 0693215423';
    //   }
    // },
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
    },
    formError () {
        console.log(this.$v.user);
      if (!this.$v.user.$error) {
        return true
      }
      return false
    }
  },
  methods: {
    async submit () {
      try {
        Loading.show({ message: 'Création de ton compte en cours...' });
        const accessToken = Cookies.get('is_activated');
        const mobilePhone = Cookies.get('signup_mobile');
        const ogustData = {
          title: this.user.civility,
          last_name: this.user.lastname,
          first_name: this.user.firstname,
          main_address: {
            line: this.user.address.line,
            zip: this.user.address.zipCode,
            city: this.user.address.city
          },
          email: this.user.email,
          sector: this.user.sector,
          mobile_phone: mobilePhone
        };
        const ogustToken = await ogust.getOgustToken(accessToken);
        const ogustNewUser = await ogust.createEmployee(ogustToken, ogustData);
        const alenviData = {
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          local: {
            email: this.user.email,
            password: this.user.password
          },
          employee_id: ogustNewUser.data.data.user.body.employee.id_employee,
          role: 'auxiliary',
        };
        const newAlenviUser = await users.create(alenviData);
        const alenviToken = newAlenviUser.data.data.token;
        Loading.show({ message: 'Redirection vers Pigi...'});
        setTimeout(async () => {
          Loading.hide();
          Cookies.remove('signup_is_activated', { path: '/' });
          Cookies.remove('signup_sector', { path: '/' });
          Cookies.remove('signup_mobile', { path: '/' });
          await activationCode.delete(accessToken, mobilePhone);
          window.location.href = `${process.env.MESSENGER_LINK}?ref=${alenviToken}`
        }, 2000);
      } catch (e) {
        Loading.hide();
        alenviAlert({
          color: 'error',
          icon: 'warning',
          content: "Erreur lors de la création de ton compte, n'hésite pas à contacter l'équipe technique si le problème persiste ;-)",
          position: 'bottom-right',
          duration: 3000
        });
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
};
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .alenvi-logo
    width: 35%
</style>
