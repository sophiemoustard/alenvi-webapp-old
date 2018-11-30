<template>
  <q-page padding>
    <div class="row justify-center q-mb-xl">
      <div style="width: 700px; max-width: 90vw;">
        <p class="caption">Création de compte Alenvi et Ogust</p>
        <ni-select-sector v-model="selectedSector" />
        <ni-select-manager v-model="selectedManager" />
        <q-field icon="phone" helper="Numéro sans délimiteur (espaces, points...)">
          <q-input :disable="!selectedSector || !selectedManager" :loading="isLoading" v-model="phoneNbr" float-label="Numéro de téléphone" @keyup.enter="handlePhone" :after="[{ icon: 'send', content: true, handler: handlePhone }]"/>
        </q-field>
        <br>
        <blockquote>
          <p>Bienvenue chez Alenvi ! :)<br>
          Utilise ce code: _CODE_ pour pouvoir commencer ton enregistrement ici avant ton intégration: https://app.alenvi.io/signup :-)</p>
          <small><cite title="">SMS d'accueil</cite></small>
        </blockquote>
        <br>
        <blockquote>
          <p>
            Attention, avant la signature de ton contrat, tu dois télécharger l'application Facebook Messenger afin de pouvoir utiliser les outils Alenvi.<br>
            Voici les deux étapes à suivre:<br>
            1. Si ton téléphone est un Iphone, clique sur ce lien https://appstore.com/messenger, sinon clique sur ce lien: https://play.google.com/store/apps/details?id=com.facebook.orca<br>
            2. Une fois l'application installée, connecte-toi en cliquant sur le lien suivant: https://m.me/alenvipigi<br>
            Si tu rencontres des difficultés, contacte dès aujourd'hui la personne qui t'a recruté chez Alenvi
          </p>
          <small><cite title="">2ème SMS si pas Messenger</cite></small>
        </blockquote>
      </div>
    </div>
    <p class="caption">Liste SMS envoyés</p>
    <q-table
      :data="messageList"
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
    </q-table> <!-- :data="filteredList" -->
  </q-page>
</template>

<script>
import SelectSector from '../../../components/form/SelectSector';
import SelectManager from '../../../components/form/SelectManager';

export default {
  components: {
    'ni-select-sector': SelectSector,
    'ni-select-manager': SelectManager,
  },
  data () {
    return {
      phoneNbr: '',
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
          label: 'Date',
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
          name: 'body',
          required: true,
          label: 'Contenu',
          field: 'body',
          align: 'left',
          sortable: true
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
  },
  async mounted () {
    await this.getMessageList();
  },
  methods: {
    async handlePhone () {
      try {
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
        const message = await this.$twilio.sendSMS({
          to: `+33${this.phoneNbr.substring(1)}`,
          body: `Bienvenue chez Alenvi ! :) Utilise ce code: ${code} pour pouvoir commencer ton enregistrement ici avant ton intégration: https://app.alenvi.io/signup :-)`,
        });
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
        const messagesListRaw = await this.$twilio.getSMS();
        this.messageList = messagesListRaw.data.data.messages;
        this.tableLoading = false;
      } catch (e) {
        console.error(e);
        this.tableLoading = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0
</style>
