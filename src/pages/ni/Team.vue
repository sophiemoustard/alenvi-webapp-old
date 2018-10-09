<template>
  <q-page class="neutral-background" padding>
    <div class="row items-center directory-header">
      <div class="col-xs-12 col-md-6">
        <h4>Répertoire</h4>
      </div>
      <div class="col-xs-12 col-md-6">
        <q-search class="no-border input-search" v-model="searchStr" placeholder="Rechercher un profil" color="white" inverted-light />
      </div>
    </div>
    <q-table
      :data="filteredUsers"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination"
      hide-bottom
      :loading="tableLoading">
      <q-tr
        slot="body"
        slot-scope="props"
        :props="props"
        class="datatable-row">
        <q-td v-for="col in props.cols"
          :key="col.name"
          :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-side :avatar="getAvatar(col.value.picture)" />
            <q-item-main :label="col.value.name" />
          </q-item>
          <template v-else>
            <a v-if="col.value !== '-'" class="text-primary" :href="getPhoneLink(col.value)">{{col.value}}</a>
            <div v-if="col.value === '-'">{{ col.value }}</div>
          </template>
        </q-td>
      </q-tr>
    </q-table>
  </q-page>
</template>

<script>

export default {
  data () {
    return {
      tableLoading: true,
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
          sort: (a, b) => {
            const aArr = a.name.split(' ');
            const bArr = b.name.split(' ');
            return aArr[aArr.length - 1].toLowerCase() < bArr[bArr.length - 1].toLowerCase() ? -1 : 1
          },
          style: 'width: 400px'
        },
        {
          name: 'phone',
          label: 'Numéro de téléphone',
          field: 'phone',
          align: 'left',
          sortable: false,
          format: (value) => this.formatPhone(value),
          style: 'width: 100px'
        }
      ]
    }
  },
  mounted () {
    this.getUserList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    filteredUsers () {
      return this.userList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    }
  },
  methods: {
    async getUserList () {
      try {
        const users = await this.$users.showAll({ role: 'Auxiliaire', sector: this.currentUser.sector, isActive: true });
        this.userList = users.map(user => ({
          auxiliary: {
            name: `${user.firstname} ${user.lastname}`,
            picture: user.picture ? user.picture.link : null
          },
          phone: user.mobilePhone
        }));
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    getAvatar (link) {
      return link || 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';
    },
    formatPhone (phoneNumber) {
      if (phoneNumber) {
        phoneNumber = phoneNumber.split(' ').join('');
        if (phoneNumber.match(/^\+.*/)) {
          return phoneNumber.replace(/^\+33(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, '0$1 $2 $3 $4 $5');
        } else if (phoneNumber.match(/^\d{10}/)) {
          return phoneNumber.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
        }
        return phoneNumber;
      }
      return '-';
    },
    getPhoneLink (link) {
      return link ? `tel:+33${link.split(' ').join('').substring(1)}` : '-';
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .input-caption
    margin-bottom: 4px

  .input-search
    font-size: 14px
    & /deep/ .q-if-control.q-icon
      margin-right: 8px

  .btn-icon
    &-disabled
      color: $light-grey
    &-enabled
      color: $primary

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
    background: $white
    &:hover
      background: $white

</style>
