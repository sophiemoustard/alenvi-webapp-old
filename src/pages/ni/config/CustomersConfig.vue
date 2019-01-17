<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card style="background: white">
          <q-card-main>
            <q-table :data="services" :columns="serviceColumns" hide-bottom binary-state-sort :pagination.sync="pagination" :visibleColumns="visibleColumns">
              <q-td slot="body-cell-history" slot-scope="props" :props="props" class="action-column">
                <q-btn flat round small color="grey" icon="history" @click.native="showHistory(props.value)" />
              </q-td>
              <q-td slot="body-cell-edit" slot-scope="props" :props="props" class="action-column">
                <q-btn flat round small color="grey" icon="edit" @click.native="startEdition(props.value)" />
              </q-td>
              <q-td slot="body-cell-delete" slot-scope="props" :props="props" class="action-column">
                <q-btn disable flat round small color="grey" icon="delete" @click="deleteService(props.value, props.row.__index)" />
              </q-td>
            </q-table>
          </q-card-main>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service" @click="serviceCreationModal = true" />
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
              name="debitMandate" @delete="deleteDocument(documents.debitMandate.driveId, 'debitMandate', 'customersConfig')"
              @uploaded="documentUploaded" :additionalValue="`modele_mandat_prelevement_${company.name}`" :url="docsUploadUrl"
            />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" :entity="company" alt="template devis"
              name="quote" @delete="deleteDocument(documents.quote.driveId, 'quote', 'customersConfig')"
              @uploaded="documentUploaded" :additionalValue="`modele_devis_${company.name}`" :url="docsUploadUrl"
            />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Tiers payeurs</p>
        <q-card style="background: white">
          <q-card-main>
            <q-table :data="thirdPartyPayersList" :columns="thirdPartyPayersColumns" hide-bottom binary-state-sort :pagination.sync="pagination">
              <q-td slot="body-cell-identity" slot-scope="props" :props="props">
                <q-item>
                  <q-item-side :avatar="getAvatar(props.value.logo)" />
                  <q-item-main :label="props.value.name" />
                </q-item>
              </q-td>
              <q-td slot="body-cell-delete" slot-scope="props" :props="props" class="action-column">
                <q-btn flat round small color="grey" icon="delete" @click="deleteThirdPartyPayer(props.value, props.row.__index)" />
              </q-td>
              <q-td slot="body-cell-edit" slot-scope="props" :props="props" class="action-column">
                <q-btn flat round small color="grey" icon="edit" @click="openThirdPartyPayerEditionModal(props.value)" />
              </q-td>
            </q-table>
          </q-card-main>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un tiers payeur" @click="thirdPartyPayerCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Service creation modal -->
    <q-modal v-model="serviceCreationModal" :content-css="modalCssContainer" @hide="resetCreationServiceData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="serviceCreationModal = false" /></span>
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
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary" :loading="loading" @click="createNewService"
        :disable="disableCreationButton" />
    </q-modal>

    <!-- Service edition modal -->
    <q-modal v-model="serviceEditionModal" :content-css="modalCssContainer" @hide="resetEditionServiceData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Éditer un <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="serviceEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-datetime-picker caption="Date d'effet" v-model="editedService.startDate" :error="$v.editedService.startDate.$error"
          @blur="$v.editedService.startDate.$touch" :min="minStartDate" />
        <ni-modal-input caption="Nom" v-model="editedService.name" :error="$v.editedService.name.$error" @blur="$v.editedService.name.$touch" />
        <ni-modal-input caption="Prix unitaire par défaut TTC" suffix="€" type="number" v-model="editedService.defaultUnitAmount"
          :error="$v.editedService.defaultUnitAmount.$error" @blur="$v.editedService.defaultUnitAmount.$touch"/>
        <ni-modal-input caption="TVA" suffix="%" v-model="editedService.vat" type="number" :error="$v.editedService.vat.$error" @blur="$v.editedService.vat.$touch" />
        <ni-modal-input caption="Majoration dimanche/jours fériés" suffix="%" type="number" v-model="editedService.holidaySurcharge" />
        <ni-modal-input caption="Majoration soirée" suffix="%" type="number" v-model="editedService.eveningSurcharge" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="add" color="primary" :loading="loading" @click="updateService"
        :disable="disableEditionButton" />
    </q-modal>

    <!-- Service history modal -->
    <q-modal v-model="serviceHistoryModal" :content-css="modalCssContainer" @hide="resetServiceHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique du service <span class="text-weight-bold">{{selectedService.name}}</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="serviceHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl" :data="selectedService.versions" :columns="serviceColumns" hide-bottom binary-state-sort :pagination.sync="paginationHistory"
          :visibleColumns="visibleHistoryColumns" />
      </div>
    </q-modal>

    <!-- Third party payers creation modal -->
    <q-modal v-model="thirdPartyPayerCreationModal" :content-css="modalCssContainer" @hide="resetThirdPartyPayerEditionData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter un <span class="text-weight-bold">tiers payeur</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="thirdPartyPayerCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newThirdPartyPayer.name" :error="$v.newThirdPartyPayer.name.$error" @blur="$v.newThirdPartyPayer.name.$touch"
          requiredField />
        <ni-search-address v-model="newThirdPartyPayer.address.fullAddress" @selected="selectedThirdPartyPayerAddress" error-label="Adresse invalide" inModal
          @blur="$v.newThirdPartyPayer.address.fullAddress.$touch" :error="$v.newThirdPartyPayer.address.fullAddress.$error"
          />
        <ni-modal-input caption="Email" v-model.trim="newThirdPartyPayer.email" />
        <ni-modal-input caption="Prix unitaire TTC par défaut" suffix="€" type="number" v-model="newThirdPartyPayer.unitTTCPrice"
          :error="$v.newThirdPartyPayer.unitTTCPrice.$error" error-label="Le prix unitaire doit être positif"/>
        <ni-modal-select v-model="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation" :filter="false" />
        <ni-image-uploader caption="Logo" path="logo" :entity="newThirdPartyPayer" alt="logo" name="picture"
          :url="logoUploadUrl" @uploaded="imageUploaded($event, 'create')" :additional-fields="thirdPartyPayersAddFields" withBorders
          @delete="deleteImageById(newThirdPartyPayer.logo.publicId)" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary" :loading="loading"
        @click="createNewThirdPartyPayer" />
    </q-modal>

    <!-- Third party payers edition modal -->
    <q-modal v-model="thirdPartyPayerEditionModal" :content-css="modalCssContainer" @hide="resetThirdPartyPayerUpdateModalData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer un <span class="text-weight-bold">tiers payeur</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="thirdPartyPayerEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="editedThirdPartyPayer.name" :error="$v.editedThirdPartyPayer.name.$error"
          @blur="$v.editedThirdPartyPayer.name.$touch" requiredField />
        <ni-search-address v-model="editedThirdPartyPayer.address.fullAddress" @selected="selectedThirdPartyPayerAddress" error-label="Adresse invalide"
          @blur="$v.editedThirdPartyPayer.address.fullAddress.$touch" :error="$v.editedThirdPartyPayer.address.fullAddress.$error" inModal
          />
        <ni-modal-input caption="Email" v-model.trim="editedThirdPartyPayer.email" />
        <ni-modal-input caption="Prix unitaire TTC par défaut" suffix="€" type="number" v-model="editedThirdPartyPayer.unitTTCPrice"
          :error="$v.editedThirdPartyPayer.unitTTCPrice.$error" error-label="Le prix unitaire doit être positif"/>
        <ni-modal-select v-model="editedThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation" :filter="false" />
        <ni-image-uploader caption="Logo" path="logo" :entity="editedThirdPartyPayer" alt="logo" name="picture" @uploaded="imageUploaded($event, 'update')"
          :url="logoUploadUrl" :additional-fields="thirdPartyPayersAddFields" @delete="deleteImageById(editedThirdPartyPayer.logo.publicId)" withBorders />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer le tiers payeur" icon-right="add" color="primary" :loading="loading" @click="updateThirdPartyPayer" />
    </q-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import ModalInput from '../../../components/form/ModalInput.vue';
import ModalSelect from '../../../components/form/ModalSelect.vue';
import ModalDatetimePicker from '../../../components/form/ModalDatetimePicker.vue';
import CustomImg from '../../../components/form/CustomImg.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import ImageUploader from '../../../components/form/ImageUploader.vue';
import { configMixin } from '../../../mixins/configMixin';
import Input from '../../../components/form/Input.vue';
import SearchAddress from '../../../components/form/SearchAddress.vue';
import { frAddress, posDecimals } from '../../../helpers/vuelidateCustomVal';
import cloudinary from '../../../api/Cloudinary.js';

export default {
  name: 'CustomersConfig',
  components: {
    'ni-modal-input': ModalInput,
    'ni-custom-img': CustomImg,
    'ni-file-uploader': FileUploader,
    'ni-image-uploader': ImageUploader,
    'ni-modal-select': ModalSelect,
    'ni-input': Input,
    'ni-search-address': SearchAddress,
    'ni-modal-datetime-picker': ModalDatetimePicker,
  },
  mixins: [configMixin],
  data () {
    return {
      loading: false,
      company: null,
      documents: null,
      services: [],
      serviceCreationModal: false,
      serviceEditionModal: false,
      serviceHistoryModal: false,
      selectedService: [],
      modalCssContainer: { minWidth: '30vw' },
      newService: {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      },
      editedService: {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      },
      natureOptions: [
        { label: 'Horaire', value: 'Horaire' },
        { label: 'Forfaitaire', value: 'Forfaitaire' },
      ],
      visibleColumns: ['name', 'nature', 'defaultUnitAmount', 'vat', 'holidaySurcharge', 'eveningSurcharge', 'delete', 'edit', 'history'],
      visibleHistoryColumns: ['startDate', 'name', 'defaultUnitAmount', 'vat', 'holidaySurcharge', 'eveningSurcharge'],
      serviceColumns: [
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: row => row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          field: 'nature'
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire par défaut TTC',
          align: 'center',
          field: row => `${row.defaultUnitAmount}€`,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: row => `${row.vat}%`,
        },
        {
          name: 'holidaySurcharge',
          label: 'Majoration dimanche/jours fériés',
          align: 'center',
          field: row => row.holidaySurcharge && `${row.holidaySurcharge}%`,
        },
        {
          name: 'eveningSurcharge',
          label: 'Majoration soirée',
          align: 'center',
          field: row => row.eveningSurcharge && `${row.eveningSurcharge}%`,
        },
        {
          name: 'history',
          label: '',
          align: 'center',
          field: '_id',
        },
        {
          name: 'edit',
          label: '',
          align: 'center',
          field: '_id',
        },
        {
          name: 'delete',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      thirdPartyPayers: [],
      thirdPartyPayersColumns: [
        {
          name: 'identity',
          label: 'Nom',
          field: 'identity',
          align: 'left',
          sortable: true
        },
        {
          name: 'address',
          label: 'Adresse',
          align: 'left',
          field: row => row.address.fullAddress
        },
        {
          name: 'email',
          label: 'Email',
          field: 'email',
          align: 'left'
        },
        {
          name: 'unitTTCprice',
          label: 'Prix unitaire TTC par défaut',
          field: 'unitTTCPrice',
          format: val => val ? `${val}€` : '',
          align: 'left'
        },
        {
          name: 'billingMode',
          label: 'Facturation (directe/indirecte)',
          field: 'billingMode',
          align: 'left'
        },
        {
          name: 'edit',
          label: '',
          align: 'center',
          field: '_id',
        },
        {
          name: 'delete',
          label: '',
          align: 'center',
          field: '_id',
        }
      ],
      thirdPartyPayerCreationModal: false,
      newThirdPartyPayer: {
        name: '',
        email: '',
        address: {},
        unitTTCPrice: '',
        logo: {},
        billingMode: ''
      },
      billingModeOptions: [
        { label: 'Indirecte', value: 'indirecte' },
        { label: 'Directe', value: 'directe' },
      ],
      thirdPartyPayerEditionModal: false,
      editedThirdPartyPayer: {
        address: {},
        logo: {}
      },
      pagination: { rowsPerPage: 0 },
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
    };
  },
  validations: {
    newService: {
      name: { required },
      nature: { required },
      defaultUnitAmount: { required },
      vat: { required },
    },
    editedService: {
      name: { required },
      startDate: { required },
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
    newThirdPartyPayer: {
      name: { required },
      address: {
        fullAddress: { frAddress }
      },
      unitTTCPrice: { posDecimals }
    },
    editedThirdPartyPayer: {
      name: { required },
      address: {
        fullAddress: { frAddress }
      },
      unitTTCPrice: { posDecimals }
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    logoUploadUrl () {
      return `${process.env.API_HOSTNAME}/cloudinary/image/upload`;
    },
    addressError () {
      return !this.$v.company.address.fullAddress.required ? 'Champ requis' : 'Adresse non valide';
    },
    disableEditionButton () {
      return !this.editedService.name || !this.editedService.startDate || !this.editedService.defaultUnitAmount || !this.editedService.vat;
    },
    disableCreationButton () {
      return !this.newService.name || !this.newService.nature || !this.newService.defaultUnitAmount || !this.newService.vat;
    },
    thirdPartyPayersAddFields () {
      return [
        { name: 'role', value: 'ThirdPartyPayers' },
        { name: 'fileName', value: `logo_${this.newThirdPartyPayer.name}` }
      ];
    },
    thirdPartyPayersList () {
      return this.thirdPartyPayers.map(thirdPartyPayer => {
        const { address, email, unitTTCPrice, billingMode, name, logo } = thirdPartyPayer;
        return {
          _id: thirdPartyPayer._id,
          identity: {
            name,
            logo: logo && logo.link ? logo.link : null
          },
          address,
          email,
          unitTTCPrice,
          billingMode
        }
      });
    },
    minStartDate () {
      const selectedService = this.services.find(ser => ser._id === this.editedService._id);
      return selectedService ? this.$moment(selectedService.startDate).add(1, 'd').toISOString() : '';
    },
  },
  mounted () {
    this.company = this.user.company;
    this.documents = this.company.customersConfig.templates || {};
    this.company.address = this.company.address || {};
    this.refreshServices();
    this.refreshThirdPartyPayers();
  },
  methods: {
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    },
    selectedAddress (item) {
      this.company.address = Object.assign({}, this.company.address, item);
    },
    selectedThirdPartyPayerAddress (item) {
      this.newThirdPartyPayer.address = Object.assign({}, this.newThirdPartyPayer.address, this.$_.omit(item, ['location']));
    },
    saveTmp (path) {
      this.tmpInput = this.company[path];
    },
    // Refresh data
    async refreshServices () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.services = this.user.company.customersConfig.services.map(service => ({
        ...this.getServiceLastVersion(service),
        ...service,
      }));
    },
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
      this.documents = this.company.customersConfig.templates || {};
      this.company.address = this.company.address || {};
    },
    async refreshThirdPartyPayers () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.thirdPartyPayers = this.user.company.customersConfig.thirdPartyPayers;
    },
    // Company
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
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
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
              resolve(!this.$v.company.address.fullAddress.$error);
            }
          }, { immediate: true });
        } else {
          this.$_.get(this.$v.company, path).$touch();
          resolve(!this.$_.get(this.$v.company, path).$error);
        }
      })
    },
    // Services
    formatCreatedService () {
      const { nature, name, defaultUnitAmount, vat, eveningSurcharge, holidaySurcharge } = this.newService;
      const formattedService = { nature, versions: [{ name, defaultUnitAmount, vat }] }

      if (eveningSurcharge) formattedService.versions[0].eveningSurcharge = eveningSurcharge;
      if (holidaySurcharge) formattedService.versions[0].holidaySurcharge = holidaySurcharge;

      return formattedService;
    },
    resetCreationServiceData () {
      this.serviceCreationModal = false;
      this.newService = {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      };
      this.$v.newService.$reset();
    },
    async createNewService () {
      try {
        if (this.$v.newService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedService();
        await this.$companies.createService(this.company._id, payload);
        NotifyPositive('Service créé.');
        this.resetCreationServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service.');
      } finally {
        this.loading = false;
      }
    },
    startEdition (id) {
      const selectedService = this.services.find(service => service._id === id);
      const { name, defaultUnitAmount, vat, holidaySurcharge, eveningSurcharge } = selectedService;
      this.editedService = {
        _id: selectedService._id,
        name: name || '',
        startDate: '',
        defaultUnitAmount: defaultUnitAmount || '',
        vat: vat || '',
        holidaySurcharge: holidaySurcharge || '',
        eveningSurcharge: eveningSurcharge || '',
      };

      this.serviceEditionModal = true;
    },
    resetEditionServiceData () {
      this.serviceEditionModal = false;
      this.editedService = {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      };
      this.$v.editedService.$reset();
    },
    async updateService () {
      try {
        if (this.$v.editedService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const serviceId = this.editedService._id;
        const payload = this.$_.pickBy(this.editedService);
        delete payload._id;
        await this.$companies.updateService({ id: this.company._id, serviceId }, payload);
        NotifyPositive('Service modifié');
        this.resetEditionServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification du service');
      } finally {
        this.loading = false;
      }
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
        NotifyPositive('Service supprimé.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    },
    showHistory (id) {
      this.selectedService = this.services.find(ser => ser._id === id);
      this.serviceHistoryModal = true;
    },
    resetServiceHistoryData () {
      this.serviceHistoryModal = false;
      this.selectedService = [];
    },
    // Third party payers
    openThirdPartyPayerEditionModal (thirdPartyPayerId) {
      this.thirdPartyPayerEditionModal = true;
      const currentThirdPartyPayer = this.thirdPartyPayers.find(thirdPartyPayer => thirdPartyPayer._id === thirdPartyPayerId);
      const { name, address, email, unitTTCPrice, billingMode, logo } = currentThirdPartyPayer;
      this.editedThirdPartyPayer = {
        _id: currentThirdPartyPayer._id,
        name,
        address,
        email,
        unitTTCPrice,
        billingMode,
        logo
      };
    },
    resetThirdPartyPayerEditionData () {
      this.$v.newThirdPartyPayer.$reset();
      this.newThirdPartyPayer = {
        name: '',
        email: '',
        address: {},
        unitTTCPrice: '',
        logo: {},
        billingMode: ''
      }
    },
    async createNewThirdPartyPayer () {
      try {
        if (this.$v.newThirdPartyPayer.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.$_.pickBy(this.newThirdPartyPayer);
        await this.$companies.createThirdPartyPayer(this.company._id, payload);
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur créé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du tiers payeur.');
      } finally {
        this.thirdPartyPayerCreationModal = false;
        this.loading = false;
      }
    },
    resetThirdPartyPayerUpdateModalData () {
      this.$v.editedThirdPartyPayer.$reset();
      this.editedThirdPartyPayer = {
        logo: {},
        address: {}
      }
    },
    async updateThirdPartyPayer () {
      try {
        if (this.$v.editedThirdPartyPayer.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const thirdPartyPayerId = this.editedThirdPartyPayer._id;
        delete this.editedThirdPartyPayer._id;
        const payload = this.$_.pickBy(this.editedThirdPartyPayer);
        await this.$companies.updateThirdPartyPayer({ id: this.company._id, thirdPartyPayerId }, payload);
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur modifié.');
      } catch (e) {
        NotifyNegative('Erreur lors de la modification du tiers payeur.');
        console.error(e);
      } finally {
        this.loading = false;
        this.thirdPartyPayerEditionModal = false;
      }
    },
    async deleteThirdPartyPayer (thirdPartyPayerId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce tiers payeur ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        const queries = { id: this.company._id, thirdPartyPayerId };
        await this.$companies.deleteThirdPartyPayer(queries);
        this.thirdPartyPayers.splice(cell, 1);
        NotifyPositive('Tiers payeur supprimé.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée')
        NotifyNegative('Erreur lors de la suppression du tiers payeur.');
      }
    },
    // Image
    async deleteImageById (imageId) {
      try {
        await cloudinary.deleteImageById({ id: imageId });
        this.newThirdPartyPayer.logo = {};
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'image');
      }
    },
    imageUploaded (data, type) {
      const response = JSON.parse(data.xhr.response);
      switch (type) {
        case 'create':
          this.newThirdPartyPayer.logo = {
            publicId: response.data.picture.public_id,
            link: response.data.picture.secure_url
          };
          break;
        case 'update':
          this.editedThirdPartyPayer.logo = {
            publicId: response.data.picture.public_id,
            link: response.data.picture.secure_url
          };
          break;
        default:
          break;
      }
    },
    getAvatar (link) {
      return link || 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';
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

  .action-column
    padding-left: 0px
    padding-right: 0px
</style>
