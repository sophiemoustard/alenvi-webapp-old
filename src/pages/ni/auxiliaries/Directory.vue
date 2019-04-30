<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-5">
        <h4 class="no-margin">Répertoire</h4>
      </div>
      <div class="col-xs-12 col-md-5">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un profil" color="white"
          inverted-light />
      </div>
      <div class="col-xs-12 col-md-2 row justify-end">
        <q-toggle v-model="activeUsers" color="primary" label="Actifs" />
      </div>
    </div>
    <q-table :data="filteredUsers" :columns="columns" row-key="name" binary-state-sort :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="people-list">
      <q-tr slot="body" slot-scope="props" :props="props" :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]"
        @click.native="goToUserProfile(props.row.auxiliary._id)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-side :avatar="getAvatar(col.value.picture)" />
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else-if="col.name === 'profileErrors'">
            <q-icon v-if="notificationsProfiles[props.row.auxiliary._id] && props.row.isActive" name="error" color="secondary"
              size="1rem" />
          </template>
          <template v-else-if="col.name === 'tasksErrors'">
            <q-icon v-if="notificationsTasks[props.row.auxiliary._id] && props.row.isActive" name="error" color="secondary"
              size="1rem" />
          </template>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne" @click="opened = true" />

    <!-- User creation modal -->
    <q-modal v-model="opened" @hide="resetForm" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une nouvelle <span class="text-weight-bold">fiche auxiliaire</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="opened = false" /></span>
          </div>
        </div>
        <ni-modal-select v-model="newUser.identity.title" :error="$v.newUser.identity.title.$error" :options="civilityOptions"
          caption="Civilité" @blur="$v.newUser.identity.title.$touch" required-field />
        <ni-modal-input v-model="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error" caption="Nom"
          @blur="$v.newUser.identity.lastname.$touch" required-field />
        <ni-modal-input v-model="newUser.identity.firstname" :error="$v.newUser.identity.firstname.$error" caption="Prénom"
          @blur="$v.newUser.identity.firstname.$touch" required-field />
        <ni-modal-input v-model="newUser.mobilePhone" :error="$v.newUser.mobilePhone.$error" caption="Numéro de téléphone"
          @blur="$v.newUser.mobilePhone.$touch" :error-label="mobilePhoneError" required-field />
        <ni-search-address v-model="newUser.contact.address.fullAddress" color="white" inverted-light @selected="selectedAddress"
          :error-label="addressError" :error="$v.newUser.contact.address.fullAddress.$error" required-field in-modal />
        <ni-modal-input v-model="newUser.local.email" :error="$v.newUser.local.email.$error" caption="Email" @blur="$v.newUser.local.email.$touch"
          :error-label="emailError" required-field />
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption required">Communauté</p>
              <q-icon v-if="$v.newUser.sector.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.sector.$error" :error-label="REQUIRED_LABEL">
              <ni-select-sector v-model="newUser.sector" @blur="$v.newUser.sector.$touch" in-modal :company-id="company._id" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption required">Géré par</p>
              <q-icon v-if="$v.newUser.ogustManagerId.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.ogustManagerId.$error" :error-label="REQUIRED_LABEL">
              <ni-select-manager v-model="newUser.ogustManagerId" @blur="$v.newUser.ogustManagerId.$touch" in-modal />
            </q-field>
        </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="sendWelcomeMsg" label="Envoyer SMS d'accueil" />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary" :loading="loading"
        @click="submit" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email, maxLength } from 'vuelidate/lib/validators';
import randomize from 'randomatic';
import { frPhoneNumber, frAddress } from '../../../helpers/vuelidateCustomVal';
import { clear } from '../../../helpers/utils.js';
import { userProfileValidation } from '../../../helpers/userProfileValidation';
import { taskValidation } from '../../../helpers/taskValidation';
import SelectSector from '../../../components/form/SelectSector';
import SelectManager from '../../../components/form/SelectManager.vue';
import NiModalInput from '../../../components/form/ModalInput';
import NiModalSelect from '../../../components/form/ModalSelect';
import NiSearchAddress from '../../../components/form/SearchAddress';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../../components/popup/notify.js';
import { DEFAULT_AVATAR, AUXILIARY, PLANNING_REFERENT, REQUIRED_LABEL } from '../../../data/constants';
import { validationMixin } from '../../../mixins/validationMixin.js';
export default {
  metaInfo: { title: 'Répertoire auxiliaires' },
  name: 'Directory',
  components: {
    NiSelectSector: SelectSector,
    NiSelectManager: SelectManager,
    NiModalInput,
    NiModalSelect,
    NiSearchAddress
  },
  mixins: [validationMixin],
  data () {
    return {
      userCreated: null,
      tableLoading: true,
      loading: false,
      opened: false,
      sendWelcomeMsg: true,
      civilityOptions: [
        {
          label: 'Monsieur',
          value: 'M.'
        },
        {
          label: 'Madame',
          value: 'Mme'
        }
      ],
      newUser: {
        identity: {
          lastname: '',
          firstname: '',
          title: '',
        },
        contact: {
          addressId: '',
          address: { fullAddress: '' },
        },
        employee_id: '',
        mobilePhone: '',
        local: {
          email: '',
          password: ''
        },
        company: '',
        sector: '',
        administrative: {
          transportInvoice: {
            transportType: 'public'
          }
        },
        ogustManagerId: ''
      },
      userList: [],
      searchStr: '',
      activeUsers: true,
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.auxiliary,
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aArr = a.name.split(' ');
            const bArr = b.name.split(' ');
            return aArr[aArr.length - 1].toLowerCase() < bArr[bArr.length - 1].toLowerCase() ? -1 : 1
          },
          style: 'width: 450px'
        },
        {
          name: 'profileErrors',
          label: 'Infos',
          field: 'profileErrors',
          align: 'left',
          sortable: true,
        },
        {
          name: 'tasksErrors',
          label: 'Tâches',
          field: 'tasksErrors',
          align: 'left',
          sortable: true,
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 170px'
        },
        {
          name: 'hiringDate',
          label: 'Embauche',
          field: 'hiringDate',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : null,
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'width: 170px'
        },
        {
          name: 'team',
          label: 'Equipe',
          field: 'sector',
          align: 'left',
          sortable: true,
          style: 'width: 170px'
        },
        {
          name: 'active',
          label: 'Actif',
          field: 'isActive',
          align: 'right',
          sortable: false,
          style: 'width: 30px'
        }
      ],
      REQUIRED_LABEL,
    }
  },
  validations: {
    newUser: {
      identity: {
        lastname: { required },
        firstname: { required },
        title: { required },
      },
      mobilePhone: {
        required,
        frPhoneNumber,
        maxLength: maxLength(10)
      },
      contact: {
        address: {
          fullAddress: { required, frAddress }
        },
      },
      local: {
        email: { required, email }
      },
      sector: { required },
      ogustManagerId: { required }
    }
  },
  mounted () {
    this.getUserList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    company () {
      return this.$store.getters['main/company'];
    },
    activeUserList () {
      if (this.activeUsers) {
        return this.userList.filter(user => user.isActive);
      }
      return this.userList.filter(user => !user.isActive);
    },
    filteredUsers () {
      return this.activeUserList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    },
    notificationsProfiles () {
      return this.$store.getters['rh/getNotificationsProfiles'];
    },
    notificationsTasks () {
      return this.$store.getters['rh/getNotificationsTasks'];
    },
    mobilePhoneError () {
      if (!this.$v.newUser.mobilePhone.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.mobilePhone.frPhoneNumber || !this.$v.newUser.mobilePhone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
    },
    zipCodeError () {
      if (!this.$v.newUser.contact.zipCode.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.contact.zipCode.frZipCode || !this.$v.newUser.contact.zipCode.maxLength) {
        return 'Code postal non valide';
      }
    },
    emailError () {
      if (!this.$v.newUser.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.local.email.email) {
        return 'Email non valide';
      }
    },
    addressError () {
      if (!this.$v.newUser.contact.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    hasPicture () {
      return !this.user.picture || (this.user.picture && !this.user.picture.link) ? DEFAULT_AVATAR : this.user.picture.link;
    }
  },
  methods: {
    selectedAddress (item) {
      this.newUser.contact.address = Object.assign({}, this.newUser.contact.address, item);
    },
    getHiringDate (user) {
      let hiringDate = null;
      if (user.contracts && user.contracts.length > 0) {
        const contracts = user.contracts;
        if (contracts.length === 1) {
          hiringDate = contracts[0].startDate;
        } else {
          hiringDate = this.$_.orderBy(contracts, ['startDate'], ['asc'])[0].startDate;
        }
      }
      return hiringDate;
    },
    async getUserList () {
      try {
        const users = await this.$users.showAll({ role: [AUXILIARY, PLANNING_REFERENT] });
        this.userList = users.map((user) => {
          const hiringDate = this.getHiringDate(user);
          if (user.isActive) {
            const checkProfileErrors = userProfileValidation(user);
            this.$store.commit('rh/saveNotification', {
              type: 'profiles',
              _id: user._id,
              exists: !!checkProfileErrors.error
            });
            const checkTasks = taskValidation(user);
            this.$store.commit('rh/saveNotification', {
              type: 'tasks',
              _id: user._id,
              exists: checkTasks
            });
            return {
              auxiliary: {
                _id: user._id,
                name: `${user.identity.firstname} ${user.identity.lastname}`,
                picture: user.picture ? user.picture.link : null
              },
              profileErrors: checkProfileErrors.error,
              tasksErrors: checkTasks,
              startDate: user.createdAt,
              sector: user.sector ? user.sector.name : 'N/A',
              isActive: user.isActive,
              hiringDate,
            }
          }
          return {
            auxiliary: {
              _id: user._id,
              name: `${user.identity.firstname} ${user.identity.lastname}`,
              picture: user.picture ? user.picture.link : null
            },
            startDate: user.createdAt,
            sector: user.sector ? user.sector.name : 'N/A',
            isActive: user.isActive,
            hiringDate,
          }
        });
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToUserProfile (userId) {
      this.$router.push({ name: 'personal info', params: { id: userId } });
    },
    resetForm () {
      this.$v.newUser.$reset();
      this.newUser = Object.assign({}, clear(this.newUser));
    },
    async createAlenviUser () {
      this.newUser.local.password = randomize('*', 10);
      this.newUser.role = AUXILIARY;
      this.newUser.ogustManagerId = this.currentUser._id;
      this.newUser.company = this.company.name;
      const newUser = await this.$users.create(this.newUser);
      await this.$users.createDriveFolder({ _id: newUser.data.data.user._id });
      return newUser;
    },
    async createOgustUser () {
      const ogustPayload = {
        title: this.newUser.identity.title,
        last_name: this.newUser.identity.lastname,
        first_name: this.newUser.identity.firstname,
        main_address: {
          line: this.newUser.contact.address.street,
          zip: this.newUser.contact.address.zipCode,
          city: this.newUser.contact.address.city
        },
        email: this.newUser.local.email,
        mobile_phone: this.newUser.mobilePhone,
        manager: this.newUser.ogustManagerId
      };
      const newEmployee = await this.$ogust.createEmployee(ogustPayload);
      return newEmployee;
    },
    async sendSms (newUserId) {
      const activationDataRaw = await this.$activationCode.create({ newUserId, userEmail: this.newUser.local.email });
      const code = activationDataRaw.activationData.code;
      await this.$twilio.sendSMS({
        to: `+33${this.newUser.mobilePhone.substring(1)}`,
        body: `Bienvenue chez Alenvi ! :) Utilise ce code: ${code} pour pouvoir commencer ton enregistrement sur Compani avant ton intégration: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/enterCode :-)`,
      });
    },
    async submit () {
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newUser);
        if (!isValid) throw new Error('Invalid fields');
        const existingEmployee = await this.$ogust.getEmployees({ email: this.newUser.local.email });
        if (Object.keys(existingEmployee).length !== 0) throw new Error('Existing email');
        const newEmployee = await this.createOgustUser();
        this.newUser.employee_id = newEmployee.data.data.employee.id_employee;
        const employee = await this.$ogust.getEmployeeById(this.newUser.employee_id);
        this.newUser.contact.addressId = employee.main_address.id_address;
        this.userCreated = await this.createAlenviUser();
        if (this.sendWelcomeMsg) {
          await this.sendSms(this.userCreated.data.data.user._id);
        }
        await this.getUserList();
        NotifyPositive('Fiche auxiliaire créée');
        this.opened = false;
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') {
          NotifyWarning('Champ(s) invalide(s)');
          return;
        }
        if (e && e.message === 'Existing email') {
          NotifyNegative('Cet email est déjà utilisé par un compte existant');
          return;
        }
        if (e && e.response) {
          console.error(e.response);
          if (e.response.status === 409) {
            NotifyNegative('Email déjà existant');
            return;
          }
        }
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire');
      } finally {
        this.loading = false;
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
  /deep/ .q-option .q-option-label
    font-size: 14px
</style>
