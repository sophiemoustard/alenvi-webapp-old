import { required, requiredIf } from 'vuelidate/lib/validators';
import { frAddress } from '../helpers/vuelidateCustomVal.js';
import { NotifyWarning, NotifyNegative, NotifyPositive } from '../components/popup/notify';
import { INTERNAL_HOUR, ABSENCE, INTERVENTION, MORNING, AFTERNOON, ALL_DAY, NEVER, UNAVAILABILITY, ILLNESS } from '../data/constants';

export const planningActionMixin = {
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
          frequency: { required: requiredIf((item) => item && item.type !== ABSENCE) }
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
  methods: {
    setInternalHours () {
      const user = this.$store.getters['main/user'];
      if (user && user.company && user.company.rhConfig && user.company.rhConfig.internalHours) {
        this.internalHours = user.company.rhConfig.internalHours;
      }
    },
    // Event creation
    selectedAddress (item) {
      if (this.creationModal) this.newEvent.location = Object.assign({}, this.newEvent.location, item);
      if (this.editionModal) this.editedEvent.location = Object.assign({}, this.editedEvent.location, item);
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
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
    closeCreationModal () {
      this.creationModal = false;
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
      if (event.type === ABSENCE && event.absence !== ILLNESS) payload.attachment = {};

      return payload;
    },
    hasConflicts (scheduledEvent) {
      const auxiliaryEvents = this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate);
      return auxiliaryEvents.some(ev => {
        if (scheduledEvent._id && scheduledEvent._id === ev._id) return false;
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
    getAbsenceDurations (event) {
      let startDuration;
      let endDuration;

      if (event.type !== ABSENCE) return { startDuration, endDuration }

      const startHour = this.$moment(event.startDate).hours();
      const endHour = this.$moment(event.endDate).hours();
      if (this.$moment(event.startDate).isSame(this.$moment(event.endDate), 'days')) {
        if (startHour === MORNING[0].startHour && endHour === MORNING[0].endHour) startDuration = MORNING;
        else if (startHour === AFTERNOON[0].startHour && endHour === AFTERNOON[0].endHour) startDuration = AFTERNOON;
        else startDuration = ALL_DAY;
      } else {
        if (startHour === AFTERNOON[0].startHour) startDuration = AFTERNOON;
        else startDuration = ALL_DAY;

        if (endHour === MORNING[0].endHour) endDuration = MORNING;
        else endDuration = ALL_DAY;
      }

      return { startDuration, endDuration };
    },
    async createEvent () {
      try {
        this.$v.newEvent.$touch();
        if (this.$v.newEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.newEvent);

        if (this.hasConflicts(payload)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        await this.$events.create(payload);

        this.refreshPlanning();
        this.creationModal = false;
        this.resetCreationForm(false);
        NotifyPositive('Évènement créé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'évènement');
      } finally {
        this.loading = false
      }
    },
    // Event edition
    openEditionModal (event) {
      const auxiliary = event.auxiliary._id;
      const can = this.$can({
        user: this.$store.getters['main/user'],
        auxiliaryIdEvent: auxiliary,
        auxiliarySectorEvent: event.sector,
        permissions: [
          { name: 'planning:edit:user', rule: 'isInSameSector' },
          { name: 'planning:edit', rule: 'isOwner' }
        ],
      });
      if (!can) return;
      const { createdAt, updatedAt, startDate, endDate, ...eventData } = event;
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
      switch (event.type) {
        case INTERVENTION:
          const subscription = event.subscription._id;
          this.editedEvent = { isCancelled: false, cancel: {}, shouldUpdateRepetition: false, ...eventData, dates, auxiliary, subscription };
          break;
        case INTERNAL_HOUR:
          const internalHour = event.internalHour._id;
          this.editedEvent = { location: {}, shouldUpdateRepetition: false, ...eventData, auxiliary, internalHour, dates };
          break;
        case ABSENCE:
          const { startDuration, endDuration } = this.getAbsenceDurations(event);
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
    closeEditionModal () {
      this.editionModal = false;
    },
    async updateEvent () {
      try {
        this.$v.editedEvent.$touch();
        if (this.$v.editedEvent.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getPayload(this.editedEvent);

        if (this.hasConflicts(payload)) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
        }

        delete payload.customer;
        delete payload.type;
        delete payload._id
        await this.$events.updateById(this.editedEvent._id, payload);
        NotifyPositive('Évènement modifié');

        this.refreshPlanning();
        this.editionModal = false;
        this.resetEditionForm();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'édition de l\'évènement');
      } finally {
        this.loading = false;
      }
    },
    async updateEventOnDrop (vEvent) {
      const { toDay, toPerson, draggedObject } = vEvent;
      const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');

      const payload = {
        startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
          .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
          .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
        auxiliary: toPerson._id
      };

      if (this.hasConflicts(payload)) {
        return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire');
      }

      const updatedEvent = await this.$events.updateById(draggedObject._id, payload);
      this.events = this.events.map(event => (event._id === updatedEvent._id) ? updatedEvent : event);

      NotifyPositive('Évènement modifié');
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
  },
};
