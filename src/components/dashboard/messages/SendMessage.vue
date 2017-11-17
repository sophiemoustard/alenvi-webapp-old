<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
    <p class="caption">Envoi de message aux utilisateurs du bot</p>
    <q-field icon="group" helper="Choix communauté">
      <q-select v-model="selectedSector" :options="orderedSectors" separator />
    </q-field>
    <q-field icon="message">
      <q-input :disable="!selectedSector" v-model="message.content" float-label="Ecrire message" type="textarea" :after="[{ icon: 'send', content: true, handler: handleMessage }]"/>
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
  Loading,
  Cookies } from 'quasar'
import _ from 'lodash'

import users from '../../models/Users'
import messages from '../../models/Messages'
import ogust from '../../models/Ogust'

export default {
  components: {
    QSelect,
    QField,
    QInput
  },
  data () {
    return {
      sectors: [],
      sectorUserList: [],
      selectedSector: '',
      message: {
        id: '',
        content: '',
        success: 0,
        failed: 0
      }
    }
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    orderedSectors () {
      return _.sortBy(this.sectors, ['value']);
    }
  },
  methods: {
    async getSectors () {
      try {
        const allSectorsRaw = await ogust.getOgustSectors();
        for (const k in allSectorsRaw) {
          if (k === '*') {
            continue;
          }
          this.sectors.push({
            label: allSectorsRaw[k],
            value: k
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getEmployeesIdBySector () {
      try {
        const employees = await ogust.getEmployees({ sector: this.selectedSector });
        for (const k in employees) {
          this.sectorUserList.push(employees[k].id_employee);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getUserIdByEmployeeId (param) {
      try {
        const user = await users.showAll(param)
        return user[0]._id;
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
        if (!Cookies.get('user_id')) {
          this.$router.push('/dashboard/login');
        }
        const storedMessage = await messages.storeMessage(data, Cookies.get('user_id'));
        this.message.id = storedMessage.data.data.message._id;
      } catch (e) {
        console.error(e);
      }
    },
    async sendMessage (messageId, recipientId) {
      try {
        await messages.sendMessage(messageId, recipientId);
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
        await messages.addMessageRecipientById(messageId, data);
      } catch (e) {
        console.error(e);
      }
    },
    async handleMessage () {
      await this.storeMessage();
      await this.getEmployeesIdBySector();
      this.message.success = 0;
      this.message.failed = 0;
      Loading.show({ message: 'Envoi messages...' });
      for (let i = 0, l = this.sectorUserList.length; i < l; i++) {
        const sentMessage = await this.sendMessage(this.message.id, this.sectorUserList[i]);
        const userId = await this.getUserIdByEmployeeId({ employee_id: this.sectorUserList[i] });
        const recipient = {
          success: sentMessage,
          recipientId: userId
        };
        await this.addMessageRecipient(this.message.id, recipient);
      }
      setTimeout(() => {
        Loading.hide();
      }, 10000);
      Dialog.create({
        title: 'Récapitulatif',
        message: `Envoyés: ${this.message.success} / Echec: ${this.message.failed}`,
        buttons: ['Fermer']
      });
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
  }
}
</script>

<style lang="stylus" scoped>
.field-margin
  padding-bottom: 5%
</style>
