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
                <q-input type="number" v-model.trim="user.stateOfBirth" float-label="Département de naissance (99 si étranger)" @blur="$v.user.stateOfBirth.$touch" />
              </q-field>
              <q-field icon="location city" :error="$v.user.placeOfBirth.$error" error-label="Champ requis">
                <q-input type="text" v-model.trim="user.placeOfBirth" float-label="Lieu de naissance" @blur="$v.user.placeOfBirth.$touch" />
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.socialInsuranceNumber.$error" :error-label="socialInsuranceNumberError">
                <q-input type="number" v-model.trim="user.socialInsuranceNumber" float-label="Numéro de sécurité sociale" @blur="$v.user.socialInsuranceNumber.$touch" />
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep1Errors" @click="firstStep()" label="Enregistrer" />
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
                <q-uploader name="picture" :url="pictureUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `picture_${user.firstname}_${user.lastname}` }]"
                float-label="Photo" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.picture">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.picture">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.idCard.$error" error-label="Champ requis">
                <q-uploader name="idCard" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `id_${user.firstname}_${user.lastname}` }]"
                float-label="Carte d'identité" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.idCard">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.idCard">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.healthAttest.$error" error-label="Champ requis">
                <q-uploader name="healthAttest" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `healthattest_${user.firstname}_${user.lastname}` }]"
                float-label="Attestation d'assurance maladie en cours de validité" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.healthAttest">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.healthAttest">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.navigoInvoice.$error" error-label="Champ requis">
                <q-uploader name="navigoInvoice" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `navigo_${user.firstname}_${user.lastname}` }]"
                float-label="Facture Navigo" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.navigoInvoice">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.navigoInvoice">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.phoneInvoice.$error" error-label="Champ requis">
                <q-uploader name="phoneInvoice" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `phone_${user.firstname}_${user.lastname}` }]"
                float-label="Facture de téléphone" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.phoneInvoice">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.phoneInvoice">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.certificates.$error" error-label="Champ requis">
                <q-uploader name="certificates" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `certificate_${user.firstname}_${user.lastname}` }]"
                float-label="Diplômes et / ou certicats" @finish="afterUpload()" multiple auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.certificates[0]">Fichier(s) mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.certificates[0]">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-field icon="mdi-account-card-details" :error="$v.user.administrative.mutualFund.$error" error-label="Champ requis">
                <q-uploader name="mutualFund" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `mutual_${user.firstname}_${user.lastname}` }]"
                float-label="Mutuelle (falcultatif)" @finish="afterUpload()" auto-expand extensions=".jpg, .jpeg, .png, .pdf"/>
                <p class="upload-done" v-if="alenviUser && alenviUser.administrative.mutualFund">Fichier mis en ligne <q-icon name="check" /></p>
                <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.mutualFund">Fichier manquant <q-icon name="warning" /></p>
              </q-field>
              <q-stepper-navigation>
                <q-btn color="primary" :disable="hasStep3Errors" @click="lastStep()" label="Terminer mon inscription" />
                <q-btn color="primary" flat @click="$refs.stepper.previous()" label="Retour" />
              </q-stepper-navigation>
            </q-step>
            <q-inner-loading :visible="inProgress" />
          </q-stepper>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  // name: 'PageName',
  data () {
    return {
      hasStep3Errors: true,
      alenviUser: null,
      ogustUser: null,
      inProgress: false,
      isSignupComplete: false,
      accessToken: '',
      countries: [],
      user: {
        dateOfBirth: '',
        stateOfBirth: '',
        placeOfBirth: '',
        countryOfBirth: '',
        phoneNbr: '',
        managerId: '',
        socialInsuranceNumber: '',
        picture: {
          link: ''
        },
        administrative: {
          payment: {
            rib: {
              iban: '',
              bic: ''
            }
          },
          idCard: {
            driveId: '',
            link: ''
          },
          healthAttest: {
            driveId: '',
            link: ''
          },
          navigoInvoice: {
            driveId: '',
            link: ''
          },
          mutualFund: {
            driveId: '',
            link: ''
          },
          phoneInvoice: {
            driveId: '',
            link: ''
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
        healthAttest: { required },
        navigoInvoice: { required },
        mutualFund: { required },
        phoneInvoice: { required },
        certificates: [ required ]
      }
    }
  },
  // async beforeRouteEnter (to, from, next) {
  //   try {
  //     if (to.query.token && to.query.id) {
  //       await this.$users.getById(to.query.id, to.params.token);
  //       next();
  //     } else {
  //       next({ path: '/401' });
  //     }
  //   } catch (e) {
  //     console.error(e.response);
  //     next({ path: '/401' });
  //   }
  // },
  async mounted () {
    try {
      if (this.$route.query.step && (this.$route.query.step === 'first' || this.$route.query.step === 'second' || this.$route.query.step === 'third')) {
        this.$refs.stepper.goToStep(this.$route.query.step);
      }
      this.accessToken = this.$route.query.token;
      this.inProgress = true;
      await this.setAlenviUser();
      await this.checkStep3Errors();
      await this.setOgustUser();
      await this.getCountries();
      this.inProgress = false;
    } catch (e) {
      console.error(e);
      this.inProgress = false;
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
      } else if (!this.$v.user.administrative.payment.rib.bic.minLength) {
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
    // hasStep3Errors () {
    //   return this.alenviUser.picture ? true : this.alenviUser.administrative ? true
    //     : this.alenviUser.administrative.idCard ? true
    //       : this.alenviUser.administrative.healthAttest ? true
    //         : this.alenviUser.administrative.certificates ? true
    //             : this.alenviUser.administrative.phoneInvoice ? true
    //               : !!this.alenviUser.administrative.navigoInvoice
    // },
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
    async firstStep () {
      try {
        const ogustData = {
          id_employee: this.user.id_employee,
          date_of_birth: this.$moment(this.user.dateOfBirth).format('YYYYMMDD'),
          country_of_birth: this.user.countryOfBirth,
          state_of_birth: this.user.stateOfBirth,
          place_of_birth: this.user.placeOfBirth,
          social_insurance_number: this.user.socialInsuranceNumber
        };
        this.inProgress = true;
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        await this.$ogust.setEmployee(ogustData, ogustToken);
        const alenviData = {
          _id: this.$route.query.id,
          administrative: {
            signup: {
              step: 'second'
            }
          }
        };
        await this.$users.updateById(alenviData, this.accessToken);
        this.inProgress = false;
        this.$refs.stepper.next();
      } catch (e) {
        this.inProgress = false;
        console.error(e.response);
      }
    },
    async secondStep () {
      try {
        const iban = this.user.administrative.payment.rib.iban;
        const bic = this.user.administrative.payment.rib.bic;
        const alenviData = {
          _id: this.$route.query.id,
          administrative: {
            signup: {
              step: 'third'
            },
            payment: {
              rib: {
                iban,
                bic
              }
            }
          }
        };
        this.inProgress = true;
        await this.$users.updateById(alenviData, this.accessToken);
        const ogustData = {
          id_tiers: this.user.id_employee,
          iban_number: iban,
          bic_number: bic
        };
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        await this.$ogust.setEmployeeBankInfo(ogustData, ogustToken);
        this.inProgress = false;
        this.$refs.stepper.next();
      } catch (e) {
        this.inProgress = false;
        console.error(e);
      }
    },
    async lastStep () {
      this.progress = true;
      const alenviData = {
        _id: this.$route.query.id,
        administrative: {
          signup: {
            complete: true
          },
        }
      };
      await this.$users.updateById(alenviData, this.accessToken);
      this.$q.loading.show({ message: 'Redirection vers Pigi...' });
      setTimeout(async () => {
        this.$q.loading.hide();
        this.progress = false;
        window.location.href = `${process.env.MESSENGER_LINK}?ref=signup_complete`;
      }, 2000);
    },
    async getCountries () {
      try {
        const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
        const countriesRaw = await this.$ogust.getList('employee.country_of_birth', ogustToken);
        delete countriesRaw['0'];
        for (const k in countriesRaw) {
          this.countries.push({ label: countriesRaw[k], value: k });
        }
        console.log(this.countries);
      } catch (e) {
        console.error(e.response);
      }
    },
    async afterUpload () {
      try {
        this.alenviUser = await this.$users.getById(this.$route.query.id, this.accessToken);
        this.checkStep3Errors();
      } catch (e) {
        console.error(e);
      }
    },
    checkStep3Errors () {
      if (this.alenviUser.picture && this.alenviUser.administrative && this.alenviUser.administrative.idCard &&
        this.alenviUser.administrative.healthAttest && this.alenviUser.administrative.certificates &&
        this.alenviUser.administrative.phoneInvoice && this.alenviUser.administrative.navigoInvoice) {
        this.hasStep3Errors = false;
      }
    },
    async setAlenviUser () {
      this.alenviUser = await this.$users.getById(this.$route.query.id, this.accessToken);
      if (this.alenviUser.administrative.signup.complete) {
        this.isSignupComplete = true;
        // TO DO MESSAGE
      }
      this.user.picture.link = this.alenviUser.picture ? this.alenviUser.picture.link : '';
    },
    async setOgustUser () {
      const ogustToken = await this.$ogust.getOgustToken(this.accessToken);
      this.ogustUser = await this.$ogust.getEmployeeById(this.alenviUser.employee_id, ogustToken);
      this.user.id_employee = this.ogustUser.id_employee || '';
      this.user.lastname = this.ogustUser.last_name || '';
      this.user.firstname = this.ogustUser.first_name || '';
      this.user.dateOfBirth = this.$moment(this.ogustUser.date_of_birth).toDate() || '';
      this.user.stateOfBirth = this.ogustUser.state_of_birth || '';
      this.user.placeOfBirth = this.ogustUser.place_of_birth || '';
      this.user.countryOfBirth = this.ogustUser.country_of_birth || 'FR';
      this.user.socialInsuranceNumber = this.ogustUser.social_insurance_number || '';
      if (this.ogustUser.bank_information[0]) {
        this.user.administrative.payment.rib.iban = this.ogustUser.bank_information[0].iban_number || '';
        this.user.administrative.payment.rib.bic = this.ogustUser.bank_information[0].bic_number || '';
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0

.upload-done
  margin-top: 10px
  margin-bottom: 5px
  color: $positive

.upload-not-done
  margin-top: 10px
  margin-bottom: 5px
  color: $negative
</style>
