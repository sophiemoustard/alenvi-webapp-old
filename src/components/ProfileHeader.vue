<template>
  <div>
    <div class="row col-xs-12 q-mb-md">
      <div class="row items-baseline col-xs-12 col-md-10">
        <div class="row">
          <q-icon v-if="isExternalUser" class="on-left cursor-pointer self-center" size="1rem" name="arrow_back" color="primary" @click.native="goToDirectory" />
          <h4 v-if="!customer">{{ user.firstname }} {{ user.lastname }}</h4>
          <h4 v-else>{{ user.identity.firstname }} {{ user.identity.lastname }}</h4>
        </div>
      </div>
      <div v-if="!customer" class="row custom-justify-end col-xs-12 col-md-2">
        <img :src="hasPicture" alt="Img user" class="avatar">
      </div>
    </div>
    <div class="row col-xs-12 profile-info">
      <div class="pl-lg col-xs-12 col-md-6">
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
      <div v-if="!customer" class="pl-lg col-xs-12 col-md-6 row">
        <div class="relative-position" style="width: 37px;">
          <q-icon size="36px" name="phone_iphone" color="grey-2" />
          <q-icon v-if="!user.isConfirmed" class="chip-icon" name="cancel" color="secondary" size="16px" />
          <q-icon v-if="user.isConfirmed" class="chip-icon" name="check_circle" color="tertiary" size="16px" />
        </div>
        <div class="column">
          <div class="text-weight-bold">{{ isAccountConfirmed }}</div>
          <div class="send-message-link" @click="opened = true">Envoyer un SMS</div>
        </div>
      </div>
    </div>
    <!-- Modal envoi message -->
    <q-modal v-model="opened" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Envoyer un <span class="text-weight-bold">message</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="opened = false" /></span>
          </div>
        </div>
        <!-- <div class="row margin-input">
          <div class="col-12">
            <div class="row">
              <p class="input-caption">Support</p>
            </div>
            <q-select
              v-model="messageSupport"
              color="white"
              inverted-light
              :options="msgSupportOptions"/>
          </div>
        </div> -->
        <div class="row margin-input">
          <div class="col-12">
            <div class="row">
                <p class="input-caption">Modèle</p>
            </div>
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
            <q-input v-model="messageComp" type="textarea" rows="7"
              color="white" inverted-light
            />
          </div>
        </div>
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary" :loading="loading" @click.native="sendMessage" />
    </q-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import randomize from 'randomatic';

// import { getUserStartDate } from '../helpers/getUserStartDate';
export default {
  name: 'ProfileHeader',
  props: ['profileId', 'customer'],
  data () {
    return {
      loading: false,
      opened: false,
      message: '',
      typeMessage: 'PM',
      messageSupport: 'sms',
      typeMessageOptions: [
        {
          label: 'Pièces manquantes',
          value: 'PM',
        },
        {
          label: 'Envoi code d\'activation',
          value: 'CA'
        },
        {
          label: 'Autres',
          value: 'Autres'
        }
      ],
      modalCssContainer: {
        minWidth: '30vw'
      }
    }
  },
  mounted () {
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
      if (this.user.createdAt) return this.$moment(this.user.createdAt).format('DD/MM/YY');
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
    },
    msgSupportOptions () {
      const options = [
        {
          label: 'SMS',
          value: 'sms'
        }
      ];
      if (this.user.facebook && this.user.facebook.address) {
        options.push({
          label: 'Pigi',
          value: 'pigi'
        });
      }
      return options
    },
    activationCode () {
      if (this.typeMessage === 'CA') {
        return randomize('0000');
      }
    },
    messageComp: {
      get () {
        if (this.typeMessage === 'PM') {
          return `Bonjour ${this.user.firstname},\nIl manque encore des informations et documents importants pour compléter ton dossier.\nClique ici pour compléter ton profil: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/ni/${this.user._id}\nSi tu rencontres des difficultés, n’hésite pas à t’adresser à ton/ta coach ou ta marraine.`;
        } else if (this.typeMessage === 'CA') {
          return `Bienvenue chez Alenvi ! :)\nUtilise ce code: ${this.activationCode} pour pouvoir commencer ton enregistrement sur Compani avant ton intégration: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/enterCode :-)`
        }
        return this.message;
      },
      set (value) {
        this.message = value;
      }
    },
    hasPicture () {
      return !this.user.picture || (this.user.picture && !this.user.picture.link) ? 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png' : this.user.picture.link;
    },
  },
  methods: {
    async sendMessage () {
      this.loading = true;
      if (this.typeMessage === 'CA') {
        await this.$activationCode.create({ code: this.activationCode, newUserId: this.user._id, userEmail: this.user.local.email });
      }
      await this.sendSMS();
      this.loading = false;
      this.opened = false;
    },
    async sendMessageToBotUser () {
      try {
        await this.$message.sendMessage({
          message: this.messageComp,
          address: this.user.facebook.address
        });
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Message par Pigi bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du message par Pigi',
          position: 'bottom-right',
          timeout: 2500
        });
      }
    },
    async sendSMS () {
      try {
        await this.$twilio.sendSMS({
          to: `+33${this.user.mobilePhone.substring(1)}`,
          body: this.messageComp,
        });
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'SMS bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du SMS',
          position: 'bottom-right',
          timeout: 2500
        });
      }
    },
    goToDirectory () {
      if (this.customer) {
        this.$router.push({ name: 'customers directory' });
      } else {
        this.$router.push({ name: 'administrative directory', query: { role: 'Auxiliaire' } });
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

  .input-caption
    margin-bottom: 4px

  .custom-justify
    &-end
      justify-content: flex-end
      @media (max-width: 768px)
        justify-content: center
    &-center
      justify-content: flex-start
      @media (max-width: 768px)
        justify-content: center

</style>
