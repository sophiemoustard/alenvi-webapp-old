<template>
  <div v-if="isLoaded">
    <div class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <select-sector v-model="user.alenvi.sector" />
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Marraine/parrain</p>
        <select-mentor :sector="user.alenvi.mentor" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Nationalité</p>
          <q-field>
            <q-select v-model="user.alenvi.administrative.identity.nationality" color="white" inverted-light :options="nationalitiesOptions"
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Date de naissance</p>
          <q-field>
            <q-datetime type="date" format="DD/MM/YYYY" v-model="user.alenvi.administrative.identity.dateOfBirth" color="white" inverted-light
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Pays de naissance</p>
          <q-field>
            <q-select v-model="user.alenvi.administrative.identity.birthCountry" :options="countriesOptions" color="white" inverted-light
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Département de naissance</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.identity.birthState" color="white" inverted-light @blur="updateAlenviUser({ group: 'administrative.identity', property: 'birthState'})" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Ville de naissance</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.identity.birthCity" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Numéro de sécurité sociale</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.identity.socialSecurityNumber" color="white" inverted-light />
          </q-field>
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
          <q-field>
            <q-input v-model="user.alenvi.mobilePhone" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Adresse email</p>
          <q-field>
            <q-input v-model="user.alenvi.local.email" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Adresse, numéro et rue</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.contact.address" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Complément d'adresse</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.contact.additionalAddress" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Code postal</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.contact.zipCode" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Ville</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.contact.city" color="white" inverted-light />
          </q-field>
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
          <q-field>
            <q-input v-model="user.alenvi.administrative.emergencyContact.name" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Numéro de téléphone</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.emergencyContact.phoneNumber" color="white" inverted-light />
          </q-field>
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
          <q-field>
            <q-input v-model="user.alenvi.administrative.payment.rib.iban" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">BIC</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.payment.rib.bic" color="white" inverted-light />
          </q-field>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
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
              <q-btn color="primary" round flat icon="delete" size="1rem" />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardRecto">
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Carte d'identité (verso)</p>
          <div v-if="user.alenvi.administrative.idCardVerso && user.alenvi.administrative.idCardVerso.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardVerso.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardVerso">
            <q-uploader url="test" color="white" inverted-light />
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
              <q-btn color="primary" round flat icon="delete" size="1rem" />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.healthAttest">
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Facture téléphonique</p>
          <div v-if="user.alenvi.administrative.idCardVerso && user.alenvi.administrative.idCardVerso.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardVerso.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardVerso">
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12">
          <p class="input-caption col-xs-12">Diplome(s) ou certificats(s)</p>
          <q-field>
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.certificates && user.alenvi.administrative.certificates.docs.length > 0" class="col-xs-12 col-md-6" v-for="(certificate, index) in user.alenvi.administrative.certificates.docs" :key="index">
          <p class="input-caption col-xs-12">Diplome(s) ou certificats(s) ({{ index + 1 }})</p>
          <div v-if="certificate.driveId" class="row justify-between" style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(certificate.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" />
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
            <q-btn-toggle
              class="full-width"
              color="white"
              text-color="black"
              toggle-color="primary"
              v-model="user.alenvi.administrative.mutualFund.has"
              :options="[
                { label: 'Oui', value: false },
                { label: 'Non', value: true }
              ]" />
          <!-- </div> -->
        </div>
        <div class="col-xs-12">
          <p class="input-caption">Merci de nous transmettre le document mentionnant le fait que vous refusez la mutuelle Alenvi</p>
          <q-field>
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Transports</p>
      </div>
      <div class="row gutter-profile-x">
        <div class="col-xs-12">
          <p class="input-caption">Voulez-vous adhérer à la mutuelle d'entreprise ?</p>
            <q-option-group
              color="primary"
              v-model="user.alenvi.administrative.transportInvoice.type"
              :options="[
                { label: 'Abonnement transports en commun', value: 'public' },
                { label: 'Voiture personnelle', value: 'private' },
                { label: 'Aucun', value: 'none' }
              ]" />
        </div>
        <div class="col-xs-12">
          <p class="input-caption">Merci de nous transmettre votre justificatif d'abonnement</p>
          <q-field>
            <q-uploader url="test" color="white" inverted-light />
          </q-field>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

// import gdrive from '../../../../api/googleDrive.js';
import nationalities from '../../../../data/nationalities.js';
import countries from '../../../../data/countries.js';
import SelectSector from '../../../../components/SelectSector';
import SelectMentor from '../../../../components/SelectMentor';

export default {
  components: {
    SelectSector,
    SelectMentor
  },
  data () {
    return {
      isLoaded: false,
      user: {
        alenvi: {
          administrative: {
            emergencyContact: {
              name: '',
              phoneNumber: ''
            },
            mutualFund: {
              has: ''
            },
            certificates: {
              docs: []
            },
            transportInvoice: {
              type: ''
            },
            payment: {
              rib: {
                iban: '',
                bic: ''
              }
            }
          }
        }
      }
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
    }
  },
  mounted () {

  },
  watch: {
    userProfile (value) {
      this.user.alenvi = this.$_.merge(this.user.alenvi, value);
      this.isLoaded = true;
      console.log(this.user.alenvi);
    }
  },
  methods: {
    setAlenviUser () {
      const user = this.$store.getters['rh/getUserProfile']
      this.user.alenvi = user;
    },
    getThumbnailUrl (fileId) {
      return `https://drive.google.com/u/1/thumbnail?id=${fileId}`
    },
    async updateAlenviUser (field) {
      try {
        let data = {};
        if (typeof field === 'string') {
          data = {
            [field]: this.user.alenvi[field]
          };
        }
        if (typeof field === 'object') {
          if (field.group) {
            const properties = field.group.split('.');
            console.log(properties);
            const lastPropertyIndex = properties.length - 1;
            Object.assign(data, { [field.group]: {} });
            // for (let i = 0, l = properties.length; i < l; i++) {
            //   Object.assign(data, { [properties[i]]: {} });
            // data[properties[i]] = {}
            // data = data[properties[i]];
            // }
            console.log('DATA', data);
            data[properties[lastPropertyIndex]][field.property] = this.$_.get(this.user.alenvi, `${field.group}.${field.property}`);
          }
        }
        console.log('DATA', data);
        // await this.$users.updateById(this.userProfile._id);
      } catch (e) {
        console.error(e);
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

  .q-if /deep/
    & .q-if-label
      color: $dark-grey

  /deep/ .q-if-inverted
    box-shadow: none
    padding: 9px 0px 11px 14px

  /deep/ .q-if-focused
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2)

  .input-caption
    font-size: 12px
    margin: 0 0 8px 0

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
