<template>
  <div padding>
        <div class="row justify-center">
      <q-card class="layout-padding" style="width: 600px; max-width: 90vw;">
        <q-card-media class="justify-start">
          <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="alenvi-logo">
        </q-card-media>
        <q-card-title>
          <div class="text-center">Bienvenue chez Alenvi !</div><br /><span slot="subtitle">Nous allons maintenant terminer ta création de compte. Merci de renseigner les champs suivants, relis-toi bien car ces infos sont importantes :-)
            N’hésite pas à appeler ton coach en cas de question !</span>
        </q-card-title>
        <q-card-separator />
        <q-card-main>
<<<<<<< HEAD
              <q-field icon="perm identity" :label-width="3">
                <q-select :options="user.civilityOptions" v-model="user.civility" float-label="Civilité" separator :error="$v.user.civility.$error" error-label="Champ requis"
                  @blur="$v.user.civility.$touch" />
              </q-field>
              <q-field icon="person" :error="$v.user.lastname.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.lastname" float-label="Nom" @blur="$v.user.lastname.$touch" />
              </q-field>
              <q-field icon="person" :error="$v.user.firstname.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.firstname" float-label="Prénom" @blur="$v.user.firstname.$touch" />
              </q-field>
              <q-field icon="home" :error="$v.user.address.line.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.address.line" float-label="Adresse" @blur="$v.user.address.line.$touch" />
              </q-field>
              <q-field icon="home" :error="$v.user.address.zipCode.$error" :error-label="zipCodeError">
                <q-input type="text" v-model.trim="user.address.zipCode" float-label="Code postal" @blur="$v.user.address.zipCode.$touch" :max-length="5" />
              </q-field>
              <q-field icon="home" :error="$v.user.address.city.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.address.city" float-label="Ville" @blur="$v.user.address.city.$touch" />
              </q-field>
              <q-field icon="email" :error="$v.user.email.$error" :error-label="emailError">
                <q-input type="email" v-model.trim="user.email" float-label="Email" @blur="$v.user.email.$touch" />
              </q-field>
              <q-field icon="email" helper="Entre une nouvelle fois ton adresse mail" :error="$v.user.emailConfirmation.$error"
                error-label="L'email entré et la confirmation sont différents.">
                <q-input type="email" v-model.trim="user.emailConfirmation" float-label="Confirmation email" @blur="$v.user.emailConfirmation.$touch" />
              </q-field>
              <q-field icon="lock" helper="Crée ton mot de passe. Il doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.password.$error"
                :error-label="passwordError">
                <q-input type="password" v-model="user.password" float-label="Mot de passe" @blur="$v.user.password.$touch" />
              </q-field>
              <q-field icon="lock" helper="Entre une nouvelle fois ton mot de passe" :error="$v.user.passwordConfirmation.$error"
                error-label="Le mot de passe entré et la confirmation sont différents.">
                <q-input type="password" v-model="user.passwordConfirmation" float-label="Confirmation mot de passe" @blur="$v.user.passwordConfirmation.$touch" />
              </q-field>
=======
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
          <q-field :label-width="3" label="Date de naissance" :error="$v.user.dateOfBirth.$error" error-label="Champ requis">
            <q-datetime v-model="user.dateOfBirth" @blur="$v.user.dateOfBirth.$touch" :first-day-of-week="Number(1)"
            ok-label="APPLIQUER" no-clear cancel-label="ANNULER"
            min="1920-01-01" :max="getMaxDate"
          format="DD/MM/YYYY"/>
          </q-field>
          <q-field :label-width="3" label="Département (99 si étranger)" :error="$v.user.stateOfBirth.$error" :error-label="stateOfBirthError">
            <q-input type="number" v-model.trim="user.stateOfBirth" @blur="$v.user.stateOfBirth.$touch" />
          </q-field>
          <q-field :label-width="3" label="Lieu de naissance" :error="$v.user.placeOfBirth.$error" error-label="Champ requis">
            <q-input type="text" v-model.trim="user.placeOfBirth" @blur="$v.user.placeOfBirth.$touch" />
          </q-field>
          <q-field :label-width="3" label="Pays de naissance" :error="$v.user.countryOfBirth.$error" error-label="Champ requis">
            <q-select v-model="user.countryOfBirth" :options="countries" @blur="$v.user.countryOfBirth.$touch" filter autofocus-filter/>
          </q-field>
          <q-field :label-width="3" label="Numéro de sécurité sociale" :error="$v.user.socialInsuranceNumber.$error" :error-label="socialInsuranceNumberError">
            <q-input type="number" v-model.trim="user.socialInsuranceNumber" @blur="$v.user.socialInsuranceNumber.$touch" />
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
            <q-input type="password" v-model="user.password" @blur="$v.user.password.$touch" />
          </q-field>
          <q-field :label-width="3" label="Confirmation mot de passe" helper="Entre une nouvelle fois ton mot de passe" :error="$v.user.passwordConfirmation.$error"
            error-label="Le mot de passe entré et la confirmation sont différents.">
            <q-input type="password" v-model="user.passwordConfirmation" @blur="$v.user.passwordConfirmation.$touch" />
          </q-field>
>>>>>>> origin/master
        </q-card-main>
        <q-card-actions class="row justify-end">
          <q-btn color="primary" @click="submit" :disable="$v.user.$invalid" flat>Envoyer</q-btn>
          <!-- <q-btn color="primary" @click="test" flat>Envoyer</q-btn> -->
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs, numeric, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  // name: 'PageName',
  data () {
    return {
      accessToken: '',
      url: '',
      countries: [],
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
        passwordConfirmation: '',
<<<<<<< HEAD
        managerId: '',
        civilityOptions: [
          {
            label: 'Monsieur',
            value: 'M.'
          },
          {
            label: 'Madame',
            value: 'Mme'
          }
        ],
      }
=======
        socialInsuranceNumber: ''
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
>>>>>>> origin/master
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
<<<<<<< HEAD
      }
=======
      },
      dateOfBirth: { required },
      stateOfBirth: {
        required,
        maxLength: maxLength(2)
      },
      socialInsuranceNumber: {
        required,
        maxLength: maxLength(15),
        minLength: minLength(15)
      },
      countryOfBirth: { required },
      placeOfBirth: { required }
>>>>>>> origin/master
    }
  },
  async mounted () {
    this.user.sector = this.$q.cookies.get('signup_sector');
    this.user.mobilePhone = this.$q.cookies.get('signup_mobile');
    this.user.managerId = this.$q.cookies.get('signup_managerId');
    this.accessToken = this.$q.cookies.get('signup_is_activated');
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
  },
  methods: {
    async submit () {
      try {
        this.$q.loading.show({ message: 'Création de ton compte en cours...' });
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
          mobile_phone: this.user.mobilePhone
        };
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        const ogustNewUser = await this.$ogust.createEmployee(ogustToken, ogustData);
        const alenviData = {
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          local: {
            email: this.user.email,
            password: this.user.password
          },
          employee_id: ogustNewUser.data.data.user.body.employee.id_employee,
          role: 'Auxiliaire',
          sector: this.user.sector,
          managerId: this.user.managerId,
          mobilePhone: this.user.mobilePhone,
          administrative: {
            signup: {
              firstSmsDate: this.$q.cookies.get('signup_firstSMS')
            }
          }
        };
        const newAlenviUser = await this.$users.create(alenviData);
        const alenviToken = newAlenviUser.data.data.token;
        const alenviUserId = newAlenviUser.data.data.user._id;
        this.$q.loading.show({ message: 'Redirection vers Pigi...' });
        setTimeout(async () => {
          this.$q.loading.hide();
          this.$q.cookies.remove('signup_is_activated', { path: '/' });
          this.$q.cookies.remove('signup_sector', { path: '/' });
          this.$q.cookies.remove('signup_mobile', { path: '/' });
          this.$q.cookies.remove('signup_managerId', { path: '/' });
          this.$q.cookies.remove('signup_firstSMS', { path: '/' });
          await this.$activationCode.delete(this.accessToken, this.user.mobilePhone);
          await this.$twilio.sendSMSConfirm({ id: alenviUserId, phoneNbr: this.user.mobilePhone }, this.accessToken);
          window.location.href = `${process.env.MESSENGER_LINK}?ref=${alenviToken}`
        }, 2000);
      } catch (e) {
        this.$q.loading.hide();
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création de ton compte, n\'hésite pas à contacter l\'équipe technique si le problème persiste ;-)',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e.response);
      }
    },
    async getCountries () {
      try {
        const ogustToken = await this.$ogust.getOgustToken(this.$q.cookies.get('signup_is_activated'));
        const countriesRaw = await this.$ogust.getList('employee.country_of_birth', ogustToken);
        delete countriesRaw['0'];
        for (const k in countriesRaw) {
          this.countries.push({ label: countriesRaw[k], value: k });
        }
        console.log(this.countries);
      } catch (e) {
        console.error(e.response);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0
</style>
