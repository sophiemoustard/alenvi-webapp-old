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
      dense
      rows-per-page-label="Lignes"
      :pagination-label="paginationLabel"
      no-data-label="Données non disponibles"
      no-results-label="Pas de résultats">
      <q-tr slot="body" slot-scope="props" :props="props" class="datatable-row">
        <q-td v-for="col in props.cols" :key="col.name" :props="props" class="datatable-cell">
          <q-item v-if="col.name === 'name'">
            <q-item-side :avatar="col.value.picture" />
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else>{{ col.value }}</template>
        </q-td>
        <!-- <q-td slot="body-cell-name" :props="props" v-else>
          <q-item>
            <q-item-side :avatar="col.value.picture" />
            <q-item-main :label="col.value.name" />
          </q-item>
        </q-td> -->
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
        }
      ]
    }
  },
  mounted () {
    this.getUserList();
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
    border-spacing: 0 3px
    & thead
      border: none

  /deep/ .q-table th.sortable:hover .q-icon, .q-table th.sorted
    color: $primary

  /deep/ td
   & .q-item
     padding: 8px 16px 8px 0px
     & .q-item-side
       & .q-item-avatar
         width: 30px
         height: 30px

  .datatable-cell
    background: white
    border-bottom: 12px solid transparent

  .datatable-row
    cursor: pointer
    transition: 0.8s cubic-bezier(0.25, 0.8, 0.5, 1)
    &:hover
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, .2)

</style>
