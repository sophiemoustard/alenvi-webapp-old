<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-4">
        <h4>Bénéficiaires</h4>
      </div>
      <div class="col-xs-12 col-md-5 margin-bottom-mobile">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un bénéficiaire" color="white" inverted-light />
      </div>
      <div class="col-xs-12 col-md-3 row justify-end-custom">
        <q-toggle v-model="ownCustomers" color="primary" label="Mes bénéficiaires" @input="getCustomersList" />
      </div>
    </div>
    <q-table
      :data="filteredUsers"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[]"
      :pagination.sync="pagination"
      :loading="tableLoading">
      <q-tr
        slot="body"
        slot-scope="props"
        :props="props"
        class="datatable-row"
        @click.native="goToCustomerProfile(props.row.customerId)">
        <q-td v-for="col in props.cols"
          :key="col.name"
          :props="props">
          <template>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>

export default {
  props: {
    role: {
      type: String,
      default: 'Auxiliaire'
    }
  },
  data () {
    return {
      tableLoading: true,
      ownCustomers: true,
      customersList: [],
      searchStr: '',
      pagination: {
        sortBy: 'name', // String, column "name" property value
        descending: false,
        page: 1,
        rowsPerPage: 15 // current rows per page being displayed
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
          // style: 'width: 500px'
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
        const customers = this.ownCustomers ? await this.$ogust.getEmployeeCustomers(this.currentUser.employee_id) : await this.$ogust.getCustomers({ sector: this.currentUser.sector });
        const filteredCustomers = this.$_.filter(customers, customer => !customer.last_name.match(/^ALENVI/i));
        this.customersList = filteredCustomers.map(customer => ({ name: `${customer.title} ${customer.last_name}`, customerId: customer.id_customer }));
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

  .directory-header
    margin-bottom: 35px
    @media (max-width: 767px)
      margin-bottom: 10px
    & .q-btn
      padding: 0

  .btn-icon
    &-disabled
      color: $light-grey
    &-enabled
      color: $primary

  .input-search
    font-size: 14px
    & /deep/ .q-if-control.q-icon
      margin-right: 8px

  .q-table-container
    box-shadow: none

  .btn-directory.q-btn /deep/
    box-shadow: none
    &.q-focusable:focus > .q-focus-helper
      background: transparent
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.5)

  /deep/ .q-table
    border-spacing: 0 12px
    border-collapse: separate
    &-horizontal-separator tbody td
      border: none
    & thead
      border: none
      & tr
        height: 48px
    & th
      padding: 0px 12px
      &.sortable:hover .q-icon, &.sorted .q-icon
        color: $primary
    & td
      padding: 8px 12px
      & .q-item
        // padding: 8px 16px 8px 0px
        min-height: 30px
        padding: 0
        &-main
          flex: 0 1 auto
        & .q-item-side
          min-width: 30px
          max-height: 30px
          & .q-item-avatar
            width: 29px
            height: 29px
            border: 1px solid #979797
        & .q-item-section + .q-item-section
          margin-left: 20px
    &-container
      & .q-table-bottom
        padding-left: 12px
      & .q-table-nodata > i
        display: none

  .datatable-row
    cursor: pointer
    background: $white
    &:hover
      background: $white
      box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.2)
      & td
        border-top: 1px solid $light-grey
        border-bottom: 1px solid $light-grey
        &:first-child
          border-left: 1px solid $light-grey
        &:last-child
          border-right: 1px solid $light-grey
    &-inactive
      background: rgba(255, 255, 255, 0.5)
      &:hover
        background: rgba(255, 255, 255, 0.5)

</style>
