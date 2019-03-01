<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Auxiliaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Equipes</p>
        <q-card style="background: white">
          <q-table :data="sectors" :columns="sectorsColumns" hide-bottom binary-state-sort :pagination.sync="pagination"
            class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions table-actions-margin">
                    <q-btn flat round small color="grey" icon="edit" @click.native="startSectorEdition(col.value)" />
                    <ni-async-disable-btn flat round small color="grey" icon="delete" :sector="col.value" @click="deleteSector(col.value, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="end">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une équipe" @click="sectorCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <!-- Sector creation modal -->
    <q-modal v-model="sectorCreationModal" content-classes="modal-container-sm" @hide="resetCreationSectorData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter une <span class="text-weight-bold">équipe</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="sectorCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="newSector.name" :error="$v.newSector.name.$error" :errorLabel="nameError($v.newSector)" @blur="$v.newSector.name.$touch" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une équipe" icon-right="add" color="primary" :loading="loading" @click="createNewSector" />
    </q-modal>

    <!-- Sector edition modal -->
    <q-modal v-model="sectorEditionModal" content-classes="modal-container-sm" @hide="resetEditionSectorData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer l'<span class="text-weight-bold">équipe</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span><q-icon name="clear" @click.native="sectorEditionModal = false" /></span>
          </div>
        </div>
        <ni-modal-input caption="Nom" v-model="editedSector.name" :error="$v.editedSector.name.$error" :errorLabel="nameError($v.editedSector)" @focus="saveTmp(editedSector.name)" @blur="$v.editedSector.name.$touch" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer l'équipe" icon-right="add" color="primary" :loading="loading" @click="updateSector" />
    </q-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { sector } from '../../../helpers/vuelidateCustomVal.js';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '../../../components/popup/notify';
import ModalInput from '../../../components/form/ModalInput.vue';
import ModalSelect from '../../../components/form/ModalSelect.vue';
import AsyncDisableBtn from '../../../components/button/AsyncDisableBtn';

export default {
  name: 'AuxiliariesConfig',
  components: {
    'ni-modal-input': ModalInput,
    'ni-modal-select': ModalSelect,
    'ni-async-disable-btn': AsyncDisableBtn
  },
  data () {
    return {
      tmpInput: '',
      loading: false,
      sectors: [],
      sectorsColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name'
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id'
        }
      ],
      pagination: {
        rowsPerPage: 0,
        sortBy: 'name',
        descending: false,
      },
      sectorCreationModal: false,
      newSector: { name: '' },
      sectorEditionModal: false,
      editedSector: { name: '' }
    };
  },
  validations () {
    if (this.isSameThanEditedSector) {
      return {
        newSector: {
          name: { required, sector }
        },
        editedSector: {
          name: { required }
        }
      }
    }
    return {
      newSector: {
        name: { required, sector }
      },
      editedSector: {
        name: { required, sector }
      }
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    company () {
      return this.user.company;
    },
    isSameThanEditedSector () {
      return this.tmpInput === this.editedSector.name;
    }
  },
  async mounted () {
    await this.getSectors();
  },
  methods: {
    saveTmp (event) {
      this.tmpInput = event
    },
    async getSectors () {
      try {
        this.sectors = await this.$sectors.showAll({ company: this.company._id });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des équipes.')
      }
    },
    async createNewSector () {
      try {
        if (this.$v.newSector.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        this.newSector.company = this.company._id;
        await this.$sectors.create(this.newSector);
        NotifyPositive('Equipe créée.');
        this.resetCreationSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la création de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetCreationSectorData () {
      this.sectorCreationModal = false
      this.newSector = { name: '' };
      this.$v.newSector.$reset();
    },
    startSectorEdition (id) {
      const selectedSector = this.sectors.find(sector => sector._id === id);
      this.editedSector = { _id: selectedSector._id, name: selectedSector.name };
      this.sectorEditionModal = true;
    },
    async updateSector () {
      try {
        if (this.$v.editedSector.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        await this.$sectors.updateById(this.editedSector._id, { name: this.editedSector.name });
        NotifyPositive('Equipe modifiée.');
        this.resetEditionSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetEditionSectorData () {
      this.sectorEditionModal = false;
      this.editedSector = { name: '' };
      this.$v.editedSector.$reset();
    },
    async deleteSector (sectorId, cell) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cette équipe ?',
          ok: 'OK',
          cancel: 'Annuler'
        });

        await this.$sectors.deleteById(sectorId);
        this.sectors.splice(cell, 1);
        NotifyPositive('Equipe supprimée.');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative("Erreur lors de la suppression de l'équipe.");
      }
    },
    nameError (obj) {
      if (!obj.name.required) {
        return 'Champ requis';
      } else if (!obj.name.sector) {
        return 'Nom déjà existant';
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
