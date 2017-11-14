<template>
  <div class="layout-padding row justify-center">
    <q-data-table :data="planningUpdatesList" :config="config" :columns="columns" @refresh="refresh">
      <template slot="col-check" slot-scope="cell">
        <div v-if="cell.data.checked">
          <q-icon name="check" />
        </div>
        <q-btn v-if="!cell.data.checked" @click="process(cell.data.id)" loader color="primary" small>Traiter</q-btn>
      </template>
    </q-data-table>
  </div>
</template>

<script>
import { QDataTable, QIcon, QBtn, Cookies } from 'quasar'

import planningUpdates from '../../models/PlanningUpdates'
import ogust from '../../models/Ogust'

export default {
  components: {
    QDataTable,
    QIcon,
    QBtn
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
        messages: {
          noData: 'Pas de données disponibles.'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
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
          field: 'check',
          filter: true,
          sort (a, b) {
            return a.checked - b.checked;
          },
          type: 'boolean',
          width: '100px'
        },
      ]
    }
  },
  async mounted () {
    await this.getPlanningUpdates();
  },
  methods: {
    async getPlanningUpdates () {
      try {
        const planningUpdatesRaw = await planningUpdates.getPlanningUpdates();
        const planningUpdatesList = planningUpdatesRaw.data.data.modifPlanning;
        const sectors = await ogust.getOgustSectors();
        for (let i = 0, l = planningUpdatesList.length; i < l; i++) {
          for (let j = 0, k = planningUpdatesList[i].planningModification.length; j < k; j++) {
            this.planningUpdatesList.push({
              date: planningUpdatesList[i].planningModification[j].createdAt,
              author: `${planningUpdatesList[i].firstname} ${planningUpdatesList[i].lastname}`,
              content: planningUpdatesList[i].planningModification[j].content,
              involved: planningUpdatesList[i].planningModification[j].involved,
              sector: sectors[planningUpdatesList[i].sector],
              type: planningUpdatesList[i].planningModification[j].modificationType,
              check: { id: planningUpdatesList[i].planningModification[j]._id, checked: planningUpdatesList[i].planningModification[j].check.isChecked, checkedBy: planningUpdatesList[i].planningModification[j].check.checkBy },
            })
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    async refresh (done) {
      this.planningUpdatesList = [];
      await this.getPlanningUpdates();
      done();
    },  
    async process (updateId) {
      try {
        if (!Cookies.get('user_id')) {
          this.$router.replace('/dashboard/login');
        }
        const payload = {
          isChecked: true,
          checkBy: Cookies.get('user_id'),
          checkedAt: new Date()
        }
        await planningUpdates.updatePlanningUpdatesStatus(updateId, payload);
        this.planningUpdatesList = [];
        await this.getPlanningUpdates();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus">
  @import '~variables'

  .q-data-table table td
    white-space: normal
</style>
