<template>
  <div class="layout-padding row justify-center">
    <q-data-table :data="messageList" :config="config" :columns="columns" />
  </div>
</template>

<script>
import { QDataTable } from 'quasar'

import users from '../../models/Users'
import messages from '../../models/Messages'

export default {
  components: {
    QDataTable
  },
  data () {
    return {
      messageList: [],
      config: {
        title: 'Messages Envoyés',
        noHeader: false,
        bodyStyle: {
          maxHeight: '700px'
        },
        rowHeight: '100px',
        responsive: true
      },
      columns: [
        {
          label: 'Date',
          field: 'date',
          width: '150px',
          filter: true,
          sort (a, b) {
            return (new Date(a)) - (new Date(b));
          },
          format (value) {
            return new Date(value).toLocaleString([], {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        },
        {
          label: 'Message',
          field: 'content',
          filter: true,
          sort: true,
          type: 'string',
          width: '400px'
        },
        {
          label: 'Communauté',
          field: 'sector',
          filter: true,
          sort: true,
          type: 'number',
          width: '100px'
        },
        {
          label: 'Envoyés',
          field: 'sent',
          filter: false,
          sort: false,
          width: '50px'
        },
        {
          label: 'Echec',
          field: 'failed',
          filter: false,
          sort: false,
          width: '50px'
        },
        {
          label: 'Total',
          field: 'total',
          filter: false,
          sort: false,
          width: '50px'
        }
      ]
    }
  },
  mounted () {
    this.getMessages();
  },
  methods: {
    async getMessages () {
      try {
        const messagesList = await messages.getMessagesBySenderId(this, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTQ3ZDFhZWZmNmMyN2NlMDc0MDU2NWEiLCJpYXQiOjE1MDk4OTkzNTgsImV4cCI6MTUwOTk4NTc1OH0.jyjO7yLJ9fptUItS-83peXvcKxLh3qSsoalfAJRgPAc', '59ca1e938cc5c5001251ea1e');
        // console.log(messagesList);
        this.messageList = messagesList;
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus">
</style>
