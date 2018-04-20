<template>
  <q-page padding class="row justify-center">
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
              <q-input type="text" align="center" v-model="role.name" readonly @blur="updateRole(role, 1)"/> <!-- :readonly="isRoleAdmin(role)" -->
            </td>
            <td class="text-center" v-for="(feature, indexFeature) in role.features" :key="indexFeature">
              <q-input type="number" align="center" v-model.trim.number="feature.permission_level" :readonly="isRoleAdmin(role)" @blur="updateRole(role, feature.permission_level)" />
            </td>
            <td class="text-center">
              <div class="justify-center">
                <q-btn icon="delete" color="primary" @click="deleteRole(role._id)" :disable="isRoleAdmin(role)" flat></q-btn>
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

  </q-page>
</template>

<script>
// import _ from 'lodash'

export default {
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
        const rolesRaw = await this.$roles.showAll();
        this.roles = rolesRaw.data.roles;
        await this.initFeaturesInRoleToAdd();
      } catch (e) {
        console.error(e);
      }
    },
    async updateRole (role, permission) {
      try {
        // Check if permission is well sent instead of void
        if (isNaN(permission)) {
          return;
        }
        await this.$roles.update(role);
      } catch (e) {
        console.error(e);
      }
    },
    initFeaturesInRoleToAdd () {
      for (let i = 0; i < this.roles[0].features.length; i++) {
        // this.roleToAdd.features[i] = {};
        // this.roleToAdd.features[i].name = this.roles[0].features[i].name;
        // this.roleToAdd.features[i].permission_level = 0;

        // Have to use this.$set because in Quasar q-input v-model data isn't reactive
        this.$set(this.roleToAdd.features, i, { name: this.roles[0].features[i].name, permission_level: 0, _id: this.roles[0].features[i]._id });
      }
    },
    async createRole () {
      try {
        const roleCreatedRaw = await this.$roles.create(this.roleToAdd);
        this.roleCreated = roleCreatedRaw.data.role;
        this.showRoleCreation = false;
        this.roleToAdd.name = '';
        this.getRoles();
      } catch (e) {
        console.error(e);
      }
    },
    async deleteRole (roleId) {
      try {
        const roleDeleted = await this.$roles.delete(roleId);
        console.log(roleDeleted);
        this.getRoles();
      } catch (e) {
        console.error(e);
      }
    },
    isRoleAdmin (role) {
      return role.name === 'Admin';
    }
  }
}
</script>

<style>
</style>
