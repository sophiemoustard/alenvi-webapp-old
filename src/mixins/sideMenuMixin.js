export const sideMenuMixin = {
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
        this.$router.push({
          name: 'personal info',
          params: {
            id: this.user._id
          }
        });
      } else {
        this.$router.push({
          name: 'customer profile',
          params: {
            id: this.user._id
          }
        });
      }
    },
    toAccountInfo () {
      this.$router.push({ name: 'account info' });
    },
    collapsibleOpening () {
      if (this.$refs[this.$route.meta.parent]) {
        this.activeRoutes[this.$route.meta.parent].open = true;
        this.activeRoutes[this.$route.meta.parent].highlight = true;
      }
    },
    collapsibleClosing (to, from) {
      if (this.$refs[from.meta.parent] && to.meta.parent !== from.meta.parent) {
        this.activeRoutes[from.meta.parent].open = false;
        this.activeRoutes[from.meta.parent].highlight = false;
      }
    },
    collapsibleEntering (to) {
      if (this.$refs[to.meta.parent]) {
        this.activeRoutes[to.meta.parent].highlight = true;
      }
    }
  }
};
