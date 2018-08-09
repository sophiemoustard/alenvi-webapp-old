<template>
  <q-list class="no-border">
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
</template>

<script>
import { sideMenuMixin } from '../mixins/sideMenuMixin';

export default {
  props: ['user'],
  mixins: [sideMenuMixin]
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

  .router-link-active > div:nth-child(2)
    color: $primary
</style>
