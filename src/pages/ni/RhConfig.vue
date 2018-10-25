<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Taux horaire brut par défaut</p>
            <q-field :error="$v.company.rhConfig.providerContracts.grossHourlyRate.$error" :error-label="nbrError('providerContracts.grossHourlyRate')">
              <q-input
                :value="company.rhConfig.providerContracts.grossHourlyRate"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.providerContracts.grossHourlyRate')"
                @change="updateCompany($event, 'rhConfig.providerContracts.grossHourlyRate')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats mandataires</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Taux horaire brut par défaut</p>
            <q-field :error="$v.company.rhConfig.agentContracts.grossHourlyRate.$error" :error-label="nbrError('agentContracts.grossHourlyRate')">
              <q-input
                :value="company.rhConfig.agentContracts.grossHourlyRate"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.agentContracts.grossHourlyRate')"
                @change="updateCompany('rhConfig.agentContracts.grossHourlyRate')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement téléphone</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <p class="input-caption">Montant du remboursement</p>
            <q-field :error="$v.company.rhConfig.phoneSubRefunding.$error" :error-label="nbrError('phoneSubRefunding')">
              <q-input
                :value="company.rhConfig.phoneSubRefunding"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp('rhConfig.phoneSubRefunding')"
                @change="updateCompany('rhConfig.phoneSubRefunding')" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <div
            v-for="(transportSub, index) in company.rhConfig.transportSubs"
            :key="index"
            class="col-xs-12 col-md-6">
            <p class="input-caption">{{ transportSub.department }}</p>
            <q-field :error="$v.company.rhConfig.transportSubs.$each[index].$error" error-label="Champ requis">
              <q-input
                :value="company.rhConfig.transportSubs[index].price"
                type="number"
                color="white"
                inverted-light
                suffix="€"
                @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)"
                @change="updateCompanyTransportSubs($event, { vuelidatePath: `rhConfig.transportSubs.$each[${index}]`, index })"/>
            </q-field>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { required, maxValue } from 'vuelidate/lib/validators';

import { posDecimals } from '../../helpers/vuelidateCustomVal';

export default {
  data () {
    return {
      company: null,
      tmpInput: ''
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    }
  },
  validations: {
    company: {
      rhConfig: {
        providerContracts: {
          grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
        },
        agentContracts: {
          grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) }
        },
        phoneSubRefunding: { required, posDecimals, maxValue: maxValue(999) },
        transportSubs: {
          $each: {
            price: { required, posDecimals, maxValue: maxValue(999) }
          }
        }
      }
    }
  },
  mounted () {
    this.company = this.user.company;
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path);
    },
    async updateCompany (event, path) {
      try {
        this.$_.set(this.company, path, event);
        console.log('VAL', this.$_.get(this.company, path));
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        this.$_.get(this.$v.company, path).$touch();
        if (this.$_.get(this.$v.company, path).$error) {
          return this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        const value = this.$_.get(this.company, path);
        const payload = this.$_.set({}, path, value);
        payload._id = this.company._id;
        await this.$companies.updateById(payload);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      }
    },
    async updateCompanyTransportSubs (event, params) {
      try {
        this.company.rhConfig.transportSubs[params.index].price = event;
        this.$_.get(this.$v.company, params.vuelidatePath).$touch();
        if (this.$_.get(this.$v.company, params.vuelidatePath).$error) {
          return this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Champ(s) invalide(s)',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        const price = this.company.rhConfig.transportSubs[params.index].price
        if (this.tmpInput === price) return;
        const payload = {
          rhConfig: {
            transportSubs: {
              subId: this.company.rhConfig.transportSubs[params.index]._id,
              '$.price': this.company.rhConfig.transportSubs[params.index].price
            }
          }
        };
        payload._id = this.company._id;
        await this.$companies.updateById(payload);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
        this.tmpInput = '';
      }
    },
    nbrError (path) {
      if (!this.$_.get(this.$v.company.rhConfig, path).required) {
        return 'Champ requis';
      } else if (!this.$_.get(this.$v.company.rhConfig, path).numeric) {
        return 'Nombre non valide';
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  /deep/ .bg-negative
    background: white !important
    color: inherit !important
</style>
