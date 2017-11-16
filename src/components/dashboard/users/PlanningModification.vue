<template>
  <div class="layout-padding row justify-center">
    <q-data-table :data="planningUpdatesList" :config="config" :columns="columns" @refresh="refresh">
      <template slot="col-check" slot-scope="cell">
        <q-checkbox v-model="planningUpdatesList[cell.row.__index].check.checked" @input="process(cell.data.id, planningUpdatesList[cell.row.__index].check.checked, cell.row.__index)" val="cell.data.checked"></q-checkbox>
      </template>
      <template slot="col-remove" slot-scope="cell">
        <q-icon class="cursor-pointer" name="delete" @click="remove(cell.data.id, cell.row.__index, cell.data.userId)" size="1.5rem" />
      </template>
    </q-data-table>
  </div>
</template>

<script>
import { QDataTable, QIcon, QCheckbox, Toast, Cookies } from 'quasar'

import planningUpdates from '../../models/PlanningUpdates'
import ogust from '../../models/Ogust'

export default {
  components: {
    QDataTable,
    QIcon,
    QCheckbox,
    Toast
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
          type: 'string',
          width: '400px'
        },
        {
          label: 'Concerné(e)',
          field: 'involved',
          filter: true,
          sort: true,
          type: 'string',
          width: '100px'
        },
        {
          label: 'Communauté',
          field: 'sector',
          filter: true,
          sort: true,
          type: 'string',
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
        {
          label: '',
          field: 'remove',
          width: '50px'
        }
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
              remove: { id: planningUpdatesList[i].planningModification[j]._id, userId: planningUpdatesList[i]._id }
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
    async process (updateId, isChecked, cell) {
      try {
        if (!Cookies.get('user_id')) {
          this.$router.replace('/dashboard/login');
        }
        const payload = {
          isChecked,
          checkBy: Cookies.get('user_id'),
          checkedAt: new Date()
        }
        await planningUpdates.updatePlanningUpdatesStatus(updateId, payload);
        Toast.create('Modification traitée.');
      } catch (e) {
        Toast.create('Erreur lors de la validation de la modification.');
        this.planningUpdatesList[cell].check.checked = !this.planningUpdatesList[cell].check.checked;
        console.error(e);
      }
    },
    async remove (id, cell, userId) {
      try {
        await planningUpdates.removePlanningUpdateById(id, { userId });
        this.planningUpdatesList.splice(cell, 1);
        Toast.create('Modification supprimée.');
      } catch (e) {
        Toast.create('Erreur lors de la suppression de la modification.');
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
