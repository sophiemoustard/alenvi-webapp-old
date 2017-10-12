<template>
  <div class="layout-padding">
    <div class="row justify-center">
      <q-field class="col-xs-12 col-sm-6">
        <q-input
        v-model="customerCodes.doorCode"
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
        v-model="customerCodes.interCode"
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
        <q-btn class="full-width" color="primary" @click="editCustomerInfo" :disable="disable">
          Envoyer
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { QInput, QField, QSelect, QBtn, Toast } from 'quasar'
import Ogust from './models/Ogust'

export default {
  components: {
    QInput,
    QField,
    QSelect,
    QBtn
  },
  data () {
    return {
      disable: true,
      queryParams: {
        accessToken: '',
        idCustomer: ''
      },
      customerCodes: {
        doorCode: '',
        interCode: ''
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
      ]
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
        this.customerCodes.doorCode = this.$route.query.customer_door_code || ''
        this.customerCodes.interCode = this.$route.query.customer_inter_code || ''
      }
    },
    async getCustomerInfo () {
      try {
        const ogustToken = await Ogust.getOgustToken(this, this.queryParams.accessToken)
        const customerDetailsRaw = await Ogust.getOgustCustomerDetails(this, this.queryParams.idCustomer, ogustToken);
        // const customerDetailsRaw = await this.$http.get(`https://alenvi-api-dev.herokuapp.com/ogust/customers/${this.queryParams.idCustomer}/moreInfo`, { headers: { 'x-ogust-token': ogustToken } })
        const customerDetails = customerDetailsRaw.body.data.info.thirdPartyInformations.array_values
        this.disable = false
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
        console.error(e)
        Toast.create('Erreur lors du chargement des données')
      }
    },
    async editCustomerInfo () {
      try {
        if (PROD) {
          apiLink = 'https://alenvi-api.herokuapp.com/ogust/customers'
        } else {
          apiLink = 'https://alenvi-api-dev.herokuapp.com/ogust/customers'
        }
        const ogustToken = await Ogust.getOgustToken(this, this.queryParams.accessToken)
        let data = { arrayValues: {} }
        const infoTitles = {
          pathology: 'NIVEAU',
          comments: 'COMMNIV',
          interventionDetails: 'DETAILEVE',
          misc: 'AUTRESCOMM'
        }
        for (const k in infoTitles) {
          data.arrayValues[infoTitles[k]] = this.customerInfo[k]
        }
        await this.$http.put(`${apiLink}/${this.queryParams.idCustomer}/moreInfo`, data, { headers: { 'x-ogust-token': ogustToken } })
        await editOgustCustomerCodes(this, ogustToken, this.queryParams.idCustomer, this.customerCodes)
        Toast.create('Modification effectuée ! :) Tu peux maintenant fermer la page.')
      } catch (e) {
        Toast.create("Erreur lors de l'édition de la fiche bénéficiaire :/")
        console.error(e)
      }
    }
  }
}
</script>

<style>
</style>
