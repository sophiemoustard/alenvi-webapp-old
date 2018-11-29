<template>
  <div>
    <div v-if="ogustUser && title" class="row justify-between items-baseline q-pt-sm">
      <h4 style="margin: 0 0 0 10px !important">{{ogustUser.title}}</h4>
      <sector-filter class="sector-filter" v-show="showTabFilter && !customer" v-if="ogustUser" @personChosen="applyFilter" @click.self="displayFilter" />
    </div>
    <div ref="scheduler_here" class="dhx_cal_container" style="width:100%; height:100%;">
      <q-scroll-observable v-if="scroll" @scroll="handleScroll" />
      <q-resize-observable v-if="customer" @resize="onResize" />
      <div ref="cal_navline" class="dhx_cal_navline">
        <div class="dhx_cal_prev_button relative-position" v-ripple>&nbsp;</div>
        <div v-show="displayNext" class="dhx_cal_next_button relative-position" v-ripple>&nbsp;</div>
        <div v-if="!customer && $q.platform.is.desktop" class="dhx_cal_today_button relative-position" v-ripple></div>
        <div class="dhx_cal_date"></div>
        <div v-show="!customer && $q.platform.is.desktop" class="dhx_cal_tab relative-position" v-ripple name="three_days_tab" style="left:200px;"></div>
        <div v-if="!customer && $q.platform.is.desktop" class="dhx_cal_tab relative-position" v-ripple name="week_tab" style="right:140px;"></div>
        <div v-if="!customer && $q.platform.is.desktop" class="dhx_cal_tab relative-position" v-ripple name="month_tab" style="right:76px;"></div>
        <div v-show="showTabCustomer" class="dhx_cal_tab relative-position" v-ripple name="customer_week_tab" style="right:140px;"></div>
      </div>
      <div class="row justify-end select-view">
        <q-select v-if="!customer && $q.platform.is.mobile" v-model="selectView" :options="viewOptions" @input="changeViewMode" />
      </div>
      <div ref="cal_header" class="dhx_cal_header"></div>
      <div class="dhx_cal_data"></div>
    </div>

    <q-modal v-model="openModal" minimized :content-css="modalStyle" @hide="closeModal" @escape-key="closeModal">
      <p class="caption">{{ customerEventInfo.eventTitle }}</p>
      <div class="margin-input">
        <div class="row gutter-sm">
          <div class="col-xs-6">
            <p class="input-caption">Heure de début</p>
            <q-datetime type="time" format24h clear-label="Effacer" ok-label="OK" cancel-label="Annuler" v-model="customerEventInfo.eventFrom"
              :disable="disableTimePicker" inverted-light color="white" popover />
          </div>
          <div class="col-xs-6">
            <p class="input-caption">Heure de fin</p>
            <q-datetime type="time" format24h clear-label="Effacer" ok-label="OK" cancel-label="Annuler" v-model="customerEventInfo.eventTo"
              :disable="disableTimePicker" inverted-light color="white" popover />
          </div>
        </div>
      </div>
      <div class="margin-input">
        <p class="input-caption">Code porte</p>
        <q-input v-model="customerEventInfo.doorCode" type="text" :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="margin-input">
        <p class="input-caption">Code interphone</p>
        <q-input v-model="customerEventInfo.interCode" type="text" :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="margin-input">
        <p class="input-caption">Pathologie</p>
        <q-select v-model="customerEventInfo.pathology" :options="selectOptions" :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="margin-input">
        <p class="input-caption">Commentaires</p>
        <q-input v-model="customerEventInfo.comments" type="textarea" :min-rows="4" :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="margin-input">
        <p class="input-caption">Détails intervention</p>
        <q-input v-model="customerEventInfo.interventionDetails" type="textarea" :min-rows="4"
          :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="margin-input">
        <p class="input-caption">Autres</p>
        <q-input v-model="customerEventInfo.misc" type="textarea" :min-rows="4" :disable="disableInput" inverted-light color="white" />
      </div>
      <div class="row justify-end">
        <q-btn :loading="modalBtnLoading" @click="updateEvent" class="on-left" color="primary"
          :disable="disableInput">
          Enregistrer
        </q-btn>
        <q-btn color="grey" @click="closeModal">
          Fermer
        </q-btn>
      </div>
    </q-modal>

    <q-modal v-model="openInternHoursModal" minimized :content-css="modalStyle" @hide="closeInternHoursModal" @escape-key="closeInternHoursModal">
      <div class="margin-input">
        <p class="input-caption">Date</p>
        <q-field :error="$v.internHoursInfo.eventDate.$error" :error-label="requiredField">
          <q-datetime type="date" format="DD/MM/YYYY" v-model="internHoursInfo.eventDate" color="white" inverted-light popover :default-value="internHoursDefault" />
        </q-field>
      </div>
      <div class="margin-input">
        <div class="row gutter-sm">
          <div class="col-xs-6">
            <p class="input-caption">Heure de début</p>
            <q-field :error="$v.internHoursInfo.eventFrom.$error" :error-label="requiredField">
              <q-datetime type="time" format24h clear-label="Effacer" ok-label="OK" cancel-label="Annuler" v-model="internHoursInfo.eventFrom"
                inverted-light color="white" popover :default-value="internHoursDefault" />
            </q-field>
          </div>
          <div class="col-xs-6">
            <p class="input-caption">Heure de fin</p>
            <q-field :error="$v.internHoursInfo.eventTo.$error" :error-label="requiredField">
              <q-datetime type="time" format24h clear-label="Effacer" ok-label="OK" cancel-label="Annuler" v-model="internHoursInfo.eventTo"
                inverted-light color="white" popover :default-value="internHoursDefault" />
            </q-field>
          </div>
        </div>
      </div>
      <div class="margin-input">
        <p class="input-caption">Motif</p>
        <q-field :error="$v.internHoursInfo.reason.$error" :error-label="requiredField">
          <q-input
            v-model="internHoursInfo.reason"
            type="textarea"
            :rows="6"
            inverted-light
            color="white" />
        </q-field>
      </div>
      <div class="row justify-end">
        <q-btn :loading="internHoursModalBtnLoading" @click="declareInternHours" class="on-left" color="primary">
          Enregistrer
        </q-btn>
        <q-btn color="grey" @click="closeInternHoursModal">
          Fermer
        </q-btn>
      </div>
    </q-modal>
  </div>
</template>

<script>
/* global scheduler */
import 'dhtmlx-scheduler'
import 'dhtmlx-scheduler/codebase/locale/locale_fr';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_readonly.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_container_autoresize.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import responsive from './scripts/dhtmlxscheduler-responsive.js';

import {
  debounce
} from 'quasar'
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators';

import SectorFilter from '../../components/SectorFilter'

const configDhtmlxScheduler = (vm) => {
  // config line mark of current time
  scheduler.config.mark_now = true;
  // Event date format
  scheduler.config.xml_date = '%Y-%m-%d %H:%i';
  // Blocking hours
  scheduler.config.first_hour = 8;
  scheduler.config.last_hour = 24;
  // disable double click
  scheduler.config.dblclick_create = false;
  scheduler.config.drag_resize = false;
  scheduler.config.drag_move = false;
  // scheduler.config.touch_tip = false;
  // changing cancel button label
  scheduler.locale.labels['icon_cancel'] = 'Fermer';
  // custom view label
  scheduler.locale.labels['customer_week_tab'] = 'Semaine';
  scheduler.locale.labels['three_days_tab'] = '3 jours';
  // hide lightbox in month view
  scheduler.config.show_loading = true;
  // hide select bar in day and week views
  scheduler.config.select = false;
  scheduler.config.touch_tip = false;
  // scheduler.config.hour_size_px = 60;
  scheduler.xy.scale_height = 25;
  // time step in lightbox
  scheduler.config.time_step = 15;
  // limit time in time picker dropdown in lightbox
  scheduler.config.limit_time_select = true;

  // scheduler position config
  scheduler.xy.scale_height = 45;
  scheduler.xy.margin_left = 10;

  // prevent from creating events
  scheduler.config.readonly = true;
}

export default {
  components: {
    SectorFilter
  },
  name: 'scheduler',
  props: {
    events: {
      type: Array,
      default () {
        return [{
          id: '',
          text: '',
          start_date: '',
          end_date: '',
          id_employee: '',
          type: '',
          id_customer: '',
          door_code: '',
          intercom_code: '',
          pathology: '',
          comments: '',
          interventionDetails: '',
          misc: '',
          readonly: ''
        }]
      }
    },
    customer: {
      type: Boolean
    },
    showTabCustomer: {
      type: Boolean
    },
    showTabFilter: {
      type: Boolean
    },
    scroll: Boolean,
    title: Boolean
  },
  data () {
    return {
      requiredField: 'Champ requis',
      openInternHoursModal: false,
      internHoursModalBtnLoading: false,
      internHoursDefault: Date.now(),
      internHoursInfo: {
        eventFrom: null,
        eventTo: null,
        eventDate: null,
        reason: ''
      },
      selectView: 'three_days',
      viewOptions: [
        {
          label: '3 jours',
          value: 'three_days'
        },
        {
          label: 'Semaine',
          value: 'week'
        },
        {
          label: 'Mois',
          value: 'month'
        }
      ],
      disableInput: true,
      disableTimePicker: true,
      modalBtnLoading: false,
      openModal: false,
      width: window.innerWidth,
      today: new Date(),
      displayNext: true,
      childEvents: this.events,
      customerCodes: {
        doorCode: '',
        interCode: ''
      },
      customerEventInfo: {
        eventTitle: '',
        pathology: '',
        comments: '',
        interventionDetails: '',
        misc: '',
        doorCode: '',
        interCode: '',
        eventEmployeeId: '',
        eventFrom: null,
        eventTo: null,
        eventType: '',
        eventId: ''
      },
      selectOptions: [
        {
          label: '-',
          value: '-'
        },
        {
          label: 'Alzheimer',
          value: 'Alzheimer'
        },
        {
          label: 'Parkinson',
          value: 'Parkinson'
        },
        {
          label: 'Corps de Lewy',
          value: 'Corps de Lewy'
        },
        {
          label: 'Autres troubles cognitifs',
          value: 'Autres troubles cognitifs'
        },
        {
          label: 'AVC récent',
          value: 'AVC récent'
        },
        {
          label: 'Autre',
          value: 'Autre'
        }
      ]
    }
  },
  computed: {
    modalStyle () {
      const style = {
        padding: '20px',
        minWidth: '70vw',
        minHeight: '80vh'
      };
      if (this.$q.platform.is.mobile) {
        style.minWidth = '100vw';
        return style;
      }
      return style;
    },
    ...mapGetters({
      user: 'main/user',
      toggleDrawer: 'main/toggleDrawer',
      showFilter: 'calendar/showFilter',
      ogustUser: 'calendar/ogustUser',
      personChosen: 'calendar/personChosen',
      personType: 'calendar/personType'
    })
  },
  validations: {
    internHoursInfo: {
      eventFrom: { required },
      eventTo: { required },
      eventDate: { required },
      reason: { required }
    }
  },
  mounted () {
    configDhtmlxScheduler(this);

    scheduler.attachEvent('onTemplatesReady', () => {
      // Custom week_date header format (week standard view)
      scheduler.templates.week_date = (start, end) => `${scheduler.date.date_to_str('%j %F')(start)} &ndash; ${scheduler.date.date_to_str('%j %F')(scheduler.date.add(end, -1, 'day'))}`;
      // Custom month_scale format (month standard view)
      scheduler.templates.month_scale_date = date => scheduler.date.date_to_str('%l')(date);
      // Custom week_scale format (week standard view)
      scheduler.templates.week_scale_date = date => `<div>${scheduler.date.date_to_str('%D')(date)}.</div><big>${scheduler.date.date_to_str('%j')(date)}</big>`;
      // Custom hour_scale format (standard view)
      scheduler.templates.hour_scale = function (date) {
        const format = scheduler.date.date_to_str('%H:%i');
        return "<div style='height:44px;line-height:0px;width:45px;'>" + format(date) + '</div>';
      }

      // custom 'customer_week' view
      scheduler.date.customer_week_start = date => scheduler.date.week_start(date);
      scheduler.templates.customer_week_date = scheduler.templates.week_date;
      scheduler.templates.customer_week_scale_date = scheduler.templates.week_scale_date;
      scheduler.date.add_customer_week = (date, inc) => scheduler.date.add(date, inc * 7, 'day');

      // custom 'customer_three_days' view
      scheduler.date.three_days_start = date => scheduler.date.date_part(new Date(date.valueOf()));
      scheduler.date.three_days_end = startDate => scheduler.date.add(startDate, 3, 'day');
      scheduler.templates.three_days_date = (start, end) => `${scheduler.date.date_to_str('%j %F')(start)} &ndash; ${scheduler.date.date_to_str('%j %F')(scheduler.date.add(end, -1, 'day'))}`;
      scheduler.templates.three_days_scale_date = scheduler.templates.week_scale_date;
      scheduler.date.add_three_days = (date, inc) => scheduler.date.add(date, inc * 3, 'day');

      // custom color events
      scheduler.templates.event_class = function (start, end, event) {
        if (event.type === 'alenvi') {
          return 'alenvi_event';
        } else if (event.type === 'alenvi_past') {
          return 'alenvi_past_event';
        }
      }
    });

    scheduler.renderEvent = (container, ev) => {
      const containerWidth = container.style.width;
      const containerHeight = container.style.height;
      const html = `<div class="dhx_event_move" style="width: ${containerWidth}"></div>
                    <div class="custom_event" style="height: ${containerHeight.replace(/\D+/g, '') - 10}px">
                      <span class="event_date">
                        ${scheduler.templates.event_header(ev.start_date, ev.end_date, ev)}
                      </span><br/>
                      <span>${scheduler.templates.event_text(ev.start_date, ev.end_date, ev)}</span>
                    </div>
                    <div class="dhx_event_resize dhx_footer" style="width: ${containerWidth}"></div>`;
      container.innerHTML = html;
      return true;
    };

    scheduler.attachEvent('onBeforeViewChange', (oldMode, oldDate, mode, date) => {
      if (mode === 'filter') {
        return false;
      }
      return true;
    });

    // when clicking on prev and next buttons
    scheduler.attachEvent('onViewChange', (newMode, newDate) => {
      if (this.personChosen) {
        this.$emit('viewChanged', { personChosen: true });
      } else {
        this.$emit('viewChanged');
      }
      let daylimit = null;
      if (newMode === 'customer_week') {
        daylimit = this.$moment(this.today).startOf('week').add(1, 'week');
      } else {
        daylimit = this.$moment(this.today).startOf('day').add(9, 'days');
      }
      this.displayNext = true;
      if (this.customer && (newMode === 'customer_week' || newMode === 'three_days') && this.$moment(newDate).isSame(daylimit)) {
        this.displayNext = false;
        return false;
      }
      return true;
    });

    responsive.initResponsive(scheduler, { customer: this.customer, mobile: this.$q.platform.is.mobile });

    // Scheduler initialization

    // Scheduler default view
    let defaultView = '';
    if (this.$q.platform.is.mobile) {
      defaultView = 'three_days';
    } else if (this.customer) {
      defaultView = 'customer_week';
    } else {
      defaultView = 'week';
    }
    scheduler.init(this.$refs.scheduler_here, this.today, defaultView);

    // Scheduler data parser
    scheduler.parse(this.childEvents, 'json');

    scheduler.showLightbox = (id) => {
      const ev = scheduler.getEvent(id);
      this.customerEventInfo.doorCode = ev.door_code;
      this.customerEventInfo.interCode = ev.intercom_code;
      this.customerEventInfo.pathology = ev.pathology;
      this.customerEventInfo.comments = ev.comments;
      this.customerEventInfo.interventionDetails = ev.interventionDetails;
      this.customerEventInfo.misc = ev.misc;
      this.customerEventInfo.eventFrom = this.$moment(ev.start_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventTo = this.$moment(ev.end_date, 'YYYY-MM-DD HH:mm').toDate();
      this.customerEventInfo.eventEmployeeId = ev.id_employee;
      this.customerEventInfo.eventType = ev.type;
      this.customerEventInfo.eventId = ev.id;
      this.customerEventInfo.eventTitle = `${ev.text} ${this.$moment(ev.start_date, 'YYYY-MM-DD HH:mm').format('HH:mm')} - ${this.$moment(ev.end_date, 'YYYY-MM-DD HH:mm').format('HH:mm')}`
      this.disableInput = false;
      this.openModal = true;
      if (this.user.employee_id === Number(ev.id_employee, 10) && !ev.readonly) {
        this.disableTimePicker = false;
      }
    };
    scheduler.attachEvent('onClick', (id, e) => {
      if (this.customer) {
        return true;
      }
      scheduler.showLightbox(id);
    });
    // Prevent double click on event
    scheduler.attachEvent('onDblClick', () => false);

    // Open intern hours modal
    scheduler.attachEvent('onEmptyClick', debounce(async () => {
      try {
        if (this.customer) return true;
        await this.$q.dialog({
          message: 'Voulez-vous déclarer des heures internes ?',
          ok: true,
          cancel: true
        });
        this.openInternHoursModal = true;
      } catch (e) {
        console.error(e);
      }
    }), 1000);
  },
  methods: {
    handleScroll: debounce(function (scroll) {
      const headerToFix = document.getElementsByClassName('dhx_cal_header')[0];
      if (scroll.position >= 60 && this.width >= 768) {
        if (this.customer && !this.$q.platform.is.mobile && this.toggleDrawer) {
          headerToFix.classList.add('header-fixed-customer');
          this.$refs.cal_header.style.left = `350px`
        } else if (this.customer && !this.$q.platform.is.mobile && !this.toggleDrawer) {
          headerToFix.classList.add('header-fixed-customer');
        } else if (!this.customer && !this.$q.platform.is.mobile && this.toggleDrawer) {
          headerToFix.classList.add('header-fixed');
          this.$refs.cal_header.style.left = scheduler.getState().mode === 'month' ? '250px' : `300px`;
        } else {
          headerToFix.classList.add('header-fixed');
        }
      } else if (scroll.position >= 71 && this.width < 768) {
        headerToFix.classList.add('header-fixed-customer');
      } else if (scroll.position >= 131 && this.width < 768) {
        headerToFix.classList.add('header-fixed');
      } else if (scroll.position === 0 && !this.customer && this.toggleDrawer) {
        this.$refs.cal_header.style.left = scheduler.getState().mode !== 'month' ? '50px' : `-1px`
        headerToFix.classList.remove('header-fixed');
      } else {
        this.$refs.cal_header.style.left = scheduler.getState().mode === 'month' ? this.$refs.cal_header.style.left : `50px`
        headerToFix.classList.remove('header-fixed');
        headerToFix.classList.remove('header-fixed-customer');
      }
    }, 10),
    onResize: debounce(function (size) {
      scheduler.updateView();
    }, 500),
    async updateEvent () {
      try {
        this.modalBtnLoading = true;
        const ev = scheduler.getEvent(this.customerEventInfo.eventId);
        ev.door_code = this.customerEventInfo.doorCode;
        ev.intercom_code = this.customerEventInfo.interCode;
        ev.pathology = this.customerEventInfo.pathology;
        ev.comments = this.customerEventInfo.comments;
        ev.interventionDetails = this.customerEventInfo.interventionDetails;
        ev.misc = this.customerEventInfo.misc;
        ev.dateChanged = false;
        if (!this.$moment(ev.start_date).isSame(this.customerEventInfo.eventFrom) || !this.$moment(ev.end_date).isSame(this.customerEventInfo.eventTo)) {
          ev.start_date = this.customerEventInfo.eventFrom;
          ev.end_date = this.customerEventInfo.eventTo;
          ev.dateChanged = true;
        }
        if (this.personType === 'employee' && this.user.employee_id === Number(ev.id_employee, 10) && ev.dateChanged) {
          const updateServicePayload = {
            start_date: this.$moment(ev.start_date).format('YYYYMMDDHHmm'),
            end_date: this.$moment(ev.end_date).format('YYYYMMDDHHmm')
          }
          await this.$ogust.updateServiceById(ev.id, updateServicePayload);
          const planningUpdateParams = {
            type: 'Modif. Intervention',
            content: `${this.$moment(ev.start_date).format('dddd DD/MM')}.\nIntervention chez ${ev.text} de ${this.$moment(ev.start_date).format('HH:mm')} à ${this.$moment(ev.end_date).format('HH:mm')}`,
            involved: ev.text,
            check: {
              isChecked: true,
              checkBy: process.env.ALENVI_BOT_ID,
              checkedAt: new Date()
            }
          };
          await this.$planningUpdates.storePlanningupdates(this.user.employee_id, planningUpdateParams);
        }
        const customerDetailsPayload = {
          arrayValues: {
            NIVEAU: ev.pathology,
            COMMNIV: ev.comments,
            DETAILEVE: ev.interventionDetails,
            AUTRESCOMM: ev.misc
          }
        };
        await this.$ogust.editOgustCustomerDetails(ev.id_customer, customerDetailsPayload);
        const customerCodesPayload = {
          door_code: ev.door_code,
          intercom_code: ev.intercom_code
        };
        await this.$ogust.editOgustCustomer(ev.id_customer, customerCodesPayload);
        // Renders immediately the updated event in calendar
        scheduler.updateEvent(ev.id);
        scheduler.setCurrentView();

        this.closeModal();
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Ta demande a bien été enregistrée',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.modalBtnLoading = false;
        this.$q.notify({
          color: 'error',
          icon: 'warning',
          detail: "Erreur lors de l'enregistrement",
          position: 'bottom-right',
          timeout: 2500
        });
      }
    },
    async declareInternHours () {
      try {
        this.$v.internHoursInfo.$touch();
        if (this.$v.internHoursInfo.$error) {
          this.$q.notify({
            color: 'secondary',
            icon: 'warning',
            detail: 'Merci de remplir tous les champs',
            position: 'bottom-right',
            timeout: 2500
          });
          return 0;
        }
        this.internHoursModalBtnLoading = true
        const internHoursParams = {
          type: 'Heures internes',
          content: `${this.$moment(this.internHoursInfo.eventDate).format('dddd DD/MM')}.\n${this.internHoursInfo.reason}.\n${this.$moment(this.internHoursInfo.eventFrom).format('HH:mm')} - ${this.$moment(this.internHoursInfo.eventTo).format('HH:mm')}`,
          involved: `${this.user.firstname} ${this.user.lastname}`,
        };
        await this.$planningUpdates.storePlanningupdates(this.user.employee_id, internHoursParams);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Ta demande a bien été enregistrée',
          position: 'bottom-right',
          timeout: 2500
        });
        this.closeInternHoursModal();
      } catch (e) {
        console.error(e);
        this.internHoursModalBtnLoading = false
        this.$q.notify({
          color: 'error',
          icon: 'secondary',
          detail: "Erreur lors de l'envoi de la déclaration",
          position: 'bottom-right',
          timeout: 2500
        });
      }
    },
    displayFilter () {
      this.$store.commit('calendar/toggleFilter', !this.showFilter)
    },
    applyFilter () {
      this.$emit('applyFilter', { personChosen: true });
    },
    closeModal () {
      this.openModal = false;
      this.disableInput = true;
      this.disableTimePicker = true;
      this.modalBtnLoading = false;
    },
    closeInternHoursModal () {
      this.$v.internHoursInfo.$reset();
      this.openInternHoursModal = false;
      this.internHoursInfo.eventDate = null;
      this.internHoursInfo.eventFrom = null;
      this.internHoursInfo.eventTo = null;
      this.internHoursInfo.reason = '';
      this.internHoursModalBtnLoading = false;
    },
    changeViewMode () {
      scheduler.setCurrentView(scheduler.getState().date, this.selectView);
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .sector-filter
    margin-right: 20px
    @media screen and (max-width: 767px)
      margin-right: 6px

  .select-view
    @media screen and (max-width: 767px)
      margin-right: 10px
    & /deep/ .q-input-target
      color: #454544
      font-size: 13px

  .custom-field
    margin: 16px 0

  .q-if-inverted
    border: 1px solid #D0D0D0;

  .margin-input
    margin-bottom: 6px;

  .q-datetime .q-datetime-content .modal-buttons .q-btn .q-btn-inner > div
    color: $primary !important;

  .bg-negative
    background: none !important
    color: inherit !important

</style>

<style lang="css">
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler_flat.css";
  @import "~assets/dhtmlxscheduler-responsive.css";

  @media screen and (max-width: 767px) {
    .dhx_cal_navline {
      height: 50px !important;
      width: 265px !important;
    }
    .dhx_cal_navline .dhx_cal_date {
      top: 0 !important;
      left: -10px !important;
    }

    .dhx_cal_navline .dhx_cal_tab {
      top: 0px !important;
      right: -2px !important;
    }

    .dhx_cal_navline .dhx_cal_prev_button {
      top: 0 !important;
      left: 0 !important;
      width: 30px !important;
    }
    .dhx_cal_navline .dhx_cal_next_button {
      top: 0 !important;
      right: 20px !important;
      width: 30px !important;
    }
  }

  .dhx_scale_hour {
    border-bottom: none;
    overflow: visible;
  }

  .dhx_cal_data {
    overflow-y: visible;
    overflow-x: visible;
    border-top: none;
  }

  .dhx_cal_header div div {
    border: none;
  }

  .dhx_scale_bar {
    line-height: 20px;
  }

  .dhx_scale_holder {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAsCAIAAAArRUU2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4gEREC41Aw9nHAAAABZJREFUCNdj+P//PxMDA8OQwOfPnwcAKy4FwcX82PUAAAAASUVORK5CYII=");
  }

  .dhx_scale_holder_now {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAsCAIAAAArRUU2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4gEREDIsgROSgQAAABZJREFUCNdj+P95IRMDA8OQwOcvPgQA44cFa6kqCcUAAAAASUVORK5CYII=");
  }

  .dhx_cal_navline.dhx_cal_date {
    color: #737373;
    font-family: inherit;
  }

  .dhx_cal_tab {
    color: #737373;
    background-color: none;
  }

  .dhx_cal_tab:hover {
    text-decoration: none;
    background-color: rgba(0,0,0,0.07);
  }

  .dhx_cal_tab.active {
    background-color: rgba(0,0,0,0.07);
    color: #737373;
    font-weight: 700;
  }

  .dhx_cal_tab.active:hover {
    background-color: rgba(0,0,0,0.1);
  }

  .dhx_cal_today_button {
    color: #737373;
  }

  .dhx_cal_today_button:hover {
    text-decoration: none;
    background-color: rgba(0,0,0,0.07);
  }

  .dhx_cal_prev_button {
    width: 30px;
    border-radius: 50%;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAORJREFUSMft1T8KwjAUBvAvcRI8jFtbOviHHkDwJIXuegGbHsFTiIODi2nOIG46OIirLk1dOog45CURHPJtGV5+PHi8B4SEhPxT8jwfUWt6rmhRFEvG2DpJkn5d1zvTOuaKtm276J5nrfVQCHE3qeWe0IvWemqKWnf8BZ0IIU6UP8iwD5QM+0IBwlR/oNemabKqqo42KEAbroct4tSxlPKQpukTQAZgwDmfR1G0UUrdfgr7xsmbyxdutTJ94Na7usMZgHGHz+I4XiuljIbQ6UhIKfdvna/Ksty6/EeOzVkMCQnxlhck2ouoK+MN0AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOC0wMS0xOFQxMDowNzoxMyswMDowMGL8TZcAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDEtMThUMTA6MDc6MTMrMDA6MDATofUrAAAAKHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy90bXAvbWFnaWNrLU5Td0Y1d0NE+kVb4wAAAABJRU5ErkJggg==") no-repeat center center;
  }

  .dhx_cal_prev_button:hover {
    background-color: rgba(0,0,0,0.07);
  }

  .dhx_cal_event .dhx_title {
    text-align: start;
  }

  .dhx_cal_event .dhx_footer {
    background: none;
  }

  .dhx_cal_event .dhx_footer:hover {
    background: none;
  }

  .dhx_cal_event:hover .dhx_event_resize.dhx_footer {
    background: none;
    display: none;
  }

  .dhx_cal_next_button {
    width: 30px;
    border-radius: 50%;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAAAPRJREFUSMft1aFOxDAcgPHvP2YwQLBonmFbdwkYPAlP0mTzuwfYPO6egIA4dwmotbwNqHMrhplT164Hpp9s2v7SihZSqdR/pbW+i7HPmc/kpmk6EdlUVXVujNn9Cay1vhaRZ+BSRFZ1Xcs4jh8nh621e6XUC/AIXAH3S07uddXGmG+l1OuMi8gqFPeCZ7woircsyxbh3jCAtfZrKR4Ez3hZllsReQIufPEsFAbI81wOhvbHrpVjJx7Wtu3tNE3vwA2Ac64bhmF9UngpGgTHQL3hWCh4PpnA54yKyLrv+yDUC/59MnPgwTnXLUGDivUtplKpaP0Awbh4tLAnJEMAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDEtMThUMTA6MDc6NTArMDA6MDDXXlnwAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTAxLTE4VDEwOjA3OjUwKzAwOjAwpgPhTAAAACh0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vdG1wL21hZ2ljay1icU1SUGdGMAb+9OcAAAAASUVORK5CYII=") no-repeat center center;
  }

  .dhx_cal_next_button:hover {
    background-color: rgba(0,0,0,0.07);
  }

  .dhx_cancel_btn_set {
    background-color: #E2007A ;
  }

  .header-fixed {
    position: fixed;
    top: 0px !important;
  }

  .header-fixed-customer {
    top: 52px !important;
    position: fixed;
  }

  .alenvi_event div {
    background-color: #E2007A !important;
    color: #fff !important;
  }

  .dhx_cal_event_line.alenvi_event {
    background-color: #E2007A !important;
    color: #fff !important;
  }

  .dhx_cal_event_clear.alenvi_event {
    background-color: #E2007A !important;
    color: #fff !important;
  }

  .alenvi_past_event div {
    background-color: #FF54B0 !important;
    color: #fff !important;
  }

  .dhx_cal_event_line.alenvi_past_event {
    background-color: #FF54B0 !important;
    color: #fff !important;
  }

  .dhx_cal_event_clear.alenvi_past_event {
    background-color: #FF54B0 !important;
    color: #fff !important;
  }

  .responsive-container {
    width: 100% !important;
  }

  .event_date {
    font-weight: bold;
  }

  .custom_event {
    padding: 5px;
    overflow: hidden;
  }

</style>
