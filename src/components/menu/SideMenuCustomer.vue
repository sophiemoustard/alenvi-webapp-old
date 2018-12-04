<template>
  <q-list class="no-border">
    <ni-menu-item name="customer planning" icon="date range" label="Planning" />
    <ni-menu-item name="customer documents" icon="folder" label="Facturation" />
    <ni-menu-item name="customer profile" :params="{ id: user._id }" icon="person" label="Mes informations" />
    <q-item to="/login" @click.native="logout" replace>
      <q-item-side icon="exit to app" />
      <q-item-main label="Déconnexion" />
    </q-item>
  </q-list>
</template>

<script>
import { sideMenuMixin } from '../../mixins/sideMenuMixin';
import MenuItem from './MenuItem.vue';

export default {
  props: ['user'],
  mixins: [sideMenuMixin],
  components: {
    'ni-menu-item': MenuItem,
  },
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
