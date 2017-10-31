<template>
  <div class="layout-padding row justify-center">
    <div style="width: 700px; max-width: 90vw;">
    <q-field icon="group" class="field-margin">
      <q-select v-model="selectedSector" :options="orderedSectors" separator />
    </q-field>
    <q-field icon="message">
      <q-input v-model="message" placeholder="Ecrire message..." type="textarea" :min-rows="2" :after="[sendIcon]"/>
    </q-field>
    </div>
  </div>
</template>

<script>
import {
  QSelect,
  QField,
  QInput,
  Toast } from 'quasar'
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
      message: ''
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
      const vm = this;
      return {
        icon: 'send',
        content: true,
        handler () {
          const selectedSector = vm.sectorUserList[vm.selectedSector];
          for (let i = 0, l = selectedSector.length; i < l; i++) {
            console.log(selectedSector[i]._id);
          // vm.sendMessage(selectedSector);
          }
        }
      }
    }
  },
  methods: {
    async getSectors () {
      try {
        this.sectorUserList = await users.getAllsectors(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWNhMWU5MzhjYzVjNTAwMTI1MWVhMWUiLCJpYXQiOjE1MDk0NDE0MTAsImV4cCI6MTUwOTUyNzgxMH0.JLFYBVsJiIRTgCdo3nFBeaj_KW4MPQNTK5e7oXeAgaI');
        console.log(this.sectorUserList);
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
    async sendMessage () {
      try {
        await users.sendMessageToBotUser(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWNhMWU5MzhjYzVjNTAwMTI1MWVhMWUiLCJpYXQiOjE1MDk0NDE0MTAsImV4cCI6MTUwOTUyNzgxMH0.JLFYBVsJiIRTgCdo3nFBeaj_KW4MPQNTK5e7oXeAgaI', this.message, '5947d1aeff6c27ce07405656')
        Toast.create('Message(s) envoyé(s)');
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
