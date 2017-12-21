<template>
  <div>
    <q-list class="no-border">
      <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,w_70/v1499948101/images/bot/Pigi.png" alt="Image user" class="avatar">
      </q-item>
      <q-item>
        <q-item-main class="text-bold text-center" :label="user.firstname" />
      </q-item>
      <q-item class="justify-center">
        <router-link to="#">
          <q-icon name="person" color="tertiary" size="1.5rem" />
        </router-link>
        <q-icon id="logout" name="exit to app" color="tertiary" size="1.5rem" class="on-right" @click="logout" />
      </q-item>
      <q-item-separator />
      <q-side-link item to="/dashboard" exact>
        <q-item-side icon="dashboard" />
        <q-item-main label="Dashboard" />
      </q-side-link>
      <q-side-link item to="/dashboard/planning" exact>
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

  import _ from 'lodash'

  import users from '../../models/Users'
  import alenvi from '../../../helpers/token/alenvi'

  export default {
    props: ['user'],
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
      logout() {
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
        this.$router.replace('/dashboard/login');
      }
    }
  }
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .avatar
    width: 70px
    height: 70px

  #logout
    cursor: pointer
</style>
