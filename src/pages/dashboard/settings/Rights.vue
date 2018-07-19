<template>
  <q-page padding class="row justify-center">
    <div style="width: 1024px; max-width: 90vw;">
      <!-- <p class="caption">Rôles existants:</p> -->
      <q-select
        v-model="select"
        float-label="Rôles existants"
        radio
        :options="selectOptions"
        @input="changeRole"
      />
      <table class="q-table striped-odd highlight compact" v-if="roleChosen">
        <!-- <thead> -->
          <!-- @blur="updateRole(role, 1)" :readonly="isRoleAdmin(role)" -->
          <!-- <td v-for="(role, index) in rolesTest" :key="index"><q-input type="text" align="center" v-model="role.name" readonly/></td> -->
        <!-- </thead> -->
        <tbody>
          <tr v-for="(right, index) in roleChosen.rights" :key="index">
            <td class="text-center">{{ right.description }}</td>
            <td class="text-center"><q-checkbox v-model="right.hasAccess" /></td>
          </tr>
          <!-- <tr v-for="(role, index) in rolesTest" :key="index">
            <td class="text-center" v-for="(right, indexFeature) in role.rights" :key="indexFeature">
              <q-input type="number" align="center" v-model="right.hasAccess" :readonly="isRoleAdmin(role)" @blur="updateRole(role, feature.permission_level)" />
            </td> -->
            <!-- <td class="text-center">
              <div class="justify-center">
                <q-btn icon="delete" color="primary" @click="deleteRole(role._id)" :disable="isRoleAdmin(role)" flat></q-btn>
              </div>
            </td> -->
          <!-- </tr> -->
        </tbody>
        <!-- <tbody>
          <tr v-for="(role, index) in roles" :key="index">
            <td class="text-center">
              <q-input type="text" align="center" v-model="role.name" readonly @blur="updateRole(role, 1)"/>
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
        </tbody> -->
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
      select: {},
      selectOptions: [],
      roleChosen: {},
      rolesTest: [
        {
          '_id': '5a3bc12a5e421400147d5eda',
          'name': 'Coach',
          'rights': [
            {
              'right_id': '5a3bc0005e421400147d5ec4',
              'name': 'users:create',
              'description': 'Créer utilisateurs',
              'hasAccess': true
            },
            {
              'right_id': '5a3bc0065e421400147d5ec7',
              'name': 'profiles:read:user',
              'description': 'Consulter les informations de profil d’autres utilisateurs',
              'hasAccess': true,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a3bc0315e421400147d5ecd',
              'name': 'planning:edit:user',
              'description': 'Editer les événements du planning des autres utilisateurs',
              'hasAccess': true,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a5735cb1f2a1f0014d48e14',
              'name': 'planning:read:user',
              'description': 'Voir les modifications planning des autres utilisateurs',
              'hasAccess': true,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a5735da1f2a1f0014d48e17',
              'name': 'users:welcome:user',
              'description': 'Processus d’accueil d’un utilisateur',
              'hasAccess': true,
              'rolesConcerned': [
                {
                  'role_id': '5a3bc11f5e421400147d5ed5',
                  'name': 'Auxiliaire'
                },
                {
                  'role_id': '5a573f4c1f2a1f0014d48e1a',
                  'name': 'Aidant'
                }
              ]
            }
          ]
        },
        {
          '_id': '5a573f4c1f2a1f0014d48e1a',
          'name': 'Client',
          'rights': [
            {
              'right_id': '5a3bc0005e421400147d5ec4',
              'name': 'users:create',
              'description': 'Créer utilisateurs',
              'hasAccess': false
            },
            {
              'right_id': '5a3bc0065e421400147d5ec7',
              'name': 'profiles:read:user',
              'description': 'Consulter les informations de profil d’autres utilisateurs',
              'hasAccess': false,
              'rolesConcerned': []
            },
            {
              'right_id': '5a3bc0315e421400147d5ecd',
              'name': 'planning:edit:user',
              'description': 'Editer les événements du planning des autres utilisateurs',
              'hasAccess': false,
              'rolesConcerned': []
            },
            {
              'right_id': '5a5735cb1f2a1f0014d48e14',
              'name': 'planning:read:user',
              'description': 'Voir les modifications planning des autres utilisateurs',
              'hasAccess': false,
              'rolesConcerned': []
            },
            {
              'right_id': '5a5735da1f2a1f0014d48e17',
              'name': 'users:welcome:user',
              'description': 'Processus d’accueil d’un utilisateur',
              'hasAccess': false,
              'rolesConcerned': []
            }
          ],
        },
        {
          '_id': '5a3bc12f5e421400147d5edf',
          'name': 'Auxiliaire',
          'rights': [
            {
              'right_id': '5a3bc0005e421400147d5ec4',
              'name': 'users:create',
              'description': 'Créer utilisateurs',
              'hasAccess': false
            },
            {
              'right_id': '5a3bc0065e421400147d5ec7',
              'name': 'profiles:read:user',
              'description': 'Consulter les informations de profil d’autres utilisateurs',
              'hasAccess': true,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a3bc0315e421400147d5ecd',
              'name': 'planning:edit:user',
              'description': 'Editer les événements du planning des autres utilisateurs',
              'hasAccess': false,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a5735cb1f2a1f0014d48e14',
              'name': 'planning:read:user',
              'description': 'Voir les modifications planning des autres utilisateurs',
              'hasAccess': true,
              'rolesConcerned': [{
                'role_id': '5a3bc11f5e421400147d5ed5',
                'name': 'Auxiliaire'
              }]
            },
            {
              'right_id': '5a5735da1f2a1f0014d48e17',
              'name': 'users:welcome:user',
              'description': 'Processus d’accueil d’un utilisateur',
              'hasAccess': true,
              'rolesConcerned': [
                {
                  'role_id': '5a3bc11f5e421400147d5ed5',
                  'name': 'Auxiliaire'
                },
                {
                  'role_id': '5a573f4c1f2a1f0014d48e1a',
                  'name': 'Aidant'
                }
              ]
            }
          ]
        }
      ],
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
      this.fillSelect();
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    changeRole (selected) {
      for (let i = 0; i < this.rolesTest.length; i++) {
        if (this.rolesTest[i]._id === selected) {
          this.roleChosen = this.rolesTest[i];
        }
      }
    },
    fillSelect () {
      for (let i = 0; i < this.rolesTest.length; i++) {
        this.$set(this.selectOptions, i, { label: this.rolesTest[i].name, value: this.rolesTest[i]._id })
      }
    },
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
