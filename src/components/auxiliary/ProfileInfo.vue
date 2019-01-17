<template>
  <div v-if="isLoaded">
    <div v-if="mainUser.role.name !== 'Auxiliaire'" class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <ni-select-sector v-model="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'sector', ogust: 'sector' })" />
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Marraine/parrain</p>
        <q-input v-model="user.alenvi.mentor" inverted-light color="white" @focus="saveTmp('mentor')" @blur="updateUser({ alenvi: 'mentor' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Photo</p>
        <p :class="[groupErrors('picture').errors > 0 ? 'group-error' : 'group-error-ok']">{{groupErrors('picture').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row" style="background: white">
            <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
              <croppa v-model="croppa" canvas-color="#EEE" accept="image/*" :initial-image="hasPicture"
                :prevent-white-space="true" placeholder="Clique ici pour choisir ta photo" placeholder-color="black"
                :placeholder-font-size="10" :show-remove-button="false" :disable-drag-and-drop="disablePictureEdition"
                :disable-drag-to-move="disablePictureEdition" :disable-scroll-to-zoom="disablePictureEdition"
                :disable-pinch-to-zoom="disablePictureEdition" @file-choose="choosePicture" />
            </div>
            <div class="row justify-center col-xs-12">
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="mdi-square-edit-outline"
                size="1rem" @click="disablePictureEdition = false" />
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="delete" size="1rem"
                @click="deleteImage" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="clear" @click="closePictureEdition" round flat
                size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate left" @click="croppa.rotate(-1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate right" @click="croppa.rotate(1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" :loading="loadingImage" color="primary" icon="done" @click="uploadImage"
                round flat size="1rem" />
              <a :href="pictureDlLink(hasPicture)" target="_blank">
                <q-btn v-if="hasPicture && disablePictureEdition" color="primary" round flat icon="save_alt" size="1rem" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="[groupErrors('identity').errors > 0 ? 'group-error' : 'group-error-ok']">{{
          groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" :error="$v.user.alenvi.firstname.$error" v-model="user.alenvi.firstname"
          @blur="updateUser({ alenvi: 'firstname', ogust: 'first_name' })" @focus="saveTmp('firstname')"
        />
        <ni-input caption="Nom" :error="$v.user.alenvi.lastname.$error" v-model="user.alenvi.lastname"
          @blur="updateUser({ alenvi: 'lastname', ogust: 'last_name' })" @focus="saveTmp('lastname')"
        />
        <ni-select caption="Nationalité" :error="$v.user.alenvi.administrative.identity.nationality.$error" :options="nationalitiesOptions"
          v-model="user.alenvi.administrative.identity.nationality" @focus="saveTmp('administrative.identity.nationality')"
          @blur="updateUser({ alenvi: 'administrative.identity.nationality', ogust: 'nationality' })"
        />
        <ni-datetime-picker caption="Date de naissance" :error="$v.user.alenvi.administrative.identity.birthDate.$error"
          v-model="user.alenvi.administrative.identity.birthDate" @focus="saveTmp('administrative.identity.birthDate')"
          @blur="updateUser({ alenvi: 'administrative.identity.birthDate', ogust: 'date_of_birth' })"
        />
        <ni-select caption="Pays de naissance" :error="$v.user.alenvi.administrative.identity.birthCountry.$error" :options="nationalitiesOptions"
          v-model="user.alenvi.administrative.identity.birthCountry" @focus="saveTmp('administrative.identity.birthCountry')"
          @blur="updateUser({ alenvi: 'administrative.identity.birthCountry', ogust: 'country_of_birth' })"
        />
        <ni-input caption="Département de naissance" :error="$v.user.alenvi.administrative.identity.birthState.$error" :errorLabel="birthStateError"
          v-model="user.alenvi.administrative.identity.birthState" @blur="updateUser({ alenvi: 'administrative.identity.birthState', ogust: 'state_of_birth' })"
          @focus="saveTmp('administrative.identity.birthState')" :displayInput="this.user.alenvi.administrative.identity.birthCountry === 'FR'"
        />
        <ni-input caption="Ville de naissance" :error="$v.user.alenvi.administrative.identity.birthCity.$error"
          v-model="user.alenvi.administrative.identity.birthCity" @focus="saveTmp('administrative.identity.birthCity')"
          @blur="updateUser({ alenvi: 'administrative.identity.birthCity', ogust: 'place_of_birth' })"
        />
        <ni-input caption="Numéro de sécurité sociale" :error="$v.user.alenvi.administrative.identity.socialSecurityNumber.$error"
          v-model="user.alenvi.administrative.identity.socialSecurityNumber" @focus="saveTmp('administrative.identity.socialSecurityNumber')"
          @blur="updateUser({ alenvi: 'administrative.identity.socialSecurityNumber', ogust: 'social_insurance_number' })" :errorLabel="ssnError"
        />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
        <p :class="[groupErrors('contact').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('contact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Numéro de téléphone" :error="$v.user.alenvi.mobilePhone.$error" :errorLabel="phoneNbrError" type="tel"
          v-model.trim="user.alenvi.mobilePhone" @blur="updateUser({ alenvi: 'mobilePhone', ogust: 'mobile_phone' })" @focus="saveTmp('mobilePhone')"
        />
        <ni-input caption="Adresse email" :error="$v.user.alenvi.local.email.$error" :errorLabel="emailError" type="email" lowerCase disable
          v-model.trim="user.alenvi.local.email" @blur="updateUser({ alenvi: 'local.email', ogust: 'email' })" @focus="saveTmp('local.email')"
          :displayInput="mainUser.role.name !== 'Auxiliaire'"
        />
        <ni-input caption="Adresse, numéro et rue" v-model="user.alenvi.administrative.contact.address"
          @blur="updateUser({ alenvi: 'administrative.contact.address', ogust: 'line' })" @focus="saveTmp('administrative.contact.address')"
          :error="$v.user.alenvi.administrative.contact.address.$error"
        />
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Complément d'adresse</p>
          <q-input v-model="user.alenvi.administrative.contact.additionalAddress" @focus="saveTmp('administrative.contact.addionalAddress')"
            @blur="updateUser({ alenvi: 'administrative.contact.additionalAddress', ogust: 'supplement' })" color="white" inverted-light
          />
        </div>
        <ni-input caption="Code postal" :error="$v.user.alenvi.administrative.contact.zipCode.$error" :errorLabel="zipCodeError"
          v-model="user.alenvi.administrative.contact.zipCode" @focus="saveTmp('administrative.contact.zipCode')"
          @blur="updateUser({ alenvi: 'administrative.contact.zipCode', ogust: 'zip' })"
        />
        <ni-input caption="Ville" :error="$v.user.alenvi.administrative.contact.city.$error" v-model="user.alenvi.administrative.contact.city"
          @blur="updateUser({ alenvi: 'administrative.contact.city', ogust: 'city' })" @focus="saveTmp('administrative.contact.city')"
        />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact d'urgence</p>
        <p :class="[groupErrors('emergencyContact').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('emergencyContact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom et nom" :error="$v.user.alenvi.administrative.emergencyContact.name.$error"
          v-model="user.alenvi.administrative.emergencyContact.name" @focus="saveTmp('administrative.emergencyContact.name')"
          @blur="updateUser({ alenvi: 'administrative.emergencyContact.name' })"
        />
        <ni-input caption="Numéro de téléphone" :error="$v.user.alenvi.administrative.emergencyContact.phoneNumber.$error"
          v-model.trim="user.alenvi.administrative.emergencyContact.phoneNumber" @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
          @blur="updateUser({ alenvi: 'administrative.emergencyContact.phoneNumber' })" :errorLabel="emergencyPhoneNbrError"
        />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">IBAN</p>
        <p :class="[groupErrors('iban').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('iban').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="IBAN" :error="$v.user.alenvi.administrative.payment.rib.iban.$error" :errorLabel="ibanError"
        v-model="user.alenvi.administrative.payment.rib.iban" @focus="saveTmp('administrative.payment.rib.iban')" upperCase
          @blur="updateUser({ alenvi: 'administrative.payment.rib.iban', ogust: 'iban_number' })"
        />
        <ni-input caption="BIC" :error="$v.user.alenvi.administrative.payment.rib.bic.$error" :errorLabel="bicError" upperCase
          v-model.trim="user.alenvi.administrative.payment.rib.bic" @focus="saveTmp('administrative.payment.rib.bic')"
          @blur="updateUser({ alenvi: 'administrative.payment.rib.bic', ogust: 'bic_number' })"
        />
      </div>
    </div>
    <div v-if="user.alenvi.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
        <p :class="[groupErrors('documents').errors > 0 ? 'group-error' : 'group-error-ok']">{{groupErrors('documents').msg }}</p>
      </div>
      <div class="row gutter-profile items-stretch">
        <div class="col-xs-12">
          <div class="row justify-between">
            <p v-if="mainUser.role.name === 'Auxiliaire'" class="input-caption">Merci de nous indiquer le type de document d'identité que tu possèdes.</p>
          </div>
          <q-field :error="$v.user.alenvi.administrative.identityDocs.$error" :error-label="requiredField">
            <q-option-group color="primary" v-model="user.alenvi.administrative.identityDocs" @input="updateUser({ alenvi: 'administrative.identityDocs' })"
              :options="[
             { label: 'Carte Nationale d\'Identité', value: 'cni' },
             { label: 'Passeport', value: 'pp' },
             { label: 'Titre de séjour', value: 'ts' }
           ]" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (recto)" path="administrative.idCardRecto" alt="cni recto" :entity="currentUser"
            @delete="deleteDocument(user.alenvi.administrative.idCardRecto.driveId, 'administrative.idCardRecto')" name="idCardRecto"
            @uploaded="refreshUser" :upload="uploadDocument" :url="docsUploadUrl" :error="$v.user.alenvi.administrative.idCardRecto.driveId.$error"
            :additionalValue="`cni_recto_${currentUser.firstname}_${currentUser.lastname}`" :extensions="extensions"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (verso)" path="administrative.idCardVerso" alt="cni verso" :entity="currentUser" :url="docsUploadUrl"
            @delete="deleteDocument(user.alenvi.administrative.idCardVerso.driveId, 'administrative.idCardVerso')" name="idCardVerso"
            @uploaded="refreshUser" :upload="uploadDocument" :additionalValue="`cni_verso_${currentUser.firstname}_${currentUser.lastname}`"
            :extensions="extensions"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Passeport" path="administrative.passport" alt="passeport" :entity="currentUser" :upload="uploadDocument"
            @delete="deleteDocument(user.alenvi.administrative.passport.driveId, 'administrative.passport')" name="passport" :url="docsUploadUrl"
            @uploaded="refreshUser" :error="$v.user.alenvi.administrative.passport.driveId.$error" :extensions="extensions"
            :additionalValue="`passport_${currentUser.firstname}_${currentUser.lastname}`"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (recto)" path="administrative.residencePermitRecto" alt="titre de séjour (recto)" :entity="currentUser"
            @delete="deleteDocument(user.alenvi.administrative.residencePermitRecto.driveId, 'administrative.residencePermitRecto')"
            @uploaded="refreshUser" :upload="uploadDocument" :url="docsUploadUrl" :error="$v.user.alenvi.administrative.residencePermitRecto.driveId.$error"
            name="residencePermitRecto" :additionalValue="`titre_de_séjour_recto_${currentUser.firstname}_${currentUser.lastname}`"
            :extensions="extensions"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (verso)" path="administrative.residencePermitVerso" alt="titre de séjour (verso)" name="residencePermitVerso"
            @delete="deleteDocument(user.alenvi.administrative.residencePermitVerso.driveId, 'administrative.residencePermitVerso')" :entity="currentUser"
            @uploaded="refreshUser" :upload="uploadDocument" :url="docsUploadUrl" :extensions="extensions"
            :additionalValue="`titre_de_séjour_verso_${currentUser.firstname}_${currentUser.lastname}`"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Attestation de sécurité sociale" path="administrative.healthAttest" alt="attestation secu" :entity="currentUser"
            @delete="deleteDocument(user.alenvi.administrative.healthAttest.driveId, 'administrative.healthAttest')" name="healthAttest"
            @uploaded="refreshUser" :upload="uploadDocument" :error="$v.user.alenvi.administrative.healthAttest.driveId.$error"
            :additionalValue="`attestation_secu_${currentUser.firstname}_${currentUser.lastname}`" :url="docsUploadUrl" :extensions="extensions"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Facture téléphonique" path="administrative.phoneInvoice" alt="facture téléphone" :entity="currentUser"
            @delete="deleteDocument(user.alenvi.administrative.phoneInvoice.driveId, 'administrative.phoneInvoice')" name="phoneInvoice"
            @uploaded="refreshUser" :upload="uploadDocument" :error="$v.user.alenvi.administrative.phoneInvoice.driveId.$error"
            :additionalValue="`facture_telephone_${currentUser.firstname}_${currentUser.lastname}`" :url="docsUploadUrl" :extensions="extensions"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-multiple-files-uploader caption="Diplome(s) ou certificat(s)" path="administrative.certificates" alt="facture téléphone"
            @delete="deleteDocument($event, 'certificates')" name="certificates" collapsibleLabel="Ajouter diplômes" :userProfile="currentUser"
            :url="docsUploadUrl" additionalFieldsName="diplomes" @uploaded="refreshUser" @upload="uploadDocument($event, 'certificates')"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Mutuelle</p>
        <p :class="[groupErrors('mutualFund').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('mutualFund').msg }}</p>
      </div>
      <div class="row gutter-profile-x">
        <div class="col-xs-12">
          <div v-if="mainUser.role.name === 'Auxiliaire'" class="row justify-between">
            <p class="input-caption">Veux-tu adhérer à la mutuelle d'entreprise ?</p>
            <q-icon v-if="$v.user.alenvi.administrative.mutualFund.has.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.mutualFund.has.$error" :error-label="requiredField">
            <q-btn-toggle class="full-width" color="white" text-color="black" toggle-color="primary" v-model="user.alenvi.administrative.mutualFund.has"
              @input="updateUser({ alenvi: 'administrative.mutualFund.has' })" :options="[
                  { label: 'Oui', value: false },
                  { label: 'Non', value: true }
                ]" />
          </q-field>
        </div>
        <div class="col-xs-12">
          <ni-file-uploader caption="Merci de nous transmettre une attestation prouvant que tu es déjà affilié(e) à une autre mutuelle"
            path="administrative.mutualFund" alt="justif mutuelle" :entity="currentUser" :upload="uploadDocument"
            @delete="deleteDocument(user.alenvi.administrative.mutualFund.driveId, 'administrative.mutualFund')" name="mutualFund" @uploaded="refreshUser"
            :displayUpload="user.alenvi.administrative.mutualFund.has && !user.alenvi.administrative.mutualFund.driveId" entityUrl="users"
            :error="$v.user.alenvi.administrative.mutualFund.driveId.$error" :displayCaption="mainUser.role.name === 'Auxiliaire'"
            :url="docsUploadUrl" :additionalValue="`mutuelle_${currentUser.firstname}_${currentUser.lastname}`" :extensions="extensions"
          />
      </div>
        </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between">
        <p class="text-weight-bold">Transports</p>
        <p :class="[groupErrors('transportInvoice').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('transportInvoice').msg }}</p>
      </div>
      <div class="row gutter-profile-x">
        <div class="col-xs-12">
          <div v-if="mainUser.role.name === 'Auxiliaire'" class="row justify-between">
            <p class="input-caption">Par quel moyen comptes-tu te rendre au travail ?</p>
            <q-icon v-if="$v.user.alenvi.administrative.transportInvoice.transportType.$error" name="error_outline"
              color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.transportInvoice.transportType.$error" :error-label="requiredField">
            <q-option-group color="primary" v-model="user.alenvi.administrative.transportInvoice.transportType" @input="updateUser({ alenvi: 'administrative.transportInvoice.transportType', ogust: 'default_means_of_transport' })"
              :options="transportOptions" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.transportInvoice.transportType === 'public'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Merci de nous transmettre ton justificatif d'abonnement" path="administrative.transportInvoice"
            alt="justif transport" :entity="currentUser" :upload="uploadDocument" name="transportInvoice" @uploaded="refreshUser"
            :error="$v.user.alenvi.administrative.transportInvoice.driveId.$error" :displayCaption="mainUser.role.name === 'Auxiliaire'"
            @delete="deleteDocument(user.alenvi.administrative.transportInvoice.driveId, 'administrative.transportInvoice')"
            :url="docsUploadUrl" :additionalValue="`justif_transport_${currentUser.firstname}_${currentUser.lastname}`" :extensions="extensions"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Visite médicale</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Certificat d'aptitude" path="administrative.medicalCertificate" alt="certificat médical" :entity="user.alenvi"
            @delete="deleteDocument(user.alenvi.administrative.medicalCertificate.driveId, 'administrative.medicalCertificate')" name="medicalCertificate"
            @uploaded="refreshUser" :additionalValue="`certificat_medical_${currentUser.firstname}_${currentUser.lastname}`"
            :upload="uploadDocument" :url="docsUploadUrl" :extensions="extensions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Cookies, openURL } from 'quasar';
import { required, email, numeric, minLength, maxLength, requiredIf } from 'vuelidate/lib/validators';
import 'vue-croppa/dist/vue-croppa.css'

import { frPhoneNumber, iban, frZipCode, bic } from '../../helpers/vuelidateCustomVal';
import { extend } from '../../helpers/utils.js';

import gdrive from '../../api/GoogleDrive.js';
import cloudinary from '../../api/Cloudinary.js';

import nationalities from '../../data/nationalities.js';
import countries from '../../data/countries.js';

import SelectSector from '../form/SelectSector';

import Input from '../form/Input.vue';
import Select from '../form/Select.vue';
import FileUploader from '../form/FileUploader.vue';
import MultipleFilesUploader from '../form/MultipleFilesUploader.vue';
import DatetimePicker from '../form/DatetimePicker.vue';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';

export default {
  name: 'ProfileInfo',
  components: {
    'ni-select-sector': SelectSector,
    'ni-input': Input,
    'ni-select': Select,
    'ni-file-uploader': FileUploader,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-datetime-picker': DatetimePicker,
  },
  data () {
    return {
      transportOptions: [
        { label: 'Abonnement transports en commun', value: 'public', ogustValue: 'C' },
        { label: 'Voiture personnelle', value: 'private', ogustValue: 'V' },
        { label: 'Aucun', value: 'none', ogustValue: 'P' }
      ],
      modalCssContainer: {
        minWidth: '30vw'
      },
      requiredField: 'Champ requis',
      requiredDoc: 'Document requis',
      disablePictureEdition: true,
      docsThmbnails: {},
      croppa: {},
      loadingImage: false,
      fileChosen: false,
      isLoaded: false,
      tmpInput: '',
      identityType: '',
      pictureGroup: [
        'user.alenvi.picture.link'
      ],
      identityGroup: [
        'user.alenvi.firstname',
        'user.alenvi.lastname',
        'user.alenvi.administrative.identity.nationality',
        'user.alenvi.administrative.identity.birthDate',
        'user.alenvi.administrative.identity.birthCountry',
        'user.alenvi.administrative.identity.birthState',
        'user.alenvi.administrative.identity.birthCity',
        'user.alenvi.administrative.identity.socialSecurityNumber'
      ],
      contactGroup: [
        'user.alenvi.administrative.contact.address',
        'user.alenvi.administrative.contact.zipCode',
        'user.alenvi.administrative.contact.city'
      ],
      emergencyContactGroup: [
        'user.alenvi.administrative.emergencyContact.name',
        'user.alenvi.administrative.emergencyContact.phoneNumber'
      ],
      ibanGroup: [
        'user.alenvi.administrative.payment.rib.iban',
        'user.alenvi.administrative.payment.rib.bic'
      ],
      documentsGroup: [
        'user.alenvi.administrative.identityDocs',
        'user.alenvi.administrative.idCardRecto.driveId',
        'user.alenvi.administrative.passport.driveId',
        'user.alenvi.administrative.residencePermitRecto.driveId',
        'user.alenvi.administrative.healthAttest.driveId',
        'user.alenvi.administrative.phoneInvoice.driveId',
      ],
      mutualFundGroup: [
        'user.alenvi.administrative.mutualFund.has',
        'user.alenvi.administrative.mutualFund.driveId',
      ],
      transportInvoiceGroup: [
        'user.alenvi.administrative.transportInvoice.transportType',
        'user.alenvi.administrative.transportInvoice.driveId',
      ],
      user: {
        alenvi: {
          mentorId: '',
          local: {
            email: ''
          },
          picture: {
            link: ''
          },
          administrative: {
            emergencyContact: {
              name: '',
              phoneNumber: ''
            },
            identityDocs: '',
            idCardRecto: {},
            idCardVerso: {},
            healthAttest: {},
            passport: {},
            residencePermitRecto: {},
            residencePermitVerso: {},
            mutualFund: {
              has: null
            },
            certificates: [],
            medicalCertificate: {},
            phoneInvoice: {},
            transportInvoice: {
              type: ''
            },
            payment: {
              rib: {
                iban: '',
                bic: ''
              }
            },
            identity: {
              nationality: '',
              birthDate: '',
              birthCountry: '',
              birthState: '',
              birthCity: '',
              socialSecurityNumber: ''
            },
            contact: {
              address: '',
              additionalAddress: '',
              zipCode: '',
              city: ''
            }
          }
        }
      },
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  validations () {
    return {
      identityType: { required },
      user: {
        alenvi: {
          firstname: { required },
          lastname: { required },
          local: {
            email: { required, email }
          },
          picture: {
            link: { required }
          },
          mobilePhone: {
            required,
            frPhoneNumber,
            maxLength: maxLength(10)
          },
          sector: { required },
          mentorId: { required },
          administrative: {
            identity: {
              nationality: { required },
              birthDate: { required },
              birthCountry: { required },
              birthState: {
                required: requiredIf(() => {
                  return this.user.alenvi.administrative.identity.birthCountry === 'FR';
                }),
                numeric,
                minLength: minLength(2),
                maxLength: maxLength(3)
              },
              birthCity: { required },
              socialSecurityNumber: {
                required,
                numeric,
                minLength: minLength(15),
                maxLength: maxLength(15)
              }
            },
            identityDocs: { required },
            contact: {
              address: { required },
              zipCode: {
                required,
                frZipCode,
                maxLength: maxLength(5)
              },
              city: { required }
            },
            emergencyContact: {
              name: { required },
              phoneNumber: {
                required,
                frPhoneNumber,
                maxLength: maxLength(10)
              }
            },
            idCardRecto: {
              driveId: {
                required: requiredIf(() => {
                  return this.user.alenvi.administrative.identityDocs === 'cni';
                })
              }
            },
            passport: {
              driveId: {
                required: requiredIf(() => {
                  return this.user.alenvi.administrative.identityDocs === 'pp';
                })
              }
            },
            residencePermitRecto: {
              driveId: {
                required: requiredIf(() => {
                  return this.user.alenvi.administrative.identityDocs === 'ts';
                })
              }
            },
            healthAttest: {
              driveId: { required }
            },
            phoneInvoice: {
              driveId: { required }
            },
            payment: {
              rib: {
                iban: {
                  required,
                  iban
                },
                bic: {
                  required,
                  bic
                }
              }
            },
            transportInvoice: {
              transportType: { required },
              driveId: { required: requiredIf((item) => {
                return item.transportType === 'public'
              }) }
            },
            mutualFund: {
              has: { required },
              driveId: { required: requiredIf((item) => {
                return item.has
              })}
            }
          }
        }
      },
      pictureGroup: this.pictureGroup,
      identityGroup: this.identityGroup,
      contactGroup: this.contactGroup,
      emergencyContactGroup: this.emergencyContactGroup,
      ibanGroup: this.ibanGroup,
      documentsGroup: this.documentsGroup,
      mutualFundGroup: this.mutualFundGroup,
      transportInvoiceGroup: this.transportInvoiceGroup
    }
  },
  computed: {
    ...mapGetters({
      userProfile: 'rh/getUserProfile',
      mainUser: 'main/user'
    }),
    currentUser () {
      if (this.userProfile) {
        return this.userProfile;
      }
      return this.mainUser;
    },
    nationalitiesOptions () {
      return ['FR', ...Object.keys(nationalities).filter(nationality => nationality !== 'FR')].map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')].map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.currentUser._id}/gdrive/${this.currentUser.administrative.driveFolder.id}/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.currentUser._id}/cloudinary/upload`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
    hasPicture () {
      return !this.user.alenvi.picture || (this.user.alenvi.picture && !this.user.alenvi.picture.link) ? null : this.user.alenvi.picture.link;
    },
    birthStateError () {
      if (!this.$v.user.alenvi.administrative.identity.birthState.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.identity.birthState.minLength ||
      !this.$v.user.alenvi.administrative.identity.birthState.maxLength ||
      !this.$v.user.alenvi.administrative.identity.birthState.numeric) {
        return 'Departement non valide';
      }
    },
    ssnError () {
      if (!this.$v.user.alenvi.administrative.identity.socialSecurityNumber.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.identity.socialSecurityNumber.minLength ||
      !this.$v.user.alenvi.administrative.identity.socialSecurityNumber.maxLength ||
      !this.$v.user.alenvi.administrative.identity.socialSecurityNumber.numeric) {
        return 'Numéro de sécurité sociale non valide';
      }
    },
    phoneNbrError () {
      if (!this.$v.user.alenvi.mobilePhone.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.mobilePhone.frPhoneNumber || !this.$v.user.alenvi.mobilePhone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
    },
    emailError () {
      if (!this.$v.user.alenvi.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.local.email.email) {
        return 'Email non valide';
      }
    },
    zipCodeError () {
      if (!this.$v.user.alenvi.administrative.contact.zipCode.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.contact.zipCode.frZipCode || !this.$v.user.alenvi.administrative.contact.zipCode.maxLength) {
        return 'Code postal non valide';
      }
    },
    emergencyPhoneNbrError () {
      if (!this.$v.user.alenvi.administrative.emergencyContact.phoneNumber.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.emergencyContact.phoneNumber.frPhoneNumber || !this.$v.user.alenvi.administrative.emergencyContact.phoneNumber.maxLength) {
        return 'Numéro de téléphone non valide';
      }
    },
    ibanError () {
      if (!this.$v.user.alenvi.administrative.payment.rib.iban.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.payment.rib.iban.iban) {
        return 'IBAN non valide';
      }
    },
    bicError () {
      if (!this.$v.user.alenvi.administrative.payment.rib.bic.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.payment.rib.bic.bic) {
        return 'BIC non valide';
      }
    },
  },
  async mounted () {
    const user = await this.$users.getById(this.currentUser._id);
    this.mergeUser(user);
    this.$v.user.alenvi.$touch();
    this.isLoaded = true;
  },
  watch: {
    currentUser (value) {
      if (!this.$_.isEqual(value, this.user.alenvi)) {
        this.mergeUser(value);
      }
    }
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.user.alenvi, value];
      this.user.alenvi = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.user.alenvi, path)
    },
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.user.alenvi, paths.alenvi)) return;
        if (this.$_.get(this.$v.user.alenvi, paths.alenvi)) {
          this.$_.get(this.$v.user.alenvi, paths.alenvi).$touch();
          if (this.$_.get(this.$v.user.alenvi, paths.alenvi).$error) {
            return NotifyWarning('Champ(s) invalide(s)');
          }
        }
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviUser(paths.alenvi);
          await this.updateOgustUser(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviUser(paths.alenvi);
        } else {
          await this.updateOgustUser(paths);
        }
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.$store.commit('rh/saveUserProfile', this.user.alenvi);
        this.tmpInput = '';
      }
    },
    async updateAlenviUser (path) {
      let value = this.$_.get(this.user.alenvi, path);
      if (path.match(/iban/i)) {
        value = value.split(' ').join('');
      }
      const payload = this.$_.set({}, path, value);
      payload._id = this.currentUser._id;

      if (path.match(/birthCountry/i) && value !== 'FR') {
        this.user.alenvi.administrative.identity.birthState = '99';
        payload.administrative.identity.birthState = '99';
      }

      await this.$users.updateById(payload);
    },
    async updateOgustUser (paths) {
      let value = this.$_.get(this.user.alenvi, paths.alenvi);
      if (paths.ogust.match(/date_of_birth/i)) {
        value = this.$moment(value).format('YYYYMMDD');
      }
      if (paths.ogust.match(/iban_number/i)) {
        value = value.split(' ').join('');
      }
      if (paths.ogust === 'default_means_of_transport') {
        const correspondingOption = this.transportOptions.find(option => option.value === value);
        value = correspondingOption.ogustValue;
      }
      const payload = this.$_.set({}, paths.ogust, value);
      if (paths.ogust.match(/(iban|bic)_number/i)) {
        if (paths.ogust === 'iban_number' && this.user.alenvi.administrative.payment.rib.bic) {
          payload.bic_number = this.user.alenvi.administrative.payment.rib.bic;
        } else if (paths.ogust === 'bic_number' && this.user.alenvi.administrative.payment.rib.iban) {
          payload.iban_number = this.user.alenvi.administrative.payment.rib.iban.split(' ').join('');
        } else {
          return;
        }
        payload.id_tiers = this.currentUser.employee_id;
        await this.$ogust.setBankInfo(payload);
      } else if (paths.ogust.match(/(city|line|supplement|zip)/i)) {
        payload.id_address = this.currentUser.administrative.contact.addressId;
        await this.$ogust.setAddress(payload);
      } else {
        payload.id_employee = this.currentUser.employee_id

        if (paths.ogust.match(/country_of_birth/i) && value !== 'FR') {
          payload.state_of_birth = '99';
        }
        await this.$ogust.setEmployee(payload);
      }
    },
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        const node = this.$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
        if (node) {
          node[0].$refs[refName].reset();
        }
        NotifyNegative('Fichier trop volumineux (> 5 Mo)');
        return '';
      } else {
        const node = this.$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
        if (node) {
          node[0].$refs[refName].upload();
        }
      }
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) {
          await cloudinary.deleteImageById({ id: this.currentUser.picture.publicId });
        }
        this.loadingImage = true;
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('_id', this.currentUser._id);
        data.append('role', this.currentUser.role.name);
        data.append('fileName', `photo_${this.currentUser.firstname}_${this.currentUser.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        await this.$axios.post(this.pictureUploadUrl, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
        await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
        this.closePictureEdition();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.loadingImage = false;
      }
    },
    async deleteDocument (driveId, path) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler'
        });
        await gdrive.removeFileById({ id: driveId });
        let payload = { _id: this.currentUser._id };
        if (path === 'certificates') {
          payload = Object.assign(payload, { [`administrative.${path}`]: { driveId } });
          await this.$users.updateCertificates(payload);
        } else {
          payload = this.$_.set(payload, path, { driveId: null, link: null });
          await this.$users.updateById(payload);
        }
        await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    async deleteImage (params) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ta photo ?',
          ok: true,
          cancel: 'Annuler'
        });
        if (this.currentUser.picture && this.currentUser.picture.publicId) {
          await cloudinary.deleteImageById({ id: this.currentUser.picture.publicId });
          this.croppa.remove();
        }
        await this.$users.updateById({
          _id: this.currentUser._id,
          picture: {
            link: null,
            publicId: null
          }
        });
        await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
        NotifyPositive('Photo supprimée');
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression de la photo');
      }
    },
    async refreshUser () {
      await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
      NotifyPositive('Document envoyé');
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    groupErrors (group) {
      let j = 0;
      const groupName = `${group}Group`;
      for (let i = 0, l = this[groupName].length; i < l; i++) {
        if (this.$v[groupName][this[groupName][i]].$error) {
          j++;
        }
      }
      return {
        errors: j,
        msg: j > 0 ? `${j} information(s) manquante(s)` : 'Informations complètes'
      }
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
    choosePicture () {
      this.fileChosen = true;
      this.disablePictureEdition = false;
      this.croppa.chooseFile();
    },
    closePictureEdition () {
      this.disablePictureEdition = true;
      this.fileChosen = false;
      if (!this.hasPicture && !this.fileChosen) {
        this.croppa.remove();
      }
      if (this.hasPicture && !this.fileChosen) {
        this.croppa.refresh();
      }
    },
    pictureDlLink (link) {
      return link ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${this.currentUser.firstname}_${this.currentUser.lastname}`) : '';
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables'

  .q-btn-group
    box-shadow: none
    & /deep/ button
      flex: 1

  .group-error
    font-size: 12px
    color: $secondary
    &-ok
      font-size: 12px
      color: $tertiary

  .croppa-container
    background-color: white

  /deep/ .bg-negative
    background: white !important
    color: inherit !important

  .picture-container
     width: 200px
     height: 200px
     background: $neutral

  .modal
    &-padding
      padding: 24px 58px 0px 58px
    &-btn
      border-radius: 0
</style>
