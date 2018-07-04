<template>
  <q-page>
    <q-table
      title="Récapitulatif des modifications planning"
      :data="messageList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[30, 40, 50]"
      :pagination.sync="pagination"
      :filter="filter"
      dense
      rows-per-page-label="Lignes"
      :pagination-label="paginationLabel"
      no-data-label="Données non disponibles"
      no-results-label="Pas de résultats">
      <template slot="top" slot-scope="props">
        <q-search
          hide-underline
          color="primary"
          v-model="filter"
          clearable
          placeholder="Recherche"
          class="col-6" />
      </template>
      <q-tr slot="body" slot-scope="props" :props="props" @click.native="displayDetails(props.row)" class="cursor-pointer">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
      </q-tr>
    </q-table>
    <q-modal v-model="opened" minimized :content-css="{ padding: '30px' }">
      <h5>Détails envoi</h5>
      <p v-for="(recipient, index) in recipients" :key="index">
        {{ recipient.name }} <q-icon v-if="recipient.success" name="done" color="positive" /><q-icon v-if="!recipient.success" name="clear" color="negative" />
      </p>
      <div class="row justify-end">
        <q-btn color="primary" @click="opened = false" flat>Fermer</q-btn>
      </div>
    </q-modal>
  </q-page>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      messageList: [],
      recipients: [],
      filter: '',
      opened: false,
      pagination: {
        sortBy: 'date', // String, column "name" property value
        descending: true,
        page: 1,
        rowsPerPage: 30 // current rows per page being displayed
      },
      columns: [
        {
          name: 'date',
          label: 'Date',
          field: 'date',
          align: 'left',
          sortable: true,
          sort: (a, b) => (new Date(a)) - (new Date(b)),
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
          name: 'content',
          label: 'Message',
          field: 'content',
          align: 'left',
          sortable: true,
          type: 'string',
        },
        {
          name: 'sector',
          label: 'Communauté',
          field: 'sector',
          align: 'left',
          sortable: true,
          type: 'number',
        },
        {
          name: 'sent',
          label: 'Envoyés',
          field: 'sent',
          align: 'left',
          sortable: false,
        },
        {
          name: 'failed',
          label: 'Echec',
          field: 'failed',
          align: 'left',
          sortable: false,
        },
        {
          name: 'total',
          label: 'Total',
          field: 'total',
          align: 'left',
          sortable: false,
        }
      ]
    }
  },
  async mounted () {
    await this.getMessages();
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    }
  },
  methods: {
    async getMessages () {
      try {
        const sectors = await this.$ogust.getList('employee.sector');
        const messagesList = await this.$messages.list({});
        const orderedMessageList = [];
        for (let i = 0, l = messagesList.length; i < l; i++) {
          const sent = _.countBy(messagesList[i].recipients, 'success');
          orderedMessageList.push({
            date: messagesList[i].createdAt,
            content: messagesList[i].content,
            sector: sectors[messagesList[i].sectors[0]] || '-',
            sent: sent.true || '-',
            failed: sent.false || '-',
            total: messagesList[i].recipients.length,
            recipients: messagesList[i].recipients
          });
        }
        // this.messageList = _.sortBy(orderedMessageList, ['date']).reverse();
        this.messageList = orderedMessageList;
      } catch (e) {
        console.error(e);
      }
    },
    async displayDetails (row) {
      try {
        this.recipients = [];
        row.recipients.forEach(async (item) => {
          const recipient = await this.$users.getById(item.id)
          this.recipients.push({
            name: `${recipient.firstname}`,
            success: item.success
          });
        })
        this.opened = true;
      } catch (e) {
        console.error(e);
      }
    },
    paginationLabel (start, end, total) {
      return `${start} - ${end} de ${total}`;
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

</style>
