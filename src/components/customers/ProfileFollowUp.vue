<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Pratique</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Accès / codes" v-model="customer.contact.accessCodes" @focus="saveTmp('contact.accessCodes')"
          @blur="updateCustomer('contact.accessCodes')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Accompagnement</p>
      </div>
      <div class="row gutter-profile">
        <ni-input  caption="Environnement du bénéficiaire" v-model="customer.followUp.environment" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.environment')" @focus="saveTmp('followUp.environment')" />
        <ni-input  caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" />
        <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="1" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Aidants</p>
      </div>
      <div>
        <helper-list :helpers="helpers" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaires</p>
      </div>
      <div>
        <auxiliary-list :auxiliaries="auxiliaries" />
      </div>
    </div>
  </div>
</template>

<script>
import Input from '../form/Input';
import Select from '../form/Select';
import HelperList from '../users/HelperList';
import AuxiliaryList from '../users/AuxiliaryList';
import { followUpMixin } from '../../mixins/followUpMixin.js';
import { NotifyNegative } from '../popup/notify.js';

export default {
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'helper-list': HelperList,
    'auxiliary-list': AuxiliaryList,
  },
  mixins: [followUpMixin],
  data () {
    return {
      isLoaded: false,
      customer: { followUp: {} },
      tmpInput: '',
      helpers: [],
      auxiliaries: [],
    };
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    await this.getCustomer(this.userProfile._id);
    await this.getUserHelpers();
    await this.getAuxiliaries();
  },
  methods: {
    async getUserHelpers () {
      try {
        this.helpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        NotifyNegative('Erreur lors de la récupération des aidants');
      }
    },
    async getAuxiliaries () {
      try {
        this.auxiliaries = await this.$users.showActiveForCustomer({ customer: this.userProfile._id });
      } catch (e) {
        NotifyNegative('Erreur lors de la récupération des auxiliaires');
      }
    },
  },
}
</script>
