export const contractMixin = {
  methods: {
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
    async refreshContracts () {
      try {
        const contracts = await this.$contracts.list({ user: this.getUser._id });
        this.contracts = contracts;
      } catch (e) {
        this.contracts = [];
        console.error(e);
      }
    }
  }
};
