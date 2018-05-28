<template>
  <q-page padding class="test">
    <!-- <div class="row justify-center">
      <div id="picture">
        <img :src="user.alenvi.picture ? user.alenvi.picture : 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_107,q_auto,w_180/v1513764284/images/users/default_avatar.png'" alt="" style="width: 180px;">
      </div>
    </div>
    <br> -->
    <!-- <br> -->
    <div class="row justify-center">
      <div class="" style="width: 500px; max-width: 90vw;">
        <p v-if="user.alenvi.employee_id">Id Alenvi: {{ user.alenvi._id }}</p>
        <p v-if="user.alenvi.employee_id">Id Ogust: {{ user.alenvi.employee_id }}</p>
        <div v-if="user.alenvi.picture" class="row test">
          <croppa v-model="croppa"
            accept="image/*"
            :prevent-white-space="true"
            placeholder="Choisis ta photo"
            :placeholder-font-size="10"
            :initial-image="hasPicture"
            >
          </croppa>
        </div>
        <div v-if="user.alenvi.picture">
          <q-btn icon="rotate left" @click="croppa.rotate(-1)" flat />
          <q-btn icon="rotate right" @click="croppa.rotate(1)" flat />
          <q-btn icon="cloud upload" @click="upload()" flat />
        </div>
        <br>
        <q-field icon="person">
          <q-input v-model="user.alenvi.firstname" float-label="Prénom"/>
        </q-field>
        <q-field icon="person">
          <q-input v-model="user.alenvi.lastname" float-label="Nom"/>
        </q-field>
        <select-role v-model="user.alenvi.role.name" icon="group"/>
        <!-- Date de naissance: <input v-model="user.ogust.date_of_birth" type="date" float-label="Date de naissance"/> -->
        <q-field icon="email">
          <q-input v-model="user.alenvi.local.email" float-label="Email" />
        </q-field>
        <q-field icon="fab fa-youtube">
          <q-chips-input float-label="Page vidéo" color="primary" v-model="user.alenvi.youtube.location"/>
        </q-field>
        <q-field icon="fab fa-youtube">
          <q-input v-model="user.alenvi.youtube.link" float-label="Lien vidéo"/>
        </q-field>
        <!-- <q-input v-model="user.ogust.mobile_phone" float-label="Mobile"/> -->
        <select-sector v-if="user.alenvi.sector !== '*'" v-model="user.alenvi.sector" icon="group"/>
        <br>
        <p>Changement de mot de passe</p>
        <q-field icon="ion-android-lock" helper="Entrez votre nouveau mot de passe. Il doit contenir au moins 6 caractères jusqu'à 20 maximum" :error="$v.user.credentials.password.$error"
          error-label="Le mot de passe doit contenir entre 6 et 20 caractères.">
          <q-input type="password" float-label="Nouveau mot de passe" v-model.trim="user.credentials.password" @blur="$v.user.credentials.password.$touch" />
        </q-field>
        <q-field icon="ion-android-lock" :error="$v.user.credentials.passwordConfirm.$error" error-label="Le mot de passe entré et la confirmation sont différents.">
          <q-input type="password" float-label="Confirmation nouveau mot de passe" v-model.trim="user.credentials.passwordConfirm" @blur="$v.user.credentials.passwordConfirm.$touch" />
        </q-field>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn big flat @click="updateUser()" color="primary">Modifier</q-btn>
    </div>
  </q-page>
</template>

<script>
import { required, email, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'
import SelectRole from '../../../components/SelectRole'
import SelectSector from '../../../components/SelectSector'
import { Cookies } from 'quasar'
import 'vue-croppa/dist/vue-croppa.css'

export default {
  components: {
    SelectRole,
    SelectSector
  },
  data () {
    return {
      croppa: {},
      user: {
        credentials: {
          password: '',
          passwordConfirm: ''
        },
        alenvi: {
          role: {},
          local: {}
        },
        ogust: {}
      }
    }
  },
  validations: {
    user: {
      credentials: {
        password: {
          minLength: minLength(6),
          maxLength: maxLength(20)
        },
        passwordConfirm: {
          sameAsPassword: sameAs('password')
        }
      },
      alenvi: {
        local: {
          email: { required, email }
        }
      }
    }
  },
  async mounted () {
    try {
      this.user.alenvi = await this.$users.getById(this.$route.params.id);
      this.user.ogust = await this.$ogust.getEmployeeById(this.user.alenvi.employee_id);
      // console.log('ALENVI=', this.user.alenvi);
      // console.log('OGUST=', this.user.ogust);
      this.user.ogust.date_of_birth = this.$moment(this.user.ogust.date_of_birth, 'YYYYMMDD').format('YYYY-MM-DD');
    } catch (e) {
      console.error(e);
    }
  },
  computed: {
    emailError () {
      if (!this.$v.user.alenvi.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.local.email.email) {
        return 'Email invalide'
      }
    },
    hasPicture () {
      return this.user.alenvi.picture ? this.user.alenvi.picture.link : '';
    },
  },
  methods: {
    async updateUser () {
      try {
        const userToSendOgust = {
          id_employee: this.user.alenvi.employee_id,
          first_name: this.user.alenvi.firstname,
          last_name: this.user.alenvi.lastname,
          email: this.user.alenvi.local.email,
          mobile_phone: this.user.ogust.mobile_phone,
          sector: this.user.alenvi.sector
          // title: this.user.ogust.title,
          // main_adress: this.user.ogust.main_address
        };
        const userToSendAlenvi = {
          _id: this.$route.params.id,
          firstname: this.user.alenvi.firstname,
          lastname: this.user.alenvi.lastname,
          local: {
            email: this.user.alenvi.local.email,
            password: this.user.credentials.password
          },
          sector: this.user.alenvi.sector,
          role: this.user.alenvi.role.name,
        };
        await this.$users.updateById(userToSendAlenvi);
        await this.$ogust.setEmployee(userToSendOgust);
        this.$q.notify({
          color: 'positive',
          icon: 'thumb up',
          detail: 'Profil mis à jour',
          position: 'bottom-right',
          timeout: 2500
        });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la mise à jour du profil',
          position: 'bottom-right',
          timeout: 2500
        });
        this.user.credentials.password = '';
        this.user.credentials.passwordConfirm = '';
        console.error(e);
      }
    },
    async upload () {
      try {
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('role', this.user.alenvi.role.name);
        data.append('fileName', `photo_${this.user.alenvi.firstname}_${this.user.alenvi.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        this.$axios.post(`${process.env.API_HOSTNAME}/uploader/${this.$route.params.id}/cloudinary/uploadImage`, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~variables';
.q-field
  margin: 16px 0
</style>
