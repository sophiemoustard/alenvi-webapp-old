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
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service" @click="newServiceModal = true" />
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

    <!-- Service modal -->
    <q-modal v-model="newServiceModal" :content-css="modalCssContainer">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Créer un <span class="text-weight-bold">service</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="newServiceModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newService.name" />
        <ni-modal-input caption="Nature" v-model="newService.nature" />
        <ni-modal-input caption="Montant unitaire par défaut" suffix="€" type="number" v-model="newService.defaultUnitAmount" />
        <ni-modal-input caption="TVA" suffix="%" v-model="newService.vat" type="number" />
        <ni-modal-input caption="Majoration dimanche/jours fériés" suffix="%" type="number" v-model="newService.holidaySurcharge" />
        <ni-modal-input caption="Majoration soirée" suffix="%" type="number" v-model="newService.eveningSurcharge" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary" :loading="loading" @click="createNewService" />
    </q-modal>
  </q-page>
</template>

<script>
import { NotifyNegative, NotifyPositive } from '../../components/popup/notify';
import ModalInput from '../../components/form/ModalInput.vue';

export default {
  components: {
    'ni-modal-input': ModalInput,
  },
  data () {
    return {
      loading: false,
      company: null,
      services: [
        { name: 'Toto' },
      ],
      newServiceModal: false,
      modalCssContainer: {
        minWidth: '30vw'
      },
      newService: {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        holidaySurcharge: '',
        eveningSurcharge: '',
      },
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
          label: 'Montant unitaire par défaut',
          align: 'center',
          field: 'defaultUnitAmount',
          sortable: true,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: 'vat',
          sortable: true,
        },
        {
          name: 'holidaySurcharge',
          label: 'Majoration dimanche/jours fériés',
          align: 'center',
          field: 'holidaySurcharge',
          sortable: true,
        },
        {
          name: 'eveningSurcharge',
          label: 'Majoration soirée',
          align: 'center',
          field: 'eveningSurcharge',
          sortable: true,
        },
        {
          name: 'delete',
          label: '',
          align: 'center',
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
    },
    async createNewService () {
      try {
        this.loading = true;
        await this.$companies.createService(this.company._id, this.newService);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service');
      } finally {
        this.loading = false;
        this.newServiceModal = false;
        this.newService = {
          name: '',
          nature: '',
          defaultUnitAmount: '',
          vat: '',
          holidaySurcharge: '',
          eveningSurcharge: '',
        };
        await this.refreshServices();
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-table-container
      box-shadow: none

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0
</style>
