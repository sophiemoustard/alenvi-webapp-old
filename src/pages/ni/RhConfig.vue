<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Taux horaire brut par défaut</p>
            <q-field :error="$v.company.rhConfig.providerContracts.grossHourlyRate.$error" :error-label="nbrError('providerContracts.grossHourlyRate')">
              <q-input
                :value="company.rhConfig.providerContracts.grossHourlyRate"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.providerContracts.grossHourlyRate')"
                @change="updateCompany($event, 'rhConfig.providerContracts.grossHourlyRate')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats mandataires</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Taux horaire brut par défaut</p>
            <q-field :error="$v.company.rhConfig.agentContracts.grossHourlyRate.$error" :error-label="nbrError('agentContracts.grossHourlyRate')">
              <q-input
                :value="company.rhConfig.agentContracts.grossHourlyRate"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.agentContracts.grossHourlyRate')"
                @change="updateCompany($event, 'rhConfig.agentContracts.grossHourlyRate')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement téléphone</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Montant du remboursement</p>
            <q-field :error="$v.company.rhConfig.phoneSubRefunding.$error" :error-label="nbrError('phoneSubRefunding')">
              <q-input
                :value="company.rhConfig.phoneSubRefunding"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.phoneSubRefunding')"
                @change="updateCompany($event, 'rhConfig.phoneSubRefunding')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <div
            v-for="(transportSub, index) in company.rhConfig.transportSubs"
            :key="index"
            class="col-xs-12 col-md-6">
            <p class="input-caption">{{ transportSub.department }}</p>
            <q-field :error="$v.company.rhConfig.transportSubs.$each[index].$error" error-label="Champ requis">
              <q-input
                :value="company.rhConfig.transportSubs[index].price"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)"
                @change="updateCompanyTransportSubs($event, { vuelidatePath: `rhConfig.transportSubs.$each[${index}]`, index })"/>
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Modèle de contrat</p>
            <div v-if="hasContractTemplate" class="row justify-between"
            style="background: white">
              <div class="doc-thumbnail">
                <custom-img :driveId="company.rhConfig.templates.contract.driveId" alt="template contrat" />
              </div>
              <div class="self-end doc-delete">
                <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(company.rhConfig.templates.contract.driveId, 'contract')" />
                <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(company.rhConfig.templates.contract.link)" />
              </div>
            </div>
            <q-field v-if="!hasContractTemplate">
            <q-uploader ref="contract" name="contract" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `modele_contrat_${company.name}` }]"
              hide-underline color="white" inverted-light
              hide-upload-button @add="uploadDocument($event, 'contract')" @uploaded="refreshUser" @fail="failMsg" />
          </q-field>
          </div>
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Modèle d'avenant au contrat</p>
            <div v-if="hasAmendmentTemplate" class="row justify-between"
            style="background: white">
              <div class="doc-thumbnail">
                <custom-img :driveId="company.rhConfig.templates.amendment.driveId" alt="template avenant" />
              </div>
              <div class="self-end doc-delete">
                <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(company.rhConfig.templates.amendment.driveId, 'amendment')" />
                <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(company.rhConfig.templates.amendment.link)" />
              </div>
            </div>
            <q-field v-if="!hasAmendmentTemplate">
            <q-uploader ref="amendment" name="amendment" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `modele_avenant_${company.name}` }]"
              hide-underline color="white" inverted-light
              hide-upload-button @add="uploadDocument($event, 'amendment')" @uploaded="refreshUser" @fail="failMsg" />
          </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <table>
          <th>Nom tag</th>
          <th>Description</th>
          <tr v-for="(templateVar, index) in varContracts" :key="index">
            <td>{{`{${index}\}`}}</td>
            <td>{{templateVar}}</td>
          </tr>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { Cookies, openURL } from 'quasar';
import { required, maxValue } from 'vuelidate/lib/validators';

import { posDecimals } from '../../helpers/vuelidateCustomVal';
import gdrive from '../../api/GoogleDrive.js';
import CustomImg from '../../components/CustomImg';

export default {
  components: {
    CustomImg
  },
  data () {
    return {
      company: null,
      tmpInput: '',
      varContracts: {
        'title': 'Civilité',
        'firstname': 'Prénom',
        'lastname': 'Nom',
        'address': 'Adresse',
        'city': 'Ville',
        'zipCode': 'Code postal',
        'birthDate': 'Date de naissance',
        'birthCountry': 'Pays de naissance',
        'birthState': 'Département de naissance',
        'nationality': 'Nationalité',
        'SSN': 'Numéro de sécurité sociale',
        'grossHourlyRate': 'Taux horaire brut',
        'monthlyHours': 'Volume d\'heure mensuel (Volume d\'heures hebdomadaire * 4,33)',
        'salary': 'Salaire mensuel (Volume d\'heures mensuel * taux horaire brut)',
        'startDate': 'Date d\'effet du contrat / de la version',
        'weeklyHours': 'Volume horaire hebdomadaire',
        'yearlyHours': 'Volume horaire annuel (Volume d\'heure mensuel * 52)',
        'uploadDate': 'Date de l\'upload du contrat pour la date de signature',
        'initialContractStartDate': 'Date d’effet du contrat initial',
      }
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.rhConfig.templates.folderId}/upload`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
    hasContractTemplate () {
      return this.company.rhConfig.templates && this.company.rhConfig.templates.contract && this.company.rhConfig.templates.contract.driveId;
    },
    hasAmendmentTemplate () {
      return this.company.rhConfig.templates && this.company.rhConfig.templates.amendment && this.company.rhConfig.templates.amendment.driveId;
    }
  },
  validations: {
    company: {
      rhConfig: {
        providerContracts: {
          grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
        },
        agentContracts: {
          grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
        },
        phoneSubRefunding: { required, posDecimals, maxValue: maxValue(999) },
        transportSubs: {
          $each: {
            price: { required, posDecimals, maxValue: maxValue(999) }
          }
        }
      }
    }
  },
  mounted () {
    this.company = this.user.company;
    if (!this.company.rhConfig.templates) {
      this.company.rhConfig.templates = {};
    }
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path);
    },
    async updateCompany (event, path) {
      try {
        this.$_.set(this.company, path, event);
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        this.$_.get(this.$v.company, path).$touch();
        if (this.$_.get(this.$v.company, path).$error) {
          return this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        const value = this.$_.get(this.company, path);
        const payload = this.$_.set({}, path, value);
        payload._id = this.company._id;
        await this.$companies.updateById(payload);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      }
    },
    async updateCompanyTransportSubs (event, params) {
      try {
        this.company.rhConfig.transportSubs[params.index].price = event;
        this.$_.get(this.$v.company, params.vuelidatePath).$touch();
        if (this.$_.get(this.$v.company, params.vuelidatePath).$error) {
          return this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        const price = this.company.rhConfig.transportSubs[params.index].price
        if (this.tmpInput === price) return;
        const payload = {
          rhConfig: {
            transportSubs: {
              subId: this.company.rhConfig.transportSubs[params.index]._id,
              price: this.company.rhConfig.transportSubs[params.index].price
            }
          }
        };
        payload._id = this.company._id;
        await this.$companies.updateById(payload);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      }
    },
    nbrError (path) {
      if (!this.$_.get(this.$v.company.rhConfig, path).required) {
        return 'Champ requis';
      } else if (!this.$_.get(this.$v.company.rhConfig, path).numeric) {
        return 'Nombre non valide';
      }
    },
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        this.$refs[refName].reset();
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Fichier trop volumineux (> 5 Mo)',
          position: 'bottom-left',
          timeout: 2500
        });
        return '';
      } else {
        this.$refs[refName].upload();
      }
    },
    async refreshUser () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.$q.notify({
        color: 'positive',
        icon: 'done',
        detail: 'Document envoyé',
        position: 'bottom-left',
        timeout: 2500
      });
      this.company = this.user.company;
    },
    failMsg () {
      this.$q.notify({
        color: 'negative',
        icon: 'warning',
        detail: 'Echec de l\'envoi du document',
        position: 'bottom-left',
        timeout: 2500
      });
    },
    async deleteDocument (driveId, type) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await gdrive.removeFileById({ id: driveId });
        const payload = {
          _id: this.company._id,
          rhConfig: {
            templates: {
              [type]: {
                driveId: null,
                link: null
              }
            }
          }
        };
        await this.$companies.updateById(payload);
        await this.$store.dispatch('main/getUser', this.user._id);
        this.company = this.user.company;
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Document supprimé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return this.$q.notify({
            color: 'positive',
            icon: 'done',
            detail: 'Suppression annulée',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression du document',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  th
    text-align: left

  /deep/ .bg-negative
    background: white !important
    color: inherit !important

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
