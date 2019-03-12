import nationalities from '../data/nationalities.js';

export const contractMixin = {
  methods: {
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
  }
};
