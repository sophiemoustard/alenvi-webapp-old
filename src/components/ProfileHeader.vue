<template>
  <div style="max-width: 90vw">
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
          <div class="full-height relative-position" style="width: 37px;">
            <q-icon size="36px" name="phone_iphone" color="grey-2" />
            <q-icon v-if="!user.isConfirmed" class="chip-icon" name="cancel" color="secondary" size="16px" />
            <q-icon v-if="user.isConfirmed" class="chip-icon" name="check_circle" color="tertiary" size="16px" />
          </div>
        </div>
        <div class="col-10 col full-height justify-between">
          <div class="text-weight-bold">{{ isAccountConfirmed }}</div>
          <div class="send-message-link" @click="opened = true">Envoyer un message</div>
        </div>
      </div>
    </div>
    <!-- Modal envoi message -->
    <q-modal v-model="opened">
      <div class="col modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Envoyer un <span class="text-weight-bold">message</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
          </div>
          <div class="row margin-input">
            <q-select
              v-model="typeMessage"
              color="white"
              inverted-light
              :options="typeMessageOptions"/>
          </div>
        </div>
        <div class="row margin-input">
          <div class="col-12">
            <div class="row justify-between">
              <p class="input-caption">Message</p>
            </div>
            <q-input v-model="message" type="textarea" rows="7"
              color="white" inverted-light
            />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary" :loading="loading" @click="sendMessage()" />
    </q-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getUserStartDate } from '../helpers/getUserStartDate';
export default {
  name: 'ProfileHeader',
  props: ['profileId'],
  data () {
    return {
      loading: false,
      opened: false,
      message: '',
      typeMessage: 'PM',
      typeMessageOptions: [
        {
          label: 'Pièces manquantes',
          value: 'PM'
        },
        {
          label: 'Intervention',
          value: 'Intervention'
        }
      ],
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'main/user',
      user: 'rh/getUserProfile'
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
    },
    isAccountConfirmed () {
      if (this.user.isConfirmed) {
        return 'Accès WebApp activé'
      }
      return 'Accès WebApp non activé'
    }
  },
  methods: {
    async sendMessage () {
      try {
        const message = await this.$twilio.sendSMS({
          to: `+33${this.user.mobilePhone.substring(1)}`,
          body: this.message,
        });
        console.log('SMS envoyé =', message);
        this.isLoading = false;
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'SMS bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.isLoading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du SMS',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    }
  }
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

  .chip-icon
    height: 14px
    position: absolute
    right: 5px
    top: -4px
    width: 14px
    border-radius: 50%
    background: white

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0

  .q-if-inverted
    border: 1px solid $light-grey

  .margin-input
    margin-bottom: 6px
    &.last
      margin-bottom: 24px
</style>
