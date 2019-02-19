export const validationMixin = {
  computed: {
    pendingValidation () {
      return this.$v.$pending;
    }
  },
  methods: {
    formValidation (validationObj, path) {
      return !this.$_.get(validationObj, path).$error;
    },
    waitForValidation (validationObj, path) {
      return new Promise((resolve) => {
        if (path.match(/address/i)) {
          const unwatch = this.$watch(() => !this.$_.get(validationObj, path).$pending, (notPending) => {
            if (notPending) {
              if (unwatch) {
                unwatch();
              }
              resolve(!this.$_.get(validationObj, path).$error);
            }
          }, { immediate: true });
        } else {
          this.$_.get(validationObj, path).$touch();
          resolve(!this.$_.get(validationObj, path).$error);
        }
      });
    }
  }
}
