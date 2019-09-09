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
    async refreshContractsWithTimeout () {
      await this.refreshContracts();
      this.timeout = setTimeout(() => this.refreshContracts(), 10000);
    },
  },
};
