<template>
  <div padding>
    <div class="row justify-center">
      <q-card class="layout-padding" style="width: 600px; max-width: 90vw;">
        <q-card-media class="justify-start">
          <img src="https://res.cloudinary.com/alenvi/image/upload/c_scale,q_auto,w_400/v1507124345/images/business/alenvi_logo_complet_full.png" alt="Logo Alenvi" class="alenvi-logo">
        </q-card-media>
        <q-card-title>
          <div class="text-center">Envoi des derniers documents</div><br />
          <span slot="subtitle">Cette partie concerne les derniers documents à envoyer en ligne. N’hésite pas à appeler ton coach en cas de question !</span>
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <p>Pour envoyer un document:</p>
          <ul>
            <li>Appuie d'abord sur cette icône: <q-icon name="add" size="1.5rem" /></li>
            <li>Choisis le fichier que tu souhaites envoyer</li>
            <li>Appuie ensuite sur cette icône: <q-icon name="cloud upload" size="1.5rem" /> pour finaliser l'envoi du fichier</li>
          </ul>
          <q-field icon="mdi-account-card-details">
            <q-uploader name="phoneInvoice" :url="docsUploadUrl" :headers="headers"
            :additional-fields="[{ name: 'fileName', value: `telephone_${user.firstname}_${user.lastname}` }]"
            float-label="Facture de téléphone" @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
            <p class="upload-done" v-if="alenviUser && alenviUser.administrative.phoneInvoice">Fichier mis en ligne <q-icon name="check" /></p>
            <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.phoneInvoice">Fichier manquant <q-icon name="warning" /></p>
          </q-field>
          <q-field icon="mdi-account-card-details">
            <q-uploader name="mutualFund" :url="docsUploadUrl" :headers="headers"
            :additional-fields="[{ name: 'fileName', value: `mutuelle_${user.firstname}_${user.lastname}` }]"
            float-label="Mutuelle (falcultatif)" @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" />
            <p class="upload-done" v-if="alenviUser && alenviUser.administrative.mutualFund">Fichier mis en ligne <q-icon name="check" /></p>
            <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.mutualFund">Fichier manquant <q-icon name="warning" /></p>
          </q-field>
          <q-field icon="mdi-account-card-details">
            <q-uploader name="navigoInvoice" :url="docsUploadUrl" :headers="headers"
            :additional-fields="[{ name: 'fileName', value: `navigo_${user.firstname}_${user.lastname}` }]"
            float-label="Facture Navigo" @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
            <p class="upload-done" v-if="alenviUser && alenviUser.administrative.navigoInvoice">Fichier mis en ligne <q-icon name="check" /></p>
            <p class="upload-not-done" v-if="alenviUser && !alenviUser.administrative.navigoInvoice">Fichier manquant <q-icon name="warning" /></p>
          </q-field>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      alenviUser: null,
      ogustUser: null,
      inProgress: false,
      accessToken: '',
      user: {
        administrative: {
          navigoInvoice: {
            driveId: '',
            link: ''
          },
          mutualFund: {
            driveId: '',
            link: ''
          },
          phoneInvoice: {
            driveId: '',
            link: ''
          }
        }
      }
    }
  },
  async mounted () {
    try {
      this.accessToken = this.$route.query.token;
      this.inProgress = true;
      await this.setAlenviUser();
      this.inProgress = false;
    } catch (e) {
      console.error(e);
      this.inProgress = false;
    }
  },
  computed: {
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/uploader/${this.$route.query.id}/drive/uploadFile`;
    },
    headers () {
      return {
        'x-access-token': this.$route.query.token
      }
    }
  },
  methods: {
    async afterUpload () {
      try {
        this.alenviUser = await this.$users.getById(this.$route.query.id, this.accessToken);
      } catch (e) {
        console.error(e);
      }
    },
    async setAlenviUser () {
      this.alenviUser = await this.$users.getById(this.$route.query.id, this.accessToken);
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables'
.q-field
  margin: 16px 0

.upload-done
  margin-top: 10px
  margin-bottom: 5px
  color: $positive

.upload-not-done
  margin-top: 10px
  margin-bottom: 5px
  color: $negative
</style>
