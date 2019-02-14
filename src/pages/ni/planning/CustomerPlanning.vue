<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="customers" personKey="customer" @updateStartOfWeek="updateStartOfWeek"
      :selectedFilter="selectedFilter" @editEvent="openEditionModal" @createEvent="openCreationModal" />

    <!-- Event creation modal -->
    <q-modal v-if="Object.keys(newEvent).length !== 0 && Object.keys(selectedCustomer.identity).length !== 0" v-model="creationModal"
      content-classes="modal-container-md" @hide="resetCreationForm(false)">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row modal-customer-header">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div class="customer-name">{{ selectedCustomer.identity.title }} {{
              selectedCustomer.identity.lastname.toUpperCase() }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="creationModal = false" /></span>
          </div>
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="newEvent.dates" requiredField />
        <ni-modal-select caption="Auxiliaire" v-model="newEvent.auxiliary" :options="auxiliariesOptions" :error="$v.newEvent.auxiliary.$error"
          icon="face" requiredField @blur="$v.newEvent.auxiliary.$touch" @input="setSector" />
        <ni-modal-select caption="Service" v-model="newEvent.subscription" :options="customerSubscriptionsOptions(newEvent.customer)"
          :error="$v.newEvent.subscription.$error" requiredField @blur="$v.newEvent.subscription.$touch" />
        <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency" :options="repetitionOptions"
          requiredField @blur="$v.newEvent.repetition.frequency.$touch" />
        <ni-modal-input v-model="newEvent.misc" caption="Notes" />
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary" @click="createEvent"
        :disable="disableCreationButton" icon-right="add" />
    </q-modal>

    <!-- Event edition modal -->
    <q-modal v-if="Object.keys(editedEvent).length !== 0 && Object.keys(selectedCustomer.identity).length !== 0" v-model="editionModal"
      content-classes="modal-container-md" @hide="resetEditionForm()">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row modal-customer-header">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div class="customer-name">{{ selectedCustomer.identity.title }} {{
              selectedCustomer.identity.lastname.toUpperCase() }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="editionModal = false" />
            </span>
          </div>
        </div>
        <div class="modal-subtitle">
          <q-btn icon="delete" no-caps flat color="grey" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" />
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" />
        <ni-modal-select caption="Auxiliaire" v-model="editedEvent.auxiliary" :options="auxiliariesOptions" :error="$v.editedEvent.auxiliary.$error"
          icon="face" requiredField @input="setSector" />
        <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
          :error="$v.editedEvent.subscription.$error" @blur="$v.editedEvent.subscription.$touch" />
        <template v-if="isRepetition(editedEvent)">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition" @input="toggleRepetition" />
          </div>
        </template>
        <ni-modal-input v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes" />
        <template v-if="!editedEvent.shouldUpdateRepetition">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
          </div>
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
            :options="cancellationConditions" requiredField @blur="$v.editedEvent.cancel.condition.$touch" />
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif" :options="cancellationReasons"
            requiredField @blur="$v.editedEvent.cancel.reason.$touch" />
        </template>
      </div>
      <div class="cutomer-info">
        <p class="input-caption">Infos bénéficiaire</p>
        <div>{{ editedEvent.customer.contact.address.fullAddress }}</div>
      </div>
      <q-btn class="full-width modal-btn" no-caps color="primary" :loading="loading" label="Editer l'évènement" @click="updateEvent"
        icon-right="check" :disable="disableEditionButton" />
    </q-modal>
  </q-page>
</template>

<script>
import Planning from '../../../components/Planning.vue';
import { planningMixin } from '../../../mixins/planningMixin';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import { INTERVENTION, DEFAULT_AVATAR, NEVER } from '../../../data/constants';

export default {
  name: 'CustomerPlanning',
  mixins: [planningMixin],
  components: {
    'ni-planning-manager': Planning,
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startDate: '',
      selectedSectors: [],
      DEFAULT_AVATAR,
    };
  },
  async mounted () {
    await this.getEmployeesBySector();
  },
  computed: {
    minEndDate () {
      return this.$moment(this.newEvent.startDate).toISOString()
    },
    maxEndDate () {
      return this.$moment(this.newEvent.startDate).hours(23).minutes(59).toISOString();
    },
    selectedCustomer () {
      if (this.creationModal && this.newEvent.customer !== '') return this.customers.find(cus => cus._id === this.newEvent.customer);
      if (this.editionModal && this.editedEvent.auxiliary !== '') return this.customers.find(cus => cus._id === this.editedEvent.customer._id);
      return { picture: {}, identity: {} };
    },
    auxiliariesOptions () {
      return this.auxiliaries.length === 0 ? [] : this.auxiliaries.map(aux => ({
        label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
        value: aux._id,
      }));
    },
    customersOptions () {
      return this.customers.length === 0 ? [] : this.customers.map(customer => ({
        label: `${customer.identity.firstname || ''} ${customer.identity.lastname}`,
        value: customer._id,
      }));
    },
  },
  methods: {
    // Dates
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeek = startOfWeek;

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (Object.keys(this.selectedSectors).length !== 0) {
        this.customers = [];
        this.refreshPlanning();
      }
    },
    // Refresh data
    async refreshPlanning () {
      try {
        const data = await this.$events.listByCustomerFromSectors({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          sector: JSON.stringify(this.selectedSectors),
        });
        this.events = data.events;
        this.customers = await this.$customers.showAll({ _id: JSON.stringify(data.customers) });
      } catch (e) {
        this.events = [];
        this.customers = [];
      }
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive({ role: 'Auxiliaire' });
    },
    // Event creation
    setSector (auxiliaryId) {
      const auxiliary = this.auxiliaries.find(aux => aux._id === auxiliaryId);
      if (this.creationModal) this.newEvent.sector = auxiliary.sector;
      if (this.editionModal) this.editedEvent.sector = auxiliary.sector;
    },
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];
      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        startDuration: '',
        endDuration: '',
        customer: person._id,
        subscription: '',
        internalHour: '',
        absence: '',
        location: {},
        attachment: {},
        auxiliary: '',
        sector: '',
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
    },
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);

        await this.$events.create(payload);

        this.refreshPlanning();
        this.creationModal = false;
        this.loading = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        NotifyNegative('Erreur lors de la création de l\'évènement');
        this.loading = false;
      }
    },
    // Event edition
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        delete payload.customer;
        delete payload.type;
        delete payload._id
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        this.refreshPlanning();
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement modifié');
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    // Event deletion
    async deleteEvent () {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
          ok: 'OK',
          cancel: 'Annuler',
        });

        this.loading = true
        await this.$events.deleteById(this.editedEvent._id);
        this.events = this.events.filter(event => event._id !== this.editedEvent._id);

        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
    async deleteEventRepetition () {
      try {
        const shouldDeleteRepetition = await this.$q.dialog({
          title: 'Confirmation',
          message: 'Supprimer l\'événement périodique',
          ok: 'OK',
          cancel: 'Annuler',
          options: {
            type: 'radio',
            model: false,
            items: [
              { label: 'Supprimer uniquement cet évenement', value: false },
              { label: 'Supprimer cet évenement et tous les suivants', value: true },
            ],
          },
        });

        this.loading = true
        if (shouldDeleteRepetition) {
          await this.$events.deleteRepetition(this.editedEvent._id);
          this.refreshPlanning();
        } else {
          await this.$events.deleteById(this.editedEvent._id);
          this.events = this.events.filter(event => event._id !== this.editedEvent._id);
        }

        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
      }
    },
    // Filters
    selectedFilter (el) {
      if (el.ogustSector) {
        this.selectedSectors.push(el.ogustSector);
        this.refreshPlanning();
      } else {
        // Add auxiliary
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

  /deep/ .modal-customer-header
    align-items: center
    .customer-name
      font-size: 24px;
      margin-left: 3px;
      padding: 9px 14px 11px;
      @media screen and (max-width: 677px)
        font-size: 20px;
        padding: 7px;
    .avatar
      @media screen and (max-width: 677px)
        height: 30px
        width: 30px

  .modal-subtitle
    justify-content: flex-end;
    display: flex;

  .cutomer-info
    background: $light-grey;
    padding: 10px 25px;
    /deep/ .q-if-inverted
      background: $light-grey !important;
      border: none;

  .light-checkbox
    color: $grey
    font-size: 14px

</style>
