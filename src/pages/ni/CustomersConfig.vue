<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card style="background: white">
          <q-card-main>
            <q-table :data="services" :columns="columns" hide-bottom binary-state-sort>
              <q-td slot="body-cell-delete" slot-scope="props" :props="props">
                <q-btn flat round small color="grey" icon="delete" @click.native="deleteService(props.value, props.row.__index)" />
              </q-td>
            </q-table>
          </q-card-main>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations</p>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
      </div>
    </div>
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../components/popup/notify';

export default {
  data () {
    return {
      company: null,
      services: [
        { name: 'Toto' },
      ],
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
          sortable: true,
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          field: 'nature',
          sortable: true,
        },
        {
          name: 'defaultUnitAmount',
          label: 'Montant unitaire par défaut (€)',
          align: 'left',
          field: 'defaultUnitAmount',
          sortable: true,
        },
        {
          name: 'vat',
          label: 'TVA (%)',
          align: 'left',
          field: 'vat',
          sortable: true,
        },
        {
          name: 'holidaySurcharge',
          label: 'Majoration dimanche/jours fériés (%)',
          align: 'left',
          field: 'holidaySurcharge',
          sortable: true,
        },
        {
          name: 'eveningSurcharge',
          label: 'Majoration soirée (%)',
          align: 'left',
          field: 'eveningSurcharge',
          sortable: true,
        },
        {
          name: 'delete',
          label: '',
          align: 'left',
          field: '_id',
          sortable: true,
        },
      ],
    };
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
  },
  mounted () {
    this.company = this.user.company;
    this.refreshServices();
  },
  methods: {
    async refreshServices () {
      this.services = await this.$companies.getServices(this.company._id);
    },
    async deleteService (serviceId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce service ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        const queries = { id: this.company._id, serviceId };
        await this.$companies.deleteService(queries);
        this.services.splice(cell, 1);
        NotifyPositive('Absence supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    }
  },
}
</script>

<style lang="stylus" scoped>
  .q-table-container
      box-shadow: none
</style>
