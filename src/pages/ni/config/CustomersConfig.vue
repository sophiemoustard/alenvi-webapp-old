<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Plans de majoration</p>
        <q-card style="background: white">
          <q-table :data="surcharges" :columns="surchargeColumns" hide-bottom binary-state-sort :pagination.sync="pagination" :visible-columns="visibleColumnsSurcharges"
            class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn flat round small color="grey" icon="edit" @click.native="initSurchargeEdition(col.value)" />
                    <q-btn disable flat round small color="grey" icon="delete" @click="deleteSurcharge(col.value, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un plan de majoration" @click="surchargeCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card style="background: white">
          <q-table :data="services" :columns="serviceColumns" hide-bottom binary-state-sort :pagination.sync="pagination" :visible-columns="visibleColumnsServices"
            class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn flat round small color="grey" icon="history" @click.native="showHistory(col.value)" />
                    <q-btn flat round small color="grey" icon="edit" @click.native="initServiceEdition(col.value)" />
                    <q-btn disable flat round small color="grey" icon="delete" @click="deleteService(col.value, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service" @click="serviceCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom" v-model="company.name" @focus="saveTmp('name')" @blur="updateCompany('name')" />
          <ni-search-address v-model="company.address.fullAddress" color="white" inverted-light @selected="selectedAddress" :error-label="addressError"
            @focus="saveTmp('address.fullAddress')" @blur="updateCompany('address.fullAddress')" :error="$v.company.address.fullAddress.$error"
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
              @uploaded="documentUploaded" :additional-value="`modele_mandat_prelevement_${company.name}`" :url="docsUploadUrl"
            />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" :entity="company" alt="template devis"
              name="quote" @delete="deleteDocument(documents.quote.driveId, 'quote', 'customersConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_devis_${company.name}`" :url="docsUploadUrl"
            />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Tiers payeurs</p>
        <q-card style="background: white">
          <q-table :data="thirdPartyPayers" :columns="thirdPartyPayersColumns" hide-bottom binary-state-sort :pagination.sync="pagination"
            class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
                <template v-if="col.name === 'billingMode'">
                  <div class="capitalize">{{ col.value }}</div>
                </template>
                <template v-else-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn :disable="isTppUsedInFundings(props.row.__index)" flat round small color="grey" icon="delete" @click="deleteThirdPartyPayer(col.value, props.row.__index)" />
                    <q-btn flat round small color="grey" icon="edit" @click="openThirdPartyPayerEditionModal(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value}}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un tiers payeur" @click="thirdPartyPayerCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Surcharge creation modal -->
    <q-modal v-model="surchargeCreationModal" content-classes="modal-container-sm" @hide="resetCreationSurchargeData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">plan de majoration</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="surchargeCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newSurcharge.name" :error="$v.newSurcharge.name.$error" @blur="$v.newSurcharge.name.$touch" />
        <ni-modal-input caption="Majoration samedis" suffix="%" type="number" v-model="newSurcharge.saturdays"
          :error="$v.newSurcharge.saturdays.$error" @blur="$v.newSurcharge.saturdays.$touch" />
        <ni-modal-input caption="Majoration dimanches" suffix="%" type="number" v-model="newSurcharge.sundays"
          :error="$v.newSurcharge.sundays.$error" @blur="$v.newSurcharge.sundays.$touch" />
        <ni-modal-input caption="Majoration jours fériés" suffix="%" type="number" v-model="newSurcharge.publicHolidays"
          :error="$v.newSurcharge.publicHolidays.$error" @blur="$v.newSurcharge.publicHolidays.$touch" />
        <ni-modal-input caption="Majoration noëls" suffix="%" type="number" v-model="newSurcharge.christmas"
          :error="$v.newSurcharge.christmas.$error" @blur="$v.newSurcharge.christmas.$touch" />
        <ni-modal-input caption="Majoration fête du travail" suffix="%" type="number" v-model="newSurcharge.laborDay"
          :error="$v.newSurcharge.laborDay.$error" @blur="$v.newSurcharge.laborDay.$touch" />
        <ni-modal-input caption="Majoration soirs" suffix="%" type="number" v-model="newSurcharge.evenings"
          :error="$v.newSurcharge.evenings.$error" @blur="$v.newSurcharge.evenings.$touch" />
        <ni-datetime-picker caption="Heure d'effet" v-model="newSurcharge.eveningsStartTime" :error="$v.newSurcharge.eveningsStartTime.$error"
          @blur="$v.newSurcharge.eveningsStartTime.$touch" in-modal type="time"/>
        <ni-datetime-picker caption="Heure de fin" v-model="newSurcharge.eveningsEndTime" :error="$v.newSurcharge.eveningsEndTime.$error"
          @blur="$v.newSurcharge.eveningsEndTime.$touch" in-modal type="time"/>
        <ni-modal-input caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.customs"
          :error="$v.newSurcharge.customs.$error" @blur="$v.newSurcharge.customs.$touch" />
        <ni-datetime-picker caption="Heure d'effet" v-model="newSurcharge.customsStartTime" :error="$v.newSurcharge.customsStartTime.$error"
          @blur="$v.newSurcharge.customsStartTime.$touch" in-modal type="time"/>
        <ni-datetime-picker caption="Heure de fin" v-model="newSurcharge.customsEndTime" :error="$v.newSurcharge.customsEndTime.$error"
          @blur="$v.newSurcharge.customsEndTime.$touch" in-modal type="time"/>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le plan de majoration" icon-right="add" color="primary" :loading="loading" @click="createNewSurcharge"
        :disable="$v.newSurcharge.$error" />
    </q-modal>

    <!-- Surcharge edition modal -->
    <q-modal v-model="surchargeEditionModal" content-classes="modal-container-sm" @hide="resetEditionSurchargeData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Éditer le <span class="text-weight-bold">plan de majoration</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="surchargeEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="editedSurcharge.name" :error="$v.editedSurcharge.name.$error" @blur="$v.editedSurcharge.name.$touch" />
        <ni-modal-input caption="Majoration samedis" suffix="%" type="number" v-model="editedSurcharge.saturdays"
          :error="$v.editedSurcharge.saturdays.$error" @blur="$v.editedSurcharge.saturdays.$touch" />
        <ni-modal-input caption="Majoration dimanches" suffix="%" type="number" v-model="editedSurcharge.sundays"
          :error="$v.editedSurcharge.sundays.$error" @blur="$v.editedSurcharge.sundays.$touch" />
        <ni-modal-input caption="Majoration jours fériés" suffix="%" type="number" v-model="editedSurcharge.publicHolidays"
          :error="$v.editedSurcharge.publicHolidays.$error" @blur="$v.editedSurcharge.publicHolidays.$touch" />
        <ni-modal-input caption="Majoration noëls" suffix="%" type="number" v-model="editedSurcharge.christmas"
          :error="$v.editedSurcharge.christmas.$error" @blur="$v.editedSurcharge.christmas.$touch" />
        <ni-modal-input caption="Majoration fête du travail" suffix="%" type="number" v-model="editedSurcharge.laborDay"
          :error="$v.editedSurcharge.laborDay.$error" @blur="$v.editedSurcharge.laborDay.$touch" />
        <ni-modal-input caption="Majoration soirs" suffix="%" type="number" v-model="editedSurcharge.evenings"
          :error="$v.editedSurcharge.evenings.$error" @blur="$v.editedSurcharge.evenings.$touch" />
        <ni-datetime-picker caption="Heure d'effet" v-model="editedSurcharge.eveningsStartTime" :error="$v.editedSurcharge.eveningsStartTime.$error"
          @blur="$v.editedSurcharge.eveningsStartTime.$touch" in-modal type="time"/>
        <ni-datetime-picker caption="Heure de fin" v-model="editedSurcharge.eveningsEndTime" :error="$v.editedSurcharge.eveningsEndTime.$error"
          @blur="$v.editedSurcharge.eveningsEndTime.$touch" in-modal type="time"/>
        <ni-modal-input caption="Majoration personnalisée" suffix="%" type="number" v-model="editedSurcharge.customs"
          :error="$v.editedSurcharge.customs.$error" @blur="$v.editedSurcharge.customs.$touch" />
        <ni-datetime-picker caption="Heure d'effet" v-model="editedSurcharge.customsStartTime" :error="$v.editedSurcharge.customsStartTime.$error"
          @blur="$v.editedSurcharge.customsStartTime.$touch" in-modal type="time"/>
        <ni-datetime-picker caption="Heure de fin" v-model="editedSurcharge.customsEndTime" :error="$v.editedSurcharge.customsEndTime.$error"
          @blur="$v.editedSurcharge.customsEndTime.$touch" in-modal type="time"/>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary" :loading="loading" @click="updateSurcharge"
        :disable="$v.editedSurcharge.$error" />
    </q-modal>

    <!-- Service creation modal -->
    <q-modal v-model="serviceCreationModal" content-classes="modal-container-sm" @hide="resetCreationServiceData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="serviceCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Type" v-model="newService.type" :error="$v.newService.type.$error" @blur="$v.newService.type.$touch"
          :options="serviceTypeOptions" required-field />
        <ni-modal-input caption="Nom" v-model="newService.name" :error="$v.newService.name.$error" @blur="$v.newService.name.$touch" required-field />
        <ni-modal-select caption="Nature" v-model="newService.nature" :error="$v.newService.nature.$error" @blur="$v.newService.nature.$touch"
          :options="natureOptions" required-field />
        <ni-modal-input caption="Prix unitaire par défaut TTC" suffix="€" type="number" v-model="newService.defaultUnitAmount"
          :error="$v.newService.defaultUnitAmount.$error" @blur="$v.newService.defaultUnitAmount.$touch" required-field />
        <ni-modal-input caption="TVA" suffix="%" v-model="newService.vat" type="number" :error="$v.newService.vat.$error" @blur="$v.newService.vat.$touch"
          error-label="La TVA doit être positive ou nulle" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary" :loading="loading" @click="createNewService"
        :disable="disableServiceCreationButton" />
    </q-modal>

    <!-- Service edition modal -->
    <q-modal v-model="serviceEditionModal" content-classes="modal-container-sm" @hide="resetEditionServiceData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Éditer le <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="serviceEditionModal = false" /></span>
          </div>
        </div>
        <ni-datetime-picker caption="Date d'effet" v-model="editedService.startDate" :error="$v.editedService.startDate.$error"
          @blur="$v.editedService.startDate.$touch" :min="minStartDate" in-modal required-field />
        <ni-modal-input caption="Nom" v-model="editedService.name" :error="$v.editedService.name.$error" @blur="$v.editedService.name.$touch"
          required-field />
        <ni-modal-input caption="Prix unitaire par défaut TTC" suffix="€" type="number" v-model="editedService.defaultUnitAmount"
          :error="$v.editedService.defaultUnitAmount.$error" @blur="$v.editedService.defaultUnitAmount.$touch" required-field />
        <ni-modal-input caption="TVA" suffix="%" v-model="editedService.vat" type="number" :error="$v.editedService.vat.$error" @blur="$v.editedService.vat.$touch"
          error-label="La TVA doit être positive ou nulle" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary" :loading="loading" @click="updateService"
        :disable="disableServiceEditionButton" />
    </q-modal>

    <!-- Service history modal -->
    <q-modal v-model="serviceHistoryModal" content-classes="modal-container-sm" @hide="resetServiceHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique du service <span class="text-weight-bold">{{selectedService.name}}</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="serviceHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-responsive" :data="selectedService.versions" :columns="serviceColumns" hide-bottom binary-state-sort :pagination.sync="paginationHistory"
          :visible-columns="visibleHistoryColumns">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">{{ col.value }}</q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Third party payers creation modal -->
    <q-modal v-model="thirdPartyPayerCreationModal" content-classes="modal-container-sm" @hide="resetThirdPartyPayerEditionData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter un <span class="text-weight-bold">tiers payeur</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="thirdPartyPayerCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newThirdPartyPayer.name" :error="$v.newThirdPartyPayer.name.$error" @blur="$v.newThirdPartyPayer.name.$touch"
          required-field />
        <ni-search-address v-model="newThirdPartyPayer.address.fullAddress" @selected="selectedThirdPartyPayerCreationAddress" error-label="Adresse invalide" in-modal
          @blur="$v.newThirdPartyPayer.address.fullAddress.$touch" :error="$v.newThirdPartyPayer.address.fullAddress.$error" />
        <ni-modal-input caption="Email" v-model.trim="newThirdPartyPayer.email" />
        <ni-modal-input caption="Prix unitaire TTC par défaut" suffix="€" type="number" v-model="newThirdPartyPayer.unitTTCRate"
          :error="$v.newThirdPartyPayer.unitTTCRate.$error" error-label="Le prix unitaire doit être positif"/>
        <ni-modal-select v-model="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation" :filter="false" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary" :loading="loading"
        @click="createNewThirdPartyPayer" />
    </q-modal>

    <!-- Third party payers edition modal -->
    <q-modal v-model="thirdPartyPayerEditionModal" content-classes="modal-container-sm" @hide="resetThirdPartyPayerUpdateModalData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer le <span class="text-weight-bold">tiers payeur</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="thirdPartyPayerEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="editedThirdPartyPayer.name" :error="$v.editedThirdPartyPayer.name.$error"
          @blur="$v.editedThirdPartyPayer.name.$touch" required-field />
        <ni-search-address v-model="editedThirdPartyPayer.address.fullAddress" @selected="selectedThirdPartyPayerEditionAddress" error-label="Adresse invalide"
          @blur="$v.editedThirdPartyPayer.address.fullAddress.$touch" :error="$v.editedThirdPartyPayer.address.fullAddress.$error" in-modal
          />
        <ni-modal-input caption="Email" v-model.trim="editedThirdPartyPayer.email" />
        <ni-modal-input caption="Prix unitaire TTC par défaut" suffix="€" type="number" v-model="editedThirdPartyPayer.unitTTCRate"
          :error="$v.editedThirdPartyPayer.unitTTCRate.$error" error-label="Le prix unitaire doit être positif"/>
        <ni-modal-select v-model="editedThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation" :filter="false" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer le tiers payeur" icon-right="check" color="primary" :loading="loading" @click="updateThirdPartyPayer" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, numeric, requiredIf } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import ModalInput from '../../../components/form/ModalInput.vue';
import ModalSelect from '../../../components/form/ModalSelect.vue';
import DatetimePicker from '../../../components/form/DatetimePicker.vue';
import CustomImg from '../../../components/form/CustomImg.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import { configMixin } from '../../../mixins/configMixin';
import { validationMixin } from '../../../mixins/validationMixin.js';
import Input from '../../../components/form/Input.vue';
import SearchAddress from '../../../components/form/SearchAddress.vue';
import { frAddress, posDecimals, positiveNumber } from '../../../helpers/vuelidateCustomVal';
import { BILLING_DIRECT, BILLING_INDIRECT, REQUIRED_LABEL, CONTRACT_STATUS_OPTIONS } from '../../../data/constants.js';

export default {
  name: 'CustomersConfig',
  components: {
    'ni-modal-input': ModalInput,
    'ni-custom-img': CustomImg,
    'ni-file-uploader': FileUploader,
    'ni-modal-select': ModalSelect,
    'ni-input': Input,
    'ni-search-address': SearchAddress,
    'ni-datetime-picker': DatetimePicker,
  },
  mixins: [configMixin, validationMixin],
  data () {
    return {
      loading: false,
      company: null,
      documents: null,
      // Surcharges
      surcharges: [],
      surchargeCreationModal: false,
      surchargeEditionModal: false,
      selectedSurcharge: {},
      newSurcharge: {
        name: '',
        saturdays: '',
        sundays: '',
        publicHolidays: '',
        christmas: '',
        laborDay: '',
        evenings: '',
        eveningsStartTime: '',
        eveningsEndTime: '',
        customs: '',
        customsStartTime: '',
        customsEndTime: '',
      },
      editedSurcharge: {
        name: '',
        saturdays: '',
        sundays: '',
        publicHolidays: '',
        christmas: '',
        laborDay: '',
        evenings: '',
        eveningsStartTime: '',
        eveningsEndTime: '',
        customs: '',
        customsStartTime: '',
        customsEndTime: '',
        service: '',
        company: ''
      },
      visibleColumnsSurcharges: ['name', 'saturdays', 'sundays', 'publicHolidays', 'christmas', 'laborDay',
        'evenings', 'eveningsStartTime', 'eveningsEndTime', 'customs', 'customsStartTime', 'customsEndTime', 'actions'],
      surchargeColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'saturdays',
          label: 'Samedis',
          align: 'center',
          field: row => row.saturdays && `${row.saturdays}%`,
        },
        {
          name: 'sundays',
          label: 'Dimanches',
          align: 'center',
          field: row => row.sundays && `${row.sundays}%`,
        },
        {
          name: 'publicHolidays',
          label: 'Jours fériés',
          align: 'center',
          field: row => row.publicHolidays && `${row.publicHolidays}%`,
        },
        {
          name: 'christmas',
          label: 'Noëls',
          align: 'center',
          field: row => row.christmas && `${row.christmas}%`,
        },
        {
          name: 'laborDay',
          label: 'Fête du travail',
          align: 'center',
          field: row => row.laborDay && `${row.laborDay}%`,
        },
        {
          name: 'evenings',
          label: 'Soirées',
          align: 'center',
          field: row => row.evenings && `${row.evenings}%`,
        },
        {
          name: 'eveningsStartTime',
          label: 'Heure de début (soirées)',
          align: 'left',
          field: row => row.eveningsStartTime ? this.$moment(row.eveningsStartTime).format('DD/MM/YYYY') : '',
        },
        {
          name: 'eveningsEndTime',
          label: 'Heure de fin (soirées)',
          align: 'left',
          field: row => row.eveningsEndTime ? this.$moment(row.eveningsEndTime).format('DD/MM/YYYY') : '',
        },
        {
          name: 'customs',
          label: 'Majoration perso.',
          align: 'center',
          field: row => row.customs && `${row.customs}%`,
        },
        {
          name: 'customsStartTime',
          label: 'Heure de début perso.',
          align: 'left',
          field: row => row.customsStartTime ? this.$moment(row.customsStartTime).format('DD/MM/YYYY') : '',
        },
        {
          name: 'customsEndTime',
          label: 'Heure de fin perso.',
          align: 'left',
          field: row => row.customsEndTime ? this.$moment(row.customsEndTime).format('DD/MM/YYYY') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],

      // Services
      services: [],
      serviceCreationModal: false,
      serviceEditionModal: false,
      serviceHistoryModal: false,
      selectedService: {},
      newService: {
        name: '',
        type: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
      },
      editedService: {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
      },
      natureOptions: [
        { label: 'Horaire', value: 'Horaire' },
        { label: 'Forfaitaire', value: 'Forfaitaire' },
      ],
      serviceTypeOptions: CONTRACT_STATUS_OPTIONS,
      visibleColumnsServices: ['name', 'nature', 'defaultUnitAmount', 'vat', 'actions'],
      visibleHistoryColumns: ['startDate', 'name', 'defaultUnitAmount', 'vat'],
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
          label: 'Prix unitaire TTC par défaut',
          align: 'center',
          field: row => `${row.defaultUnitAmount}€`,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: row => row.vat && `${row.vat}%`,
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      thirdPartyPayers: [],
      thirdPartyPayersColumns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true
        },
        {
          name: 'address',
          label: 'Adresse',
          align: 'left',
          field: row => row.address ? row.address.fullAddress : '',
        },
        {
          name: 'email',
          label: 'Email',
          field: 'email',
          align: 'left'
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC par défaut',
          field: 'unitTTCRate',
          format: val => val ? `${val}€` : '',
          align: 'center'
        },
        {
          name: 'billingMode',
          label: 'Facturation',
          field: 'billingMode',
          align: 'left'
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      thirdPartyPayerCreationModal: false,
      newThirdPartyPayer: {
        name: '',
        email: '',
        address: {},
        unitTTCRate: '',
        billingMode: ''
      },
      billingModeOptions: [
        { label: 'Indirecte', value: BILLING_INDIRECT },
        { label: 'Directe', value: BILLING_DIRECT },
      ],
      thirdPartyPayerEditionModal: false,
      editedThirdPartyPayer: {
        address: {},
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
    newSurcharge: {
      name: { required },
      saturdays: { numeric },
      sundays: { numeric },
      publicHolidays: { numeric },
      christmas: { numeric },
      laborDay: { numeric },
      evenings: { numeric },
      eveningsStartTime: {
        required: requiredIf((item) => {
          return item.evenings;
        })
      },
      eveningsEndTime: {
        required: requiredIf((item) => {
          return item.evenings;
        })
      },
      customs: { numeric },
      customsStartTime: {
        required: requiredIf((item) => {
          return item.customs;
        })
      },
      customsEndTime: {
        required: requiredIf((item) => {
          return item.customs;
        })
      },
    },
    editedSurcharge: {
      name: { required },
      saturdays: { numeric },
      sundays: { numeric },
      publicHolidays: { numeric },
      christmas: { numeric },
      laborDay: { numeric },
      evenings: { numeric },
      eveningsStartTime: {
        required: requiredIf((item) => {
          return item.evenings;
        })
      },
      eveningsEndTime: {
        required: requiredIf((item) => {
          return item.evenings;
        })
      },
      customs: { numeric },
      customsStartTime: {
        required: requiredIf((item) => {
          return item.customs;
        })
      },
      customsEndTime: {
        required: requiredIf((item) => {
          return item.customs;
        })
      },
    },
    newService: {
      name: { required },
      type: { required },
      nature: { required },
      defaultUnitAmount: { required },
      vat: { positiveNumber },
    },
    editedService: {
      name: { required },
      startDate: { required },
      defaultUnitAmount: { required },
      vat: { positiveNumber },
    },
    company: {
      ics: { required },
      name: { required },
      rcs: { required },
      address: {
        fullAddress: {
          required,
          frAddress
        },
      },
    },
    newThirdPartyPayer: {
      name: { required },
      address: {
        fullAddress: { frAddress }
      },
      unitTTCRate: { posDecimals }
    },
    editedThirdPartyPayer: {
      name: { required },
      address: {
        fullAddress: { frAddress }
      },
      unitTTCRate: { posDecimals }
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    addressError () {
      return !this.$v.company.address.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    disableServiceEditionButton () {
      return !this.editedService.name || !this.editedService.startDate || !this.editedService.defaultUnitAmount || !this.editedService.vat < 0;
    },
    disableServiceCreationButton () {
      return !this.newService.name || !this.newService.nature || !this.newService.defaultUnitAmount || !this.newService.vat < 0;
    },
    minStartDate () {
      const selectedService = this.services.find(ser => ser._id === this.editedService._id);
      return selectedService ? this.$moment(selectedService.startDate).add(1, 'd').toISOString() : '';
    },
  },
  async mounted () {
    await this.refreshCompany();
    await this.refreshSurcharges();
    await this.refreshServices();
    await this.refreshThirdPartyPayers();
  },
  methods: {
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    },
    selectedAddress (item) {
      this.company.address = Object.assign({}, this.company.address, item);
    },
    selectedThirdPartyPayerEditionAddress (item) {
      this.editedThirdPartyPayer.address = Object.assign({}, this.editedThirdPartyPayer.address, this.$_.omit(item, ['location']));
    },
    selectedThirdPartyPayerCreationAddress (item) {
      this.newThirdPartyPayer.address = Object.assign({}, this.newThirdPartyPayer.address, this.$_.omit(item, ['location']));
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path)
    },
    // Refresh data
    async refreshSurcharges () {
      const surcharges = await this.$surcharges.showAll({ company: this.user.company._id });
      this.surcharges = surcharges;
    },
    async refreshServices () {
      const services = await this.$services.showAll({ company: this.user.company._id });
      this.services = services.map(service => ({
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
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        if (this.$_.get(this.$v.company, path)) {
          this.$_.get(this.$v.company, path).$touch();
          const isValid = await this.waitForValidation(this.$v.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        if (path.match(/fullAddress/)) path = 'address';
        const value = this.$_.get(this.company, path);
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
    // Surcharges
    resetCreationSurchargeData () {
      this.surchargeCreationModal = false;
      this.newSurcharge = {
        name: '',
        saturdays: '',
        sundays: '',
        publicHolidays: '',
        christmas: '',
        laborDay: '',
        evenings: '',
        eveningsStartTime: '',
        eveningsEndTime: '',
        customs: '',
        customsStartTime: '',
        customsEndTime: '',
      };
      this.$v.newService.$reset();
    },
    async createNewSurcharge () {
      try {
        if (this.$v.newSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        this.newSurcharge.company = this.user.company._id;
        await this.$surcharges.create(this.newSurcharge);
        NotifyPositive('Majoration créée.');
        this.resetCreationSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service.');
      } finally {
        this.loading = false;
      }
    },
    initSurchargeEdition (id) {
      this.editedSurcharge = this.surcharges.find(surcharge => surcharge._id === id);
      delete this.editedSurcharge.createdAt;
      delete this.editedSurcharge.updatedAt;
      delete this.editedSurcharge.__index;
      this.surchargeEditionModal = true;
    },
    resetEditionSurchargeData () {
      this.surchargeEditionModal = false;
      this.editedSurcharge = {
        name: '',
        saturdays: '',
        sundays: '',
        publicHolidays: '',
        christmas: '',
        laborDay: '',
        evenings: '',
        eveningsStartTime: '',
        eveningsEndTime: '',
        customs: '',
        customsStartTime: '',
        customsEndTime: '',
      };
      this.$v.editedSurcharge.$reset();
    },
    async updateSurcharge () {
      try {
        if (this.$v.editedSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const surchargeId = this.editedSurcharge._id;
        const payload = this.$_.pickBy(this.editedSurcharge);
        delete payload._id;
        await this.$surcharges.updateById(surchargeId, payload);
        NotifyPositive('Majoration modifiée.');
        this.resetEditionSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification de la majoration');
      } finally {
        this.loading = false;
      }
    },
    async deleteSurcharge (surchargeId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette majoration ?',
          ok: 'OK',
          cancel: 'Annuler'
        });
        await this.$surcharges.remove(surchargeId);
        this.surcharges.splice(cell, 1);
        NotifyPositive('Majoration supprimée.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de la majoration.');
      }
    },
    // Services
    formatCreatedService () {
      const { nature, name, defaultUnitAmount, type } = this.newService;
      const formattedService = {
        nature,
        versions: [{ name, defaultUnitAmount }],
        type,
        company: this.user.company._id
      };
      if (this.newService.vat && this.newService.vat !== '') formattedService.versions[0].vat = this.newService.vat;
      return formattedService;
    },
    resetCreationServiceData () {
      this.serviceCreationModal = false;
      this.newService = {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
      };
      this.$v.newService.$reset();
    },
    async createNewService () {
      try {
        if (this.$v.newService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedService();
        await this.$services.create(payload);
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
    initServiceEdition (id) {
      const selectedService = this.services.find(service => service._id === id);
      const { name, defaultUnitAmount, vat } = selectedService;
      this.editedService = {
        _id: selectedService._id,
        name: name || '',
        startDate: '',
        defaultUnitAmount: defaultUnitAmount || '',
        vat: vat || '',
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
        await this.$services.updateById(serviceId, payload);
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

        await this.$services.remove(serviceId);
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
      this.selectedService = {};
    },
    // Third party payers
    openThirdPartyPayerEditionModal (thirdPartyPayerId) {
      this.thirdPartyPayerEditionModal = true;
      const currentThirdPartyPayer = this.thirdPartyPayers.find(thirdPartyPayer => thirdPartyPayer._id === thirdPartyPayerId);
      const { name, address, email, unitTTCRate, billingMode } = currentThirdPartyPayer;
      this.editedThirdPartyPayer = {
        _id: currentThirdPartyPayer._id,
        name,
        address: { ...address } || {},
        email,
        unitTTCRate,
        billingMode,
      };
    },
    resetThirdPartyPayerEditionData () {
      this.$v.newThirdPartyPayer.$reset();
      this.newThirdPartyPayer = {
        name: '',
        email: '',
        address: {},
        unitTTCRate: '',
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
        address: {}
      }
    },
    async updateThirdPartyPayer () {
      try {
        if (this.$v.editedThirdPartyPayer.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const thirdPartyPayerId = this.editedThirdPartyPayer._id;
        delete this.editedThirdPartyPayer._id;
        const payload = this.editedThirdPartyPayer;
        if (payload.address && !payload.address.fullAddress) {
          payload.address = {};
        }
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
    isTppUsedInFundings (tppIndex) {
      return this.thirdPartyPayers[tppIndex].isUsedInFundings;
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
