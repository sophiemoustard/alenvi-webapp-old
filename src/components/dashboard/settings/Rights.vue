<template>
  <div class="layout-padding row justify-center">
    <div style="width: 1024px; max-width: 90vw;">
      <p class="caption">Rôles existants:</p>
      <table class="q-table striped-odd highlight compact">
        <thead>
          <tr>
            <th class="text-center">Rôles \ Features</th>
            <th class="text-center" v-for="(feature, index) in roles[0].features" :key="index">{{ feature.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(role, index) in roles" :key="index">
            <td class="text-center">
              <q-input type="text" align="center" v-model="role.name" />
            </td>
            <td class="text-center" v-for="(feature, indexFeature) in role.features" :key="indexFeature">
              <q-input type="number" align="center" v-model.trim.number="feature.permission_level" @blur="updateRole(role, feature.permission_level)" />
            </td>
            <td class="text-center">
              <div class="row justify-end">
                <q-btn icon="delete" color="primary" @click="deleteRole(role._id)" :disable="!roleToAdd.name" flat></q-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="showRoleCreation" id="create-role">
        <br>
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
  QIcon,
  Cookies } from 'quasar'
import _ from 'lodash'

import roles from '../../models/Roles'
// import features from '../../models/Features'

export default {
  components: {
    QInput,
    QBtn,
    QIcon
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
    try {
      await this.getRoles();
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async getRoles () {
      try {
        const rolesRaw = await roles.showAll();
        this.roles = rolesRaw.data.roles;
        await this.initFeaturesInRoleToAdd();
      } catch (e) {
        console.error(e);
      }
    },
    async updateRole(role, permission) {
      try {
        // Check if permission is well sent instead of void
        if (!permission) {
          return ;
        }
        const roleUpdatedRaw = await roles.update(role);
      } catch (e) {
        console.error(e);
      }
    },
    initFeaturesInRoleToAdd() {
      for (let i = 0; i < this.roles[0].features.length; i++) {
        // this.roleToAdd.features[i] = {};
        // this.roleToAdd.features[i].name = this.roles[0].features[i].name;
        // this.roleToAdd.features[i].permission_level = 0;
        this.$set(this.roleToAdd.features, i, { name: this.roles[0].features[i].name, permission_level: 0, _id: this.roles[0].features[i]._id });
      }
    },
    async createRole() {
      try {
        const roleCreatedRaw = await roles.create(this.roleToAdd);
        this.roleCreated = roleCreatedRaw.data.role;
        this.showRoleCreation = false;
        this.roleToAdd.name = "";
        this.getRoles();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
