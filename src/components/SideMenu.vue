<template>
  <div>
    <!-- If we are another role than customer -->
    <q-list v-if="user.role.name !== 'Client'" class="no-border sidemenu-flex">
      <q-list-header>
       <q-item class="justify-center">
        <!-- <img src="user.picture.link" alt="Image user" class="avatar"> -->
          <img id="logo-sidemenu" src="https://res.cloudinary.com/alenvi/image/upload/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Alenvi logo">
        </q-item>
      </q-list-header>
      <q-item-separator />
      <q-collapsible ref="rh" v-model="rhCollapsible" label="Ressources humaines">
        <q-item to="/dashboard/rh/directory">
          <q-item-side icon="contacts" />
          <q-item-main label="Répertoire" />
        </q-item>
        <q-item>
          <q-item-side icon="settings" />
          <q-item-main label="Configuration RH" />
        </q-item>
      </q-collapsible>
      <q-item-separator />
      <q-collapsible ref="planning" v-model="planningCollapsible" label="Planning">
        <q-item to="/dashboard/planning/view" exact>
          <q-item-side icon="date range" />
          <q-item-main label="Vue planning" />
        </q-item>
        <q-item to="/dashboard/planning/modification" exact>
          <q-item-side icon="update" />
          <q-item-main label="Modifications planning" />
        </q-item>
        <q-item to="/dashboard/planning/constrainedCoaches" exact>
          <q-item-side icon="perm contact calendar" />
          <q-item-main label="Coach(s) de permanence" />
        </q-item>
      </q-collapsible>
      <q-item-separator />
      <q-collapsible ref="benef" v-model="benefCollapsible" label="Bénéficiaires">
        <q-item to="/dashboard/beneficiaries/addHelper" exact>
          <q-item-side icon="person add" />
          <q-item-main label="Accueil aidants" />
        </q-item>
      </q-collapsible>
      <q-item-separator />
      <!-- <q-item>
        <q-item-main class="text-bold text-center" :label="user.firstname" />
      </q-item> -->
      <!-- <q-item class="justify-center">
        <q-icon id="profile" name="person" color="tertiary" size="1.5rem" @click.native="goToProfile"/>
        <q-icon id="logout" name="exit to app" color="tertiary" size="1.5rem" class="on-right" @click.native="logout" />
      </q-item> -->
      <q-item to="/dashboard/auxiliaries" exact> <!-- v-can="{ feature: 'Auxiliaires' }" }" -->
        <q-item-side icon="ion-contacts" />
        <q-item-main label="Auxiliaires d'envie" />
      </q-item>
      <!-- <q-item to="/dashboard/caregivers" exact> v-can="{ feature: 'Aidants' }" -->
        <!-- <q-item-side icon="group" /> -->
        <!-- <q-item-main label="Aidants familiaux" /> -->
      <!-- </q-item> -->
      <!-- <q-item to="/dashboard/pigi" exact> v-can="{ feature: 'Pigi' }" -->
        <!-- <q-item-side icon="message" /> -->
        <!-- <q-item-main label="Pigi" /> -->
      <!-- </q-item> -->
      <!-- <div class="col"> -->
        <q-item-separator />
        <!-- <q-item to="/dashboard/settings" exact> v-can="{ feature: 'Paramètres' }" -->
          <!-- <q-item-side icon="settings" /> -->
          <!-- <q-item-main label="Paramètres" /> -->
        <!-- </q-item> -->
        <div class="sidemenu-footer">
          <q-item class="sidemenu-footer-border full-width">
            <q-item-main :label="userFirstnameUpper" />
            <q-item-side>
              <q-btn flat icon="person" />
            </q-item-side>
            <q-item-side>
              <q-btn flat icon="settings" />
            </q-item-side>
            <q-item-side>
              <q-btn flat icon="lock_open" />
            </q-item-side>
          </q-item>
        </div>
      <!-- </div> -->
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
  data () {
    return {
      planningCollapsible: false,
      benefCollapsible: false,
      rhCollapsible: false
    }
  },
  mounted () {
    this.collapsibleOpening();
  },
  computed: {
    userFirstnameUpper () {
      return this.user.firstname.toUpperCase();
    }
  },
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
    },
    collapsibleOpening () {
      if (this.$refs[this.$route.meta.parent]) {
        this[`${this.$route.meta.parent}Collapsible`] = true;
        this.$refs[this.$route.meta.parent].$el.style.background = '#FEFAFC';
      }
    },
    collapsibleClosing (to, from) {
      if (this.$refs[from.meta.parent] && to.meta.parent !== from.meta.parent) {
        this[`${from.meta.parent}Collapsible`] = false;
        this.$refs[from.meta.parent].$el.style.background = '#FFFFFF';
      }
    },
    collapsibleEntering (to) {
      if (this.$refs[to.meta.parent]) {
        this.$refs[to.meta.parent].$el.style.background = '#FEFAFC';
      }
    }
    // changeRefreshState () {
    //   this.$store.commit('changeRefreshState');
    // }
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

  #logo-sidemenu
    width: 250px

  .user-menu
    cursor: pointer

  .router-link-active
    background: none
    color: $primary

  .router-link-active > div:nth-child(2)
    color: $primary

  .sidemenu-flex
    display: flex
    flex-direction: column
    min-height: 100vh

  .sidemenu-footer
    flex-grow: 1
    display: flex
    align-items: flex-end
    justify-content: space-between
    padding-top: 0px
    padding-bottom: 0px
    // prevent border overlap from footer to last sidemenu object
    margin-top: -1px
    & .q-item
      padding: 6px 2px 0px 16px
    &-border
      border-top: 1px solid #e0e0e0
    // & .q-item-section + .q-item-section
    //   margin-left: 5px
</style>
