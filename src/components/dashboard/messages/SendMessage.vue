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
import messages from '../../models/Messages'

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
        id: '',
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
          await this.storeMessage();
          const sectorUserList = this.sectorUserList[this.selectedSector];
          this.message.success = 0;
          this.message.failed = 0;
          Loading.show({ message: 'Envoi messages...' });
          for (let i = 0, l = sectorUserList.length; i < l; i++) {
            // console.log(selectedSector[i]._id);
            const sentMessage = await this.sendMessage(this.message.id, sectorUserList[i]._id);
            const recipient = {
              success: sentMessage,
              recipientId: sectorUserList[i]._id
            };
            await this.addMessageRecipient(this.message.id, recipient);
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
        this.sectorUserList = await users.getAllsectors(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk5NTg1MzEsImV4cCI6MTUxMDA0NDkzMX0.rYa1pYL44WmSlYZJm_J91vRinPAQhjW00eK6Zs2MTpI');
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
    async storeMessage () {
      try {
        const data = {
          message: this.message.content,
          sectors: this.selectedSector
        };
        const storedMessage = await messages.storeMessage(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk5NTg1MzEsImV4cCI6MTUxMDA0NDkzMX0.rYa1pYL44WmSlYZJm_J91vRinPAQhjW00eK6Zs2MTpI', data, '59ca1e938cc5c5001251ea1e');
        this.message.id = storedMessage.data.data.message._id;
      } catch (e) {
        console.error(e);
      }
    },
    async sendMessage (messageId, recipientId) {
      try {
        await messages.sendMessage(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk5NTg1MzEsImV4cCI6MTUxMDA0NDkzMX0.rYa1pYL44WmSlYZJm_J91vRinPAQhjW00eK6Zs2MTpI', messageId, recipientId);
        this.message.success++;
        return true;
      } catch (e) {
        console.error(e);
        this.message.failed++;
        return false;
      }
    },
    async addMessageRecipient (messageId, data) {
      try {
        await messages.addMessageRecipientById(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk5NTg1MzEsImV4cCI6MTUxMDA0NDkzMX0.rYa1pYL44WmSlYZJm_J91vRinPAQhjW00eK6Zs2MTpI', messageId, data);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.field-margin
  padding-bottom: 5%
</style>
