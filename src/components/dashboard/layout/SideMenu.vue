<template>
  <div>
    <q-list class="no-border">
      <q-item class="justify-center">
        <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,w_70/v1499948101/images/bot/Pigi.png" alt="Image user" class="avatar">
      </q-item>
      <q-item>
        <q-item-main class="text-bold text-center" label="User" />
      </q-item>
      <q-item class="justify-center">
        <router-link to="#">
          <q-icon name="person" color="tertiary" size="1.5rem" />
        </router-link>
        <router-link to="#">
          <q-icon name="exit to app" color="tertiary" size="1.5rem" class="on-right" />
        </router-link>
      </q-item>
      <q-item-separator />
      <q-side-link item to="/dashboard/users" exact>
        <q-item-side icon="group" />
        <q-item-main label="Utilisateurs" />
      </q-side-link>
      <q-side-link item to="/dashboard/messages" exact>
        <q-item-side icon="message" />
        <q-item-main label="Envoi Messages" />
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
  QSideLink } from 'quasar'

export default {
  components: {
    QItem,
    QItemSide,
    QItemMain,
    QItemSeparator,
    QList,
    QBtn,
    QIcon,
    QSideLink
  }
}
</script>

<style lang="stylus">
  @import '~variables'

  .avatar
    width: 70px
    height: 70px
</style>
