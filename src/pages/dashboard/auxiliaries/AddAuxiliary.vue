<template>
  <q-page padding>
    <div class="row justify-center q-mb-xl">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte Alenvi et Ogust</p>
        <select-sector v-model="selectedSector"></select-sector>
        <select-manager v-model="selectedManager"></select-manager>
        <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
          <q-input :disable="!selectedSector || !selectedManager" :loading="isLoading" v-model="phoneNbr" float-label="Numéro de téléphone" @keyup.enter="handlePhone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
        </q-field>
        <!-- <p class="caption">Envoi de code pour compte existant</p>
        <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
          <q-input v-model="phoneNbr" float-label="Numéro de téléphone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
        </q-field> -->
        <!-- <br>
        <q-search v-model="searchUserFromMobilePhone" :debounce="600" placeholder="Numéro auxiliaire" type="tel" stack-label="Numéro de téléphone" /> -->
      </div>
    </div>
    <p class="caption">Liste SMS envoyés</p>
    <q-table
      :data="filteredList"
      :columns="columns"
      row-key="name"
      :rows-per-page-options="[20, 30, 40]"
      :pagination.sync="pagination"
      dense
      :filter="filter"
      rows-per-page-label="Lignes"
      :pagination-label="paginationLabel"
      no-data-label="Données non disponibles"
      no-results-label="Pas de résultats"
      :loading="tableLoading"
      @request="getMessageList">
      <template slot="top" slot-scope="props">
        <q-search
          hide-underline
          color="primary"
          v-model="filter"
          clearable
          placeholder="Recherche"
          class="col-12" />
      </template>
    </q-table>
  </q-page>
</template>

<script>
import SelectSector from '../../../components/SelectSector';
import SelectManager from '../../../components/SelectManager';

export default {
  components: {
    SelectSector,
    SelectManager
  },
  data () {
    return {
      phoneNbr: '',
      // searchUserFromMobilePhone: ''
      employee: '',
      selectedSector: '',
      selectedManager: '',
      isLoading: false,
      tableLoading: false,
      pagination: {
        page: 1,
        rowsPerPage: 20,
      },
      filter: '',
      messageList: [],
      columns: [
        {
          name: 'dateSent',
          required: true,
          label: 'Date SMS accueil',
          field: 'dateSent',
          align: 'left',
          sortable: true,
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
          name: 'to',
          required: true,
          label: 'Destinataire',
          field: 'to',
          align: 'left'
        }
      ]
    }
  },
  computed: {
    filteredList () {
      return this.messageList.filter(message => message.body.match(/Bienvenue/));
    }
  },
  async mounted () {
    await this.getMessageList();
  },
  methods: {
    async handlePhone () {
      try {
        // const payload = {
        //   mobile_phone: this.phoneNbr
        // };
        // const res = await ogust.getEmployees(payload);
        // this.employee = res[0];
        await this.$q.dialog({
          title: 'Confirmation accueil',
          message: `Es-tu sûr de vouloir envoyer un message au ${this.phoneNbr} ?`,
          ok: 'Envoyer',
          cancel: 'Annuler'
        })
        this.isLoading = true;
        const activationDataRaw = await this.$activationCode.create({
          mobile_phone: this.phoneNbr,
          sector: this.selectedSector,
          managerId: this.selectedManager,
        });
        const code = activationDataRaw.activationData.code;
        const message = await this.$twilio.sendSMS(this.phoneNbr, {
          activationCode: code
        });
        console.log('SMS envoyé =', message);
        console.log('Auxiliaire accueilli !');
        this.isLoading = false;
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'SMS bien envoyé',
          position: 'bottom-right',
          timeout: 2500
        });
      } catch (e) {
        this.isLoading = false;
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de l\'envoi du SMS',
          position: 'bottom-right',
          timeout: 2500
        });
        console.error(e);
      }
    },
    paginationLabel (start, end, total) {
      return `${start} - ${end} de ${total}`;
    },
    async getMessageList () {
      try {
        this.tableLoading = true;
        const messagesListRaw = await this.$twilio.getRecords();
        this.messageList = messagesListRaw.data.data.messageList;
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
      }
    }
    // async getMessageList ({ pagination }) {
    //   try {
    //     this.tableLoading = true;
    //     const params = {};
    //     params.pageSize = pagination.rowsNumber;
    //     if (pagination.pageToken) {
    //       params.pageToken = pagination.pageToken;
    //     }
    //     if (pagination.page > 1) {
    //       params.pageNumber = pagination.page - 1;
    //     }
    //     const messagesListRaw = await this.$twilio.getRecords(params);
    //     console.log(messagesListRaw);
    //     this.pagination = pagination;
    //     this.pagination.rowsNumber = Number(messagesListRaw.data.data.nextPage.PageSize);
    //     console.log(this.pagination.rowsNumber);
    //     this.pagination.page = Number(messagesListRaw.data.data.nextPage.Page) + 1;
    //     console.log(this.pagination.page);
    //     this.pagination.pageToken = messagesListRaw.data.data.nextPage.PageToken;
    //     console.log(this.pagination.pageToken);
    //     this.messageList = messagesListRaw.data.data.messageList;
    //     console.log('MESSAGES', this.messageList);
    //     this.tableLoading = false;
    //   } catch (e) {
    //     console.error(e);
    //     this.tableLoading = false;
    //   }
    // }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0
</style>
