export const fundingMixin = {
  data () {
    return {
      fundings: [],
      selectedFunding: {}
    }
  },
  methods: {
    refreshFundings () {
      try {
        this.fundings = this.customer.fundings.map(fund => ({
          ...this.getFundingLastVersion(fund),
          ...fund,
        }))

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    getFundingLastVersion (funding) {
      if (!funding.versions || funding.versions.length === 0) return {};

      return funding.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]
    },
  }
};
