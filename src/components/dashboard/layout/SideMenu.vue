<template>
  <div>
    <q-list v-if="user.role.name != 'Client'" class="no-border">
      <q-item class="justify-center">
        <img :src="user.picture ? user.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto/v1513764284/images/users/default_avatar.png'" alt="Image user" class="avatar-alenvi">
      </q-item>
      <q-item>
        <q-item-main class="text-bold text-center" :label="user.firstname" />
      </q-item>
      <q-item class="justify-center">
        <q-side-link item :to="{ name: 'profile', params: {id: user._id }}" exact>
          <q-icon name="person" color="tertiary" size="1.5rem"/>
        </q-side-link>
        <!-- <router-link :to="{ name: 'profile', params: {id: user._id }}">
          <q-icon name="person" color="tertiary" size="1.5rem"/>
        </router-link> -->
        <q-icon id="logout" name="exit to app" color="tertiary" size="1.5rem" class="on-right" @click="logout" />
      </q-item>
      <q-item-separator />
      <q-side-link item to="/dashboard" exact>
        <q-item-side icon="dashboard" />
        <q-item-main label="Dashboard" />
      </q-side-link>
      <q-side-link v-can="{ feature: 'Planning', user }" item to="/dashboard/planning" exact>
        <q-item-side icon="date range" />
        <q-item-main label="Planning" />
      </q-side-link>
      <q-side-link v-can="{ feature: 'Utilisateurs', user }" item to="/dashboard/users" exact>
        <q-item-side icon="group" />
        <q-item-main label="Utilisateurs" />
      </q-side-link>
      <q-side-link v-can="{ feature: 'Pigi', user }" item to="/dashboard/pigi" exact>
        <q-item-side icon="message" />
        <q-item-main label="Pigi" />
      </q-side-link>
      <q-item-separator />
      <q-side-link v-can="{ feature: 'Paramètres', user }" item to="/dashboard/settings" exact>
        <q-item-side icon="settings" />
        <q-item-main label="Paramètres" />
      </q-side-link>
    </q-list>
    <q-list v-if="user.role.name == 'Client'" class="no-border">
      <!-- <q-item>
        <q-item-main class="text-bold text-center" :label="user.lastname" />
      </q-item>
      <q-item class="justify-center">
        <q-icon name="person" color="tertiary" size="1.5rem" class="on-right user-menu" @click="goToProfile" />
        <q-icon name="exit to app" color="tertiary" size="1.5rem" class="on-right user-menu" @click="logout" />
      </q-item>
      <q-item-separator /> -->
      <!-- <q-side-link item to="/dashboard/customer/home" exact>
        <q-item-side icon="home" />
        <q-item-main label="Accueil" />
      </q-side-link> -->
      <q-side-link item to="/dashboard/customer/planning" exact>
        <q-item-side icon="date range" />
        <q-item-main label="Planning" />
      </q-side-link>
      <q-side-link item to="/dashboard/customer/documents" exact>
        <q-item-side icon="folder" />
        <q-item-main label="Facturation" />
      </q-side-link>
      <q-side-link item :to="{ name: 'customer profile', params: { id: user._id } }" exact>
        <q-item-side icon="person" />
        <q-item-main label="Mes informations" />
      </q-side-link>
      <q-side-link item to="/dashboard/login" @click.native="logout" replace>
        <q-item-side icon="exit to app" />
        <q-item-main label="Déconnexion" />
      </q-side-link>
    </q-list>
  </div>
</template>

<script>
  import {
    QItem,
    QItemSide,
    QItemMain,
    QItemSeparator,
    QList,
    QBtn,
    QIcon,
    QSideLink,
    Cookies
  } from 'quasar'

  export default {
    props: ['user'],
    inject: ['layout'],
    components: {
      QItem,
      QItemSide,
      QItemMain,
      QItemSeparator,
      QList,
      QBtn,
      QIcon,
      QSideLink
    },
    methods: {
      logout () {
        Cookies.remove('alenvi_token', {
          path: '/'
        });
        Cookies.remove('alenvi_token_expires_in', {
          path: '/'
        });
        Cookies.remove('refresh_token', {
          path: '/'
        });
        Cookies.remove('user_id', {
          path: '/'
        });
        if (this.user.role.name !== 'Client') {
          this.$router.replace('/dashboard/login');
        }
      },
      goToProfile () {
        this.layout.hideCurrentSide(() => {
          this.$router.push({ name: 'customer profile', params: { id: this.user._id } });
        });
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

  .user-menu
    cursor: pointer

  .router-link-active
    background: none
    color: $primary 
  
  .router-link-active > div:first-child
    color: $primary
</style>
