<template>
    <div style="max-width: 90vw;">
      <h4>Modifications planning</h4>
      <q-table
        title="Récapitulatif des modifications planning"
        :data="planningUpdatesList"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="[30, 40, 50]"
        :pagination.sync="pagination"
        :filter="filter"
        dense
        rows-per-page-label="Lignes"
        :pagination-label="paginationLabel"
        no-data-label="Données non disponibles"
        no-results-label="Pas de résultats">
        <template slot="top" slot-scope="props">
          <q-search
            hide-underline
            color="primary"
            v-model="filter"
            clearable
            placeholder="Recherche"
            class="col-6" />
        </template>
        <q-td slot="body-cell-check" slot-scope="props" :props="props">
          <q-checkbox v-model="props.value.checked" @input="process(props.value.id, props.value.checked, props.row.__index)" val="props.value.checked"></q-checkbox>
        </q-td>
        <q-td slot="body-cell-remove" slot-scope="props" :props="props">
          <q-icon class="cursor-pointer" color="grey" name="delete" @click.native="remove(props.value.id, props.row.__index, props.value.userId)" size="1.5rem" />
        </q-td>
      </q-table>
    </div>
</template>

<script>
export default {
  data () {
    return {
      planningUpdatesList: [],
      isChecked: false,
      filter: '',
      pagination: {
        sortBy: 'date', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 30 // current rows per page being displayed
      },
      columns: [
        {
          name: 'date',
          label: 'Date',
          field: 'date',
          align: 'left',
          sortable: true,
          sort: (a, b) => (new Date(a)) - (new Date(b)),
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
          name: 'author',
          label: 'Auteur',
          field: 'author',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'content',
          label: 'Demande',
          field: 'content',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'involved',
          label: 'Concerné(e)',
          field: 'involved',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'sector',
          label: 'Communauté',
          field: 'sector',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'type',
          label: 'Type',
          field: 'type',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'check',
          label: 'Traitée',
          field: 'check',
          align: 'left',
          sortable: true,
          sort: (a, b) => a.checked - b.checked,
          type: 'boolean',
        },
        {
          name: 'checkedBy',
          label: 'Traitée par',
          field: 'checkedBy',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'checkedAt',
          label: 'Traitée le',
          field: 'checkedAt',
          align: 'left',
          sortable: true,
          sort: (a, b) => (new Date(a)) - (new Date(b)),
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
        },
        {
          name: 'remove',
          label: '',
          field: 'remove',
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
      return this.$store.getters['main/user'];
    }
  },
  methods: {
    async getPlanningUpdates () {
      try {
        const planningUpdatesRaw = await this.$planningUpdates.getPlanningUpdates();
        const planningUpdatesList = planningUpdatesRaw.data.data.modifPlanning;
        const orderedPlanningUpdatesList = [];
        const sectors = await this.$ogust.getList('employee.sector');
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
        // this.planningUpdatesList = _.sortBy(orderedPlanningUpdatesList, ['date']).reverse();
      } catch (e) {
        console.error(e);
      }
    },
    async process (updateId, isChecked, cell) {
      try {
        const payload = {
          isChecked,
          checkBy: isChecked ? this.user._id : null,
          checkedAt: isChecked ? new Date() : null
        }
        await this.$planningUpdates.updatePlanningUpdatesStatus(updateId, payload);
        this.planningUpdatesList[cell].checkedBy = payload.checkBy ? `${this.user.firstname} ${this.user.lastname.substring(0, 1)}.` : '-';
        this.planningUpdatesList[cell].checkedAt = payload.checkedAt ? new Date() : '';
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Modification traitée.',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la validation de la modification.',
          position: 'bottom-right',
          timeout: 2500
        });
        this.planningUpdatesList[cell].check.checked = !this.planningUpdatesList[cell].check.checked;
        console.error(e);
      }
    },
    async remove (id, cell, userId) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette demande de modification ?',
          ok: 'OK',
          cancel: 'Annuler'
        }).then(async () => {
          await this.$planningUpdates.removePlanningUpdateById(id, { userId });
          this.planningUpdatesList.splice(cell, 1);
          this.$q.notify({
            color: 'positive',
            icon: 'thumb up',
            detail: 'Demande de modification supprimée.',
            position: 'bottom-right',
            timeout: 2500
          });
        }).catch(() => {
          this.$q.notify({
            color: 'info',
            icon: 'thumb up',
            detail: 'Suppression annulée',
            position: 'bottom-right',
            timeout: 2500
          });
        })
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression de la demande de modification.',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    },
    async getUserById (id) {
      try {
        const user = await this.$users.getById(id);
        return `${user.firstname} ${user.lastname.substring(0, 1)}.`
      } catch (e) {
        console.error(e);
      }
    },
    paginationLabel (start, end, total) {
      return `${start} - ${end} de ${total}`;
    }
  },
  beforeDestroy () {
    clearInterval(this.interval);
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-table-container
    background: $white
</style>
