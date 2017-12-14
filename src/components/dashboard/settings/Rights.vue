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
      <div v-if="showRoleCreation" id="create-role">
        <p class="caption">Nouveau rôle:</p>
        <table>
          <thead>
            <tr>
              <th></th>
              <th class="text-center" v-for="(feature, index) in roles[0].features" :key="index">{{ feature.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <q-input type="text" align="center" v-model="roleToAdd.name" placeholder="Nom rôle"/>
              </td>
              <td class="text-center" v-for="(feature, index) in roleToAdd.features" :key="index">
                <q-input type="number" align="center" v-model.trim.number="feature.permission_level" />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="row justify-end">
          <q-btn color="primary" @click="createRole()" :disable="!roleToAdd.name" flat>Créer</q-btn>
        </div>
      </div>
      <p>0: Aucun droit<br />1: Droit de visibilité (lecture)<br />2: Droit de modification (écriture)<br /></p>
      <!-- Show create role button -->
      <div v-if="!showRoleCreation" class="row justify-begin">
        <q-btn color="primary" @click="showRoleCreation = !showRoleCreation">Créer rôle</q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Dialog,
  QInput,
  QBtn,
  Cookies } from 'quasar'
import _ from 'lodash'

import roles from '../../models/Roles'
// import features from '../../models/Features'

export default {
  components: {
    QInput,
    QBtn
  },
  data () {
    return {
      roleToAdd: {
        features: []
      },
      roles: [{
        features: []
      }],
      showRoleCreation: false,
      maxPermission: 2,
      minPermission: 0
    }
  },
  async created () {
    // await this.getRoles();
    this.roles = await roles.showAll();
    console.log('this.roles=', this.roles);
    this.initFeaturesInRoleToAdd();
  },
  methods: {
    async getRoles () {
      try {
        this.roles = await roles.showAll();
        await this.initFeaturesInRoleToAdd();
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
        // this.roleToAdd.features[i] = {};
        // this.roleToAdd.features[i].name = this.roles[0].features[i].name;
        // this.roleToAdd.features[i].permission_level = 0;
        this.$set(this.roleToAdd.features, i, { name: this.roles[0].features[i].name, permission_level: 0, _id: this.roles[0].features[i]._id });
      }
      console.log('this.roleToAdd.features=', this.roleToAdd.features);
    },
    async createRole() {
      try {
        this.roleCreated = await roles.create(this.roleToAdd);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
