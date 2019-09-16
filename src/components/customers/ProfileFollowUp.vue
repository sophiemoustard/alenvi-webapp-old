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
  </div>
</template>

<script>
import Input from '../form/Input';
import Select from '../form/Select';
import HelperList from '../users/HelperList';
import { followUpMixin } from '../../mixins/followUpMixin.js';
import { NotifyNegative } from '../popup/notify.js';

export default {
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'helper-list': HelperList,
  },
  mixins: [followUpMixin],
  data () {
    return {
      isLoaded: false,
      customer: { followUp: {} },
      tmpInput: '',
      helpers: [],
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
  },
  methods: {
    async getUserHelpers () {
      try {
        this.helpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        NotifyNegative('Erreur lors de la récupération des aidants');
      }
    },
  },
}
</script>
