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
            <!-- First step -->
            <q-step name="first" title="Informations personnelles (suite)" default>
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
                <q-btn color="primary" :disable="hasStep1Errors" @click="firstStep()" label="Enregistrer" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
            <!-- 2nd step -->
            <q-step name="second" title="Informations de paiement">
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.payment.rib.iban.$error" :error-label="ibanError">
                <q-input type="text" v-model.trim="user.administrative.payment.rib.iban" float-label="IBAN" @blur="$v.user.administrative.payment.rib.iban.$touch" />
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.payment.rib.bic.$error" :error-label="bicError">
                <q-input type="text" v-model.trim="user.administrative.payment.rib.bic" float-label="BIC" @blur="$v.user.administrative.payment.rib.bic.$touch" />
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep2Errors" @click="secondStep()" label="Enregistrer" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
            <!-- Last step -->
            <q-step name="third" title="Documents annexes">
              <q-field icon="mdi-account-card-details" :error="$v.user.picture.$error" error-label="Champ requis">
                <q-uploader name="picture" :url="pictureUploadUrl" :headers="headers" :addtional-fields="[{ name: fileName, value: `${user.firstname}_${user.lastname}` }]" float-label="Photo"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.idCard.$error" error-label="Champ requis">
                <q-uploader name="idCard" :url="docsUploadUrl" :headers="headers" float-label="Carte d'identité"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.vitalCard.$error" error-label="Champ requis">
                <q-uploader name="vitalCard" :url="docsUploadUrl" :headers="headers" float-label="Carte vitale"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.navigoInvoice.$error" error-label="Champ requis">
                <q-uploader name="navigoInvoice" :url="docsUploadUrl" :headers="headers" float-label="Facture Navigo"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.phoneInvoice.$error" error-label="Champ requis">
                <q-uploader name="phoneInvoice" :url="docsUploadUrl" :headers="headers" float-label="Facture de téléphone"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.mutualFund.$error" error-label="Champ requis">
                <q-uploader name="mutualFund" :url="docsUploadUrl" :headers="headers" float-label="Mutuelle"/>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.certificates.$error" error-label="Champ requis">
                <q-uploader name="certificates" :url="docsUploadUrl" :headers="headers" float-label="Diplômes et / ou certicats" multiple/>
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep3Errors" @click="lastStep()" label="Terminer mon inscription" />
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
import { required, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  // name: 'PageName',
  data () {
    return {
      accessToken: '',
      countries: [],
      user: {
        dateOfBirth: '',
        stateOfBirth: '',
        placeOfBirth: '',
        countryOfBirth: 'FR',
        phoneNbr: '',
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
        }
      }
    }
  },
  validations: {
    user: {
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
  async beforeRouteEnter (to, from, next) {
    try {
      if (to.query.token && to.query.id) {
        await this.$users.getById(to.query.id, to.params.token);
        next();
      } else {
        next({ path: '/401' });
      }
    } catch (e) {
      console.error(e.response);
      next({ path: '/401' });
    }
  },
  async mounted () {
    try {
      this.accessToken = this.$route.query.token;
      const alenviUser = await this.$users.getById(this.$route.query.id, this.accessToken);
      console.log(alenviUser);
      const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
      const ogustUser = await this.$ogust.getById(alenviUser.employee_id, ogustToken);
      console.log(ogustUser);
      this.user = {
        lastname: ogustUser.last_name,
        firstname: ogustUser.first_name,
        dateOfBirth: ogustUser.date_of_birth,
        stateOfBirth: ogustUser.state_of_birth,
        placeOfBirth: ogustUser.place_of_birth,
        countryOfBirth: ogustUser.country_of_birth,
        socialInsuranceNumber: ogustUser.social_insurance_number,
        administrative: {
          payment: {
            rib: {
              iban: '',
              bic: ''
            }
          },
        }
      }
      this.getCountries();
      if (this.$route.query.step && (this.$route.query.step === 'first' || this.$route.query.step === 'second' || this.$route.query.step === 'third')) {
        this.$refs.stepper.goToStep(this.$route.query.step);
      }
    } catch (e) {
      console.error(e);
    }
  },
  computed: {
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
      return this.$v.user.dateOfBirth.$invalid ? true : this.$v.user.countryOfBirth.$invalid ? true : this.$v.user.stateOfBirth.$invalid ? true
        : this.$v.user.placeOfBirth.$invalid ? true : !!this.$v.user.socialInsuranceNumber.$invalid
    },
    hasStep2Errors () {
      return this.$v.user.administrative.payment.rib.iban.$invalid ? true : !!this.$v.user.administrative.payment.rib.bic.$invalid
    },
    hasStep3Errors () {
      return this.$v.user.picture.$invalid ? true : this.$v.user.administrative.idCard.$invalid ? true : this.$v.user.administrative.vitalCard.$invalid ? true
        : this.$v.user.administrative.navigoInvoice.$invalid ? true : this.$v.user.administrative.phoneInvoice.$invalid ? true
          : this.$v.user.administrative.mutualFund.$invalid ? true : !!this.$v.user.administrative.certificates.$invalid
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/uploader/${this.$route.query.id}/drive/uploadFile`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/uploader/${this.$route.query.id}/cloudinary/uploadImage`;
    },
    headers () {
      return {
        'x-access-token': this.$route.query.token
      }
    }
  },
  methods: {
    setData (user) {
      this.user = user;
    },
    async firstStep () {
      try {
        const ogustData = {
          date_of_birth: this.user.dateOfBirth,
          country_of_birth: this.user.countryOfBirth,
          state_of_birth: this.user.stateOfBirth,
          place_of_birth: this.user.placeOfBirth,
          social_insurance_number: this.user.socialInsuranceNumber
        };
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        const ogustUserUpdated = await this.$ogust.setEmployee(ogustData, ogustToken);
        this.$refs.stepper.next();
        console.log(ogustUserUpdated);
      } catch (e) {
        console.error(e.response);
      }
    },
    async secondStep () {
      try {
        const alenviData = {
          administrative: {
            payment: {
              rib: {
                iban: this.user.administrative.payment.rib.iban,
                bic: this.user.admninistrative.payment.rib.bic
              }
            }
          }
        };
        const userAlenviUpdated = await this.$users.updateById(alenviData, this.accessToken);
        const ogustData = {
          iban_number: this.user.administrative.payment.rib.iban,
          bic_number: this.user.admninistrative.payment.rib.bic
        };
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        const userOgustUpdated = await this.$ogust.setEmployee(ogustData, ogustToken);
        this.$refs.stepper.next();
        console.log(userAlenviUpdated);
        console.log(userOgustUpdated);
      } catch (e) {
        console.error(e.response);
      }
    },
    async lastStep () {
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
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0
</style>
