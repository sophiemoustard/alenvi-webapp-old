<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <div class="q-mb-xl">
        <p class="text-weight-bold">Heures internes</p>
        <q-card style="background: white">
          <q-table :data="internalHours" :columns="internalHoursColumns" hide-bottom binary-state-sort :pagination.sync="pagination" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'default'">
                  <q-checkbox :disable="col.value" :value="col.value" @input="updateDefaultInternalHour(props.row._id)" />
                </template>
                <template v-else-if="col.name === 'actions'">
                  <q-btn :disable="props.row.default" flat round small color="grey" icon="delete" @click="deleteInternalHour(col.value, props.row.__index)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une heure interne" @click="newInternalHourModal = true"
              :disable="internalHours.length >= MAX_INTERNAL_HOURS_NUMBER" />
          </q-card-actions>
        </q-card>
      </div>
      <h4>Configuration RH</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut" :error="$v.company.rhConfig.providerContracts.grossHourlyRate.$error"
            :error-label="nbrError('providerContracts.grossHourlyRate')" type="number" v-model="company.rhConfig.providerContracts.grossHourlyRate"
            @focus="saveTmp('rhConfig.providerContracts.grossHourlyRate')" suffix="€" @blur="updateCompany('rhConfig.providerContracts.grossHourlyRate')"
          />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats mandataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut" :error="$v.company.rhConfig.agentContracts.grossHourlyRate.$error"
            :error-label="nbrError('agentContracts.grossHourlyRate')" type="number" v-model="company.rhConfig.agentContracts.grossHourlyRate"
            @focus="saveTmp('rhConfig.agentContracts.grossHourlyRate')" suffix="€" @blur="updateCompany('rhConfig.agentContracts.grossHourlyRate')"
          />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement téléphone</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant du remboursement" :error="$v.company.rhConfig.phoneSubRefunding.$error" :error-label="nbrError('phoneSubRefunding')"
            type="number" v-model="company.rhConfig.phoneSubRefunding" @focus="saveTmp('rhConfig.phoneSubRefunding')" suffix="€"
            @blur="updateCompany('rhConfig.phoneSubRefunding')"
          />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <template v-for="(transportSub, index) in company.rhConfig.transportSubs">
            <ni-input :caption="transportSub.department" :error="$v.company.rhConfig.transportSubs.$each[index].$error"
              type="number" v-model="company.rhConfig.transportSubs[index].price" @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)" suffix="€"
              @blur="updateCompanyTransportSubs({ vuelidatePath: `rhConfig.transportSubs.$each[${index}]`, index })" :key="index"
            />
          </template>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat" path="rhConfig.templates.contract" :entity="company" alt="template contrat"
              name="contract" @delete="deleteDocument(company.rhConfig.templates.contract.driveId, 'contract', 'rhConfig')"
              @uploaded="documentUploaded" :additionalValue="`modele_contrat_${company.name}`" :url="docsUploadUrl"
            />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat" path="rhConfig.templates.amendment" :entity="company" alt="template avenant"
              name="amendment" @delete="deleteDocument(company.rhConfig.templates.amendment.driveId, 'amendment', 'rhConfig')"
              @uploaded="documentUploaded" :additionalValue="`modele_avenant_${company.name}`" :url="docsUploadUrl"
            />
          </div>
        </div>
      </div>
    </div>

     <!-- Service modal -->
    <q-modal v-model="newInternalHourModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">heure interne</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="newInternalHourModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newInternalHour.name" :error="$v.newInternalHour.name.$error" @blur="$v.newInternalHour.name.$touch" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'heure interne" icon-right="add" color="primary" :loading="loading" @click="createInternalHour" />
    </q-modal>
  </q-page>
</template>

<script>
import { Cookies } from 'quasar';
import { required, maxValue } from 'vuelidate/lib/validators';

import { posDecimals } from '../../../helpers/vuelidateCustomVal';
import CustomImg from '../../../components/form/CustomImg';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import Input from '../../../components/form/Input.vue';
import ModalInput from '../../../components/form/ModalInput.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import { configMixin } from '../../../mixins/configMixin';

export default {
  name: 'RhConfig',
  components: {
    'ni-custom-img': CustomImg,
    'ni-input': Input,
    'ni-modal-input': ModalInput,
    'ni-file-uploader': FileUploader,
  },
  mixins: [configMixin],
  data () {
    return {
      MAX_INTERNAL_HOURS_NUMBER: 9,
      company: null,
      tmpInput: '',
      internalHours: [],
      internalHoursColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'default',
          label: 'Type par défaut',
          align: 'left',
          field: 'default',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
          sortable: true,
        },
      ],
      newInternalHourModal: false,
      newInternalHour: { name: '' },
      loading: false,
      modalCssContainer: { minWidth: '30vw' },
      pagination: { rowsPerPage: 0 },
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
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
          },
        },
      },
    },
    newInternalHour: {
      name: { required },
    }
  },
  mounted () {
    this.company = this.user.company;
    if (!this.company.rhConfig.templates) {
      this.company.rhConfig.templates = {};
    }
    this.internalHours = this.company.rhConfig && this.company.rhConfig.internalHours ? this.company.rhConfig.internalHours : [];
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path);
    },
    async updateCompany (path) {
      try {
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        this.$_.get(this.$v.company, path).$touch();
        if (this.$_.get(this.$v.company, path).$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = this.$_.get(this.company, path);
        const payload = this.$_.set({}, path, value);
        payload._id = this.company._id;
        await this.$companies.updateById(payload);
        NotifyPositive('Modification enregistrée');
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
        this.tmpInput = '';
      }
    },
    async updateCompanyTransportSubs (params) {
      try {
        this.$_.get(this.$v.company, params.vuelidatePath).$touch();
        if (this.$_.get(this.$v.company, params.vuelidatePath).$error) {
          NotifyWarning('Champ(s) invalide(s)');
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
        NotifyPositive('Modification enregistrée');
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
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
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
    },
    async refreshInternalHours () {
      this.internalHours = await this.$companies.getInternalHours(this.company._id);
    },
    async createInternalHour () {
      try {
        this.$v.newInternalHour.$touch();
        if (this.$v.newInternalHour.$error) return;

        this.loading = true;
        const payload = this.$_.pickBy(this.newInternalHour);
        await this.$companies.createInternalHour(this.company._id, payload);
        NotifyPositive('Heure interne créée');

        this.newInternalHourModal = false;
        this.newInternalHour = { name: '' };
        await this.refreshInternalHours();
        this.$v.newInternalHour.$reset();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'heure interne');
      } finally {
        this.loading = false;
      }
    },
    async deleteInternalHour (internalHourId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette heure interne ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        const queries = { id: this.company._id, internalHourId };
        await this.$companies.deleteInternalHour(queries);
        this.internalHours.splice(cell, 1);
        NotifyPositive('Heure interne supprimée.');
      } catch (e) {
        console.error(e);

        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression d\'une heure interne.');
      }
    },
    async updateDefaultInternalHour (internalHourId) {
      const defaultInternalHour = this.internalHours.find(internalHour => internalHour.default);
      const params = { id: this.company._id, internalHourId: defaultInternalHour._id };
      await this.$companies.updateInternalHour(params, { default: false });

      params.internalHourId = internalHourId;
      await this.$companies.updateInternalHour(params, { default: true });
      await this.refreshInternalHours();
    },
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-table-container
      box-shadow: none

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
