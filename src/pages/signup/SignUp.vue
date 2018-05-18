<template>
  <div padding>
        <div class="row justify-center">
      <q-card class="layout-padding" style="width: 600px; max-width: 90vw;">
        <q-card-media class="justify-start">
          <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="alenvi-logo">
        </q-card-media>
        <q-card-title>
          <div class="text-center">Bienvenue chez Alenvi !</div><br />
          <span slot="subtitle">Nous allons maintenant démarrer la création de ton compte afin de pouvoir t'inscrire chez Alenvi. Merci de renseigner les champs suivants, relis-toi bien car ces infos sont importantes :-)
            N’hésite pas à appeler ton coach en cas de question !</span>
        </q-card-title>
        <q-card-separator />
        <q-card-main>
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
          </q-field><br>
          <p style="color: red"><strong>Note bien tes identifiants (email et mot de passe).</strong></p>
          <router-link class="row justify-start" :to="{ path: '/login' }"><small>J'ai déjà un compte</small></router-link>
          <!-- <p style="color: red"><strong>Un SMS te sera envoyé une fois que tu auras cliqué sur "Envoyer". Il s'agit de la prochaine étape de ton inscription chez Alenvi.</strong></p> -->
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
import { date } from 'quasar'

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
  async mounted () {
    this.user.sector = this.$q.cookies.get('signup_sector');
    this.user.mobilePhone = this.$q.cookies.get('signup_mobile');
    this.user.managerId = this.$q.cookies.get('signup_managerId');
    this.accessToken = this.$q.cookies.get('signup_token');
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

        const alenviData = {
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          local: {
            email: this.user.email,
            password: this.user.password
          },
          // employee_id: ogustNewUser.data.data.user.body.employee.id_employee,
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
        // console.log(this.accessToken);
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        const ogustNewUser = await this.$ogust.createEmployee(ogustToken, ogustData);
        await this.$users.updateById({ _id: newAlenviUser.data.data.user._id, employee_id: ogustNewUser.data.data.user.body.employee.id_employee }, newAlenviUser.data.data.token);
        // const alenviToken = newAlenviUser.data.data.token;
        // const alenviUserId = newAlenviUser.data.data.user._id;
        // this.$q.loading.show({ message: 'Redirection vers Pigi...' });
        setTimeout(async () => {
          this.$q.loading.hide();
          this.$q.cookies.remove('signup_token', { path: '/' });
          this.$q.cookies.remove('signup_sector', { path: '/' });
          this.$q.cookies.remove('signup_mobile', { path: '/' });
          this.$q.cookies.remove('signup_managerId', { path: '/' });
          this.$q.cookies.remove('signup_firstSMS', { path: '/' });
          await this.$activationCode.delete(this.accessToken, this.user.mobilePhone);
          this.$q.loading.show({ message: 'Connexion au compte...' });
          const user = await this.$axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, {
            email: this.user.email,
            password: this.user.password
          });
          // console.log(user);
          this.$q.cookies.set('alenvi_token', user.data.data.token, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
          this.$q.cookies.set('alenvi_token_expires_in', user.data.data.expiresIn, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
          this.$q.cookies.set('refresh_token', user.data.data.refreshToken, { path: '/', expires: 365, secure: process.env.NODE_ENV !== 'development' });
          this.$q.cookies.set('user_id', user.data.data.user._id, { path: '/', expires: date.addToDate(new Date(), { seconds: user.data.data.expiresIn }), secure: process.env.NODE_ENV !== 'development' });
          await this.$store.dispatch('main/getUser', this.$q.cookies.get('user_id'));
          this.$q.loading.show({ message: 'Redirection vers prochaine étape...' });
          this.$q.loading.hide();
          this.$router.replace({ path: '/signupComplete' });
          await this.$email.sendAuxiliaryWelcome({ email: this.user.email }, this.accessToken);
          // await this.$twilio.sendSMSConfirm({ id: alenviUserId, phoneNbr: this.user.mobilePhone }, this.accessToken);
          // window.location.href = `${process.env.MESSENGER_LINK}?ref=${alenviToken}`
        }, 2000);
      } catch (e) {
        console.error(e);
        this.$q.loading.hide();
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création de ton compte, n\'hésite pas à contacter l\'équipe technique si le problème persiste ;-)',
          position: 'bottom-right',
          timeout: 2500
        });
        if (e.response) {
          console.error(e.response);
          if (e.response.status === 409) {
            this.$q.notify({
              color: 'negative',
              icon: 'warning',
              detail: 'Adresse email déjà utilisée.`',
              position: 'bottom-right',
              timeout: 2500
            });
          }
        }
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
