<template>
  <q-page padding class="neutral-background">
    <div v-if="isLoaded">
      <div class="row items-center col-xs-12 header-margin">
        <div>
          <q-icon class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary" @click.native="$router.go(-1)" />
        </div>
        <h4 class="no-margin">{{ customer.title }} {{ customer.last_name }}</h4>
      </div>
      <div class="row">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Adresse</p>
          </div>
          <q-field>
            <q-input
              v-model="customer.main_address.line"
              disable
              inverted-light
              color="white" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Ville</p>
          </div>
          <q-field>
            <q-input
              v-model="customer.main_address.city"
              disable
              inverted-light
              color="white" />
          </q-field>
        </div><div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Code postal</p>
          </div>
          <q-field>
            <q-input
              v-model="customer.main_address.zip"
              disable
              inverted-light
              color="white" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Code porte</p>
          </div>
          <q-field>
            <q-input
              v-model="customer.door_code"
              inverted-light
              color="white"
              @focus="saveTmp('door_code')"
              @blur="updateCustomer('door_code')" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Code interphone</p>
          </div>
          <q-field>
            <q-input
              v-model="customer.intercom_code"
              inverted-light
              color="white"
              @focus="saveTmp('intercom_code')"
              @blur="updateCustomer('intercom_code')" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Pathologie</p>
          </div>
          <q-field>
            <q-select
              v-model="customerInfo.pathology"
              :options="selectOptions"
              inverted-light
              color="white"
              @focus="saveTmp('customerInfo')"
              @blur="updateCustomerInfo" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Commentaires</p>
          </div>
          <q-field>
            <q-input
              v-model="customerInfo.comments"
              type="textarea"
              :rows="6"
              inverted-light
              color="white"
              @focus="saveTmp('customerInfo')"
              @blur="updateCustomerInfo" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Détails intervention</p>
          </div>
          <q-field>
            <q-input
              v-model="customerInfo.interventionDetails"
              type="textarea"
              :rows="6"
              inverted-light
              color="white"
              @focus="saveTmp('customerInfo')"
              @blur="updateCustomerInfo" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Autres</p>
          </div>
          <q-field>
            <q-input
              v-model="customerInfo.misc"
              type="textarea"
              :rows="6"
              inverted-light
              color="white"
              @focus="saveTmp('customerInfo')"
              @blur="updateCustomerInfo" />
          </q-field>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  props: {
    id: String,
    customerId: String
  },
  metaInfo: {
    title: 'Fiche bénéficiaire'
  },
  data () {
    return {
      tmpInput: '',
      isLoaded: false,
      customer: null,
      customerInfo: {
        pathology: '',
        comments: '',
        interventionDetails: '',
        misc: ''
      },
      selectOptions: [
        {
          label: '-',
          value: '-'
        },
        {
          label: 'Alzheimer',
          value: 'Alzheimer'
        },
        {
          label: 'Parkinson',
          value: 'Parkinson'
        },
        {
          label: 'Corps de Lewy',
          value: 'Corps de Lewy'
        },
        {
          label: 'Autres troubles cognitifs',
          value: 'Autres troubles cognitifs'
        },
        {
          label: 'AVC récent',
          value: 'AVC récent'
        },
        {
          label: 'Autre',
          value: 'Autre'
        }
      ],
      infoTitles: {
        pathology: 'NIVEAU',
        comments: 'COMMNIV',
        interventionDetails: 'DETAILEVE',
        misc: 'AUTRESCOMM'
      }
    }
  },
  async mounted () {
    await this.getCustomerInfo();
  },
  methods: {
    async getCustomerInfo () {
      try {
        const customerDetailsRaw = await this.$ogust.getOgustCustomerDetails(this.customerId);
        const customerDetails = customerDetailsRaw.data.data.info.thirdPartyInformations.array_values
        this.customer = await this.$ogust.getCustomerById(this.customerId);
        if (customerDetails === null) {
          for (const k in this.infoTitles) {
            this.customerInfo[k] = '-';
          }
          this.isLoaded = true;
          return;
        } else {
          for (const k in this.infoTitles) {
            this.customerInfo[k] = customerDetails[this.infoTitles[k]]
          }
        }
        this.isLoaded = true;
      } catch (e) {
        console.error(e.response);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors du chargement des données',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    saveTmp (path) {
      if (path === 'customerInfo') {
        this.tmpInput = Object.assign({}, this.customerInfo);
      } else {
        this.tmpInput = this.$_.get(this.customer, path);
      }
    },
    async updateCustomerInfo () {
      try {
        console.log('info', this.customerInfo);
        if (this.$_.isEqual(this.tmpInput, this.customerInfo)) return 0;
        let data = { arrayValues: {} };
        const infoTitles = {
          pathology: 'NIVEAU',
          comments: 'COMMNIV',
          interventionDetails: 'DETAILEVE',
          misc: 'AUTRESCOMM'
        };
        for (const k in infoTitles) {
          data.arrayValues[infoTitles[k]] = this.customerInfo[k]
        }
        await this.$ogust.editOgustCustomerDetails(this.customerId, data);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Modification effectuée !',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'édition de la fiche bénéficiaire :/',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    async updateCustomer (path) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, path)) return 0;
        const value = this.$_.get(this.customer, path);
        const payload = this.$_.set({}, path, value);
        await this.$ogust.editOgustCustomer(this.customerId, payload);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Modification effectuée !',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'édition de la fiche bénéficiaire :/',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .header-margin
    margin-bottom: 35px

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
</style>
