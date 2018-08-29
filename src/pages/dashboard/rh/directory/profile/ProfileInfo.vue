<template>
  <div v-if="isLoaded">
    <div class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <select-sector v-model="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'sector', ogust: 'sector' })" />
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Marraine/parrain</p>
        <select-mentor v-model="user.alenvi.mentor" :sector="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'mentor' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="[groupErrors('identity').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Nationalité</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.nationality.$error" name="error_outline" color="secondary" />
          </div>
          <q-select v-model="user.alenvi.administrative.identity.nationality" color="white" inverted-light :options="nationalitiesOptions"
            filter
            filter-placeholder="Rechercher"
            @focus="saveTmp('administrative.identity.nationality')"
            @blur="updateUser({ alenvi: 'administrative.identity.nationality', ogust: 'nationality' })" />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Date de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.dateOfBirth.$error" name="error_outline" color="secondary" />
          </div>
          <q-datetime type="date" format="DD/MM/YYYY" v-model="user.alenvi.administrative.identity.dateOfBirth" color="white" inverted-light
            @focus="saveTmp('administrative.identity.dateOfBirth')"
            @blur="updateUser({ alenvi: 'administrative.identity.dateOfBirth', ogust: 'date_of_birth' })" />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Pays de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthCountry.$error" name="error_outline" color="secondary" />
          </div>
          <q-select v-model="user.alenvi.administrative.identity.birthCountry" :options="countriesOptions" color="white" inverted-light
            filter
            filter-placeholder="Rechercher"
            @focus="saveTmp('administrative.identity.birthCountry')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthCountry', ogust: 'country_of_birth' })" />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Département de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthState.$error" error-label="error" name="error_outline" color="secondary" />
          </div>
          <q-input v-model="user.alenvi.administrative.identity.birthState"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.birthState')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthState', ogust: 'state_of_birth' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Ville de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthCity.$error" name="error_outline" color="secondary" />
          </div>
          <q-input v-model="user.alenvi.administrative.identity.birthCity"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.birthCity')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthCity', ogust: 'place_of_birth' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Numéro de sécurité sociale</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.socialSecurityNumber.$error" name="error_outline" color="secondary" />
          </div>
          <q-input v-model="user.alenvi.administrative.identity.socialSecurityNumber"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.socialSecurityNumber')"
            @blur="updateUser({ alenvi: 'administrative.identity.socialSecurityNumber', ogust: 'social_insurance_number' })"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Numéro de téléphone</p>
          <q-input v-model.trim="user.alenvi.mobilePhone"
            color="white"
            inverted-light
            @focus="saveTmp('mobilePhone')"
            @blur="updateUser({ alenvi: 'mobilePhone', ogust: 'mobile_phone' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Adresse email</p>
          <q-input v-model.trim="user.alenvi.local.email"
            color="white"
            inverted-light
            lower-case
            @focus="saveTmp('local.email')"
            @blur="updateUser({ alenvi: 'local.email', ogust: 'email' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Adresse, numéro et rue</p>
          <q-input v-model="user.alenvi.administrative.contact.address"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.address')"
            @blur="updateUser({ alenvi: 'administrative.contact.address', ogust: 'main_address.line' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Complément d'adresse</p>
          <q-input v-model="user.alenvi.administrative.contact.additionalAddress"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.addionalAddress')"
            @blur="updateUser({ alenvi: 'administrative.contact.additionalAddress', ogust: 'main_address.supplement' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Code postal</p>
          <q-input v-model="user.alenvi.administrative.contact.zipCode"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.zipCode')"
            @blur="updateUser({ alenvi: 'administrative.contact.zipCode', ogust: 'main_address.zip' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Ville</p>
          <q-input v-model="user.alenvi.administrative.contact.city"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.city')"
            @blur="updateUser({ alenvi: 'administrative.contact.city', ogust: 'main_address.city' })"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Contact d'urgence</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Prénom et nom</p>
          <q-input v-model="user.alenvi.administrative.emergencyContact.name"
           color="white"
           inverted-light
           @focus="saveTmp('administrative.emergencyContact.name')"
           @blur="updateUser({ alenvi: 'administrative.emergencyContact.name' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Numéro de téléphone</p>
          <q-input v-model.trim="user.alenvi.administrative.emergencyContact.phoneNumber"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
            @blur="updateUser({ alenvi: 'administrative.emergencyContact.phoneNumber' })"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">IBAN</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">IBAN</p>
          <q-input upper-case v-mask="'SS## #### #### #### #### #### ###'" v-model.trim="user.alenvi.administrative.payment.rib.iban"
            color="white" inverted-light @blur="updateUser({ alenvi: 'administrative.payment.rib.iban', ogust: 'iban_number' })"
            @focus="saveTmp('administrative.payment.rib.iban')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">BIC</p>
          <q-input v-model="user.alenvi.administrative.payment.rib.bic"
            upper-case color="white" inverted-light @blur="updateUser({ alenvi: 'administrative.payment.rib.bic', ogust: 'bic_number' })"
            @focus="saveTmp('administrative.payment.rib.bic')"
          />
        </div>
      </div>
    </div>
    <div v-if="user.alenvi.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Documents</p>
      </div>
      <div class="row gutter-profile items-stretch">
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Carte d'identité (recto) ou passeport</p>
          <div v-if="user.alenvi.administrative.idCardRecto && user.alenvi.administrative.idCardRecto.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardRecto.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.idCardRecto.driveId, 'administrative.idCardRecto')"
              />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardRecto.driveId">
            <q-uploader ref="idCardRecto" name="idCardRecto" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `cni_recto_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('idCardRecto')" @finish="refreshUser" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Carte d'identité (verso)</p>
          <div v-if="user.alenvi.administrative.idCardVerso && user.alenvi.administrative.idCardVerso.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardVerso.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.idCardVerso.driveId, 'administrative.idCardVerso')"
              />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardVerso.driveId">
            <q-uploader ref="idCardVerso" name="idCardVerso" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `cni_verso_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('idCardVerso')" @finish="refreshUser" />
            <!-- <q-uploader url="test" color="white" inverted-light /> -->
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div>
            <p class="input-caption">Attestation de sécurité sociale</p>
          </div>
          <div v-if="user.alenvi.administrative.healthAttest && user.alenvi.administrative.healthAttest.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.healthAttest.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.healthAttest.driveId, 'administrative.healthAttest')"
              />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.healthAttest.driveId">
            <q-uploader ref="healthAttest" name="healthAttest" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `assurance_maladie_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('healthAttest')" @finish="refreshUser" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Facture téléphonique</p>
          <div v-if="user.alenvi.administrative.phoneInvoice && user.alenvi.administrative.phoneInvoice.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.phoneInvoice.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.phoneInvoice.driveId, 'administrative.phoneInvoice')"
              />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.phoneInvoice.driveId">
            <q-uploader ref="phoneInvoice" name="phoneInvoice" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `facture_telephone_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('phoneInvoice')" @finish="refreshUser" />
          </q-field>
        </div>
        <div class="col-xs-12">
          <p class="input-caption col-xs-12">Diplome(s) ou certificats(s)</p>
          <q-field>
            <q-uploader ref="certificates" name="certificates" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `diplomes_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('certificates')" @finish="refreshUser" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.certificates && user.alenvi.administrative.certificates.length > 0" class="col-xs-12 col-md-6"
          v-for="(certificate, index) in user.alenvi.administrative.certificates" :key="index">
          <p class="input-caption col-xs-12">Diplome(s) ou certificats(s) ({{ index + 1 }})</p>
          <div v-if="certificate.driveId" class="row justify-between" style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(certificate.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(certificate.driveId, 'certificates')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Mutuelle</p>
      </div>
      <div class="row gutter-profile-x">
        <div class="col-xs-12">
          <p class="input-caption">Voulez-vous adhérer à la mutuelle d'entreprise ?</p>
          <!-- <div class="row"> -->
          <q-btn-toggle class="full-width" color="white" text-color="black" toggle-color="primary" v-model="user.alenvi.administrative.mutualFund.has"
            @input="updateUser({ alenvi: 'administrative.mutualFund.has' })" :options="[
                { label: 'Oui', value: false },
                { label: 'Non', value: true }
              ]" />
          <!-- </div> -->
          <div v-if="user.alenvi.administrative.mutualFund && user.alenvi.administrative.mutualFund.driveId" class="row justify-between"
            style="background: white; margin-top: 24px;">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.mutualFund.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.mutualFund.driveId, 'administrative.mutualFund')"
              />
            </div>
          </div>
        </div>
        <div v-if="user.alenvi.administrative.mutualFund.has && !user.alenvi.administrative.mutualFund.driveId" class="col-xs-12">
          <p class="input-caption">Merci de nous transmettre le document mentionnant le fait que vous refusez la mutuelle Alenvi</p>
          <q-uploader ref="mutualFund" name="mutualFund" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `mutuelle_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
            hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
            hide-upload-button @add="uploadDocument('mutualFund')" @finish="refreshUser" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Transports</p>
      </div>
      <div class="row gutter-profile-x">
        <div class="col-xs-12">
          <p class="input-caption">Avez-vous un abonnement de transports en commun ?</p>
          <q-option-group color="primary" v-model="user.alenvi.administrative.transportInvoice.type" @input="updateUser({ alenvi: 'administrative.transportInvoice.type' })"
            :options="[
                { label: 'Abonnement transports en commun', value: 'public' },
                { label: 'Voiture personnelle', value: 'private' },
                { label: 'Aucun', value: 'none' }
              ]" />
        </div>
        <div v-if="user.alenvi.administrative.transportInvoice.type === 'public'" class="col-xs-12">
          <p class="input-caption">Merci de nous transmettre votre justificatif d'abonnement</p>
          <q-uploader ref="transportInvoice" name="transportInvoice" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `justif_transport_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
            hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
            hide-upload-button @add="uploadDocument('transportInvoice')" @finish="refreshUser" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Cookies } from 'quasar';
import { required, email, numeric, minLength, requiredIf } from 'vuelidate/lib/validators';

import gdrive from '../../../../../api/GoogleDrive.js';
import nationalities from '../../../../../data/nationalities.js';
import countries from '../../../../../data/countries.js';
import SelectSector from '../../../../../components/SelectSector';
import SelectMentor from '../../../../../components/SelectMentor';
import { extend } from '../../../../../helpers/utils.js';

export default {
  components: {
    SelectSector,
    SelectMentor
  },
  data () {
    return {
      isLoaded: false,
      tmpInput: '',
      identityGroup: [
        'user.alenvi.administrative.identity.nationality',
        'user.alenvi.administrative.identity.dateOfBirth',
        'user.alenvi.administrative.identity.birthCountry',
        'user.alenvi.administrative.identity.birthState',
        'user.alenvi.administrative.identity.birthCity',
        'user.alenvi.administrative.identity.socialSecurityNumber'
      ],
      contactGroup: [
        'user.alenvi.administrative.contact.address',
        'user.alenvi.administrative.contact.zipCode',
        'user.alenvi.administrative.contact.city'
      ],
      user: {
        alenvi: {
          mentor: '',
          administrative: {
            emergencyContact: {
              name: '',
              phoneNumber: ''
            },
            idCardRecto: {},
            idCardVerso: {},
            mutualFund: {
              has: null
            },
            certificates: [],
            phoneInvoice: {},
            transportInvoice: {
              type: ''
            },
            payment: {
              rib: {
                iban: '',
                bic: ''
              }
            },
            identity: {
              nationality: '',
              dateOfBirth: '',
              birthCountry: '',
              birthState: '',
              birthCity: '',
              socialSecurityNumber: 0
            },
            contact: {
              address: '',
              additionalAddress: '',
              zipCode: '',
              city: ''
            }
          }
        }
      }
    }
  },
  validations () {
    return {
      user: {
        alenvi: {
          firstname: { required },
          lastname: { required },
          local: {
            email: { required, email }
          },
          mobilePhone: { required, numeric },
          sector: { required },
          mentor: { required },
          administrative: {
            identity: {
              nationality: { required },
              dateOfBirth: { required },
              birthCountry: { required },
              birthState: { required },
              birthCity: { required },
              socialSecurityNumber: { required, numeric }
            },
            contact: {
              address: { required },
              zipCode: { required, numeric },
              city: { required }
            },
            emergencyContact: {
              name: { required },
              phoneNumber: { required, numeric }
            },
            idCardRecto: {
              driveId: { required }
            },
            idCardVerso: {
              driveId: { required }
            },
            healthAttest: {
              driveId: { required }
            },
            phoneInvoice: {
              driveId: { required }
            },
            payment: {
              rib: {
                iban: {
                  required,
                  minLength: minLength(28)
                },
                bic: {
                  required,
                  minLength: minLength(8)
                }
              }
            },
            transportInvoice: {
              type: { required },
              driveId: { required: requiredIf((item) => {
                return item.type === 'public'
              })}
            },
            certificates: {
              required,
              minLength: minLength(1)
            },
            mutualFund: {
              has: { required },
              driveId: { required: requiredIf((item) => {
                return item.has
              })}
            }
          }
        }
      },
      identityGroup: this.identityGroup,
      contactGroup: this.contactGroup
    }
  },
  computed: {
    ...mapGetters({
      userProfile: 'rh/getUserProfile'
    }),
    nationalitiesOptions () {
      return Object.keys(nationalities).map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return Object.keys(countries).map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/gdrive/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/cloudinary/uploadImage`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    }
  },
  mounted () {
    this.mergeUser();
    this.$v.user.alenvi.$touch();
  },
  watch: {
    userProfile (value) {
      this.mergeUser(value);
    }
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.user.alenvi, value || this.$store.state.rh.userProfile];
      this.user.alenvi = Object.assign({}, extend(true, ...args));
      this.isLoaded = true;
    },
    getThumbnailUrl (fileId) {
      return `https://drive.google.com/u/1/thumbnail?id=${fileId}`
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.user.alenvi, path)
    },
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.user.alenvi, paths.alenvi)) return;
        this.$_.get(this.$v.user.alenvi, paths.alenvi).$touch();
        if (this.$_.get(this.$v.user.alenvi, paths.alenvi).$error) {
          return this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviUser(paths.alenvi);
          await this.updateOgustUser(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviUser(paths.alenvi);
        } else {
          await this.updateOgustUser(paths);
        }
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    async updateAlenviUser (path) {
      try {
        let value = this.$_.get(this.user.alenvi, path);
        if (path.match(/dateOfBirth/i)) {
          value = this.$moment(value).format('YYYY-MM-DD');
        }
        if (path.match(/iban/i)) {
          value = value.split(' ').join('');
        }
        const payload = this.$_.set({}, path, value);
        payload._id = this.userProfile._id;
        console.log('PAYLOAD ALENVI', payload);
        await this.$users.updateById(payload);
      } catch (e) {
        console.error(e);
      }
    },
    async updateOgustUser (paths) {
      try {
        let value = this.$_.get(this.user.alenvi, paths.alenvi);
        if (paths.ogust.match(/date_of_birth/i)) {
          value = this.$moment(value).format('YYYYMMDD');
        }
        if (paths.ogust.match(/iban_number/i)) {
          value = value.split(' ').join('');
        }
        const payload = this.$_.set({}, paths.ogust, value);
        if (paths.ogust.match(/(iban|bic)_number/i)) {
          payload.id_tiers = this.userProfile.employee_id;
          // await this.$ogust.setEmployeeBankInfo(payload);
        } else {
          payload.id_employee = this.userProfile.employee_id
          // await this.$ogust.setEmployee(payload);
        }
        console.log('PAYLOAD OGUST', payload);
      } catch (e) {
        console.error(e);
      }
    },
    uploadDocument (refName) {
      this.$refs[refName].upload();
      this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
    },
    async deleteDocument (driveId, path) {
      try {
        await gdrive.removeFileById({ id: driveId });
        let payload = { _id: this.userProfile._id };
        if (path === 'certificates') {
          payload = Object.assign(payload, { [`administrative.${path}`]: { driveId } });
          await this.$users.updateCertificates(payload);
        } else {
          payload = this.$_.set(payload, path, { driveId: null, link: null });
          await this.$users.updateById(payload);
        }
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Document supprimé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression du document',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    refreshUser () {
      this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
      this.$q.notify({
        color: 'positive',
        icon: 'done',
        detail: 'Document envoyé',
        position: 'bottom-left',
        timeout: 2500
      });
    },
    groupErrors (group) {
      let j = 0;
      console.log('VUELIDATE', this.$v);
      for (let i = 0, l = this[`${group}Group`].length; i < l; i++) {
        if (this.$v.identityGroup[this[`${group}Group`][i]].$error) {
          j++;
        }
      }
      return {
        errors: j,
        msg: j > 0 ? `${j} information(s) manquante(s)` : 'Informations complètes'
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-btn-group
    box-shadow: none
    & /deep/ button
      flex: 1

  .gutter-profile
    margin-top: -24px
    margin-left: -24px
    & > div
      padding-top: 24px
      padding-left: 24px
    &-x
      margin-top: -24px
      & > div
        padding-top: 24px

  // .q-if /deep/
  //   & .q-if-label
  //     color: $dark-grey

  // /deep/ .q-if
  //   &-inverted
  //     box-shadow: none
  //     padding: 9px 14px 11px 14px
  //   &-focused
  //     box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2)
  //   &-baseline
  //     line-height: 0
  //   & input.q-input-target
  //     height: 20px
  //     line-height: 20px
  //   & .q-if-inner
  //     min-height: 20px
  //     margin: 0

  // /deep/ .q-if-focused
  //   box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2)

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px

  .group-error
    font-size: 12px
    color: $secondary
    &-ok
      font-size: 12px
      color: $tertiary
</style>
