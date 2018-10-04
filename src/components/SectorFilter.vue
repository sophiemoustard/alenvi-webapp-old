<template>
<q-icon name="mdi-account-search" size="1.8rem" flat>
  <q-popover v-model="showFilter" @show="getPersonsBySector(sector)">
    <q-list link no-border style="min-width: 200px">
      <!-- <q-list-header v-if="persons.length !== 0"> -->
      <!-- <q-field icon="search">
           <q-input v-model="search" placeholder="Recherche" />
      </q-field> -->
      <!-- </q-list-header> -->
      <q-inner-loading :visible="loading">
        <q-spinner size="50px" />
      </q-inner-loading>
      <div v-if="persons.length === 0 && !loading" class="q-px-sm">
        <p class="caption"><q-icon class="on-left" color="tertiary" name="warning"/>Pas de personnes disponibles.</p>
      </div>
      <q-item v-for="(person, index) in persons" :key="index">
          <!-- <q-checkbox v-model="personsIds" :val="person.value" :label="person.label" @change="choosePersons" /> -->
          <q-radio v-model="personId" :val="person.value" :label="person.label" @input="choosePersons(person.value)" />
        </q-item>
      </q-list>
    </q-popover>
  </q-icon>
</template>

<script>
export default {
  data () {
    return {
      sectors: [],
      persons: [],
      personId: '',
      loading: false
      // personsIds: [],
      // search: '',
    }
  },
  computed: {
    showFilter: {
      get () {
        return this.$store.state.calendar.showFilter;
      },
      set (value) {
        this.$store.commit('calendar/toggleFilter', value);
      }
    },
    ogustUser () {
      return this.$store.getters['calendar/ogustUser'];
    },
    personType () {
      return this.$store.getters['calendar/personType'];
    },
    sector () {
      if (this.$route.query.sector) {
        return this.$route.query.sector;
      }
      return this.ogustUser.sector;
    }
    // filteredPersons () {
    //   return this.persons.filter((item) => {
    //     return item.label.match(new RegExp(`${this.search}`, 'i'));
    //   })
    // }
  },
  mounted () {
    // this.personsIds.push(this.$store.state.ogustUser.id_employee);
    if (this.personType === 'employee') {
      this.personId = this.$store.state.calendar.ogustUser.id_employee;
    }
    if (this.personType === 'customer') {
      this.personId = this.$store.state.calendar.ogustUser.id_customer;
    }
  },
  methods: {
    async getPersonsBySector (sector) {
      try {
        this.loading = true;
        this.persons = [];
        switch (this.personType) {
          case 'employee':
            const employees = await this.$ogust.getEmployees({ sector });
            for (const k in employees) {
              this.persons.push({
                label: `${employees[k].first_name} ${employees[k].last_name}`,
                value: employees[k].id_employee
              });
            }
            break;
          case 'customer':
            const customers = await this.$ogust.getCustomers({ sector });
            const filteredCustomers = this.$_.filter(customers, customer => !customer.last_name.match(/^ALENVI/i));
            for (const k in filteredCustomers) {
              this.persons.push({
                label: `${filteredCustomers[k].title} ${filteredCustomers[k].last_name}`,
                value: filteredCustomers[k].id_customer
              });
            }
            break;
        }
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.loading = false;
      }
    },
    choosePersons (personId) {
      this.$store.commit('calendar/setPersonChosen', personId);
      this.$emit('personChosen');
    }
  }
}
</script>
