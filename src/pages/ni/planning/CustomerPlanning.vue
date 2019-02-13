<template>
  <q-page class="neutral-background">
    <ni-planning-manager @refreshEvents="getEvents" :events="events" :persons="customers" personKey="customer"
      @updateStartOfWeek="updateStartOfWeek" :selectedFilter="selectedFilter" />
  </q-page>
</template>

<script>
import Planning from '../../../components/Planning.vue';
import { INTERVENTION } from '../../../data/constants';

export default {
  name: 'AuxiliaryPlanning',
  components: {
    'ni-planning-manager': Planning,
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startDate: '',
      selectedSectors: [],
    };
  },
  async mounted () {
    await this.getEmployeesBySector();
  },
  computed: {
    minEndDate () {
      return this.$moment(this.newEvent.startDate).toISOString()
    },
    maxEndDate () {
      return this.$moment(this.newEvent.startDate).hours(23).minutes(59).toISOString();
    },
    selectedCustomer () {
      if (this.creationModal && this.newEvent.customer !== '') return this.customers.find(cus => cus._id === this.newEvent.customer);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
      return { picture: {}, identity: {} };
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
        value: aux._id,
      }));
    },
    customersOptions () {
      return this.customers.length === 0 ? [] : this.customers.map(customer => ({
        label: `${customer.identity.firstname || ''} ${customer.identity.lastname}`,
        value: customer._id,
      }));
    },
  },
  methods: {
    // Dates
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeek = startOfWeek;

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (Object.keys(this.selectedSectors).length !== 0) this.getCustomersBySector();
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          sector: JSON.stringify(this.selectedSectors),
          type: INTERVENTION,
        });
      } catch (e) {
        this.events = [];
        console.error(e);
      }
    },
    async getCustomersBySector () {
      this.customers = [];
      await this.getEvents();
      const customers = [];
      this.events.map(event => {
        if (customers.filter(cust => cust._id === event.customer._id).length === 0) {
          customers.push(event.customer);
        }
      });
      this.customers = customers;
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive();
    },
    // Filtre
    selectedFilter (el) {
      if (el.ogustSector) {
        this.selectedSectors.push(el.ogustSector);
        this.getCustomersBySector();
      } else {
        // Add auxiliary
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;
</style>
