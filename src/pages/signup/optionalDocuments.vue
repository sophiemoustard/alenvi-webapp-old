<template>
  <div padding v-if="user">
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
            <p class="caption">Attestation sécurité sociale (disponible sur téléchargement sur www.ameli.fr) :</p>
            <q-field icon="mdi-account-card-details">
              <q-uploader name="healthAttestInvoice" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `telephone_${user.firstname}_${user.lastname}` }]"
                @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
              <p class="upload-done" v-if="user && user.administrative.healthAttest.link">Fichier mis en ligne <q-icon name="check" /></p>
              <p class="upload-not-done" v-if="user && !user.administrative.healthAttest.link">Fichier manquant <q-icon name="warning" /></p>
            </q-field>
          <div v-if="user.administrative.phoneInvoice && user.administrative.phoneInvoice.has">
            <p class="caption">Facture de téléphone :</p>
            <q-field icon="mdi-account-card-details">
              <q-uploader name="phoneInvoice" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `telephone_${user.firstname}_${user.lastname}` }]"
                @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
              <p class="upload-done" v-if="user && user.administrative.phoneInvoice.link">Fichier mis en ligne <q-icon name="check" /></p>
              <p class="upload-not-done" v-if="user && !user.administrative.phoneInvoice.link">Fichier manquant <q-icon name="warning" /></p>
            </q-field>
          </div>
          <div v-if="user.administrative.mutualFund && user.administrative.mutualFund.has">
            <p class="caption">Mutuelle (facultatif)</p>
            <q-field icon="mdi-account-card-details">
              <q-uploader name="mutualFund" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `mutuelle_${user.firstname}_${user.lastname}` }]"
                @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" />
              <p class="upload-done" v-if="user && user.administrative.mutualFund.link">Fichier mis en ligne <q-icon name="check" /></p>
              <p class="upload-not-done" v-if="user && !user.administrative.mutualFund.link">Fichier manquant <q-icon name="warning" /></p>
            </q-field>
          </div>
          <div v-if="user.administrative.navigoInvoice && user.administrative.navigoInvoice.has">
            <p class="caption">Facture Navigo</p>
            <q-field icon="mdi-account-card-details">
              <q-uploader name="navigoInvoice" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `navigo_${user.firstname}_${user.lastname}` }]"
                @finish="afterUpload()" auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
              <p class="upload-done" v-if="user && user.administrative.navigoInvoice.link">Fichier mis en ligne <q-icon name="check" /></p>
              <p class="upload-not-done" v-if="user && !user.administrative.navigoInvoice.link">Fichier manquant <q-icon name="warning" /></p>
            </q-field>
          </div>
          <div v-if="user.administrative.certificates && user.administrative.certificates.has">
            <p class="caption">Diplômes et / ou certicats</p>
            <q-field icon="mdi-account-card-details">
              <q-uploader name="certificates" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `certif-diplome_${user.firstname}_${user.lastname}` }]"
                @finish="afterUpload()" multiple auto-expand extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"/>
              <p class="upload-done" v-if="user && user.administrative.certificates[0]">Fichier(s) mis en ligne <q-icon name="check" /></p>
              <p class="upload-not-done" v-if="user && !user.administrative.certificates[0]">Fichier manquant <q-icon name="warning" /></p>
            </q-field>
          </div>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
import { Cookies } from 'quasar'
export default {
  data () {
    return {
      // user: null,
      // ogustUser: null,
      inProgress: false,
      // accessToken: '',
      // user: {
      //   administrative: {
      //     navigoInvoice: {
      //       driveId: '',
      //       link: ''
      //     },
      //     mutualFund: {
      //       driveId: '',
      //       link: ''
      //     },
      //     phoneInvoice: {
      //       driveId: '',
      //       link: ''
      //     }
      //   }
      // }
    }
  },
  // async mounted () {
  //   try {
  //     this.accessToken = this.$route.query.token;
  //     this.inProgress = true;
  //     await this.setAlenviUser();
  //     this.inProgress = false;
  //   } catch (e) {
  //     console.error(e);
  //     this.inProgress = false;
  //   }
  // },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/uploader/${this.user._id}/drive/uploadFile`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token')
      }
    }
  },
  methods: {
    async afterUpload () {
      try {
        await this.$store.dispatch('main/getUser', this.user._id);
      } catch (e) {
        console.error(e);
      }
    },
    // async setAlenviUser () {
    //   this.user = await this.$users.getById(this.$route.query.id, this.accessToken);
    // }
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
