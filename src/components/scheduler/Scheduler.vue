<template lang="html">
  <div ref="scheduler_here" class="dhx_cal_container" style='width:100%; height:100%;'>
    <q-window-resize-observable @resize="onResize" />
    <div class="dhx_cal_navline">
      <div @click="getData" class="dhx_cal_prev_button">&nbsp;</div>
      <div @click="getData" class="dhx_cal_next_button">&nbsp;</div>
      <div class="dhx_cal_today_button"></div>
      <div class="dhx_cal_date"></div>
      <div @click="getData" class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>
      <div @click="getData" class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>
      <div @click="getData" class="dhx_cal_tab" name="month_tab" style="right:76px;"></div>
    </div>
    <div class="dhx_cal_header"></div>
    <div class="dhx_cal_data"></div>
  </div>
</template>

<script>
import 'dhtmlx-scheduler'
import 'dhtmlx-scheduler/codebase/locale/locale_fr';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_readonly.js';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_container_autoresize.js';
import responsive from './scripts/dhtmlxscheduler-responsive.js';

import { debounce, QWindowResizeObservable } from 'quasar'

export default {
  components: {
    QWindowResizeObservable
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
        }]
      }
    }
  },
  data() {
    return {
      width: '',
      height: ''
    }
  },
  mounted() {
    // Event date format
    scheduler.config.xml_date = '%Y-%m-%d %H:%i';
    // Blocking hours
    scheduler.config.first_hour = 8;
    scheduler.config.last_hour = 24;
    // disable double click
    scheduler.config.dblclick_create = false;
    scheduler.config.drag_resize= false;
    scheduler.config.drag_move= false;
    // scheduler.config.touch_tip = false;
    // disable left buttons on lightbox
    scheduler.config.buttons_left = [];
    // enable cancel button on lightbox's right wing
    scheduler.config.buttons_right = ['dhx_cancel_btn'];
    // changing cancel button label
    scheduler.locale.labels['icon_cancel'] = 'Fermer';
    // hide lightbox in month view
    scheduler.config.readonly_form = true;
    // hide select bar in day and week views
    scheduler.config.select = false;
    scheduler.config.touch_tip = false;
    scheduler.config.lightbox.sections = [
      {
        name: "description",
        height: 20,
        map_to: "text",
        type: "textarea",
        focus: true
      }
    ];

    responsive.initResponsive(scheduler);
    // Scheduler initialization
    scheduler.init(this.$refs.scheduler_here, new Date(), 'week');
    scheduler.templates.event_class = function(start, end, event) {
      if (event.type == 'alenvi') {
        return 'alenvi_event'
      }
    }
    // Scheduler data parser
    scheduler.parse(this.$props.events, 'json');
    // Prevent draggable events
    // scheduler.attachEvent('onEventDrag', this.blockReadOnly);
  },
  methods: {
    // blockReadOnly(id) {
    //   if (!id) return true;
    //   return !scheduler.getEvent(id).readonly;
    // },
    getData() {
      this.$emit('getData');
    },
    handleScroll: debounce(function() {
      const headerToFix = document.getElementsByClassName('dhx_cal_header')[0];
      let currentScroll = window.pageYOffset;
      console.log(this.width);
      if (currentScroll >= 60 && this.width >= 768) {
        headerToFix.classList.add('header-fixed');
      } else if (currentScroll >= 131 && this.width < 768) {
        headerToFix.classList.add('header-fixed');
      } else {
        headerToFix.classList.remove('header-fixed');
      }
    }, 10),
    onResize(size) {
      this.width = size.width;
      this.height = size.height;
    }
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style lang="css" scoped>
  @import "~dhtmlx-scheduler/codebase/dhtmlxscheduler.css";
  @import "../../assets/dhtmlxscheduler-responsive.css";

  .header-fixed {
    position: fixed;
    top: 0px !important;
  }

</style>
