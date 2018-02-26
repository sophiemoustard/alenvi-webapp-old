<template>
  <div class="layout-padding">
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
import { QDataTable, QIcon, QCheckbox, Cookies } from 'quasar'
import _ from 'lodash'

import planningUpdates from '../../models/PlanningUpdates'
import { alenviAlert } from '../../../helpers/alerts'
import alenvi from '../../../helpers/token/alenvi'
import ogust from '../../models/Ogust'
import users from '../../models/Users'

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
          rowsPerPage: 30,
          options: [30, 40, 50]
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
          width: '200px'
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
          width: '80px'
        },
        {
          label: 'Traitée par',
          field: 'checkedBy',
          filter: true,
          sort: true,
          type: 'string',
          width: '100px'
        },
        {
          label: 'Traitée le',
          field: 'checkedAt',
          filter: true,
          sort (a, b) {
            return (new Date(a)) - (new Date(b));
          },
          format (value) {
            if (!value) {
              return '-';
            }
            return new Date(value).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          width: '150px'
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
    const vm = this;
    this.interval = setInterval(async () => {
      this.planningUpdatesList = [];
      await vm.getPlanningUpdates();
    }, 10 * 60 * 1000)
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async getPlanningUpdates () {
      try {
        const planningUpdatesRaw = await planningUpdates.getPlanningUpdates();
        const planningUpdatesList = planningUpdatesRaw.data.data.modifPlanning;
        const orderedPlanningUpdatesList = [];
        const sectors = await ogust.getList('employee.sector');
        for (let i = 0, l = planningUpdatesList.length; i < l; i++) {
          for (let j = 0, k = planningUpdatesList[i].planningModification.length; j < k; j++) {
            orderedPlanningUpdatesList.push({
              date: planningUpdatesList[i].planningModification[j].createdAt,
              author: `${planningUpdatesList[i].firstname} ${planningUpdatesList[i].lastname}`,
              content: planningUpdatesList[i].planningModification[j].content || '-',
              involved: planningUpdatesList[i].planningModification[j].involved,
              sector: sectors[planningUpdatesList[i].sector],
              type: planningUpdatesList[i].planningModification[j].modificationType,
              check: { id: planningUpdatesList[i].planningModification[j]._id, checked: planningUpdatesList[i].planningModification[j].check.isChecked },
              checkedBy: planningUpdatesList[i].planningModification[j].check.checkBy ? `${planningUpdatesList[i].planningModification[j].check.checkBy.firstname} ${planningUpdatesList[i].planningModification[j].check.checkBy.lastname.substring(0, 1)}.` : '-',
              checkedAt: planningUpdatesList[i].planningModification[j].check.checkedAt || '',
              remove: { id: planningUpdatesList[i].planningModification[j]._id, userId: planningUpdatesList[i]._id }
            });
          }
        }
        this.planningUpdatesList = orderedPlanningUpdatesList;
        this.planningUpdatesList = _.sortBy(orderedPlanningUpdatesList, ['date']).reverse();
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
          if (await !alenvi.refreshAlenviCookies()) {
            return this.$router.push('/login');
          }
        }
        const payload = {
          isChecked,
          checkBy: isChecked ? this.user._id : null,
          checkedAt: isChecked ? new Date() : null
        }
        await planningUpdates.updatePlanningUpdatesStatus(updateId, payload);
        this.planningUpdatesList[cell].checkedBy = payload.checkBy ? `${this.user.firstname} ${this.user.lastname.substring(0, 1)}.` : '-';
        this.planningUpdatesList[cell].checkedAt = payload.checkedAt ? new Date() : '';
        alenviAlert({ color: 'positive', icon: 'check', content: 'Modification traitée.', position: 'bottom-right', duration: 2500 });
      } catch (e) {
        alenviAlert({ color: 'error', icon: 'warning', content: 'Erreur lors de la validation de la modification.', position: 'bottom-right', duration: 2500 });
        this.planningUpdatesList[cell].check.checked = !this.planningUpdatesList[cell].check.checked;
        console.error(e);
      }
    },
    async remove (id, cell, userId) {
      try {
        await planningUpdates.removePlanningUpdateById(id, { userId });
        this.planningUpdatesList.splice(cell, 1);
        alenviAlert({ color: 'positive', icon: 'check', content: 'Demande de modification supprimée.', position: 'bottom-right', duration: 2500 });
      } catch (e) {
        alenviAlert({ color: 'error', icon: 'warning', content: 'Erreur lors de la suppression de la demande de modification.', position: 'bottom-right', duration: 2500 });
        console.error(e);
      }
    },
    async getUserById (id) {
      try {
        const user = await users.getById(id);
        return `${user.firstname} ${user.lastname.substring(0, 1)}.`
      } catch (e) {
        console.error(e);
      }
    }
  },
  beforeDestroy () {
    clearTimeout(this.timeout);
    clearInterval(this.interval);
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'
</style>
