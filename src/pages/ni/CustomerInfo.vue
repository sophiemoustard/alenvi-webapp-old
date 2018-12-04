<template>
  <q-page padding class="neutral-background">
    <div v-if="isLoaded">
      <div class="row items-center col-xs-12 header-margin">
        <div>
          <q-icon class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary" @click.native="$router.push({ name: 'profile customers', params: { id } })" />
        </div>
        <h4 class="no-margin">{{ customer.title }} {{ customer.last_name }}</h4>
      </div>
      <div class="row">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Adresse" v-model="customer.main_address.line" disable />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Ville" v-model="customer.main_address.city" disable />
        </div><div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Code postal" v-model="customer.main_address.zip" disable />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Code porte" v-model="customer.door_code" @myFocus="saveTmp('door_code')"
            @myBlur="updateCustomer('door_code')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Code interphone" v-model="customer.intercom_code"
            @myBlur="updateCustomer('intercom_code')" @myFocus="saveTmp('intercom_code')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-select-with-errors caption="Pathologie" v-model="customerInfo.pathology" :options="selectOptions"
            @myBlur="updateCustomerInfo" @myFocus="saveTmp('customerInfo')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Commentaires" v-model="customerInfo.comments" @myFocus="saveTmp('customerInfo')"
            type="textarea" :rows="6" @myBlur="updateCustomerInfo"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Détails intervention" v-model="customerInfo.interventionDetails" @myFocus="saveTmp('customerInfo')"
            type="textarea" :rows="6" @myBlur="updateCustomerInfo"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input-with-errors caption="Autres" v-model="customerInfo.misc" @myFocus="saveTmp('customerInfo')" type="textarea"
            :rows="6" @myBlur="updateCustomerInfo"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import pathologies from '../../data/pathologies';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify';
import InputWithErrors from '../../components/form/InputWithErrors.vue';
import SelectWithErrors from '../../components/form/SelectWithErrors.vue';

export default {
  components: {
    'ni-input-with-errors': InputWithErrors,
    'ni-select-with-errors': SelectWithErrors,
  },
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
      selectOptions: pathologies,
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
        NotifyNegative('Erreur lors du chargement des données');
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
        if (this.$_.isEqual(this.tmpInput, this.customerInfo)) return 0;
        let data = { arrayValues: {} };
        for (const k in this.infoTitles) {
          data.arrayValues[this.infoTitles[k]] = this.customerInfo[k]
        }
        await this.$ogust.editOgustCustomerDetails(this.customerId, data);
        NotifyPositive('Modification effectuée !');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de la fiche bénéficiaire :/');
      }
    },
    async updateCustomer (path) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, path)) return 0;
        const value = this.$_.get(this.customer, path);
        const payload = this.$_.set({}, path, value);
        await this.$ogust.editOgustCustomer(this.customerId, payload);
        NotifyPositive('Modification effectuée !');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de la fiche bénéficiaire :/');
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
