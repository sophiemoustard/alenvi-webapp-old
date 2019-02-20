<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="customers" personKey="customer" @updateStartOfWeek="updateStartOfWeek" :filters="filters"
      :selectedFilter="selectedFilter" @editEvent="openEditionModal" @createEvent="openCreationModal" @onDrop="updateEventOnDrop"
      :removedFilter="removedFilter" />

    <!-- Event creation modal -->
    <q-modal v-if="Object.keys(newEvent).length !== 0 && Object.keys(selectedCustomer.identity).length !== 0" v-model="creationModal"
      content-classes="modal-container-md" @hide="resetCreationForm(false)">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row modal-customer-header">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div class="customer-name">{{ selectedCustomer.identity.title }} {{ selectedCustomer.identity.lastname.toUpperCase() }}</div>
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
import Planning from '../../../components/planning/Planning.vue';
import { planningModalMixin } from '../../../mixins/planningModalMixin';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify.js';
import { INTERVENTION, DEFAULT_AVATAR, NEVER, ABSENCE, INTERNAL_HOUR, ILLNESS, UNAVAILABILITY } from '../../../data/constants';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../../../helpers/vuelidateCustomVal.js';

export default {
  name: 'CustomerPlanning',
  mixins: [planningModalMixin],
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
      filters: [],
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
    };
  },
  async mounted () {
    await this.getEmployeesBySector();
    await this.initFilters();
  },
  validations () {
    return {
      newEvent: {
        type: { required },
        dates: {
          startDate: { required },
          endDate: { required },
        },
        startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        auxiliary: { required },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) }
        },
        attachment: {
          driveId: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
          link: requiredIf((item) => item.type === ABSENCE && item.absence === ILLNESS),
        },
      },
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
        },
        startDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        endDuration: { required: requiredIf((item) => item.type === ABSENCE) },
        auxiliary: { required },
        sector: { required },
        customer: { required: requiredIf((item) => item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item.type === ABSENCE) },
        location: { fullAddress: { frAddress } },
        repetition: {
          frequency: { required: requiredIf((item) => item.type !== ABSENCE) },
        },
        cancel: {
          condition: { required: requiredIf((item, parent) => parent.isCancelled) },
          reason: { required: requiredIf((item, parent) => parent.isCancelled) },
        },
      },
    };
  },
  computed: {
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
      if (this.filteredSectors.length !== 0 || this.filteredCustomers.length !== 0) await this.refreshCustomers();
      if (this.customers.length !== 0) await this.refreshPlanning();
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
    async refreshPlanning () {
      try {
        this.events = await this.$events.list({
          startDate: this.startOfWeek.format('YYYYMMDD'),
          endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
          customer: JSON.stringify(this.customers.map(cus => cus._id)),
        });
      } catch (e) {
        this.events = [];
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
          startDuration: '',
          endDuration: '',
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
      let payload = { ...this.$_.omit(event, ['dates', '__v']) }
      payload = this.$_.pickBy(payload);

      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }
      if (event.type === ABSENCE) {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.startDuration[0].startHour).toISOString();
        if (event.endDuration !== '') {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.endDuration[0].endHour).toISOString();
        } else {
          payload.endDate = this.$moment(event.dates.endDate).hours(event.startDuration[0].endHour).toISOString();
        }

        this.$_.unset(payload, 'startDuration');
        this.$_.unset(payload, 'endDuration');
      } else {
        payload.startDate = this.$moment(event.dates.startDate).hours(event.dates.startHour.split(':')[0])
          .minutes(event.dates.startHour.split(':')[1]).toISOString();
        payload.endDate = this.$moment(event.dates.endDate).hours(event.dates.endHour.split(':')[0])
          .minutes(event.dates.endHour.split(':')[1]).toISOString();
      }

      if (event.location && event.location.fullAddress) delete payload.location.location;
      if (event.location && Object.keys(event.location).length === 0) delete payload.location;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;

      return payload;
    },
    async hasConflicts (scheduledEvent) {
      let auxiliaryEvents = [];
      try {
        auxiliaryEvents = await this.$events.list({
          auxiliary: JSON.stringify([scheduledEvent.auxiliary]),
          startDate: scheduledEvent.startDate,
          endStartDate: this.$moment(scheduledEvent.endDate).subtract(1, 'minutes').toISOString(),
        });
      } catch (e) {
        if (e.data.statusCode !== 404) return NotifyNegative('Une erreur s\'est produite');
      }

      return auxiliaryEvents.filter(event => event._id !== scheduledEvent._id).length !== 0;
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

        this.refreshPlanning();
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
      const editedEvent = this.events.find(ev => ev._id === eventId);
      const { createdAt, updatedAt, startDate, endDate, ...eventData } = editedEvent;
      const auxiliary = editedEvent.auxiliary._id;
      const dates = {
        startDate,
        endDate,
        startHour: `${this.$moment(startDate).hours() < 10
          ? `0${this.$moment(startDate).hours()}`
          : this.$moment(startDate).hours()}:${this.$moment(startDate).minutes() || '00'}`,
        endHour: `${this.$moment(endDate).hours() < 10
          ? `0${this.$moment(endDate).hours()}`
          : this.$moment(endDate).hours()}:${this.$moment(endDate).minutes() || '00'}`,
      };
      switch (editedEvent.type) {
        case INTERVENTION:
          const subscription = editedEvent.subscription._id;
          this.editedEvent = { isCancelled: false, cancel: {}, shouldUpdateRepetition: false, ...eventData, dates, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = editedEvent.internalHour._id;
          this.editedEvent = { location: {}, shouldUpdateRepetition: false, ...eventData, auxiliary, internalHour, dates };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(editedEvent);
          this.editedEvent = {
            location: {},
            attachment: {},
            ...eventData,
            auxiliary,
            startDuration,
            endDuration,
            dates: { startDate, endDate },
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary, dates };
          break;
      }

      this.editionModal = true
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
    async initFilters () {
      try {
        await this.addCustomersToFilter();
        await this.addSectorsToFilter();
      } catch (e) {
        console.error(e);
      }
    },
    async addCustomersToFilter () {
      this.filters = await this.$customers.showAll({ subscriptions: true });
      for (let i = 0, l = this.filters.length; i < l; i++) {
        this.filters[i].value = `${this.filters[i].identity.title} ${this.filters[i].identity.lastname}`;
        this.filters[i].label = `${this.filters[i].identity.title} ${this.filters[i].identity.lastname}`;
      }
    },
    async addSectorsToFilter () {
      const allSectorsRaw = await this.$ogust.getList('employee.sector');
      for (const k in allSectorsRaw) {
        if (k === '*') continue;

        this.filters.push({
          label: allSectorsRaw[k],
          value: allSectorsRaw[k],
          ogustSector: k
        });
      }
    },
    async getCustomersBySectors (sectors) {
      return sectors.length === 0 ? [] : this.$customers.showAllBySector({
        startDate: this.startOfWeek.format('YYYYMMDD'),
        endStartDate: this.endOfWeek().add(1, 'd').format('YYYYMMDD'),
        sector: JSON.stringify(sectors),
      });
    },
    async selectedFilter (el) {
      if (el.ogustSector) {
        this.filteredSectors.push(el.ogustSector);
        const customersBySector = await this.getCustomersBySectors(this.filteredSectors);
        for (let i = 0, l = customersBySector.length; i < l; i++) {
          if (!this.customers.some(cus => customersBySector[i]._id === cus._id)) {
            this.customers.push(customersBySector[i]);
          }
        }
        this.refreshPlanning();
      } else {
        if (!this.customers.some(cust => cust._id === el._id)) {
          this.filteredCustomers.push(el);
          this.customers.push(el);
          this.refreshPlanning();
        }
      }
    },
    async removedFilter (el) {
      if (el.ogustSector) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec !== el.ogustSector);
        await this.refreshCustomers();
        await this.refreshPlanning();
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
