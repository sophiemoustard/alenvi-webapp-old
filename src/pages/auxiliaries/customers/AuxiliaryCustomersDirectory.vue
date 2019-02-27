<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-4">
        <h4>Bénéficiaires</h4>
      </div>
      <div class="col-xs-12 col-md-5 margin-bottom-mobile">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un bénéficiaire" color="white" inverted-light />
      </div>
    </div>
    <q-table :data="filteredUsers" :columns="columns" row-key="name" :rows-per-page-options="[]" :pagination.sync="pagination" :loading="tableLoading"
      class="people-list">
      <q-tr slot="body" slot-scope="props" :props="props" class="datatable-row" @click.native="goToCustomerProfile(props.row.ogustId)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>
import { AUXILIARY } from '../../../data/constants.js'

export default {
  props: {
    role: {
      type: String,
      default: AUXILIARY
    }
  },
  metaInfo: {
    title: 'Bénéficiaires'
  },
  data () {
    return {
      tableLoading: true,
      ownCustomers: true,
      customersList: [],
      searchStr: '',
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aArr = a.split(' ');
            const bArr = b.split(' ');
            return aArr[aArr.length - 1].toLowerCase() < bArr[bArr.length - 1].toLowerCase() ? -1 : 1
          },
        },
      ]
    }
  },
  async mounted () {
    await this.getCustomersList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    filteredUsers () {
      return this.customersList.filter(customer => customer.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  methods: {
    async getCustomersList () {
      try {
        this.tableLoading = true;
        const customers = await this.$customers.showAll();
        this.customersList = customers.map(customer => ({ name: `${customer.identity.title} ${customer.identity.lastname}`, customerId: customer._id, ogustId: customer.customerId }));
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToCustomerProfile (customerId) {
      this.$router.push({ name: 'profile customers info', params: { id: this.currentUser._id, customerId } });
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .margin-bottom-mobile
    @media (max-width: 767px)
      margin-bottom: 20px

  .justify-end-custom
    justify-content: flex-end
    @media (max-width: 767px)
      justify-content: flex-start
</style>
