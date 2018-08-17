<template>
  <div style="max-width: 90vw" v-if="user">
    <div class="row justify-between col-12">
      <div class="row items-baseline">
        <div class="row">
          <q-icon v-if="isExternalUser" class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary" @click.native="$router.go(-1)" />
        </div>
        <h4>{{ user.firstname }} {{ user.lastname }}</h4>
      </div>
      <img :src="user.picture.link" alt="Img user" class="avatar">
    </div>
    <div class="row col-12 profile-info">
      <div class="pl-lg col-6">
        <div class="row items-center">
          <div class="row items-center justify-center on-left" style="width: 17px; height: 17px">
            <div :class="[{ activeDot: user.isActive, inactiveDot: !user.isActive }]" />
          </div>
          <div>{{ userStatus }}</div>
        </div>
        <div class="row items-center">
          <q-icon name="restore" class="on-left" size="1rem" />
          <div>Depuis le {{ userStartDate }} ({{ userRelativeStartDate }})</div>
        </div>
      </div>
      <div class="col-6 row">
        <div class="col-1">
          <q-icon size="36px" name="phone_iphone"></q-icon>
        </div>
        <div class="col-10 col full-height justify-between">
          <div class="text-weight-bold">Compte webapp créé</div>
          <div class="send-message-link">Envoyer un message</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getUserStartDate } from '../helpers/getUserStartDate';
export default {
  name: 'ProfileHeader',
  props: ['user'],
  computed: {
    ...mapGetters({
      currentUser: 'main/user'
    }),
    userStatus () {
      if (this.user.isActive) return 'Profil actif';
      return 'Profil inactif'
    },
    userStartDate () {
      if (this.user.administrative && this.user.administrative.contracts) return getUserStartDate(this.user.administrative.contracts);
      return 'N/A';
    },
    userRelativeStartDate () {
      if (this.userStartDate !== 'N/A') return this.$moment(this.userStartDate, 'DD/MM/YY').toNow(true);
    },
    isExternalUser () {
      if (this.user._id !== this.currentUser._id) return true;
      return false;
    }
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  h4
    margin: 0

  .avatar
    width: 59px
    height: 59px
    border: 1px solid #979797

  .activeDot
    background: $tertiary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .inactiveDot
    background: $primary-dark
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .pl-lg
    padding-left: 28px

  .profile-info
    font-size: 14px

  .send-message-link
    color: $primary
    cursor: pointer
    &:hover
      text-decoration: underline
</style>
