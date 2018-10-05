<template>
  <q-page v-if="isLoaded" padding class="neutral-background">
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
            color="white" />
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
            color="white" />
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
            color="white" />
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
            color="white" />
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
            color="white" />
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
            color="white" />
        </q-field>
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
  data () {
    return {
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
      ]
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
        if (customerDetails == null) {
          return;
        } else {
          const infoTitles = {
            pathology: 'NIVEAU',
            comments: 'COMMNIV',
            interventionDetails: 'DETAILEVE',
            misc: 'AUTRESCOMM'
          }
          for (const k in infoTitles) {
            this.customerInfo[k] = customerDetails[infoTitles[k]]
          }
        }
        this.isLoaded = true;
      } catch (e) {
        console.error(e.response);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors du chargement des données',
          position: 'bottom-right',
          timeout: 2500
        });
      }
    },
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
