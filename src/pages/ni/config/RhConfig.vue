<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration RH</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Heures internes</p>
        <q-card style="background: white">
          <q-table :data="internalHours" :columns="internalHoursColumns" hide-bottom binary-state-sort
            :pagination.sync="pagination" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'default'">
                  <q-checkbox :disable="col.value" :value="col.value"
                    @input="updateDefaultInternalHour(props.row._id)" />
                </template>
                <template v-else-if="col.name === 'actions'">
                  <q-btn :disable="props.row.default" flat round small color="grey" icon="delete"
                    @click="deleteInternalHour(col.value, props.row.__index)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une heure interne"
              @click="newInternalHourModal = true" :disable="internalHours.length >= MAX_INTERNAL_HOURS_NUMBER" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut"
            :error="$v.company.rhConfig.contractWithCompany.grossHourlyRate.$error"
            :error-label="nbrError('contractWithCompany.grossHourlyRate')" type="number"
            v-model="company.rhConfig.contractWithCompany.grossHourlyRate"
            @focus="saveTmp('rhConfig.contractWithCompany.grossHourlyRate')" suffix="€"
            @blur="updateCompany('rhConfig.contractWithCompany.grossHourlyRate')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats mandataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut"
            :error="$v.company.rhConfig.contractWithCustomer.grossHourlyRate.$error"
            :error-label="nbrError('contractWithCustomer.grossHourlyRate')" type="number"
            v-model="company.rhConfig.contractWithCustomer.grossHourlyRate"
            @focus="saveTmp('rhConfig.contractWithCustomer.grossHourlyRate')" suffix="€"
            @blur="updateCompany('rhConfig.contractWithCustomer.grossHourlyRate')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement téléphone</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant du remboursement" :error="$v.company.rhConfig.phoneSubRefunding.$error"
            :error-label="nbrError('phoneSubRefunding')" type="number" v-model="company.rhConfig.phoneSubRefunding"
            @focus="saveTmp('rhConfig.phoneSubRefunding')" suffix="€"
            @blur="updateCompany('rhConfig.phoneSubRefunding')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Taux kilométrique</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant par kilomètre" :error="$v.company.rhConfig.amountPerKm.$error" type="number"
            v-model="company.rhConfig.amountPerKm" @focus="saveTmp('rhConfig.amountPerKm')" suffix="€"
            @blur="updateCompany('rhConfig.amountPerKm')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <template v-for="(transportSub, index) in company.rhConfig.transportSubs">
            <ni-input :caption="transportSub.department" :error="$v.company.rhConfig.transportSubs.$each[index].$error"
              type="number" v-model="company.rhConfig.transportSubs[index].price"
              @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)" suffix="€"
              @blur="updateCompanyTransportSubs({ vuelidatePath: `rhConfig.transportSubs.$each[${index}]`, index })"
              :key="index" />
          </template>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat prestataire" path="rhConfig.templates.contractWithCompany"
              :entity="company" alt="template contrat prestataire" name="contractWithCompany"
              @delete="deleteDocument(company.rhConfig.templates.contractWithCompany.driveId, 'contractWithCompany', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_contrat_prestataire_${company.name}`"
              :url="docsUploadUrl" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat prestataire"
              path="rhConfig.templates.contractWithCompanyVersion" :entity="company" alt="template avenant prestataire"
              name="contractWithCompanyVersion"
              @delete="deleteDocument(company.rhConfig.templates.contractWithCompanyVersion.driveId, 'contractWithCompanyVersion', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_avenant_prestataire_${company.name}`"
              :url="docsUploadUrl" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat mandataire" path="rhConfig.templates.contractWithCustomer"
              :entity="company" alt="template contrat mandataire" name="contractWithCustomer"
              @delete="deleteDocument(company.rhConfig.templates.contractWithCustomer.driveId, 'contractWithCustomer', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_contrat_mandataire_${company.name}`"
              :url="docsUploadUrl" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat mandataire"
              path="rhConfig.templates.contractWithCustomerVersion" :entity="company" alt="template avenant mandataire"
              name="contractWithCustomerVersion"
              @delete="deleteDocument(company.rhConfig.templates.contractWithCustomerVersion.driveId, 'contractWithCustomerVersion', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_avenant_mandataire_${company.name}`"
              :url="docsUploadUrl" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Equipes</p>
        <q-card style="background: white">
          <q-table :data="sectors" :columns="sectorsColumns" hide-bottom binary-state-sort
            :pagination.sync="sectorPagination" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat round small color="grey" icon="edit" @click.native="openEditionModal(col.value._id)" />
                    <q-btn flat round small color="grey" icon="delete" :disable="col.value.auxiliaryCount > 0"
                      @click="deleteSector(col.value._id, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une équipe"
              @click="sectorCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Internal hour creation modal -->
    <q-modal v-model="newInternalHourModal" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer une <span class="text-weight-bold">heure interne</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="newInternalHourModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newInternalHour.name" :error="$v.newInternalHour.name.$error"
          @blur="$v.newInternalHour.name.$touch" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'heure interne" icon-right="add" color="primary"
        :loading="loading" @click="createInternalHour" />
    </q-modal>

    <!-- Sector creation modal -->
    <q-modal v-model="sectorCreationModal" content-classes="modal-container-sm" @hide="resetCreationSectorData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter une <span class="text-weight-bold">équipe</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="sectorCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newSector.name" :error="$v.newSector.name.$error"
          :error-label="nameError($v.newSector)" @blur="$v.newSector.name.$touch" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une équipe" icon-right="add" color="primary"
        :disable="newSector.name === ''" :loading="loading" @click="createNewSector" />
    </q-modal>

    <!-- Sector edition modal -->
    <q-modal v-model="sectorEditionModal" content-classes="modal-container-sm" @hide="resetEditionSectorData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer l'<span class="text-weight-bold">équipe</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="sectorEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="editedSector.name" :error="$v.editedSector.name.$error"
          :error-label="nameError($v.editedSector)" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer l'équipe" icon-right="add" color="primary"
        :disable="isSameThanEditedSector" :loading="loading" @click="updateSector" />
    </q-modal>
  </q-page>
</template>

<script>
import { Cookies } from 'quasar';
import { required, maxValue } from 'vuelidate/lib/validators';

import { posDecimals, sector } from '../../../helpers/vuelidateCustomVal';
import CustomImg from '../../../components/form/CustomImg';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import Input from '../../../components/form/Input.vue';
import ModalInput from '../../../components/form/ModalInput.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import { configMixin } from '../../../mixins/configMixin';
import { REQUIRED_LABEL } from '../../../data/constants';

export default {
  name: 'RhConfig',
  metaInfo: { title: 'Configuration rh' },
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
      pagination: { rowsPerPage: 0 },
      sectors: [],
      sectorsColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name'
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: row => ({ _id: row._id, auxiliaryCount: row.auxiliaryCount })
        }
      ],
      sectorPagination: {
        rowsPerPage: 0,
        sortBy: 'name',
      },
      sectorCreationModal: false,
      newSector: { name: '' },
      sectorEditionModal: false,
      editedSector: { name: '' }
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
    isSameThanEditedSector () {
      return this.tmpInput === this.editedSector.name;
    }
  },
  validations () {
    return {
      company: {
        rhConfig: {
          contractWithCompany: {
            grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
          },
          contractWithCustomer: {
            grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
          },
          phoneSubRefunding: { required, posDecimals, maxValue: maxValue(999) },
          amountPerKm: { required },
          transportSubs: {
            $each: {
              price: { required, posDecimals, maxValue: maxValue(999) }
            },
          },
        },
      },
      newInternalHour: {
        name: { required },
      },
      newSector: {
        name: { required, sector }
      },
      editedSector: {
        name: { required, sector }
      }
    }
  },
  async mounted () {
    this.company = this.$_.cloneDeep(this.user.company);
    if (!this.company.rhConfig.templates) {
      this.company.rhConfig.templates = {};
    }
    this.internalHours = this.company.rhConfig && this.company.rhConfig.internalHours ? this.company.rhConfig.internalHours : [];
    await this.getSectors();
    this.$v.company.$touch();
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
          return NotifyWarning('Champ(s) invalide(s)');
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
        return REQUIRED_LABEL;
      } else if (!this.$_.get(this.$v.company.rhConfig, path).numeric) {
        return 'Nombre non valide';
      }
    },
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
    },
    // Internal hours
    async refreshInternalHours () {
      this.internalHours = await this.$companies.getInternalHours(this.company._id);
    },
    async createInternalHour () {
      try {
        this.$v.newInternalHour.$touch();
        if (this.$v.newInternalHour.$error) return;

        this.loading = true;
        if (!this.internalHours || this.internalHours.length === 0) this.newInternalHour.default = true;
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
      const params = { id: this.company._id };
      if (defaultInternalHour) {
        params.internalHourId = defaultInternalHour._id;
        await this.$companies.updateInternalHour(params, { default: false });
      }

      params.internalHourId = internalHourId;
      await this.$companies.updateInternalHour(params, { default: true });
      await this.refreshInternalHours();
    },
    // Sectors
    async getSectors () {
      try {
        this.sectors = await this.$sectors.showAll({ company: this.company._id });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des équipes.')
      }
    },
    async createNewSector () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.newSector.name);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        this.newSector.company = this.company._id;
        await this.$sectors.create(this.newSector);
        NotifyPositive('Equipe créée.');
        this.resetCreationSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la création de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetCreationSectorData () {
      this.sectorCreationModal = false
      this.newSector = { name: '' };
      this.$v.newSector.$reset();
    },
    openEditionModal (id) {
      const selectedSector = this.sectors.find(sector => sector._id === id);
      this.editedSector = { _id: selectedSector._id, name: selectedSector.name };
      this.tmpInput = this.editedSector.name;
      this.sectorEditionModal = true;
    },
    async updateSector () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.editedSector.name);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        await this.$sectors.updateById(this.editedSector._id, { name: this.editedSector.name });
        NotifyPositive('Equipe modifiée.');
        this.resetEditionSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetEditionSectorData () {
      this.sectorEditionModal = false;
      this.editedSector = { name: '' };
      this.$v.editedSector.$reset();
    },
    async deleteSector (sectorId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette équipe ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        await this.$sectors.deleteById(sectorId);
        this.sectors.splice(cell, 1);
        NotifyPositive('Equipe supprimée.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative("Erreur lors de la suppression de l'équipe.");
      }
    },
    nameError (obj) {
      if (!obj.name.required) {
        return REQUIRED_LABEL;
      } else if (!obj.name.sector) {
        return 'Nom déjà existant';
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
