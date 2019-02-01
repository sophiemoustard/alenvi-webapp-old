<template>
  <q-page padding class="neutral-background">
    <p class="input-caption">Communauté</p>
    <ni-select-sector class="q-mb-md" @input="getEmployeesBySector" v-model="selectedSector" />
    <ni-planning-manager @refreshEvents="getEvents" :events="events" :customers="customers" :persons="auxiliaries" @updateStartOfWeek="updateStartOfWeek" />
  </q-page>
</template>

<script>
import Planning from '../../proto/planning.vue';
import SelectSector from '../../../components/form/SelectSector';

export default {
  name: 'AuxiliaryPlanning',
  components: {
    'ni-planning-manager': Planning,
    'ni-select-sector': SelectSector,
  },
  data () {
    return {
      selectedSector: '',
      events: [],
      customers: [],
      auxiliaries: [],
      startDate: '',
    };
  },
  async mounted () {
    await this.getCustomers();
  },
  computed: {
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
  },
  methods: {
    async updateStartOfWeek (vEvent) {
      this.startOfWeek = vEvent.startOfWeek;
      if (this.selectedSector !== '') await this.getEvents();
    },
    // Refresh data
    async getEvents () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek.format('YYYYMMDD'),
          sector: this.selectedSector,
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.showAll();
      } catch (e) {
        console.error(e);
      }
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive({ sector: this.selectedSector });
      this.getEvents({});
    },
  },
}
</script>
