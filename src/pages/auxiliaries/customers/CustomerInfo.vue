<template>
  <q-page padding class="neutral-background">
    <div v-if="isLoaded">
      <div class="row items-center col-xs-12 header-margin">
        <div>
          <q-icon class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary"
            @click.native="$router.go(-1)" />
        </div>
        <h4 class="no-margin">{{ customer.identity | formatIdentity('FL') }}</h4>
      </div>
      <div class="row">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input caption="Adresse" v-model="customer.contact.address.fullAddress" disable />
        <ni-input caption="Accès / codes" v-model="customer.contact.accessCodes" @focus="saveTmp('contact.accessCodes')"
          @blur="updateCustomer('contact.accessCodes')" />
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input  caption="Environnement du bénéficiaire" v-model="customer.followUp.customerEnvironment" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.customerEnvironment')" @focus="saveTmp('followUp.customerEnvironment')" />
        <ni-input  caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" />
        <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="1" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { followUpMixin } from '../../../mixins/followUpMixin.js';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import { formatIdentity } from '../../../helpers/utils';

export default {
  components: {
    'ni-input': Input,
    'ni-select': Select,
  },
  props: {
    id: { type: String },
    customerId: { type: String },
  },
  mixins: [followUpMixin],
  metaInfo: {
    title: 'Fiche bénéficiaire',
  },
  data () {
    return {
      tmpInput: '',
      isLoaded: false,
      customer: {
        identity: {},
        contact: { address: {} },
        followUp: {},
      },
    }
  },
  async mounted () {
    await this.getCustomer(this.customerId);
  },
  filters: {
    formatIdentity,
  },
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
