<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="customers" :personKey="personKey" :can-edit="canEditEvent"
      @updateStartOfWeek="updateStartOfWeek" @editEvent="openEditionModal" @createEvent="openCreationModal"
      @onDrop="updateEventOnDrop" ref="planningManager" />

    <!-- Event creation modal -->
    <q-modal v-if="Object.keys(newEvent).length !== 0" v-model="creationModal" content-classes="modal-container-md"
      @hide="resetCreationForm(false)">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row person-name">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div>{{ selectedCustomer.identity | formatIdentity('FL') }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="creationModal = false" /></span>
          </div>
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="newEvent.dates" required-field
          disable-end-date />
        <ni-select in-modal caption="Auxiliaire" v-model="newEvent.auxiliary" :options="auxiliariesOptions"
          :error="$v.newEvent.auxiliary.$error" required-field @blur="$v.newEvent.auxiliary.$touch"
          @input="toggleServiceSelection(newEvent.customer)" />
        <ni-select in-modal caption="Service" v-model="newEvent.subscription" :error="$v.newEvent.subscription.$error"
          :options="customerSubscriptionsOptions(newEvent.customer)" required-field
          @blur="$v.newEvent.subscription.$touch" />
        <ni-select in-modal caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency"
          :options="repetitionOptions" required-field @blur="$v.newEvent.repetition.frequency.$touch"
          :disable="!isRepetitionAllowed" />
        <ni-input in-modal v-model="newEvent.misc" caption="Notes" />
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary"
        @click="createEvent" :disable="disableCreationButton" icon-right="add" />
    </q-modal>

    <!-- Event edition modal -->
    <q-modal v-if="Object.keys(editedEvent).length !== 0" v-model="editionModal" content-classes="modal-container-md"
      @hide="resetEditionForm()">
      <div class="modal-padding">
        <div class="row q-mb-md">
          <div class="col-11 row person-name">
            <img :src="DEFAULT_AVATAR" class="avatar">
            <div>{{ selectedCustomer.identity | formatIdentity('FL') }}</div>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="editionModal = false" />
            </span>
          </div>
        </div>
        <div class="modal-subtitle">
          <q-btn icon="delete" no-caps flat color="grey"  v-if="!isDisabled"
            @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" />
        </div>
        <ni-datetime-range caption="Dates et heures de l'intervention" v-model="editedEvent.dates" disable-end-date
          :disable="isDisabled" />
        <ni-select in-modal caption="Auxiliaire" v-model="editedEvent.auxiliary" :options="auxiliariesOptions"
          :error="$v.editedEvent.sector.$error" required-field :disable="isDisabled"
          @blur="$v.editedEvent.sector.$touch" />
        <ni-select in-modal caption="Service" v-model="editedEvent.subscription" required-field :disable="isDisabled"
          :options="customerSubscriptionsOptions(editedEvent.customer._id)"
          :error="$v.editedEvent.subscription.$error" @blur="$v.editedEvent.subscription.$touch" />
        <template v-if="isRepetition(editedEvent) && !isDisabled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition"
              @input="toggleRepetition" />
          </div>
        </template>
        <ni-input in-modal v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes"
          :disable="isDisabled" />
        <template v-if="!editedEvent.shouldUpdateRepetition && !isDisabled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm" />
          </div>
          <div class="row justify-between">
            <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" caption="Conditions"
              :options="cancellationConditions" required-field @blur="$v.editedEvent.cancel.condition.$touch"
              class="col-6 cancel" />
            <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif"
              :options="cancellationReasons" required-field @blur="$v.editedEvent.cancel.reason.$touch"
              class="col-6 cancel" />
          </div>
        </template>
      </div>
      <div class="customer-info">
        <div class="row items-center no-wrap">
        <div v-if="customerAddress" class="customer-address">{{ customerAddress }}</div>
          <q-btn flat size="md" color="primary" icon="mdi-information-outline" :to="customerProfileRedirect" />
        </div>
      </div>
      <q-btn v-if="!isDisabled" class="full-width modal-btn" no-caps color="primary" :loading="loading"
        label="Editer l'évènement" @click="updateEvent" icon-right="check" :disable="disableEditionButton" />
    </q-modal>
  </q-page>
</template>

<script>
import Planning from '../../../components/planning/Planning.vue';
import { planningModalMixin } from '../../../mixins/planningModalMixin';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { NotifyWarning, NotifyNegative } from '../../../components/popup/notify.js';
import { INTERVENTION, DEFAULT_AVATAR, NEVER, AUXILIARY, PLANNING_REFERENT, CUSTOMER_CONTRACT, COMPANY_CONTRACT, CUSTOMER, SECTOR, AUXILIARY_ROLES } from '../../../data/constants';
import { mapGetters, mapActions } from 'vuex';
import { formatIdentity } from '../../../helpers/utils';

export default {
  name: 'CustomerPlanning',
  metaInfo: { title: 'Planning bénéficiaire' },
  mixins: [planningModalMixin, planningActionMixin],
  components: {
    'ni-planning-manager': Planning,
  },
  props: {
    initialCustomer: { type: Object, default: null },
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startOfWeekAsString: '',
      filteredSectors: [],
      filteredCustomers: [],
      DEFAULT_AVATAR,
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
      personKey: CUSTOMER,
      sectorCustomers: [],
    };
  },
  async mounted () {
    try {
      await this.fillFilter(CUSTOMER);
      await this.getAuxiliaries();
      this.initFilters();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes');
    }
  },
  watch: {
    elementToAdd (val) {
      this.addElementToFilter(val);
    },
    elementToRemove (val) {
      this.removeElementFromFilter(val);
    },
    isRepetitionAllowed (value) {
      if (!value) this.newEvent.repetition.frequency = NEVER;
    },
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    endOfWeek () {
      return this.$moment(this.startOfWeekAsString).endOf('w');
    },
    selectedCustomer () {
      if (this.creationModal && this.newEvent.customer !== '') return this.customers.find(cus => cus._id === this.newEvent.customer);
      if (this.editionModal && this.editedEvent.customer !== '') return this.customers.find(cus => cus._id === this.editedEvent.customer._id);
      return { picture: {}, identity: {} };
    },
    customersOptions () {
      return this.customers.map(customer => this.formatPersonOptions(customer));
    },
    selectedAuxiliary () {
      if (this.creationModal && this.newEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
        const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(aux, this.newEvent.dates.startDate);
        const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(aux, this.newEvent.dates.startDate);
        const isCustomerContractValidForRepetition = this.isCustomerContractValidForRepetition(aux);
        const isCompanyContractValidForRepetition = this.isCompanyContractValidForRepetition(aux);

        return { ...aux, hasCustomerContractOnEvent, hasCompanyContractOnEvent, isCustomerContractValidForRepetition, isCompanyContractValidForRepetition };
      }
      if (this.editionModal && this.editedEvent.auxiliary) {
        const aux = this.auxiliaries.find(aux => aux._id === this.editedEvent.auxiliary);
        const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(aux, this.editedEvent.dates.startDate);
        const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(aux, this.editedEvent.dates.startDate);

        return { ...aux, hasCustomerContractOnEvent, hasCompanyContractOnEvent };
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
        if (selectedSubscription.service.type === CUSTOMER_CONTRACT) return this.selectedAuxiliary.isCustomerContractValidForRepetition;
        if (selectedSubscription.service.type === COMPANY_CONTRACT) return this.selectedAuxiliary.isCompanyContractValidForRepetition;
      }
      return true;
    },
    activeAuxiliaries () {
      return this.auxiliaries
        .filter(aux => this.hasCustomerContractOnEvent(aux, this.$moment(this.startOfWeekAsString), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(aux, this.$moment(this.startOfWeekAsString), this.endOfWeek));
    },
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
    // Dates
    async updateStartOfWeek (vEvent) {
      const { startOfWeekAsString } = vEvent;
      this.startOfWeekAsString = startOfWeekAsString.startOf('d').toISOString();

      const range = this.$moment.range(this.startOfWeekAsString, this.$moment(this.startOfWeekAsString).endOf('w'));
      this.days = Array.from(range.by('days'));
      if (this.filteredSectors.length !== 0 || this.filteredCustomers.length !== 0) await this.refreshCustomers();
      if (this.customers.length !== 0) await this.refresh();
    },
    isCompanyContractValidForRepetition (aux) {
      if (!aux.contracts.length === 0) return false;
      if (!aux.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = aux.contracts.filter(ctr => ctr.status === COMPANY_CONTRACT);
      if (companyContracts.length === 0) return false;

      return companyContracts.some(contract => !contract.endDate);
    },
    isCustomerContractValidForRepetition (aux) {
      if (aux.contracts.length === 0) return false;
      if (!aux.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const customerContracts = aux.contracts.filter(ctr => ctr.customer === this.newEvent.customer);
      if (customerContracts.length === 0) return false;

      return customerContracts.some(contract => !contract.endDate);
    },
    // Filters
    initFilters () {
      if (this.initialCustomer) {
        this.$refs.planningManager.restoreFilter([formatIdentity(this.initialCustomer.identity, 'FL')]);
      } else if (!AUXILIARY_ROLES.includes(this.mainUser.role.name)) {
        this.addSavedTerms('Customers');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.mainUser.sector);
        if (userSector && this.$refs.planningManager) this.$refs.planningManager.restoreFilter([userSector.label]);
      }
    },
    // Refresh
    async refreshCustomers () {
      this.customers = [];
      try {
        this.sectorCustomers = await this.getSectorCustomers(this.filteredSectors);
      } catch (e) {
        this.sectorCustomers = []
      }

      for (let i = 0, l = this.sectorCustomers.length; i < l; i++) {
        if (!this.customers.some(cus => this.sectorCustomers[i]._id === cus._id)) {
          this.customers.push(this.sectorCustomers[i]);
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
          startDate: this.$moment(this.startOfWeekAsString).toDate(),
          endDate: this.endOfWeek.toDate(),
          customer: this.customers.map(cus => cus._id),
          groupBy: CUSTOMER,
        });
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      this.auxiliaries = await this.$users.showAll({ role: [AUXILIARY, PLANNING_REFERENT] });
    },
    // Event creation
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
        address: {},
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
    // Event edition
    openEditionModal ({ eventId, rowId }) {
      const rowEvents = this.getRowEvents(rowId);
      const event = rowEvents.find(ev => ev._id === eventId);
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.formatEditedEvent(event);

      this.editionModal = true;
    },
    async getSectorCustomers (sectors) {
      return sectors.length === 0 ? [] : this.$customers.listBySector({
        startDate: this.$moment(this.startOfWeekAsString).toDate(),
        endDate: this.endOfWeek.toDate(),
        sector: JSON.stringify(sectors),
      });
    },
    // Filter
    async addElementToFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors.push(el._id);
        this.sectorCustomers = await this.getSectorCustomers(this.filteredSectors);
        for (let i = 0, l = this.sectorCustomers.length; i < l; i++) {
          if (!this.customers.some(cus => this.sectorCustomers[i]._id === cus._id)) {
            this.customers.push(this.sectorCustomers[i]);
          }
        }
        await this.refresh();
      } else { // el = customer
        if (!this.filteredCustomers.some(cust => cust._id === el._id)) this.filteredCustomers.push(el);
        if (!this.customers.some(cust => cust._id === el._id)) {
          this.customers.push(el);
          await this.refresh();
        }
      }
    },
    async removeElementFromFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec !== el._id);
        await this.refreshCustomers();
        await this.refresh();
      } else {
        this.filteredCustomers = this.filteredCustomers.filter(cus => cus._id !== el._id);
        if (!this.sectorCustomers.some(cus => cus._id === el._id)) {
          this.customers = this.customers.filter(customer => customer._id !== el._id);
        }
      }
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .modal-subtitle
    justify-content: flex-end;
    display: flex;

  .light-checkbox
    color: $grey
    font-size: 14px

  .cancel
    padding-right: 3px;

</style>
