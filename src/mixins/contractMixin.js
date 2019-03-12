export const contractMixin = {
  methods: {
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
  }
};
