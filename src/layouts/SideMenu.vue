<template>
  <div>
    <!-- If we are another role than customer -->
    <q-list v-if="user.role.name !== 'Client'" class="no-border">
      <q-item class="justify-center">
        <img :src="user.picture && user.picture.link ? user.picture.link : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto/v1513764284/images/users/default_avatar.png'" alt="Image user" class="avatar">
      </q-item>
      <q-item>
        <q-item-main class="text-bold text-center" :label="user.firstname" />
      </q-item>
      <q-item class="justify-center">
        <q-icon id="profile" name="person" color="tertiary" size="1.5rem" @click.native="goToProfile"/>
        <q-icon id="logout" name="exit to app" color="tertiary" size="1.5rem" class="on-right" @click.native="logout" />
      </q-item>
      <q-item-separator />
      <q-item to="/dashboard" exact>
        <q-item-side icon="dashboard" />
        <q-item-main label="Dashboard" />
      </q-item>
      <q-item v-can="{ feature: 'Planning' }" to="/dashboard/planning" exact>
        <q-item-side icon="date range" />
        <q-item-main label="Planning" />
      </q-item>
      <q-item v-can="{ feature: 'Auxiliaires' }" to="/dashboard/auxiliaries" exact>
        <q-item-side icon="ion-android-contacts" />
        <q-item-main label="Auxiliaires d'envie" />
      </q-item>
      <q-item v-can="{ feature: 'Aidants' }" to="/dashboard/caregivers" exact>
        <q-item-side icon="group" />
        <q-item-main label="Aidants familiaux" />
      </q-item>
      <q-item v-can="{ feature: 'Pigi' }" to="/dashboard/pigi" exact>
        <q-item-side icon="message" />
        <q-item-main label="Pigi" />
      </q-item>
      <q-item-separator />
      <q-item v-can="{ feature: 'Paramètres' }" to="/dashboard/settings" exact>
        <q-item-side icon="settings" />
        <q-item-main label="Paramètres" />
      </q-item>
    </q-list>
    <!-- If we are another customer -->
    <q-list v-if="user.role.name === 'Client'" class="no-border">
      <q-item to="/dashboard/customer/planning" exact>
        <q-item-side icon="date range" />
        <q-item-main label="Planning" />
      </q-item>
      <q-item to="/dashboard/customer/documents" exact>
        <q-item-side icon="folder" />
        <q-item-main label="Facturation" />
      </q-item>
      <q-item :to="{ name: 'customer profile', params: { id: user._id } }" exact>
        <q-item-side icon="person" />
        <q-item-main label="Mes informations" />
      </q-item>
      <q-item to="/login" @click.native="logout" replace>
        <q-item-side icon="exit to app" />
        <q-item-main label="Déconnexion" />
      </q-item>
    </q-list>
  </div>
</template>

<script>

export default {
  props: ['user'],
  methods: {
    logout () {
      this.$q.cookies.remove('alenvi_token', {
        path: '/'
      });
      this.$q.cookies.remove('alenvi_token_expires_in', {
        path: '/'
      });
      this.$q.cookies.remove('refresh_token', {
        path: '/'
      });
      this.$q.cookies.remove('user_id', {
        path: '/'
      });
      if (this.user.role.name !== 'Client') {
        this.$router.replace('/login');
      }
    },
    goToProfile () {
      if (this.$q.platform.is.mobile) {
        this.$store.commit('main/setToggleDrawer', false);
      }
      if (this.user.role.name !== 'Client') {
        this.$router.push({ name: 'profile', params: { id: this.user._id } });
      } else {
        this.$router.push({ name: 'customer profile', params: { id: this.user._id } });
      }
    }
    // changeRefreshState () {
    //   this.$store.commit('changeRefreshState');
    // }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .avatar-alenvi
    width: 120px
    height: 85px

  #logout
    cursor: pointer

  #profile
    cursor: pointer

  .user-menu
    cursor: pointer

  .router-link-active
    background: none
    color: $primary

  .router-link-active > div:first-child
    color: $primary
</style>
