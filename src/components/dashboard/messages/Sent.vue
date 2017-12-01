<template>
  <div class="layout-padding row justify-center">
    <q-data-table :data="messageList" :config="config" :columns="columns">
      <template slot="col-message" slot-scope="cell">
        <div class="text-align-left">{{ cell.data }}</div>
      </template>
    </q-data-table>
  </div>
</template>

<script>
import { QDataTable, Cookies } from 'quasar'
import _ from 'lodash'

import users from '../../models/Users'
import messages from '../../models/Messages'
import ogust from '../../models/Ogust'

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
        rowHeight: 'auto',
        pagination: {
          rowsPerPage: 10,
          options: [10, 20, 30]
        },
        messages: {
          noData: 'Pas de données disponibles.'
        },
        labels: {
          allCols: 'Colonnes (toutes)',
          rows: 'Lignes',
          search: 'Rechercher'
        },
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
          type: 'date',
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
          width: '120px'
        },
        {
          label: 'Envoyés',
          field: 'sent',
          filter: false,
          sort: false,
          width: '70px'
        },
        {
          label: 'Echec',
          field: 'failed',
          filter: false,
          sort: false,
          width: '70px'
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
  async mounted () {
    await this.getMessages();
  },
  methods: {
    async getMessages() {
      try {
        if (!Cookies.get('user_id')) {
          return this.$router.replace('/dashboard/login');
        }
        const sectors = await ogust.getOgustSectors();
        const messagesList = await messages.getMessagesBySenderId(Cookies.get('user_id'));
        const orderedMessageList = [];
        for (let i = 0, l = messagesList.length; i < l; i++) {
          const sent = _.countBy(messagesList[i].recipients, 'success');
          orderedMessageList.push({
            date: messagesList[i].createdAt,
            content: messagesList[i].content,
            sector: sectors[messagesList[i].sectors[0]] || '-',
            sent: sent.true || 0,
            failed: sent.false || 0,
            total: messagesList[i].recipients.length
          });
        }
        this.messageList = _.sortBy(orderedMessageList, ['date']).reverse();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

</style>
