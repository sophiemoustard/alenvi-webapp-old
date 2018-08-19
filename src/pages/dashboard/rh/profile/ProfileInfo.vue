<template>
  <div v-if="isLoaded">
    <div class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <select-sector v-model="userProfile.sector" />
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Marraine/parrain</p>
        <select-mentor :sector="userProfile.sector" />
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
            <q-select v-model="user.alenvi.administrative.identity.nationality" color="white" inverted-light :options="nationalitiesOptions" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Date de naissance</p>
          <q-field>
            <q-datetime type="date" v-model="user.alenvi.administrative.identity.dateOfBirth" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Pays de naissance</p>
          <q-field>
            <q-select v-model="user.alenvi.administrative.identity.birthCountry" :options="countriesOptions" color="white" inverted-light />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Département de naissance</p>
          <q-field>
            <q-input v-model="user.alenvi.administrative.identity.birthState" color="white" inverted-light />
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
    }
  },
  methods: {
    setAlenviUser () {
      const user = this.$store.getters['rh/getUserProfile']
      this.user.alenvi = user;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .gutter-profile
    margin-top: -24px
    margin-left: -24px
    & > div
      padding-top: 24px
      padding-left: 24px

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
</style>
