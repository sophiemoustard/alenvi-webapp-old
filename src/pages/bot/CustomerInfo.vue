<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerCodes.door_code"
        float-label="Code porte"
        type="textarea"
        :min-rows="1"
        :disable="disable">
        </q-input>
      </q-field>
    </div>
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerCodes.intercom_code"
        float-label="Code interphone"
        type="textarea"
        :min-rows="1"
        :disable="disable">
        </q-input>
      </q-field>
    </div>
      <div class="row justify-center">
        <q-field class="col-xs-12 col-sm-6">
          <q-select
          v-model="customerInfo.pathology"
          float-label="Pathologie"
          :options="selectOptions"
          :disable="disable"
          ></q-select>
        </q-field>
      </div>
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerInfo.comments"
        float-label="Commentaires"
        type="textarea"
        :min-rows="4"
        :disable="disable">
        </q-input>
      </q-field>
    </div>
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerInfo.interventionDetails"
        float-label="Détails intervention"
        type="textarea"
        :min-rows="4"
        :disable="disable">
        </q-input>
      </q-field>
    </div>
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerInfo.misc"
        float-label="Autres"
        type="textarea"
        :min-rows="4"
        :disable="disable">
        </q-input>
      </q-field>
    </div>
    <div class="row justify-center">
      <div class="col-xs-12 col-sm-6">
        <q-btn class="full-width" color="primary" @click="setModificationsOn(true)"> <!-- editCustomerInfo --> <!-- :disable="disable" -->
          {{buttonName}} <!-- Enregistrer -->
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      disable: true,
      queryParams: {
        accessToken: '',
        idCustomer: ''
      },
      customerCodes: {
        door_code: '',
        intercom_code: ''
      },
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
      buttonName: 'Modifier...'
    }
  },
  mounted () {
    this.getQueryParams()
    this.getCustomerInfo()
  },
  methods: {
    getQueryParams () {
      if (!this.$route.query.access_token || !this.$route.query.id_customer) {
        throw new Error('Missing alenvi access token and/or customer id')
      } else {
        this.queryParams.accessToken = this.$route.query.access_token
        this.queryParams.idCustomer = this.$route.query.id_customer
      }
    },
    async getCustomerInfo () {
      try {
        const ogustToken = await this.$ogust.getOgustToken(this.queryParams.accessToken)
        const customerDetailsRaw = await this.$ogust.getOgustCustomerDetails(ogustToken, this.queryParams.idCustomer);
        const customerDetails = customerDetailsRaw.data.data.info.thirdPartyInformations.array_values
        const customerCodesRaw = await this.$ogust.getOgustCustomerCodes(ogustToken, this.queryParams.idCustomer);
        this.customerCodes.door_code = customerCodesRaw.door_code;
        this.customerCodes.intercom_code = customerCodesRaw.intercom_code;
        // this.disable = false;
        if (customerDetails == null) {
          return
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
    async editCustomerInfo () {
      try {
        const ogustToken = await this.$ogust.getOgustToken(this.queryParams.accessToken);
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
        await this.$ogust.editOgustCustomerDetails(ogustToken, this.queryParams.idCustomer, data);
        await this.$ogust.editOgustCustomer(ogustToken, this.queryParams.idCustomer, this.customerCodes);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Modification effectuée ! :) Tu peux maintenant fermer la page.',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'édition de la fiche bénéficiaire :/',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e.response)
      }
    },
    setModificationsOn (toSend) {
      if (toSend && !this.disable) {
        this.editCustomerInfo();
      }
      this.disable = false;
      this.buttonName = 'Enregistrer';
    }
  }
}
</script>

<style lang="stylus" scoped>
.q-field
  margin: 5px 0
</style>
