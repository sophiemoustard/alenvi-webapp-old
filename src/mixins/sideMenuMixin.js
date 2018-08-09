export const sideMenuMixin = {
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
          name: 'profile',
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
    }
  }
};
