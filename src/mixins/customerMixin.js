export const customerMixin = {
  computed: {
    lastSubscriptionHistory () {
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length > 1) {
        const history = this.customer.subscriptionsHistory;
        return history.sort((a, b) => new Date(b.approvalDate) - new Date(a.approvalDate))[0];
      }
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length === 1) {
        return this.customer.subscriptionsHistory[0];
      }
    },
    acceptedBy () {
      return `${this.lastSubscriptionHistory.helper.title} ${this.lastSubscriptionHistory.helper.firstname} ${this.lastSubscriptionHistory.helper.lastname}`;
    }
  }
};
