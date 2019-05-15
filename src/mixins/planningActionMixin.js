import { NotifyWarning, NotifyNegative, NotifyPositive } from '../components/popup/notify';
import { INTERNAL_HOUR, ABSENCE, INTERVENTION, NEVER, UNAVAILABILITY, ILLNESS, CUSTOMER_CONTRACT, COMPANY_CONTRACT, DAILY, HOURLY, PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR } from '../data/constants';

export const planningActionMixin = {
  methods: {
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    hasActiveCustomerContract (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const customerContracts = auxiliary.contracts.filter(contract => contract.status === CUSTOMER_CONTRACT);

      return customerContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isSameOrAfter(startDate));
      });
    },
    hasActiveCompanyContract (auxiliary, startDate, endDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = auxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          ((!contract.endDate && contract.versions.some(version => version.isActive)) || this.$moment(contract.endDate).isAfter(startDate));
      });
    },
    // Event creation
    canCreateEvent (person, selectedDay) {
      const hasActiveCustomerContract = this.hasActiveCustomerContract(person, selectedDay);
      const hasActiveCompanyContract = this.hasActiveCompanyContract(person, selectedDay);

      return hasActiveCustomerContract || hasActiveCompanyContract;
    },
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
      if (this.editionModal) this.editedEvent.location = Object.assign({}, this.editedEvent.location, item);
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
      this.$v.newEvent.$reset();
      if (!partialReset) this.newEvent = {};
      else {
        let startHour = this.newEvent.dates.startHour;
        let endHour = this.newEvent.dates.endHour;
        if (type === ABSENCE) {
          const startHourSplit = this.newEvent.dates.startHour.split(':');
          const endHourSplit = this.newEvent.dates.endHour.split(':');
          startHour = this.$moment().hours(startHourSplit[0]).minutes(startHourSplit[1]).toISOString();
          endHour = this.$moment().hours(endHourSplit[0]).minutes(endHourSplit[1]).toISOString();
        } else if (this.$moment(this.newEvent.dates.startHour).isValid()) { // Switch from absence to anoter event type
          startHour = this.$moment(this.newEvent.dates.startHour).format('HH:mm');
          endHour = this.$moment(this.newEvent.dates.endHour).format('HH:mm');
        }
        this.newEvent = {
          type,
          dates: {
            startDate: partialReset ? this.newEvent.dates.startDate : '',
            startHour: partialReset ? startHour : '',
            endDate: partialReset ? this.newEvent.dates.endDate : '',
            endHour: partialReset ? endHour : '',
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
          ...(type === ABSENCE && { absenceNature: DAILY }),
        };
      }
    },
    closeCreationModal () {
      this.creationModal = false;
    },
    getCreationPayload (event) {
      let payload = { ...this.$_.omit(event, ['dates', '__v', '__index']) }
      payload = this.$_.pickBy(payload);

      if (event.type === INTERNAL_HOUR) {
        const internalHour = this.internalHours.find(hour => hour._id === event.internalHour);
        payload.internalHour = internalHour;
      }
      if (event.type === ABSENCE) {
        if (event.absenceNature === DAILY) {
          payload.startDate = this.$moment(event.dates.startDate).hour(PLANNING_VIEW_START_HOUR).minute(0).toISOString();
          payload.endDate = this.$moment(event.dates.endDate).hour(PLANNING_VIEW_END_HOUR).minute(0).toISOString();
        } else {
          payload.startDate = this.$moment(event.dates.startDate)
            .hour(this.$moment(event.dates.startHour).hour())
            .minute(this.$moment(event.dates.startHour).minute())
            .toISOString();
          payload.endDate = this.$moment(event.dates.startDate)
            .hour(this.$moment(event.dates.endHour).hour())
            .minute(this.$moment(event.dates.endHour).minute())
            .toISOString();
        }
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
      if (event.type === ABSENCE && event.absence !== ILLNESS) payload.attachment = {};

      return payload;
    },
    hasConflicts (scheduledEvent) {
      const auxiliaryEvents = this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate);
      return auxiliaryEvents.some(ev => {
        if ((scheduledEvent._id && scheduledEvent._id === ev._id) || ev.isCancelled) return false;
        return this.$moment(scheduledEvent.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          this.$moment(ev.startDate).isBetween(scheduledEvent.startDate, scheduledEvent.endDate, 'minutes', '[]');
      });
    },
    getAuxiliaryEventsBetweenDates (auxiliaryId, startDate, endDate) {
      return this.events
        .filter(event => event.auxiliary._id === auxiliaryId)
        .filter(event => {
          return this.$moment(event.startDate).isBetween(startDate, endDate, 'minutes', '[)') ||
            this.$moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '[)')
        });
    },
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getCreationPayload(this.newEvent);

        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        await this.$events.create(payload);

        this.refresh();
        this.creationModal = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 422) return NotifyNegative('La creation de cet evenement n\'est pas autorisée');
        NotifyNegative('Erreur lors de la création de l\'évènement');
      } finally {
        this.loading = false
      }
    },
    // Event edition
    formatHour (date) {
      return `${this.$moment(date).hours() < 10
        ? `0${this.$moment(date).hours()}`
        : this.$moment(date).hours()}:${this.$moment(date).minutes() || '00'}`;
    },
    formatEditedEvent (event) {
      const { createdAt, updatedAt, startDate, endDate, isBilled, auxiliary, ...eventData } = event;
      const dates = {
        startDate,
        endDate,
        startHour: event.type === ABSENCE && event.absenceNature === HOURLY ? startDate : this.formatHour(startDate),
        endHour: event.type === ABSENCE && event.absenceNature === HOURLY ? endDate : this.formatHour(endDate),
      };

      switch (event.type) {
        case INTERVENTION:
          const subscription = event.subscription._id;
          this.editedEvent = {
            isCancelled: false,
            cancel: {},
            shouldUpdateRepetition: false,
            ...eventData,
            dates,
            auxiliary: auxiliary._id,
            subscription,
            isBilled
          };
          break;
        case INTERNAL_HOUR:
          const internalHour = event.internalHour._id;
          this.editedEvent = { location: {}, shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, internalHour, dates };
          break;
        case ABSENCE:
          this.editedEvent = {
            location: {},
            attachment: {},
            ...eventData,
            auxiliary: auxiliary._id,
            dates,
          };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, dates };
          break;
      }
    },
    canEditEvent (event) {
      return this.$can({
        user: this.$store.getters['main/user'],
        auxiliaryIdEvent: event.auxiliary._id,
        auxiliarySectorEvent: event.sector,
        permissions: [
          { name: 'planning:edit:user', rule: 'isInSameSector' },
          { name: 'planning:edit', rule: 'isOwner' }
        ],
      });
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
    closeEditionModal () {
      this.editionModal = false;
    },
    getEditionPayload (event) {
      let payload = this.getCreationPayload(event);

      delete payload.customer;
      delete payload.repetition;
      delete payload.staffingLeft;
      delete payload.staffingWidth;
      delete payload.staffingTop;
      delete payload.staffingHeight;
      delete payload.type;

      return payload;
    },
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getEditionPayload(this.editedEvent);

        if (!payload.isCancelled && this.hasConflicts(payload)) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }
        delete payload._id;
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        this.refresh();
        this.editionModal = false;
        this.resetEditionForm();
      } catch (e) {
        console.error(e)
        if (e.data && e.data.statusCode === 422) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Cette modification n\'est pas autorisée');
        }
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    async updateEventOnDrop (vEvent) {
      try {
        const { toDay, toPerson, draggedObject } = vEvent;
        const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');

        if ([ABSENCE, UNAVAILABILITY].includes(draggedObject.type) && draggedObject.auxiliary._id !== toPerson._id) {
          return NotifyNegative('Impossible de modifier l\'auxiliaire de cet évènement.');
        }

        const payload = {
          startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
            .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
          endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
            .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
          auxiliary: toPerson._id
        };

        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }

        const updatedEvent = await this.$events.updateById(draggedObject._id, payload);
        this.events = this.events.map(event => (event._id === updatedEvent._id) ? updatedEvent : event);

        NotifyPositive('Évènement modifié');
      } catch (e) {
        if (e.data.statusCode === 422) return NotifyNegative('Cette modification n\'est pas autorisée');
      }
    },
    // Event files
    documentUploaded (uploadedInfo) {
      if (!uploadedInfo.xhr || !uploadedInfo.xhr.response) return;

      const json = JSON.parse(uploadedInfo.xhr.response);
      if (!json || !json.data || !json.data.payload) return;

      if (this.creationModal) this.newEvent.attachment = { ...json.data.payload.attachment }
      if (this.editionModal) this.editedEvent.attachment = { ...json.data.payload.attachment }
    },
    async deleteDocument (driveId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await this.$gdrive.removeFileById({ id: driveId });
        if (this.creationModal) this.newEvent.attachment = {};
        if (this.editionModal) this.editedEvent.attachment = {};
        NotifyPositive('Document supprimé');
      } catch (e) {
        if (e.message === '') return NotifyPositive('Suppression annulée');
        NotifyNegative('Erreur lors de la suppression du document');
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
  },
};
