<template>
  <q-page padding class="neutral-background">
    <h4>Fiches de paie</h4>
    <q-table
      :data="salaries"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[10]"
      :pagination.sync="pagination"
      :loading="tableLoading">
        <q-td slot="body-cell-periodStart" slot-scope="props" :props="props">
          {{ props.value }}
        </q-td>
        <q-td slot="body-cell-link" slot-scope="props" :props="props">
          <q-btn flat round small color="primary">
            <a :href="props.value">
              <q-icon name="file download" />
            </a>
          </q-btn>
        </q-td>
    </q-table>
  </q-page>
</template>

<script>
export default {
  metaInfo: {
    title: 'Fiches de paie'
  },
  data () {
    return {
      tableLoading: true,
      user: {},
      salaries: [],
      pagination: {
        sortBy: 'periodStart',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'periodStart',
          label: 'Date',
          field: 'period_start',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value, 'YYYYMMDDHHmm').format('MMMM YYYY'),
          sort: (a, b) => (this.$moment(a, 'YYYYMMDDHHmm').toDate()) - (this.$moment(b, 'YYYYMMDDHHmm').toDate()),
          style: 'width: 170px'
        },
        {
          name: 'link',
          label: 'Visualiser',
          field: 'print_url',
          align: 'left',
          style: 'width: 30px'
        }
      ]
    }
  },
  async created () {
    try {
      this.user = await this.$users.getById(this.$route.params.id);
      const salaries = await this.$ogust.getEmployeeSalaries(this.user.employee_id);
      for (const k in salaries) {
        this.salaries.push(salaries[k]);
      }
      this.tableLoading = false;
    } catch (e) {
      console.error(e);
      this.tableLoading = false;
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'

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
  & tbody tr
    background: $white
  & td
    padding: 8px 12px
    font-size: 16px
    & .q-item
      min-height: 30px
      padding: 0
      &-main
        flex: 0 1 auto
      & .q-item-side
        min-width: 30px
        max-height: 30px
      & .q-item-section + .q-item-section
        margin-left: 20px
  &-container
    & .q-table-bottom
      padding-left: 12px
    & .q-table-nodata > i
      display: none

</style>
