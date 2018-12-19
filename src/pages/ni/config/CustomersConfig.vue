<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card style="background: white">
          <q-card-main>
            <q-table :data="services" :columns="columns" hide-bottom binary-state-sort>
              <q-td slot="body-cell-delete" slot-scope="props" :props="props">
                <q-btn flat round small color="grey" icon="delete" @click.native="deleteService(props.value, props.row.__index)" />
              </q-td>
            </q-table>
          </q-card-main>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service" @click="newServiceModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom" v-model="company.name" @focus="saveTmp('name')" @blur="updateCompany('name')" />
          <ni-search-address v-model="company.address.fullAddress" color="white" inverted-light @selected="selectedAddress" :errorLabel="addressError"
            @focus="saveTmp('address.fullAddress')" @blur="updateCompany('address')" :error="$v.company.address.fullAddress.$error"
          />
          <ni-input caption="Numéro ICS" v-model="company.ics" @focus="saveTmp('ics')" @blur="updateCompany('ics')" />
          <ni-input caption="Numéro RCS" v-model="company.rcs" @focus="saveTmp('rcs')" @blur="updateCompany('rcs')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Mandat de prélèvement" path="customersConfig.templates.debitMandate" :entity="company" alt="template mandat prelevement"
              name="debitMandate" @delete="deleteDocument(documents.debitMandate.driveId, 'debitMandate', 'customersConfig')" :upload="uploadDocument"
              @uploaded="documentUploaded" :additionalValue="`modele_mandat_prelevement_${company.name}`" :url="docsUploadUrl"
            />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" :entity="company" alt="template devis"
              name="quote" @delete="deleteDocument(documents.quote.driveId, 'quote', 'customersConfig')" :upload="uploadDocument"
              @uploaded="documentUploaded" :additionalValue="`modele_devis_${company.name}`" :url="docsUploadUrl"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Service modal -->
    <q-modal v-model="newServiceModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="newServiceModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newService.name" :error="$v.newService.name.$error" @blur="$v.newService.name.$touch" />
        <ni-modal-select caption="Nature" v-model="newService.nature" :error="$v.newService.nature.$error" @blur="$v.newService.nature.$touch"
          :options="natureOptions" />
        <ni-modal-input caption="Prix unitaire par défaut TTC" suffix="€" type="number" v-model="newService.defaultUnitAmount"
          :error="$v.newService.defaultUnitAmount.$error" @blur="$v.newService.defaultUnitAmount.$touch"/>
        <ni-modal-input caption="TVA" suffix="%" v-model="newService.vat" type="number" :error="$v.newService.vat.$error" @blur="$v.newService.vat.$touch" />
        <ni-modal-input caption="Majoration dimanche/jours fériés" suffix="%" type="number" v-model="newService.holidaySurcharge" />
        <ni-modal-input caption="Majoration soirée" suffix="%" type="number" v-model="newService.eveningSurcharge" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary" :loading="loading" @click="createNewService" />
    </q-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import ModalInput from '../../../components/form/ModalInput.vue';
import ModalSelect from '../../../components/form/ModalSelect.vue';
import CustomImg from '../../../components/form/CustomImg.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import { configMixin } from '../../../mixins/configMixin';
import Input from '../../../components/form/Input.vue';
import SearchAddress from '../../../components/form/SearchAddress.vue';
import { frAddress } from '../../../helpers/vuelidateCustomVal';

export default {
  name: 'CustomersConfig',
  components: {
    'ni-modal-input': ModalInput,
    'ni-custom-img': CustomImg,
    'ni-file-uploader': FileUploader,
    'ni-modal-select': ModalSelect,
    'ni-input': Input,
    'ni-search-address': SearchAddress,
  },
  mixins: [configMixin],
  data () {
    return {
      loading: false,
      company: null,
      documents: null,
      services: [],
      newServiceModal: false,
      modalCssContainer: {
        minWidth: '30vw'
      },
      newService: {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      },
      natureOptions: [
        { label: 'Horaire', value: 'Horaire' },
        { label: 'Forfaitaire', value: 'Forfaitaire' },
      ],
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          field: 'nature',
          sortable: true,
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire par défaut TTC',
          align: 'center',
          field: row => `${row.defaultUnitAmount}€`,
          sortable: true,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: row => `${row.vat}%`,
          sortable: true,
        },
        {
          name: 'holidaySurcharge',
          label: 'Majoration dimanche/jours fériés',
          align: 'center',
          field: row => row.holidaySurcharge && `${row.holidaySurcharge}%`,
          sortable: true,
        },
        {
          name: 'eveningSurcharge',
          label: 'Majoration soirée',
          align: 'center',
          field: row => row.eveningSurcharge && `${row.eveningSurcharge}%`,
          sortable: true,
        },
        {
          name: 'delete',
          label: '',
          align: 'center',
          field: '_id',
          sortable: true,
        },
      ],
    };
  },
  validations: {
    newService: {
      name: { required },
      nature: { required },
      defaultUnitAmount: { required },
      vat: { required },
    },
    company: {
      ics: { required },
      name: { required },
      rcs: { required },
      address: {
        fullAddress: { required, frAddress },
      },
    },
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    addressError () {
      if (!this.$v.company.address.fullAddress.required) {
        return 'Champ requis';
      }
      return 'Adresse non valide';
    },
  },
  mounted () {
    this.company = this.user.company;
    this.documents = this.company.customersConfig.templates || {};
    this.company.address = this.company.address || {};
    this.refreshServices();
  },
  methods: {
    async refreshServices () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.services = this.user.company.customersConfig.services;
    },
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
      this.documents = this.company.customersConfig.templates || {};
      this.company.address = this.company.address || {};
    },
    selectedAddress (item) {
      this.company.address = Object.assign({}, this.company.address, item);
    },
    saveTmp (path) {
      this.tmpInput = this.company[path];
    },
    async updateCompany (path) {
      try {
        if (this.tmpInput === this.company[path]) return;
        if (this.$v.company[path]) {
          const isValid = await this.waitForValidation(path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = this.company[path];
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
    waitForValidation (path) {
      return new Promise((resolve) => {
        if (path === 'address') {
          const unwatch = this.$watch(() => !this.$v.company.address.$pending, (notPending) => {
            if (notPending) {
              if (unwatch) {
                unwatch();
              }
              this.$v.company.address.fullAddress.$touch();
              resolve(!this.$v.company.address.fullAddress.$error);
            }
          }, { immediate: true });
        } else {
          this.$v.company[path].$touch();
          resolve(!this.$v.company[path].$error);
        }
      })
    },
    async deleteService (serviceId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce service ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        const queries = { id: this.company._id, serviceId };
        await this.$companies.deleteService(queries);
        this.services.splice(cell, 1);
        NotifyPositive('Absence supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    },
    async createNewService () {
      try {
        this.loading = true;
        const payload = this.$_.pickBy(this.newService);
        await this.$companies.createService(this.company._id, payload);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service');
      } finally {
        this.loading = false;
        this.newServiceModal = false;
        this.newService = {
          name: '',
          nature: '',
          defaultUnitAmount: '',
          vat: '',
          holidaySurcharge: '',
          eveningSurcharge: '',
        };
        await this.refreshServices();
        this.$v.newService.$reset();
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-table-container
      box-shadow: none

  /deep/ .bg-negative
    background: white !important
    color: inherit !important

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0
</style>
