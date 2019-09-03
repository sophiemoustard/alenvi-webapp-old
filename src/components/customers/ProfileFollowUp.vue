<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-select caption="Pathologie" v-model="customer.followUp.pathology" :options="selectOptions"
          @blur="updateCustomer('followUp.pathology')" @focus="saveTmp('followUp.pathology')" />
      </div>
      <div class="row gutter-profile">
        <ni-input  caption="Commentaires" v-model="customer.followUp.comments" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.comments')" @focus="saveTmp('followUp.comments')" />
        <ni-input  caption="Détails intervention" v-model="customer.followUp.details" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.details')" @focus="saveTmp('followUp.details')" />
        <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="6" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
  </div>
</template>

<script>
import Input from '../form/Input';
import Select from '../form/Select';
import pathologies from '../../data/pathologies';
import { followUpMixin } from '../../mixins/followUpMixin.js';

export default {
  components: {
    'ni-input': Input,
    'ni-select': Select,
  },
  mixins: [followUpMixin],
  data () {
    return {
      isLoaded: false,
      customer: { followUp: {} },
      tmpInput: '',
      selectOptions: pathologies,
    };
  },
  computed: {
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    await this.getCustomer(this.userProfile._id);
  },
}
</script>
