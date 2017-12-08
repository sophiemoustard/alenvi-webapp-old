<template>
  <div class="layout-padding row justify-center">
    <!-- <div style="width: 700px; max-width: 90vw;">
      <p>Test</p>
    </div> -->
    <table class="q-table striped-odd highlight">
      <thead>
        <tr>
          <th></th>
          <th class="text-center" v-for="(feature, index) in roles[0].features" :key="index">{{ feature.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(role, index) in roles" :key="index">
          <td class="text-center">{{ role.name }}</td>
          <td class="text-center" v-for="(feature, index) in role.features" :key="index">
            <q-input align="center" v-model="feature.permission_level" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  Dialog,
  QInput,
  Cookies } from 'quasar'
import _ from 'lodash'

import roles from '../../models/Roles'
import features from '../../models/Features'

export default {
  components: {
    QInput
  },
  data () {
    return {
      // roles: {},
      features: {},
      featuresLength: 0,
      roles: [
        {
          "name": "Admin",
          "features": [
            {
              "_id": "123122",
              "name": "SendMessage",
              "permission_level": "1"
            },
            {
              "_id": "123122",
              "name": "Account",
              "permission_level": "2"
            },
            {
              "_id": "123122",
              "name": "Pigi",
              "permission_level": "2"
            },
            {
              "_id": "123122",
              "name": "Params",
              "permission_level": "2"
            }
          ]
        },
        {
          "name": "Tech",
          "features": [
            {
              "_id": "123122",
              "name": "SendMessage",
              "permission_level": "2"
            },
            {
              "_id": "123122",
              "name": "Account",
              "permission_level": "1"
            },
            {
              "_id": "123122",
              "name": "Pigi",
              "permission_level": "2"
            },
            {
              "_id": "123122",
              "name": "Params",
              "permission_level": "2"
            }
          ]
        }
      ]
    }
  },
  async mounted () {
    // await this.getRoles();
    await this.getFeatures();
  },
  methods: {
    async getRoles (params) {
      try {
        this.roles = await roles.showAll(params)
        console.log(this.roles);
      } catch (e) {
        console.error(e);
      }
    },
    async getFeatures (params) {
      try {
        this.features = await features.showAll(params)
        this.featuresLength = 4,
        console.log(this.features);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
