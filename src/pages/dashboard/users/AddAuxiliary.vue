<template>
  <q-page padding>
    <div class="row justify-center">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte Alenvi et Ogust</p>
        <select-sector v-model="selectedSector"></select-sector>
        <select-manager v-model="selectedManager"></select-manager>
        <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
          <q-input :disable="!selectedSector || !selectedManager" :loading="isLoading" v-model="phoneNbr" float-label="Numéro de téléphone" @keyup.enter="handlePhone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
        </q-field>
        <!-- <p class="caption">Envoi de code pour compte existant</p>
        <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
          <q-input v-model="phoneNbr" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
        </q-field> -->
        <!-- <br>
        <q-search v-model="searchUserFromMobilePhone" :debounce="600" placeholder="Numéro auxiliaire" type="tel" stack-label="Numéro de téléphone" /> -->
      </div>
    </div>
  </q-page>
</template>

<script>
import SelectSector from '../../../components/SelectSector';
import SelectManager from '../../../components/SelectManager';

export default {
  components: {
    SelectSector,
    SelectManager
  },
  data () {
    return {
      phoneNbr: '',
      // searchUserFromMobilePhone: ''
      employee: '',
      selectedSector: '',
      selectedManager: '',
      isLoading: false
    };
  },
  methods: {
    async handlePhone () {
      try {
        // const payload = {
        //   mobile_phone: this.phoneNbr
        // };
        // const res = await ogust.getEmployees(payload);
        // this.employee = res[0];
        console.log('MANAGER', this.selectedManager);
        await this.$q.dialog({
          title: 'Confirmation accueil',
          message: `Es-tu sûr de vouloir envoyer un message au ${this.phoneNbr} ?`,
          ok: 'Envoyer',
          cancel: 'Annuler'
        })
        this.isLoading = true;
        const activationDataRaw = await this.$activationCode.create({
          mobile_phone: this.phoneNbr,
          sector: this.selectedSector,
          managerId: this.selectedManager
        });
        const code = activationDataRaw.activationData.code;
        const message = await this.$twilio.sendSMS(this.phoneNbr, {
          activationCode: code
        });
        console.log('SMS envoyé =', message);
        console.log('Auxiliaire accueilli !');
        this.isLoading = false;
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'SMS bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.isLoading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du SMS',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0
</style>
