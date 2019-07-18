import nationalities from '../data/nationalities.js';

export const contractMixin = {
  data () {
    return {
      timeout: null,
    }
  },
  methods: {
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
    getActiveVersion (contract) {
      return contract.versions ? contract.versions.find(version => version.isActive) : null;
    },
    async refreshContractsWithTimeout () {
      await this.refreshContracts();
      this.timeout = setTimeout(() => this.refreshContracts(), 10000);
    },
  },
};
