<template>
  <div v-if="isLoaded">
    <div v-if="currentUser.role.name !== 'Auxiliaire'" class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <select-sector v-model="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'sector', ogust: 'sector' })" />
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
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Prénom" :error="$v.user.alenvi.firstname.$error" v-model="user.alenvi.firstname"
            @myBlur="updateUser({ alenvi: 'firstname', ogust: 'first_name' })" @myFocus="saveTmp('firstname')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Nom" :error="$v.user.alenvi.lastname.$error" v-model="user.alenvi.lastname"
            @myBlur="updateUser({ alenvi: 'lastname', ogust: 'last_name' })" @myFocus="saveTmp('lastname')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <select-with-errors caption="Nationalité" :error="$v.user.alenvi.administrative.identity.nationality.$error" :options="nationalitiesOptions"
            v-model="user.alenvi.administrative.identity.nationality" @myFocus="saveTmp('administrative.identity.nationality')"
            @myBlur="updateUser({ alenvi: 'administrative.identity.nationality', ogust: 'nationality' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Date de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthDate.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.birthDate.$error" :error-label="requiredField">
            <q-datetime type="date" format="DD/MM/YYYY" v-model="user.alenvi.administrative.identity.birthDate" color="white"
              inverted-light popover @focus="saveTmp('administrative.identity.birthDate')" @blur="updateUser({ alenvi: 'administrative.identity.birthDate', ogust: 'date_of_birth' })"
              ok-label="OK" cancel-label="Fermer" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <select-with-errors caption="Pays de naissance" :error="$v.user.alenvi.administrative.identity.birthCountry.$error" :options="nationalitiesOptions"
            v-model="user.alenvi.administrative.identity.birthCountry" @myFocus="saveTmp('administrative.identity.birthCountry')"
            @myBlur="updateUser({ alenvi: 'administrative.identity.birthCountry', ogust: 'country_of_birth' })"
          />
        </div>
        <div v-if="this.user.alenvi.administrative.identity.birthCountry === 'FR'" class="col-xs-12 col-md-6">
          <input-with-errors caption="Département de naissance" :error="$v.user.alenvi.administrative.identity.birthState.$error" :errorLabel="birthStateError"
            v-model="user.alenvi.administrative.identity.birthState" @myBlur="updateUser({ alenvi: 'administrative.identity.birthState', ogust: 'state_of_birth' })"
            @myFocus="saveTmp('administrative.identity.birthState')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Ville de naissance" :error="$v.user.alenvi.administrative.identity.birthCity.$error"
            v-model="user.alenvi.administrative.identity.birthCity" @myFocus="saveTmp('administrative.identity.birthCity')"
            @myBlur="updateUser({ alenvi: 'administrative.identity.birthCity', ogust: 'place_of_birth' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Numéro de sécurité sociale" :error="$v.user.alenvi.administrative.identity.socialSecurityNumber.$error"
            v-model="user.alenvi.administrative.identity.socialSecurityNumber" @myFocus="saveTmp('administrative.identity.socialSecurityNumber')"
            @myBlur="updateUser({ alenvi: 'administrative.identity.socialSecurityNumber', ogust: 'social_insurance_number' })" :errorLabel="ssnError"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
        <p :class="[groupErrors('contact').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('contact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Numéro de téléphone" :error="$v.user.alenvi.mobilePhone.$error" :errorLabel="phoneNbrError" type="tel"
            v-model.trim="user.alenvi.mobilePhone" @myBlur="updateUser({ alenvi: 'mobilePhone', ogust: 'mobile_phone' })" @myFocus="saveTmp('mobilePhone')"
          />
        </div>
        <div v-if="currentUser.role.name !== 'Auxiliaire'" class="col-xs-12 col-md-6">
          <input-with-errors caption="Adresse email" :error="$v.user.alenvi.local.email.$error" :errorLabel="emailError" type="email" lowerCase disable
            v-model.trim="user.alenvi.local.email" @myBlur="updateUser({ alenvi: 'local.email', ogust: 'email' })" @myFocus="saveTmp('local.email')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Adresse, numéro et rue" v-model="user.alenvi.administrative.contact.address"
            @myBlur="updateUser({ alenvi: 'administrative.contact.address', ogust: 'line' })" @myFocus="saveTmp('administrative.contact.address')"
            :error="$v.user.alenvi.administrative.contact.address.$error"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Complément d'adresse</p>
          <q-input v-model="user.alenvi.administrative.contact.additionalAddress" @focus="saveTmp('administrative.contact.addionalAddress')"
            @blur="updateUser({ alenvi: 'administrative.contact.additionalAddress', ogust: 'supplement' })" color="white" inverted-light
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Code postal" :error="$v.user.alenvi.administrative.contact.zipCode.$error" :errorLabel="zipCodeError"
            v-model="user.alenvi.administrative.contact.zipCode" @myFocus="saveTmp('administrative.contact.zipCode')"
            @myBlur="updateUser({ alenvi: 'administrative.contact.zipCode', ogust: 'zip' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Ville" :error="$v.user.alenvi.administrative.contact.city.$error" v-model="user.alenvi.administrative.contact.city"
            @myBlur="updateUser({ alenvi: 'administrative.contact.city', ogust: 'city' })" @myFocus="saveTmp('administrative.contact.city')"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact d'urgence</p>
        <p :class="[groupErrors('emergencyContact').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('emergencyContact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Prénom et nom" :error="$v.user.alenvi.administrative.emergencyContact.name.$error"
            v-model="user.alenvi.administrative.emergencyContact.name" @myFocus="saveTmp('administrative.emergencyContact.name')"
            @myBlur="updateUser({ alenvi: 'administrative.emergencyContact.name' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="Numéro de téléphone" :error="$v.user.alenvi.administrative.emergencyContact.phoneNumber.$error"
            v-model.trim="user.alenvi.administrative.emergencyContact.phoneNumber" @myFocus="saveTmp('administrative.emergencyContact.phoneNumber')"
            @myBlur="updateUser({ alenvi: 'administrative.emergencyContact.phoneNumber' })" :errorLabel="emergencyPhoneNbrError"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">IBAN</p>
        <p :class="[groupErrors('iban').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('iban').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="IBAN" :error="$v.user.alenvi.administrative.payment.rib.iban.$error" :errorLabel="ibanError"
          v-model="user.alenvi.administrative.payment.rib.iban" @myFocus="saveTmp('administrative.payment.rib.iban')" upperCase
            @myBlur="updateUser({ alenvi: 'administrative.payment.rib.iban', ogust: 'iban_number' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <input-with-errors caption="BIC" :error="$v.user.alenvi.administrative.payment.rib.bic.$error" :errorLabel="bicError" upperCase
            v-model.trim="user.alenvi.administrative.payment.rib.bic" @myFocus="saveTmp('administrative.payment.rib.bic')"
            @myBlur="updateUser({ alenvi: 'administrative.payment.rib.bic', ogust: 'bic_number' })"
          />
        </div>
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
            <p v-if="currentUser.role.name === 'Auxiliaire'" class="input-caption">Merci de nous indiquer le type de document d'identité que tu possèdes.</p>
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
          <file-uploader caption="Carte d'identité (recto)" path="administrative.idCardRecto" alt="cni recto" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.idCardRecto.driveId, 'administrative.idCardRecto')" name="idCardRecto"
            additionalFieldsName="cni_recto" @uploaded="refreshUser" @upload="uploadDocument($event, 'idCardRecto')"
            :error="$v.user.alenvi.administrative.idCardRecto.driveId.$error"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <file-uploader caption="Carte d'identité (verso)" path="administrative.idCardVerso" alt="cni verso" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.idCardVerso.driveId, 'administrative.idCardVerso')" name="idCardVerso"
            additionalFieldsName="cni_verso" @uploaded="refreshUser" @upload="uploadDocument($event, 'idCardVerso')"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <file-uploader caption="Passeport" path="administrative.passport" alt="passeport" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.passport.driveId, 'administrative.passport')" name="passport"
            additionalFieldsName="passport" @uploaded="refreshUser" @upload="uploadDocument($event, 'passport')"
            :error="$v.user.alenvi.administrative.passport.driveId.$error"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <file-uploader caption="Titre de séjour (recto)" path="administrative.residencePermitRecto" alt="titre de séjour (recto)" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.residencePermitRecto.driveId, 'administrative.residencePermitRecto')"
            additionalFieldsName="titre_de_séjour_recto" @uploaded="refreshUser" @upload="uploadDocument($event, 'residencePermitRecto')"
            :error="$v.user.alenvi.administrative.residencePermitRecto.driveId.$error" name="residencePermitRecto"
          />
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <file-uploader caption="Titre de séjour (verso)" path="administrative.residencePermitVerso" alt="titre de séjour (verso)" name="residencePermitVerso"
            @delete="deleteDocument(user.alenvi.administrative.residencePermitVerso.driveId, 'administrative.residencePermitVerso')" :userProfile="userProfile"
            additionalFieldsName="titre_de_séjour_verso" @uploaded="refreshUser" @upload="uploadDocument($event, 'residencePermitVerso')"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <file-uploader caption="Attestation de sécurité sociale" path="administrative.healthAttest" alt="attestation secu" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.healthAttest.driveId, 'administrative.healthAttest')" name="healthAttest"
            additionalFieldsName="attestation_secu" @uploaded="refreshUser" @upload="uploadDocument($event, 'healthAttest')"
            :error="$v.user.alenvi.administrative.healthAttest.driveId.$error"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <file-uploader caption="Facture téléphonique" path="administrative.phoneInvoice" alt="facture téléphone" :userProfile="userProfile"
            @delete="deleteDocument(user.alenvi.administrative.phoneInvoice.driveId, 'administrative.phoneInvoice')" name="phoneInvoice"
            additionalFieldsName="facture_telephone" @uploaded="refreshUser" @upload="uploadDocument($event, 'phoneInvoice')"
            :error="$v.user.alenvi.administrative.phoneInvoice.driveId.$error"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row">
            <p class="input-caption">Diplome(s) ou certificat(s)</p>
          </div>
          <q-field v-if="user.alenvi.administrative.certificates.length === 0">
            <q-uploader ref="certificates" name="certificates" :url="docsUploadUrl" :headers="headers"
              :additional-fields="[{ name: 'fileName', value: `diplomes_${userProfile.firstname}_${userProfile.lastname}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white"
              inverted-light hide-upload-button @add="uploadDocument($event, 'certificates')" @uploaded="refreshUser"
              @fail="failMsg" />
          </q-field>
          <div v-if="user.alenvi.administrative.certificates && user.alenvi.administrative.certificates.length > 0"
            v-for="(certificate, index) in user.alenvi.administrative.certificates" :key="index">
            <div v-if="certificate.driveId" class="row justify-between" style="background: white; margin-bottom: 24px">
              <div class="doc-thumbnail">
                <custom-img :driveId="certificate.driveId" alt="diplôme" />
              </div>
              <div class="self-end doc-delete">
                <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(certificate.driveId, 'certificates')" />
                <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(certificate.link)" />
              </div>
            </div>
          </div>
          <div v-if="user.alenvi.administrative.certificates && user.alenvi.administrative.certificates.length > 0">
            <q-collapsible v-model="collapsibleOpened" label="Ajouter diplômes" :collapseIcon="collapsibleIcon">
              <q-uploader ref="certificates" name="certificates" :url="docsUploadUrl" :headers="headers"
                :additional-fields="[{ name: 'fileName', value: `diplomes_${userProfile.firstname}_${userProfile.lastname}` }]"
                hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white"
                inverted-light hide-upload-button @add="uploadDocument($event, 'certificates')" @uploaded="refreshUser"
                @fail="failMsg" />
            </q-collapsible>
          </div>
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
          <div v-if="currentUser.role.name === 'Auxiliaire'" class="row justify-between">
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
          <div v-if="user.alenvi.administrative.mutualFund && user.alenvi.administrative.mutualFund.driveId" class="row justify-between"
            style="background: white; margin-top: 24px;">
            <div class="doc-thumbnail">
              <custom-img :driveId="user.alenvi.administrative.mutualFund.driveId" alt="justif mutuelle" />
            </div>
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.mutualFund.driveId, 'administrative.mutualFund')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.mutualFund.link)" />
            </div>
          </div>
        </div>
        <div v-if="user.alenvi.administrative.mutualFund.has && !user.alenvi.administrative.mutualFund.driveId" class="col-xs-12">
          <div v-if="currentUser.role.name === 'Auxiliaire'" class="row justify-between">
            <p class="input-caption">Merci de nous transmettre une attestation prouvant que tu es déjà affilié(e) à une
              autre mutuelle</p>
            <q-icon v-if="$v.user.alenvi.administrative.mutualFund.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.mutualFund.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="mutualFund" name="mutualFund" :headers="headers" :additional-fields="[{ name: 'fileName', value: `mutuelle_${userProfile.firstname}_${userProfile.lastname}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" url="docsUploadUrl"
              inverted-light hide-upload-button @add="uploadDocument($event, 'mutualFund')" @uploaded="refreshUser"
              @fail="failMsg" />
          </q-field>
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
          <div v-if="currentUser.role.name === 'Auxiliaire'" class="row justify-between">
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
          <file-uploader caption="Merci de nous transmettre ton justificatif d'abonnement" path="administrative.transportInvoice"
            alt="justif transport" :userProfile="userProfile" additionalFieldsName="justif_transport" @upload="uploadDocument($event, 'transportInvoice')"
            :error="$v.user.alenvi.administrative.transportInvoice.driveId.$error" :displayCaption="currentUser.role.name === 'Auxiliaire'" name="transportInvoice"
            @delete="deleteDocument(user.alenvi.administrative.transportInvoice.driveId, 'administrative.transportInvoice')" @uploaded="refreshUser"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Visite médicale</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <file-uploader caption="Certificat d'aptitude" path="administrative.medicalCertificate" alt="certificat médical" :userProfile="user.alenvi"
            @delete="deleteDocument(user.alenvi.administrative.medicalCertificate.driveId, 'administrative.medicalCertificate')" name="medicalCertificate"
            additionalFieldsName="certificat_medical" @uploaded="refreshUser" @upload="uploadDocument($event, 'medicalCertificate')"
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

import { frPhoneNumber, iban, frZipCode, bic } from '../helpers/vuelidateCustomVal';
import { extend } from '../helpers/utils.js';

import gdrive from '../api/GoogleDrive.js';
import cloudinary from '../api/Cloudinary.js';

import nationalities from '../data/nationalities.js';
import countries from '../data/countries.js';

import SelectSector from './SelectSector';
import SelectMentor from './SelectMentor';
import CustomImg from './CustomImg';

import InputWithErrors from './form/InputWithErrors.vue';
import SelectWithErrors from './form/SelectWithErrors.vue';
import FileUploader from './form/FileUploader.vue';

export default {
  components: {
    SelectSector,
    SelectMentor,
    CustomImg,
    InputWithErrors,
    SelectWithErrors,
    FileUploader,
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
      collapsibleOpened: false,
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
      }
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
      if (this.mainUser) {
        return this.mainUser;
      }
      return this.userProfile;
    },
    nationalitiesOptions () {
      return ['FR', ...Object.keys(nationalities).filter(nationality => nationality !== 'FR')].map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')].map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.userProfile._id}/gdrive/${this.userProfile.administrative.driveFolder.id}/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.userProfile._id}/cloudinary/upload`;
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
    collapsibleIcon () {
      if (!this.collapsibleOpened) {
        return 'add';
      }
      return 'mdi-blank-checkbox';
    }
  },
  async mounted () {
    const user = await this.$users.getById(this.userProfile._id);
    this.mergeUser(user);
    this.$v.user.alenvi.$touch();
    this.isLoaded = true;
  },
  watch: {
    userProfile (value) {
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
            return this.$q.notify({
              color: 'secondary',
              icon: 'warning',
              detail: 'Champ(s) invalide(s)',
              position: 'bottom-left',
              timeout: 2500
            });
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
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
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
      payload._id = this.userProfile._id;
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
        payload.id_tiers = this.userProfile.employee_id;
        await this.$ogust.setEmployeeBankInfo(payload);
      } else if (paths.ogust.match(/(city|line|supplement|zip)/i)) {
        payload.id_address = this.userProfile.administrative.contact.addressId;
        await this.$ogust.setAddress(payload);
      } else {
        payload.id_employee = this.userProfile.employee_id
        await this.$ogust.setEmployee(payload);
      }
    },
    uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        if (this.$refs[refName]) {
          this.$refs[refName].reset();
        } else {
          const node = this.$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
          if (node) {
            node[0].$refs[refName].reset();
          }
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Fichier trop volumineux (> 5 Mo)',
          position: 'bottom-left',
          timeout: 2500
        });
        return '';
      } else {
        if (this.$refs[refName]) {
          this.$refs[refName].upload();
        } else {
          const node = this.$children.filter(child => child.$refs && Object.keys(child.$refs).includes(refName));
          if (node) {
            node[0].$refs[refName].upload();
          }
        }
      }
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) {
          await cloudinary.deleteImageById({ id: this.userProfile.picture.publicId });
        }
        this.loadingImage = true;
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('_id', this.userProfile._id);
        data.append('role', this.userProfile.role.name);
        data.append('fileName', `photo_${this.userProfile.firstname}_${this.userProfile.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        await this.$axios.post(this.pictureUploadUrl, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
        await this.$store.dispatch('rh/getUserProfile', { userId: this.userProfile._id });
        this.closePictureEdition();
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
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
        let payload = { _id: this.userProfile._id };
        if (path === 'certificates') {
          payload = Object.assign(payload, { [`administrative.${path}`]: { driveId } });
          await this.$users.updateCertificates(payload);
        } else {
          payload = this.$_.set(payload, path, { driveId: null, link: null });
          await this.$users.updateById(payload);
        }
        await this.$store.dispatch('rh/getUserProfile', { userId: this.userProfile._id });
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Document supprimé',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return this.$q.notify({
            color: 'positive',
            icon: 'done',
            detail: 'Suppression annulée',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression du document',
          position: 'bottom-left',
          timeout: 2500
        });
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
        if (this.userProfile.picture && this.userProfile.picture.publicId) {
          await cloudinary.deleteImageById({ id: this.userProfile.picture.publicId });
          this.croppa.remove();
        }
        await this.$users.updateById({
          _id: this.userProfile._id,
          picture: {
            link: null,
            publicId: null
          }
        });
        await this.$store.dispatch('rh/getUserProfile', { userId: this.userProfile._id });
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Photo supprimée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return this.$q.notify({
            color: 'positive',
            icon: 'done',
            detail: 'Suppression annulée',
            position: 'bottom-left',
            timeout: 2500
          });
        }
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la suppression de la photo',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    async refreshUser () {
      await this.$store.dispatch('rh/getUserProfile', { userId: this.userProfile._id });
      this.$q.notify({
        color: 'positive',
        icon: 'done',
        detail: 'Document envoyé',
        position: 'bottom-left',
        timeout: 2500
      });
    },
    failMsg () {
      this.$q.notify({
        color: 'negative',
        icon: 'warning',
        detail: 'Echec de l\'envoi du document',
        position: 'bottom-left',
        timeout: 2500
      });
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
      return link ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${this.userProfile.firstname}_${this.userProfile.lastname}`) : '';
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

  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px

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

  /deep/ .q-collapsible-inner
    & .q-item
      font-size: 12px
      padding-left: 0
      padding: 8px 0px
      &-side
        color: $primary
        & > .q-icon
          font-size: 16px

  /deep/ .q-collapsible-sub-item
    padding-left: 0
    padding: 8px 0px

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
