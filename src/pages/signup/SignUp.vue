<template>
  <div padding>
    <div class="row justify-center layout-padding">
       <q-card flat style="width: 700px; max-width: 90vw;">
        <q-card-media class="justify-start">
          <img style="max-width: 300px" src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="alenvi-logo">
        </q-card-media>
        <q-card-title class="layout-padding">
          <div class="text-center">Bienvenue chez Alenvi !</div><br /><span slot="subtitle">Nous allons maintenant terminer ta création de compte. Merci de renseigner les champs suivants, relis-toi bien car ces infos sont importantes :-)
            N’hésite pas à appeler ton coach en cas de question !</span>
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <q-stepper color="primary" ref="stepper" alternative-labels vertical>
            <q-step default name="first" title="Informations personnelles (1)">
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
              <!-- Navigation for this step at the end of QStep-->
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep1Errors" @click="firstStep()" label="Créer compte et aller sur Pigi" /> <!-- :disable="$v.user.$invalid" -->
                <!-- <q-btn color="primary" :disable="$v.user.$invalid" @click="$refs.stepper.next()" label="Créer compte et aller sur Pigi" /> -->
              </q-stepper-navigation>
            </q-step>
            <q-step name="second" title="Informations personnelles (2)">
              <q-field icon="date range" :error="$v.user.dateOfBirth.$error" error-label="Champ requis">
                <q-datetime v-model="user.dateOfBirth" float-label="Date de naissance" @blur="$v.user.dateOfBirth.$touch" :first-day-of-week="Number(1)"
                ok-label="APPLIQUER" no-clear cancel-label="ANNULER"
                min="1920-01-01" :max="getMaxDate"
              format="DD/MM/YYYY"/>
              </q-field>
              <q-field icon="ion-earth" :error="$v.user.countryOfBirth.$error" error-label="Champ requis">
                <q-select v-model="user.countryOfBirth" :options="countries" float-label="Pays de naissance" @blur="$v.user.countryOfBirth.$touch" filter autofocus-filter/>
              </q-field>
              <q-field icon="ion-earth" :error="$v.user.stateOfBirth.$error" :error-label="stateOfBirthError">
                <q-input type="number" v-model.trim="user.stateOfBirth" float-label="Département (99 si étranger)" @blur="$v.user.stateOfBirth.$touch" />
              </q-field>
              <q-field icon="location city" :error="$v.user.placeOfBirth.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.placeOfBirth" float-label="Lieu de naissance" @blur="$v.user.placeOfBirth.$touch" />
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.socialInsuranceNumber.$error" :error-label="socialInsuranceNumberError">
                <q-input type="number" v-model.trim="user.socialInsuranceNumber" float-label="Numéro de sécurité sociale" @blur="$v.user.socialInsuranceNumber.$touch" />
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep2Errors" @click="$refs.stepper.next()" label="Enregistrer" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="third" title="Informations de paiement">
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.payment.rib.iban.$error" :error-label="ibanError">
                <q-input type="text" v-model.trim="user.administrative.payment.rib.iban" float-label="IBAN" @blur="$v.user.administrative.payment.rib.iban.$touch" />
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.payment.rib.bic.$error" :error-label="bicError">
                <q-input type="text" v-model.trim="user.administrative.payment.rib.bic" float-label="BIC" @blur="$v.user.administrative.payment.rib.bic.$touch" />
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep3Errors" @click="$refs.stepper.next()" label="Enregistrer" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="fourth" title="Documents annexes">
              <q-field icon="mdi-account-card-details" :error="$v.user.picture.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Photo"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.idCard.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Carte d'identité"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.vitalCard.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Carte vitale"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.navigoInvoice.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Facture Navigo"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.phoneInvoice.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Facture de téléphone"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.mutualFund.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Mutuelle"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.certificates.$error" error-label="Champ requis">
                <q-uploader :url="url" float-label="Diplômes et / ou certicats" multiple/>
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep4Errors" @click="$refs.stepper.next()" label="Terminer mon inscription" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-main>
        <!-- <q-card-actions class="row justify-end">
          <q-btn color="primary" @click="submit" :disable="$v.user.$invalid" flat>Envoyer</q-btn>
        </q-card-actions> -->
      </q-card>

    <!-- Test -->
    <!-- <div class="row justify-center">
      <div style="width: 600px; max-width: 90vw;">
        <q-field :label-width="3" label="Titulaire du compte" :error="$v.user.rib.fullname.$error" error-label="Champ requis">
          <q-input type="text" v-model="user.rib.fullname" @blur="$v.user.rib.fullname.$touch" />
        </q-field>
      </div>
    </div> -->
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
        dateOfBirth: '',
        stateOfBirth: '',
        placeOfBirth: '',
        countryOfBirth: 'FR',
        phoneNbr: '',
        email: '',
        emailConfirmation: '',
        password: '',
        passwordConfirmation: '',
        managerId: '',
        socialInsuranceNumber: '',
        administrative: {
          payment: {
            rib: {
              bankName: '',
              iban: '',
              bic: ''
            }
          },
          idCard: {
            parent: process.env.PARENT_GOOGLE_FOLDER_ID
          },
          vitalCard: {
            parent: process.env.PARENT_GOOGLE_FOLDER_ID
          },
          navigoInvoice: {
            parent: process.env.PARENT_GOOGLE_FOLDER_ID
          },
          mutualFund: {
            parent: process.env.PARENT_GOOGLE_FOLDER_ID
          },
          phoneInvoice: {
            parent: process.env.PARENT_GOOGLE_FOLDER_ID
          },
          certificates: []
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
      placeOfBirth: { required },
      picture: { required },
      administrative: {
        payment: {
          rib: {
            iban: {
              required,
              minLength: minLength(27),
              maxLength: maxLength(27)
            },
            bic: {
              required,
              minLength: minLength(8)
            }
          }
        },
        idCard: { required },
        vitalCard: { required },
        navigoInvoice: { required },
        mutualFund: { required },
        phoneInvoice: { required },
        certificates: [ required ]
      }
    }
  },
  mounted () {
    this.user.sector = this.$q.cookies.get('signup_sector');
    this.user.mobilePhone = this.$q.cookies.get('signup_mobile');
    this.user.managerId = this.$q.cookies.get('signup_managerId');
    this.accessToken = this.$q.cookies.get('signup_is_activated');
    this.getCountries();
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
      if (!this.$v.user.$error) {
        return true
      }
      return false
    },
    stateOfBirthError () {
      if (!this.$v.user.stateOfBirth.required) {
        return 'Champ requis'
      } else if (!this.$v.user.stateOfBirth.maxLength) {
        return 'Le département doit contenir 1 ou 2 chiffres.'
      }
    },
    socialInsuranceNumberError () {
      if (!this.$v.user.socialInsuranceNumber.required) {
        return 'Champ requis'
      } else if (!this.$v.user.socialInsuranceNumber.maxLength || !this.$v.user.socialInsuranceNumber.minLength) {
        return 'Le numéro de sécurité sociale doit contenir 15 chiffres.'
      }
    },
    ibanError () {
      if (!this.$v.user.administrative.payment.rib.iban.required) {
        return 'Champ requis'
      } else if (!this.$v.user.administrative.payment.rib.iban.minLength || !this.$v.user.administrative.payment.rib.iban.maxLength) {
        return 'L\'IBAN doit contenir 27 caractères.'
      }
    },
    bicError () {
      if (!this.$v.user.administrative.payment.rib.bic.required) {
        return 'Champ requis'
      } else if (!this.$v.user.administrative.payment.rib.iban.minLength) {
        return 'Le BIC doit contenir au moins 8 caractères.'
      }
    },
    getMaxDate () {
      return `${this.$moment().year()}-12-31`
    },
    hasStep1Errors () {
      return this.$v.user.civility.$invalid ? true : this.$v.user.firstname.$invalid ? true : this.$v.user.lastname.$invalid ? true
        : this.$v.user.address.zipCode.$invalid ? true : this.$v.user.address.city.$invalid ? true : this.$v.user.address.line.$invalid ? true
          : this.$v.user.email.$invalid ? true : this.$v.user.emailConfirmation.$invalid ? true
            : this.$v.user.password.$invalid ? true : !!this.$v.user.passwordConfirmation.$invalid
    },
    hasStep2Errors () {
      return this.$v.user.dateOfBirth.$invalid ? true : this.$v.user.countryOfBirth.$invalid ? true : this.$v.user.stateOfBirth.$invalid ? true
        : this.$v.user.placeOfBirth.$invalid ? true : !!this.$v.user.socialInsuranceNumber.$invalid
    },
    hasStep3Errors () {
      return this.$v.user.administrative.payment.rib.iban.$invalid ? true : !!this.$v.user.administrative.payment.rib.bic.$invalid
    },
    hasStep4Errors () {
      return this.$v.user.picture.$invalid ? true : this.$v.user.administrative.idCard.$invalid ? true : this.$v.user.administrative.vitalCard.$invalid ? true
        : this.$v.user.administrative.navigoInvoice.$invalid ? true : this.$v.user.administrative.phoneInvoice.$invalid ? true
          : this.$v.user.administrative.mutualFund.$invalid ? true : !!this.$v.user.administrative.certificates.$invalid
    }
  },
  methods: {
    async firstStep () {
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
          managerId: this.user.managerId
        };
        const newAlenviUser = await this.$users.create(alenviData);
        const alenviToken = newAlenviUser.data.data.token;
        this.$q.loading.show({ message: 'Redirection vers Pigi...' });
        setTimeout(async () => {
          this.$q.loading.hide();
          this.$q.cookies.remove('signup_is_activated', { path: '/' });
          this.$q.cookies.remove('signup_sector', { path: '/' });
          this.$q.cookies.remove('signup_mobile', { path: '/' });
          this.$q.cookies.remove('signup_managerId', { path: '/' });
          await this.$activationCode.delete(this.accessToken, this.user.mobilePhone);
          await this.$twilio.sendSMSConfirm(this.user.mobilePhone, this.accessToken);
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
    async secondStep () {

    },
    async thirdStep () {

    },
    async lastStep () {

    },
    async submit () {
      try {
        this.$q.loading.show({ message: 'Création de ton compte en cours...' });
        const accessToken = this.$q.cookies.get('signup_is_activated');
        const mobilePhone = this.$q.cookies.get('signup_mobile');
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
          mobile_phone: mobilePhone,
          date_of_birth: this.$moment(this.user.dateOfBirth).format('YYYYMMDD'),
          place_of_birth: this.user.placeOfBirth,
          state_of_birth: this.user.stateOfBirth,
          country_of_birth: this.user.countryOfBirth,
          social_insurance_number: this.user.socialInsuranceNumber
        };
        const ogustToken = await this.$ogust.getOgustToken(accessToken);
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
          managerId: this.$q.cookies.get('signup_managerId')
        };
        const newAlenviUser = await this.$users.create(alenviData);
        const alenviToken = newAlenviUser.data.data.token;
        this.$q.loading.show({ message: 'Redirection vers Pigi...' });
        setTimeout(async () => {
          this.$q.loading.hide();
          this.$q.cookies.remove('signup_is_activated', { path: '/' });
          this.$q.cookies.remove('signup_sector', { path: '/' });
          this.$q.cookies.remove('signup_mobile', { path: '/' });
          this.$q.cookies.remove('signup_managerId', { path: '/' });
          await this.$activationCode.delete(accessToken, mobilePhone);
          await this.$twilio.sendSMSConfirm(mobilePhone, accessToken);
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
