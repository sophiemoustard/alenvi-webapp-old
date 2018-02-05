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
        <q-btn class="full-width" color="primary" @click="setModificationsOn(true)"> <!-- editCustomerInfo --> <!-- :disable="disable" -->
          {{buttonName}} <!-- Enregistrer -->
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { QInput, QField, QSelect, QBtn, Toast } from 'quasar'
import Ogust from '../models/Ogust'

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
        const ogustToken = await Ogust.getOgustToken(this.queryParams.accessToken)
        const customerDetailsRaw = await Ogust.getOgustCustomerDetails(ogustToken, this.queryParams.idCustomer);
        const customerDetails = customerDetailsRaw.data.data.info.thirdPartyInformations.array_values
        const customerCodesRaw = await Ogust.getOgustCustomerCodes(ogustToken, this.queryParams.idCustomer);
        this.customerCodes.doorCode = customerCodesRaw.door_code;
        this.customerCodes.interCode = customerCodesRaw.intercom_code;
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
        Toast.create('Erreur lors du chargement des données');
      }
    },
    async editCustomerInfo () {
      try {
        const ogustToken = await Ogust.getOgustToken(this.queryParams.accessToken);
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
        await Ogust.editOgustCustomerDetails(ogustToken, this.queryParams.idCustomer, data);
        await Ogust.editOgustCustomer(ogustToken, this.queryParams.idCustomer, this.customerCodes);
        Toast.create('Modification effectuée ! :) Tu peux maintenant fermer la page.');
      } catch (e) {
        Toast.create("Erreur lors de l'édition de la fiche bénéficiaire :/");
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

<style>
</style>
