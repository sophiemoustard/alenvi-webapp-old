<template>
  <div class="layout-padding row justify-center">
    <q-data-table :data="planningUpdatesList" :config="config" :columns="columns" @refresh="refresh">
      <template slot="col-checked" slot-scope="cell">
        <q-icon v-if="cell.data" name="check" />
        <q-checkbox v-if="!cell.data"  v-model="isChecked" val="true" />
      </template>
    </q-data-table>
  </div>
</template>

<script>
import { QDataTable, QIcon, QCheckbox } from 'quasar'

import planningUpdates from '../../models/PlanningUpdates'

export default {
  components: {
    QDataTable,
    QIcon,
    QCheckbox
  },
  data () {
    return {
      planningUpdatesList: [],
      isChecked: false,
      config: {
        title: 'Récapitulatif des modifications planning',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        refresh: true,
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 5,
          options: [5, 10, 15, 30]
        },
        responsive: true
      },
      columns: [
        {
          label: 'Date',
          field: 'date',
          width: '150px',
          filter: true,
          sort (a, b) {
            return (new Date(a)) - (new Date(b));
          },
          format (value) {
            return new Date(value).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        },
        {
          label: 'Auteur',
          field: 'author',
          filter: true,
          sort: true,
          type: 'string',
          width: '100px'
        },
        {
          label: 'Demande',
          field: 'content',
          filter: true,
          sort: true,
          type: 'string',
          width: '400px'
        },
        {
          label: 'Concerné(e)',
          field: 'involved',
          filter: true,
          sort: true,
          type: 'number',
          width: '100px'
        },
        {
          label: 'Communauté',
          field: 'sector',
          filter: true,
          sort: true,
          type: 'number',
          width: '100px'
        },
        {
          label: 'Type',
          field: 'type',
          filter: true,
          sort: true,
          type: 'string',
          width: '100px'
        },
        {
          label: 'Traitée',
          field: 'checked',
          filter: true,
          sort: true,
          type: 'boolean',
          width: '50px'
        },
        {
          label: 'Traitée par',
          field: 'checkBy',
          filter: true,
          sort: true,
          type: 'string',
          width: '100px'
        }
      ]
    }
  },
  mounted () {
    this.getPlanningUpdates();
  },
  methods: {
    async getPlanningUpdates () {
      try {
        const planningUpdatesRaw = await planningUpdates.getPlanningUpdates(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MTAxNzIwMzgsImV4cCI6MTUxMDI1ODQzOH0.6A7JhwxGVBGMvrUAXikvicGmJAAwGkLEq2LoIqQKkG0');
        const planningUpdatesList = planningUpdatesRaw.data.data.modifPlanning;
        const correspSectors = {
          '1a*': '1',
          '1b*': '2'
        };
        for (let i = 0, l = planningUpdatesList.length; i < l; i++) {
          for (let j = 0, k = planningUpdatesList[i].planningModification.length; j < k; j++) {
            this.planningUpdatesList.push({
              date: planningUpdatesList[i].planningModification[j].createdAt,
              author: `${planningUpdatesList[i].firstname} ${planningUpdatesList[i].lastname}`,
              content: planningUpdatesList[i].planningModification[j].content,
              involved: planningUpdatesList[i].planningModification[j].involved,
              sector: correspSectors[planningUpdatesList[i].sector],
              type: planningUpdatesList[i].planningModification[j].modificationType,
              checked: planningUpdatesList[i].planningModification[j].check.isChecked,
              checkBy: planningUpdatesList[i].planningModification[j].check.checkBy,
            })
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    refresh (done) {
      this.planningUpdatesList = [];
      this.getPlanningUpdates();
      done();
    }
  }
}
</script>

<style lang="stylus">
  @import '~variables'

  .q-data-table table td
    text-align: center
    white-space: normal

  .q-data-table table th
    text-align: center
</style>
