<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-5">
        <h4 class="no-margin">Répertoire</h4>
      </div>
      <div class="col-xs-12 col-md-5">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un profil" color="white" inverted-light />
      </div>
      <div class="col-xs-12 col-md-2 row justify-end">
        <q-toggle v-model="activeUsers" color="primary" label="Actifs" />
      </div>
    </div>
    <q-table
      :data="filteredUsers"
      :columns="columns"
      row-key="name"
      binary-state-sort
      :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination"
      :loading="tableLoading">
      <q-tr
        slot="body"
        slot-scope="props"
        :props="props"
        :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]"
        @click.native="goToUserProfile(props.row.auxiliary._id)">
        <q-td v-for="col in props.cols"
          :key="col.name"
          :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-side :avatar="getAvatar(col.value.picture)" />
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else-if="col.name === 'profileErrors'">
            <q-icon v-if="notificationsProfiles[props.row.auxiliary._id] && props.row.isActive" name="error" color="secondary" size="1rem" />
          </template>
          <template v-else-if="col.name === 'tasksErrors'">
            <q-icon v-if="notificationsTasks[props.row.auxiliary._id] && props.row.isActive" name="error" color="secondary" size="1rem" />
          </template>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
    <q-btn class="fixed fab-add-person" no-caps rounded color="primary" icon="add" label="Ajouter une personne" @click="opened = true" />
    <q-modal v-model="opened" @hide="resetForm" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Créer une nouvelle <span class="text-weight-bold">fiche auxiliaire</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Civilité</p>
              <q-icon v-if="$v.newUser.administrative.identity.title.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.administrative.identity.title.$error" error-label="Champ requis">
              <q-select :options="civilityOptions" v-model="newUser.administrative.identity.title" color="white" inverted-light separator
               @blur="$v.newUser.administrative.identity.title.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Nom</p>
              <q-icon v-if="$v.newUser.lastname.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.lastname.$error" error-label="Champ requis">
              <q-input v-model="newUser.lastname" color="white" inverted-light @blur="$v.newUser.lastname.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Prénom</p>
              <q-icon v-if="$v.newUser.firstname.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.firstname.$error" error-label="Champ requis">
              <q-input v-model="newUser.firstname" color="white" inverted-light @blur="$v.newUser.firstname.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Numéro de téléphone</p>
              <q-icon v-if="$v.newUser.mobilePhone.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.mobilePhone.$error" :error-label="mobilePhoneError">
              <q-input v-model="newUser.mobilePhone" color="white" inverted-light @blur="$v.newUser.mobilePhone.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Adresse</p>
              <q-icon v-if="$v.newUser.administrative.contact.address.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.administrative.contact.address.$error" error-label="Champ requis">
              <q-input v-model="newUser.administrative.contact.address" color="white" inverted-light
                @blur="$v.newUser.administrative.contact.address.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Code Postal</p>
              <q-icon v-if="$v.newUser.administrative.contact.zipCode.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.administrative.contact.zipCode.$error" :error-label="zipCodeError">
              <q-input v-model="newUser.administrative.contact.zipCode" color="white" inverted-light
                @blur="$v.newUser.administrative.contact.zipCode.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Ville</p>
              <q-icon v-if="$v.newUser.administrative.contact.city.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.administrative.contact.city.$error" error-label="Champ requis">
              <q-input v-model="newUser.administrative.contact.city" color="white" inverted-light @blur="$v.newUser.administrative.contact.city.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Email</p>
              <q-icon v-if="$v.newUser.local.email.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.local.email.$error" :error-label="emailError">
              <q-input v-model="newUser.local.email" color="white" inverted-light @blur="$v.newUser.local.email.$touch" />
            </q-field>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Communauté</p>
              <q-icon v-if="$v.newUser.sector.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.sector.$error" error-label="Champ requis">
              <select-sector v-model="newUser.sector" @myBlur="$v.newUser.sector.$touch"/>
            </q-field>
          </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Géré par</p>
              <q-icon v-if="$v.newUser.ogustManagerId.$error" name="error_outline" color="secondary" />
            </div>
            <q-field :error="$v.newUser.ogustManagerId.$error" error-label="Champ requis">
              <select-manager v-model="newUser.ogustManagerId" @myBlur="$v.newUser.ogustManagerId.$touch"/>
            </q-field>
          </div>
        </div>
        <div class="row margin-input last">
          <div class="col-12">
            <q-checkbox v-model="sendWelcomeMsg" label="Envoyer SMS d'accueil" />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary" :loading="loading" @click="submit" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, email, maxLength } from 'vuelidate/lib/validators';
import randomize from 'randomatic';

import { frPhoneNumber, frZipCode } from '../../helpers/vuelidateCustomVal';
import { clear } from '../../helpers/utils.js';
import { userProfileValidation } from '../../helpers/userProfileValidation';
import { taskValidation } from '../../helpers/taskValidation';
import SelectSector from '../../components/SelectSector';
import SelectManager from '../../components/SelectManager';

export default {
  props: {
    role: {
      type: String,
      default: 'Auxiliaire'
    }
  },
  metaInfo: {
    title: 'Répertoire'
  },
  components: {
    SelectSector,
    SelectManager
  },
  data () {
    return {
      userCreated: null,
      tableLoading: true,
      loading: false,
      opened: false,
      sendWelcomeMsg: true,
      modalCssContainer: {
        minWidth: '30vw'
      },
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
        lastname: '',
        firstname: '',
        employee_id: '',
        mobilePhone: '',
        local: {
          email: '',
          password: ''
        },
        sector: '',
        administrative: {
          contact: {
            addressId: '',
            address: '',
            city: '',
            zipCode: ''
          },
          identity: {
            title: ''
          },
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
        sortBy: 'startDate', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 15 // current rows per page being displayed
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
      ]
    }
  },
  validations: {
    newUser: {
      lastname: { required },
      firstname: { required },
      mobilePhone: {
        required,
        frPhoneNumber,
        maxLength: maxLength(10)
      },
      administrative: {
        contact: {
          address: { required },
          zipCode: {
            required,
            frZipCode,
            maxLength: maxLength(5)
          },
          city: { required }
        },
        identity: {
          title: { required }
        }
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
        return 'Champ requis';
      } else if (!this.$v.newUser.mobilePhone.frPhoneNumber || !this.$v.newUser.mobilePhone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
    },
    zipCodeError () {
      if (!this.$v.newUser.administrative.contact.zipCode.required) {
        return 'Champ requis';
      } else if (!this.$v.newUser.administrative.contact.zipCode.frZipCode || !this.$v.newUser.administrative.contact.zipCode.maxLength) {
        return 'Code postal non valide';
      }
    },
    emailError () {
      if (!this.$v.newUser.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.newUser.local.email.email) {
        return 'Email non valide';
      }
    },
    hasPicture () {
      return !this.user.picture || (this.user.picture && !this.user.picture.link) ? 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png' : this.user.picture.link;
    }
  },
  methods: {
    async getUserList () {
      try {
        const users = await this.$users.showAll({ role: this.role });
        const sectors = await this.$ogust.getList('employee.sector');
        this.userList = users.map((user) => {
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
                name: `${user.firstname} ${user.lastname}`,
                picture: user.picture ? user.picture.link : null
              },
              profileErrors: checkProfileErrors.error,
              tasksErrors: checkTasks,
              startDate: user.createdAt,
              sector: sectors[user.sector],
              isActive: user.isActive
            }
          }
          return {
            auxiliary: {
              _id: user._id,
              name: `${user.firstname} ${user.lastname}`,
              picture: user.picture.link
            },
            startDate: user.createdAt,
            sector: sectors[user.sector],
            isActive: user.isActive
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
      this.newUser.role = 'Auxiliaire';
      this.newUser.ogustManagerId = this.currentUser._id;
      const newUser = await this.$users.create(this.newUser);
      await this.$users.createDriveFolder({ _id: newUser.data.data.user._id });
      return newUser;
    },
    async createOgustUser () {
      const ogustPayload = {
        title: this.newUser.administrative.identity.title,
        last_name: this.newUser.lastname,
        first_name: this.newUser.firstname,
        main_address: {
          line: this.newUser.administrative.contact.address,
          zip: this.newUser.administrative.contact.zipCode,
          city: this.newUser.administrative.contact.city
        },
        email: this.newUser.local.email,
        sector: this.newUser.sector,
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
        if (this.$v.newUser.$error) {
          throw new Error('Invalid fields');
        }
        const existingEmployee = await this.$ogust.getEmployees({ email: this.newUser.local.email });
        if (Object.keys(existingEmployee).length !== 0) {
          throw new Error('Existing email');
        }
        const newEmployee = await this.createOgustUser();
        this.newUser.employee_id = newEmployee.data.data.employee.id_employee;
        const employee = await this.$ogust.getEmployeeById(this.newUser.employee_id);
        this.newUser.administrative.contact.addressId = employee.main_address.id_address;
        this.userCreated = await this.createAlenviUser();
        if (this.sendWelcomeMsg) {
          await this.sendSms(this.userCreated.data.data.user._id);
        }
        await this.getUserList();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Fiche auxiliaire créée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
        this.opened = false;
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') {
          this.loading = false;
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
          return;
        }
        if (e && e.message === 'Existing email') {
          this.loading = false;
          this.$q.notify({
            color: 'negative',
            icon: 'warning',
            detail: 'Cet email est déjà utilisé par un compte existant',
            position: 'bottom-left',
            timeout: 2500
          });
          return;
        }
        if (e && e.response) {
          console.error(e.response);
          if (e.response.status === 409) {
            this.$q.notify({
              color: 'negative',
              icon: 'warning',
              detail: 'Email déjà existant',
              position: 'bottom-left',
              timeout: 2500
            });
            this.loading = false;
            return;
          }
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la création de la fiche auxiliaire',
          position: 'bottom-left',
          timeout: 2500
        });
        this.loading = false;
      }
    },
    getAvatar (link) {
      return link || 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .input-caption
    margin-bottom: 4px

  .input-search
    font-size: 14px
    & /deep/ .q-if-control.q-icon
      margin-right: 8px

  .btn-icon
    &-disabled
      color: $light-grey
    &-enabled
      color: $primary

  .q-table-container
    box-shadow: none

  .btn-directory.q-btn /deep/
    box-shadow: none
    &.q-focusable:focus > .q-focus-helper
      background: transparent
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5)

  /deep/ .q-table
    border-spacing: 0 12px
    border-collapse: separate
    &-horizontal-separator tbody td
      border: none
    & thead
      border: none
      & tr
        height: 48px
    & th
      padding: 0px 12px
      &.sortable:hover .q-icon, &.sorted .q-icon
        color: $primary
    & td
      padding: 8px 12px
      & .q-item
        min-height: 30px
        padding: 0
        &-main
          flex: 0 1 auto
        & .q-item-side
          min-width: 30px
          max-height: 30px
          & .q-item-avatar
            width: 29px
            height: 29px
            border: 1px solid #979797
        & .q-item-section + .q-item-section
          margin-left: 20px
    &-container
      & .q-table-bottom
        padding-left: 12px
      & .q-table-nodata > i
        display: none

  .datatable-row
    cursor: pointer
    background: $white
    &:hover
      background: $white
      box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.2)
      & td
        border-top: 1px solid $light-grey
        border-bottom: 1px solid $light-grey
        &:first-child
          border-left: 1px solid $light-grey
        &:last-child
          border-right: 1px solid $light-grey
    &-inactive
      background: rgba(255, 255, 255, 0.5)
      &:hover
        background: rgba(255, 255, 255, 0.5)

  .activeDot
    background: $tertiary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .inactiveDot
    background: $primary-dark
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .fab-add-person
    right: 60px
    bottom: 18px
    font-size: 16px
    z-index: 2

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  .q-if-inverted
    border: 1px solid $light-grey

  .bg-negative
    background: none !important
    color: inherit !important

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px

  /deep/ .q-option .q-option-label
    font-size: 14px

  .q-field-bottom
    padding-top: 2px

</style>
