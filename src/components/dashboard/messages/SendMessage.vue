<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
    <q-field icon="group" class="field-margin">
      <q-select v-model="selectedSector" :options="orderedSectors" separator />
    </q-field>
    <q-field icon="message">
      <q-input v-model="message.content" placeholder="Ecrire message..." type="textarea" :min-rows="2" :after="[sendIcon]"/>
    </q-field>
    </div>
  </div>
</template>

<script>
import {
  QSelect,
  QField,
  QInput,
  Toast,
  Dialog,
  Loading } from 'quasar'
import _ from 'lodash'

import users from '../../models/Users'

export default {
  components: {
    QSelect,
    QField,
    QInput
  },
  data () {
    return {
      sectors: [],
      sectorUserList: {},
      selectedSector: '1a*',
      correspSectors: {
        '1a*': 'Communauté 1',
        '1b*': 'Communauté 2'
      },
      message: {
        content: '',
        success: 0,
        failed: 0
      }
    }
  },
  mounted () {
    this.getSectors();
  },
  computed: {
    orderedSectors () {
      return _.sortBy(this.sectors, ['value']);
    },
    sendIcon () {
      // const vm = this; no need of temp variables as using arrow function
      return {
        icon: 'send',
        content: true,
        handler: async () => {
          const sectorUserList = this.sectorUserList[this.selectedSector];
          this.message.success = 0;
          this.message.failed = 0;
          Loading.show({ message: 'Envoi messages...' });
          for (let i = 0, l = sectorUserList.length; i < l; i++) {
            // console.log(selectedSector[i]._id);
          await this.sendMessage(sectorUserList[i]._id);
          }
          Loading.hide();
          Dialog.create({
            title: 'Récapitulatif',
            message: `Envoyés: ${this.message.success} / Echec: ${this.message.failed}`,
            buttons: ['Fermer']
          });
          // Toast.create('Message(s) envoyé(s)');
        }
      }
    }
  },
  methods: {
    async getSectors () {
      try {
        this.sectorUserList = await users.getAllsectors(this, 'eyJhbGciUzI1NiIsInR5cCI6I9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk2MTU5NTMsImV4cCI6MTUwOTcwMjM1M30.GeHC5wvl_WeP9WTkBdQwuRoVcGbMNnZM3ITHuKMGOkE');
        for (const k in this.sectorUserList) {
          this.sectors.push({
            label: this.correspSectors[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async sendMessage (id) {
      try {
        await users.sendMessageToBotUser(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX.eyJiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk2MTU5NTMsImV4cCI6MTUwOTcwMjM1M30.GeHC5wvl_WeP9WTkBdQwuRoVcGbMNnZM3ITHuKMGOkE', this.message.content, id)
        this.message.success++;
        console.log(this.message.success);
      } catch (e) {
        console.error(e);
        this.message.failed++;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.field-margin
  padding-bottom: 5%
</style>
