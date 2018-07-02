<template>
  <q-page padding class="row justify-center">
    <div style="width: 700px; max-width: 90vw;">
    <p class="caption">Envoi de message aux utilisateurs du bot</p>
    <select-sector v-model="selectedSector"></select-sector>
    <q-field icon="message">
      <q-input :disable="!selectedSector" v-model="message.content" float-label="Ecrire message" type="textarea" :after="[{ icon: 'send', content: true, handler: handleMessage }]"/>
    </q-field>
    </div>
  </q-page>
</template>

<script>
import _ from 'lodash'

import SelectSector from '../../../components/SelectSector'

export default {
  components: {
    SelectSector
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
      },
      progress: {
        model: 0
      }
    }
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    orderedSectors () {
      return _.sortBy(this.sectors, ['value']);
    },
    user () {
      return this.$store.getters['main/user'];
    }
  },
  methods: {
    async getSectors () {
      try {
        const allSectorsRaw = await this.$ogust.getList('employee.sector');
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
        this.sectorUserList = [];
        const employees = await this.$users.showAll({ sector: this.selectedSector });
        for (let i = 0, l = employees.length; i < l; i++) {
          this.sectorUserList.push(employees[i]._id);
        }
      } catch (e) {
        console.error(e);
      }
    },
    // async getUserIdByEmployeeId (param) {
    //   try {
    //     const user = await this.$users.showAll(param)
    //     return user[0]._id;
    //   } catch (e) {
    //     console.error(e);
    //   }
    // },
    async storeMessage () {
      try {
        const data = {
          message: this.message.content,
          sectors: this.selectedSector,
          senderId: this.user._id
        };
        // if (!Cookies.get('user_id')) {
        //   this.$router.push('/dashboard/login');
        // }
        const storedMessage = await this.$messages.storeMessage(data);
        this.message.id = storedMessage.data.data.message._id;
      } catch (e) {
        console.error(e);
      }
    },
    async sendMessage (messageId, recipientId) {
      try {
        const message = await this.$messages.getById(messageId);
        await this.$messages.sendMessage({ message: message.content, recipientId });
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
        await this.$messages.addMessageRecipientById(messageId, data);
      } catch (e) {
        console.error(e);
      }
    },
    async handleMessage () {
      await this.storeMessage();
      await this.getEmployeesIdBySector();
      this.message.success = 0;
      this.message.failed = 0;
      this.$q.loading.show({ message: 'Envoi messages...' });

      for (let i = 0, l = this.sectorUserList.length; i < l; i++) {
        const sentMessage = await this.sendMessage(this.message.id, this.sectorUserList[i]);
        // const userId = await this.getUserIdByEmployeeId({ employee_id: this.sectorUserList[i] });
        const recipient = {
          success: sentMessage,
          recipientId: this.sectorUserList[i]
        };
        await this.addMessageRecipient(this.message.id, recipient);
      }
      this.$q.loading.hide();
      this.$q.dialog({
        title: 'Récapitulatif',
        message: `Envoyés: ${this.message.success} / Echec: ${this.message.failed}`,
        buttons: ['Fermer']
      });
    }
  }
  // beforeDestroy () {
  //   clearTimeout(this.timeout);
  // }
}
</script>

<style lang="stylus" scoped>
.q-field
  margin: 16px 0
</style>
