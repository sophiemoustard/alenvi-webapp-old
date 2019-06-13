<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="customers" personKey="customer" @updateStartOfWeek="updateStartOfWeek"
      @editEvent="openEditionModal" @createEvent="openCreationModal" @onDrop="updateEventOnDrop" />

    <!-- Event creation modal -->
    <q-modal v-if="Object.keys(newEvent).length !== 0 && Object.keys(selectedCustomer.identity).length !== 0" v-model="creationModal"
      content-classes="modal-container-md" @hide="resetCreationForm(false)">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row person-name">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div>{{ selectedCustomer.identity.title }} {{ selectedCustomer.identity.lastname.toUpperCase() }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="creationModal = false" /></span>
          </div>
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="newEvent.dates" required-field />
        <ni-modal-select caption="Auxiliaire" v-model="newEvent.auxiliary" :options="auxiliariesOptions" :error="$v.newEvent.auxiliary.$error"
          required-field @blur="$v.newEvent.auxiliary.$touch" @input="setSector" />
        <ni-modal-select caption="Service" v-model="newEvent.subscription" :options="customerSubscriptionsOptions(newEvent.customer)"
          :error="$v.newEvent.subscription.$error" required-field @blur="$v.newEvent.subscription.$touch" />
        <ni-modal-select caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency" :options="repetitionOptions"
          required-field @blur="$v.newEvent.repetition.frequency.$touch" :disable="!isRepetitionAllowed" />
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
          <div class="col-11 row person-name">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div>{{ selectedCustomer.identity.title }} {{
              selectedCustomer.identity.lastname.toUpperCase() }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="editionModal = false" />
            </span>
          </div>
        </div>
        <div class="modal-subtitle">
          <q-btn icon="delete" no-caps flat color="grey" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()"
            v-if="!isDisabled" />
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" :disable="isDisabled" />
        <ni-modal-select caption="Auxiliaire" v-model="editedEvent.auxiliary" :options="auxiliariesOptions" :error="$v.editedEvent.auxiliary.$error"
          required-field @input="setSector" :disable="isDisabled" />
        <ni-modal-select caption="Service" v-model="editedEvent.subscription" :options="customerSubscriptionsOptions(editedEvent.customer._id)"
          :error="$v.editedEvent.subscription.$error" @blur="$v.editedEvent.subscription.$touch" :disable="isDisabled" />
        <template v-if="isRepetition(editedEvent) && !isDisabled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition" @input="toggleRepetition" />
          </div>
        </template>
        <ni-modal-input v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes" :disable="isDisabled" />
        <template v-if="!editedEvent.shouldUpdateRepetition && !isDisabled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
          </div>
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
            :options="cancellationConditions" required-field @blur="$v.editedEvent.cancel.condition.$touch" />
          <ni-modal-select v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif" :options="cancellationReasons"
            required-field @blur="$v.editedEvent.cancel.reason.$touch" />
        </template>
      </div>
      <div class="cutomer-info">
        <p class="input-caption">Infos bénéficiaire</p>
        <div>{{ editedEvent.customer.contact.address.fullAddress }}</div>
      </div>
      <q-btn v-if="!isDisabled" class="full-width modal-btn" no-caps color="primary" :loading="loading"
        label="Editer l'évènement" @click="updateEvent" icon-right="check" :disable="disableEditionButton" />
    </q-modal>
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';
import Planning from '../../../components/planning/Planning.vue';
import { planningModalMixin } from '../../../mixins/planningModalMixin';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import { INTERVENTION, DEFAULT_AVATAR, NEVER, AUXILIARY, PLANNING_REFERENT, CUSTOMER_CONTRACT, COMPANY_CONTRACT, CUSTOMER } from '../../../data/constants';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CustomerPlanning',
  metaInfo: { title: 'Planning bénéficiaire' },
  mixins: [planningModalMixin, planningActionMixin],
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
      filteredSectors: [],
      filteredCustomers: [],
      DEFAULT_AVATAR,
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
    };
  },
  async mounted () {
    try {
      await this.fillFilter(CUSTOMER);
      await this.getEmployeesBySector();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes');
    }
  },
  watch: {
    getElemAdded (val) {
      this.handleElemAddedToFilter(val);
    },
    getElemRemoved (val) {
      this.handleElemRemovedFromFilter(val);
    },
    isRepetitionAllowed (value) {
      if (!value) this.newEvent.repetition.frequency = NEVER;
    }
  },
  validations () {
    return {
      newEvent: {
        type: { required },
        dates: {
          startDate: { required },
          endDate: { required },
        },
        auxiliary: { required },
        sector: { required },
        customer: { required },
        subscription: { required },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required }
        },
      },
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
        },
        auxiliary: { required },
        sector: { required },
        customer: { required },
        subscription: { required },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required },
        },
        cancel: {
          condition: { required: requiredIf((item, parent) => parent && parent.isCancelled) },
          reason: { required: requiredIf((item, parent) => parent && parent.isCancelled) },
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      getUser: 'main/user',
      getFilter: 'planning/getFilter',
      getElemAdded: 'planning/getElemAdded',
      getElemRemoved: 'planning/getElemRemoved'
    }),
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
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
        const hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(aux, this.newEvent.dates.startDate);
        const hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(aux, this.newEvent.dates.endDate);
        const isCompanyContractActive = this.isCompanyContractActive(aux);
        const isCustomerContractActive = this.isCustomerContractActive(aux);

        return { ...aux, hasActiveCustomerContractOnEvent, hasActiveCompanyContractOnEvent, isCompanyContractActive, isCustomerContractActive };
      }
      if (this.editionModal && this.editedEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
        const hasActiveCustomerContractOnEvent = this.hasActiveCustomerContractOnEvent(aux, this.editedEvent.dates.startDate);
        const hasActiveCompanyContractOnEvent = this.hasActiveCompanyContractOnEvent(aux, this.editedEvent.dates.endDate);

        return { ...aux, hasActiveCustomerContractOnEvent, hasActiveCompanyContractOnEvent };
      }
      return { picture: {}, identity: { lastname: '' } };
    },
    isDisabled () {
      return this.editedEvent.type === INTERVENTION && this.editedEvent.isBilled;
    },
    isRepetitionAllowed () {
      if (this.newEvent.subscription !== '' && this.newEvent.auxiliary !== '') {
        const selectedCustomer = this.customers.find(cus => cus._id === this.newEvent.customer);
        if (!selectedCustomer) return true;
        const selectedSubscription = selectedCustomer.subscriptions.find(sub => sub._id === this.newEvent.subscription);
        if (!selectedSubscription) return true;
        if (selectedSubscription.service.type === COMPANY_CONTRACT) return this.selectedAuxiliary.isCompanyContractActive;
        if (selectedSubscription.service.type === CUSTOMER_CONTRACT) return this.selectedAuxiliary.isCustomerContractActive;
      }
      return true;
    }
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
    // Dates
    endOfWeek () {
      return this.$moment(this.startOfWeek).add(6, 'd');
    },
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeek = startOfWeek;

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (this.filteredSectors.length !== 0 || this.filteredCustomers.length !== 0) await this.refreshCustomers();
      if (this.customers.length !== 0) await this.refresh();
    },
    hasActiveCustomerContractOnEvent (auxiliary, selectedDay) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const customerContracts = auxiliary.contracts.filter(contract => contract.status === CUSTOMER_CONTRACT);

      return customerContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(selectedDay) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(selectedDay));
      });
    },
    hasActiveCompanyContractOnEvent (auxiliary, selectedDay) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = auxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(selectedDay) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(selectedDay));
      });
    },
    isCompanyContractActive (aux) {
      if (!aux.contracts.length === 0) return false;
      if (!aux.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContract = aux.contracts.find(contract => contract.status === COMPANY_CONTRACT);
      if (!companyContract) return false;

      return !companyContract.endDate && companyContract.versions.some(version => version.isActive);
    },
    isCustomerContractActive (aux) {
      if (aux.contracts.length === 0) return false;
      if (!aux.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const correspContract = aux.contracts.find(ctr => ctr.customer === this.newEvent.customer);
      if (!correspContract) return false;
      return !correspContract.endDate && correspContract.versions.some(version => version.isActive);
    },
    // Refresh data
    async refreshCustomers () {
      this.customers = [];
      let customersBySector = [];
      try {
        customersBySector = await this.getCustomersBySectors(this.filteredSectors);
      } catch (e) {
        customersBySector = []
      }

      for (let i = 0, l = customersBySector.length; i < l; i++) {
        if (!this.customers.some(cus => customersBySector[i]._id === cus._id)) {
          this.customers.push(customersBySector[i]);
        }
      }
      if (this.filteredCustomers.length !== 0) {
        for (let i = 0, l = this.filteredCustomers.length; i < l; i++) {
          if (!this.customers.some(cus => this.filteredCustomers[i]._id === cus._id)) {
            this.customers.push(this.filteredCustomers[i]);
          }
        }
      }
    },
    async refresh () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          customer: JSON.stringify(this.customers.map(cus => cus._id)),
        });
      } catch (e) {
        this.events = [];
      }
    },
    async getEmployeesBySector () {
      this.auxiliaries = await this.$users.showAllActive({ role: [AUXILIARY, PLANNING_REFERENT] });
    },
    // Event creation
    setSector (auxiliaryId) {
      const auxiliary = this.auxiliaries.find(aux => aux._id === auxiliaryId);
      if (this.creationModal) this.newEvent.sector = auxiliary.sector._id;
      if (this.editionModal) this.editedEvent.sector = auxiliary.sector._id;
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
    resetCreationForm (partialReset, type = INTERVENTION) {
      this.$v.newEvent.$reset();
      if (!partialReset) this.newEvent = {};
      else {
        this.newEvent = {
          type,
          dates: {
            startDate: partialReset ? this.newEvent.dates.startDate : '',
            startHour: partialReset ? this.newEvent.dates.startHour : '',
            endDate: partialReset ? this.newEvent.dates.endDate : '',
            endHour: partialReset ? this.newEvent.dates.endHour : '',
          },
          repetition: { frequency: NEVER },
          auxiliary: partialReset ? this.newEvent.auxiliary : '',
          customer: '',
          subscription: '',
          sector: partialReset ? this.newEvent.sector : '',
          internalHour: '',
          absence: '',
          location: {},
          attachment: {},
        };
      }
    },
    getPayload (event) {
      let payload = { ...this.$_.omit(event, ['dates', '__v', 'repetition']) }
      payload = this.$_.pickBy(payload);

      const customer = this.customers.find(cus => cus._id === event.customer);
      if (customer) {
        const subscription = customer.subscriptions.find(sub => sub._id === event.subscription);
        if (subscription && subscription.service) payload.status = subscription.service.type;
      }

      payload.startDate = this.$moment(event.dates.startDate).hours(event.dates.startHour.split(':')[0])
        .minutes(event.dates.startHour.split(':')[1]).toISOString();
      payload.endDate = this.$moment(event.dates.endDate).hours(event.dates.endHour.split(':')[0])
        .minutes(event.dates.endHour.split(':')[1]).toISOString();

      if (event.location && event.location.fullAddress) delete payload.location.location;
      if (event.location && Object.keys(event.location).length === 0) delete payload.location;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;

      return payload;
    },
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);

        const hasConflicts = await this.hasConflicts(payload);
        if (hasConflicts) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        await this.$events.create(payload);

        this.refresh();
        this.creationModal = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        NotifyNegative('Erreur lors de la création de l\'évènement');
      } finally {
        this.loading = false
      }
    },
    // Event edition
    openEditionModal (eventId) {
      const event = this.events.find(ev => ev._id === eventId);
      const can = this.canEditEvent(event);
      if (!can) return;
      this.formatEditedEvent(event);

      this.editionModal = true;
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        const hasConflicts = await this.hasConflicts(payload);
        if (hasConflicts) {
          this.loading = false;
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        delete payload.customer;
        delete payload.type;
        delete payload._id
        await this.$events.updateById(this.editedEvent._id, payload);

        this.refresh();
        this.editionModal = false;
        this.resetEditionForm();
        NotifyPositive('Évènement modifié');
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    async updateEventOnDrop (vEvent) {
      const { toDay, toPerson, draggedObject } = vEvent;

      if (toPerson._id !== draggedObject.customer._id) return NotifyNegative('Impossible de modifier le bénéficiaire de l\'intervention');

      const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');
      const payload = {
        startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
          .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
          .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
        auxiliary: draggedObject.auxiliary._id,
      };

      const hasConflicts = await this.hasConflicts(payload);
      if (hasConflicts) {
        return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
      }

      const updatedEvent = await this.$events.updateById(draggedObject._id, payload);
      this.events = this.events.map(event => (event._id === updatedEvent._id) ? updatedEvent : event);

      NotifyPositive('Évènement modifié');
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
          this.refresh();
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
    async getCustomersBySectors (sectors) {
      return sectors.length === 0 ? [] : this.$customers.showAllBySector({
        startDate: this.startOfWeek.format('YYYYMMDD'),
        endDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
        sector: JSON.stringify(sectors),
      });
    },
    // Filter
    async handleElemAddedToFilter (el) {
      if (el.sectorId) { // el = sector
        this.filteredSectors.push(el.sectorId);
        const customersBySector = await this.getCustomersBySectors(this.filteredSectors);
        for (let i = 0, l = customersBySector.length; i < l; i++) {
          if (!this.customers.some(cus => customersBySector[i]._id === cus._id)) {
            this.customers.push(customersBySector[i]);
          }
        }
        this.refresh();
      } else { // el = auxiliary
        if (!this.customers.some(cust => cust._id === el._id)) {
          this.filteredCustomers.push(el);
          this.customers.push(el);
          this.refresh();
        }
      }
    },
    async handleElemRemovedFromFilter (el) {
      if (el.sectorId) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec !== el.sectorId);
        await this.refreshCustomers();
        await this.refresh();
      } else {
        this.filteredCustomers = this.filteredCustomers.filter(cus => cus._id !== el._id);
        this.customers = this.customers.filter(customer => customer._id !== el._id);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-layout-page
    padding-top: 20px;

  .modal-subtitle
    justify-content: flex-end;
    display: flex;

  .light-checkbox
    color: $grey
    font-size: 14px

</style>
