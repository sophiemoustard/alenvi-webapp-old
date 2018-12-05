<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-select caption="Pathologie" v-model="customer.followUp.pathology" :options="selectOptions"
            @myBlur="updateUser({ alenvi: 'followUp.pathology', ogust: 'pathology' })" @myFocus="saveTmp('followUp.pathology')"
          />
        </div>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-input  caption="Commentaires" v-model="customer.followUp.comments" :rows="6" type="textarea"
            @myBlur="updateUser({ alenvi: 'followUp.comments', ogust: 'comments' })" @myFocus="saveTmp('followUp.comments')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input  caption="Détails intervention" v-model="customer.followUp.details" :rows="6" type="textarea"
            @myBlur="updateUser({ alenvi: 'followUp.details', ogust: 'interventionDetails' })" @myFocus="saveTmp('followUp.details')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-input  caption="Autres" v-model="customer.followUp.misc" :rows="6" type="textarea"
            @myBlur="updateUser({ alenvi: 'followUp.misc', ogust: 'misc' })" @myFocus="saveTmp('followUp.misc')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { extend } from '../../helpers/utils.js';
import Input from '../form/Input.vue';
import Select from '../form/Select.vue';
import { NotifyPositive, NotifyNegative } from '../../components/popup/notify.js';
import pathologies from '../../data/pathologies';

export default {
  components: {
    'ni-input': Input,
    'ni-select': Select,
  },
  data () {
    return {
      isLoaded: false,
      customer: {
        followUp: {},
      },
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
    const customerRaw = await this.$customers.getById(this.userProfile._id);
    const customer = customerRaw.data.data.customer;
    this.mergeUser(customer);
    this.isLoaded = true;
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path);
    },
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, paths.alenvi)) return;
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviCustomer(paths.alenvi);
          await this.updateOgustCustomer(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviCustomer(paths.alenvi);
        } else {
          await this.updateOgustCustomer(paths)
        }
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de la fiche bénéficiaire')
      }
    },
    async updateAlenviCustomer (path) {
      let value = this.$_.get(this.customer, path);
      const payload = this.$_.set({}, path, value);
      payload._id = this.userProfile._id;
      await this.$customers.updateById(payload);
    },
    async updateOgustCustomer (paths) {
      let data = { arrayValues: {} };
      const infoTitles = {
        pathology: 'NIVEAU',
        comments: 'COMMNIV',
        details: 'DETAILEVE',
        misc: 'AUTRESCOMM',
      };
      for (const k in infoTitles) {
        data.arrayValues[infoTitles[k]] = this.customer.followUp[k]
      }
      await this.$ogust.editOgustCustomerDetails(this.userProfile.customerId, data);
    },
  },
}
</script>
