<template>
  <div class="layout-padding row justify-center">
    <div style="width: 1024px; max-width: 90vw;">
      <p class="caption">Rôles existants:</p>
      <table class="q-table striped-odd highlight">
        <thead>
          <tr>
            <th></th>
            <th class="text-center" v-for="(feature, index) in roles[0].features" :key="index">{{ feature.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(role, index) in roles" :key="index">
            <td class="text-center">
              <q-input type="text" align="center" v-model="role.name" />
            </td>
            <td class="text-center" v-for="(feature, index) in role.features" :key="index">
              <q-input type="number" align="center" v-model.trim.number="feature.permission_level" @blur="updateRole(role, feature.permission_level)" />
            </td>
          </tr>
        </tbody>
      </table>
      <p>0: Aucun droit<br />1: Droit de visibilité (lecture)<br />2: Droit de modification (écriture)<br /></p>
      <p class="caption">Nouveau rôle:</p>
      <table>
        <tbody>
          <tr>
            <td>
              <q-input type="text" align="center" v-model="roleToAdd.name" placeholder="Nom rôle"/>
            </td>
            <td class="text-center" v-for="(feature, index) in roleToAdd.features" :key="index">
              <q-input type="number" align="center" v-model.trim.number="feature.permission_level" @blur="logRoleToAddFeatures(index)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {
  Dialog,
  QInput,
  Cookies } from 'quasar'
import _ from 'lodash'

import roles from '../../models/Roles'
// import features from '../../models/Features'

export default {
  components: {
    QInput
  },
  data () {
    return {
      roleToAdd: {
        features: []
      },
      roles: [{
        features: []
      }],
      featurePermissionsToAdd: [],
      maxPermission: 2,
      minPermission: 0
    }
  },
  async created () {
    this.getRoles();
  },
  methods: {
    async getRoles () {
      try {
        this.roles = await roles.showAll();
        this.initFeaturesInRoleToAdd();
      } catch (e) {
        console.error(e);
      }
    },
    async updateRole(role, permission) {
      try {
        if (!permission) {
          return ;
        }
        console.log('roles features=', this.roles);
        // const roleUpdated = await roles.update(role);
      } catch (e) {
        console.error(e);
      }
    },
    updateRoleToAdd(feature) {
      // console.log('FEATURE_NAME_TO_ADD', feature.name);
      // console.log('FEATURES_PERMISSION_TO_ADD', this.featurePermissionsToAdd);

      // console.log('ROLE_TO_ADD', this.roleToAdd);

      // for (let i = -1; i < this..length; ++i) {
      //   console.log('FEATURE_NAME', feature.name);
      //   console.log();
      //   this.roleToAdd.features.push({
      //     [feature.name]: this.featuresToAdd[0]
      //   })
      // }
      // console.log(this.roleToAdd);
    },
    initFeaturesInRoleToAdd() {
      for (let i = 0; i < this.roles[0].features.length; i++) {
        this.roleToAdd.features[i] = {};
        this.roleToAdd.features[i].name = this.roles[0].features[i].name;
        this.roleToAdd.features[i].permission_level = 0;
      }
      console.log(this.roleToAdd.features);
    },
    logRoleToAddFeatures() {
      console.log('features to add=', this.roleToAdd.features);
    }
    // checkNumber() {

    // }
  }
}
</script>

<style lang="stylus" scoped>
</style>
