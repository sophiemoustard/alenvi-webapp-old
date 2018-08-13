<template>
  <div style="max-width: 90vw;">
    <div class="row items-start directory-header">
      <div class="col-xs-12 col-md-5">
        <h4>Répertoire</h4>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-search v-model="searchStr" placeholder="Rechercher un profil" color="white" inverted-light />
      </div>
      <div class="col-xs-12 col-md-1 row justify-end">
        <q-btn text-color="dark-grey" color="white" class="btn-directory" @click="activeUsers = !activeUsers" size="form-inverted" push>
          <q-icon :class="{ 'btn-icon-disabled': activeUsers, 'btn-icon-enabled': !activeUsers }" name="visibility" />
          <div class="col-12" style="font-size: 9px">Inactifs</div>
        </q-btn>
      </div>
    </div>
    <q-table
      :data="filteredUsers"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination"
      rows-per-page-label="Lignes"
      :pagination-label="paginationLabel"
      no-data-label="Données non disponibles"
      no-results-label="Pas de résultats">
      <q-tr slot="body" slot-scope="props" :props="props" :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]">
        <q-td v-for="col in props.cols"
          :key="col.name"
          :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-side :avatar="col.value.picture" />
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      userList: [],
      searchStr: '',
      activeUsers: true,
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
          field: row => row.auxiliary,
          align: 'left',
          sortable: true,
          sort: (a, b) => a.name.split(' ')[1].toLowerCase() < b.name.split(' ')[1].toLowerCase() ? -1 : 1
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          sort: (a, b) => (this.$moment(a, 'DD/MM/YYYY').toDate()) - (this.$moment(b, 'DD/MM/YYYY').toDate())
        },
        {
          name: 'team',
          label: 'Equipe',
          field: 'sector',
          align: 'left',
          sortable: true
        },
        {
          name: 'active',
          label: '',
          field: 'isActive',
          align: 'right',
          sortable: true
        }
      ]
    }
  },
  mounted () {
    this.getUserList();
    console.log(this.props);
  },
  computed: {
    activeUserList () {
      if (this.activeUsers) {
        return this.userList.filter(user => user.isActive);
      }
      return this.userList;
    },
    filteredUsers () {
      return this.activeUserList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    }
  },
  methods: {
    async getUserList () {
      try {
        const users = await this.$users.showAll({ role: 'Auxiliaire' });
        const sectors = await this.$ogust.getList('employee.sector');
        this.userList = users.map((user) => {
          const startDates = user.administrative.contracts.map(contract => this.$moment(contract.startDate, 'DD/MM/YYYY'));
          return {
            auxiliary: {
              name: `${user.firstname} ${user.lastname}`,
              picture: user.picture.link
            },
            startDate: this.$moment.min(startDates).format('DD/MM/YYYY'),
            sector: sectors[user.sector],
            isActive: user.isActive
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    paginationLabel (start, end, total) {
      return `${start} - ${end} de ${total}`;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  // .q-if-inverted
  //   min-height: 40px

  .directory-header
    & .q-btn
      padding: 0

  // .btn-directory
  //   min-height: 40px

  .btn-icon
    &-disabled
      color: $light-grey
    &-enabled
      color: $primary

  .q-table-container
    box-shadow: none

  /deep/ .q-table
    border-spacing: 0 12px
    border-collapse: separate
    &-horizontal-separator tbody td
      border: none
    & thead
      border: none
    & th
      padding: 8px 12px
      &.sortable:hover .q-icon, &.sorted .q-icon
        color: $primary
    & td
      padding: 8px 12px
      & .q-item
        // padding: 8px 16px 8px 0px
        min-height: 30px
        padding: 0
        & .q-item-side
          min-width: 30px
          max-height: 30px
          & .q-item-avatar
            width: 29px
            height: 29px
            border: 1px solid #979797
        & .q-item-section + .q-item-section
          margin-left: 20px

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

  .activeDot
    background: $tertiary
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

  .inactiveDot
    background: $primary-dark
    width: 9px
    height: 9px
    border-radius: 50%
    display: inline-block

</style>
