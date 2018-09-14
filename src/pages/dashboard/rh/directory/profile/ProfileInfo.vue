<template>
  <div v-if="isLoaded">
    <div v-if="currentUser.role.name !== 'Auxiliaire'" class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Communauté</p>
        <select-sector v-model="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'sector', ogust: 'sector' })" />
      </div>
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Marraine/parrain</p>
        <select-mentor v-model="user.alenvi.mentorId" :sector="user.alenvi.sector" @myBlur="updateUser({ alenvi: 'mentorId' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Photo</p>
        <p :class="[groupErrors('picture').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('picture').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between" style="background: white">
            <croppa v-model="croppa"
              class="doc-thumbnail"
              canvas-color="#EEE"
              accept="image/*"
              :prevent-white-space="true"
              placeholder="Clique ici pour choisir ta photo"
              :placeholder-font-size="10"
              :show-remove-button="false"
              :initial-image="hasPicture"
              @file-choose="fileChosen = true"
              @image-remove="fileChosen = false" />
            <div class="self-end doc-delete">
              <q-btn v-if="fileChosen || hasPicture" color="primary" icon="rotate left" @click="croppa.rotate(-1)" round flat size="1rem" />
              <q-btn v-if="fileChosen || hasPicture" color="primary" icon="rotate right" @click="croppa.rotate(1)" round flat size="1rem" />
              <q-btn v-if="fileChosen || hasPicture" color="primary" round flat icon="cloud_upload" size="1rem" @click.native="uploadImage" />
              <q-btn v-if="hasPicture || fileChosen" color="primary" round flat icon="delete" size="1rem" @click.native="deleteImage" />
              <q-btn v-if="hasPicture && !fileChosen" color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.picture.link)" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="[groupErrors('identity').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Prénom</p>
            <q-icon v-if="$v.user.alenvi.firstname.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.firstname.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.firstname"
              color="white"
              inverted-light
              @focus="saveTmp('firstname')"
              @blur="updateUser({ alenvi: 'firstname', ogust: 'first_name' })"
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Nom</p>
            <q-icon v-if="$v.user.alenvi.lastname.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.lastname.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.lastname"
              color="white"
              inverted-light
              @focus="saveTmp('lastname')"
              @blur="updateUser({ alenvi: 'lastname', ogust: 'last_name' })"
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Nationalité</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.nationality.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.nationality.$error" :error-label="requiredField">
            <q-select v-model="user.alenvi.administrative.identity.nationality" color="white" inverted-light :options="nationalitiesOptions"
            filter
            filter-placeholder="Rechercher"
            @focus="saveTmp('administrative.identity.nationality')"
            @blur="updateUser({ alenvi: 'administrative.identity.nationality', ogust: 'nationality' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Date de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.dateOfBirth.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.dateOfBirth.$error" :error-label="requiredField">
            <q-datetime type="date" format="DD/MM/YYYY" v-model="user.alenvi.administrative.identity.dateOfBirth" color="white" inverted-light
            @focus="saveTmp('administrative.identity.dateOfBirth')"
            @blur="updateUser({ alenvi: 'administrative.identity.dateOfBirth', ogust: 'date_of_birth' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Pays de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthCountry.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.birthCountry.$error" :error-label="requiredField">
            <q-select v-model="user.alenvi.administrative.identity.birthCountry" :options="countriesOptions" color="white" inverted-light
            filter
            filter-placeholder="Rechercher"
            @focus="saveTmp('administrative.identity.birthCountry')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthCountry', ogust: 'country_of_birth' })" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Département de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthState.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.birthState.$error" :error-label="birthStateError">
            <q-input v-model="user.alenvi.administrative.identity.birthState"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.birthState')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthState', ogust: 'state_of_birth' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Ville de naissance</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.birthCity.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.birthCity.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.administrative.identity.birthCity"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.birthCity')"
            @blur="updateUser({ alenvi: 'administrative.identity.birthCity', ogust: 'place_of_birth' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Numéro de sécurité sociale</p>
            <q-icon v-if="$v.user.alenvi.administrative.identity.socialSecurityNumber.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.identity.socialSecurityNumber.$error" :error-label="ssnError">
            <q-input v-model="user.alenvi.administrative.identity.socialSecurityNumber"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.identity.socialSecurityNumber')"
            @blur="updateUser({ alenvi: 'administrative.identity.socialSecurityNumber', ogust: 'social_insurance_number' })"
          />
          </q-field>
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
          <div class="row justify-between">
            <p class="input-caption">Numéro de téléphone</p>
            <q-icon v-if="$v.user.alenvi.mobilePhone.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.mobilePhone.$error" :error-label="phoneNbrError">
            <q-input v-model.trim="user.alenvi.mobilePhone"
            type="tel"
            color="white"
            inverted-light
            @focus="saveTmp('mobilePhone')"
            @blur="updateUser({ alenvi: 'mobilePhone', ogust: 'mobile_phone' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Adresse email</p>
            <q-icon v-if="$v.user.alenvi.local.email.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.local.email.$error" :error-label="emailError">
            <q-input v-model.trim="user.alenvi.local.email"
            type="email"
            color="white"
            inverted-light
            lower-case
            @focus="saveTmp('local.email')"
            @blur="updateUser({ alenvi: 'local.email', ogust: 'email' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Adresse, numéro et rue</p>
            <q-icon v-if="$v.user.alenvi.administrative.contact.address.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.contact.address.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.administrative.contact.address"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.address')"
            @blur="updateUser({ alenvi: 'administrative.contact.address', ogust: 'line' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <p class="input-caption">Complément d'adresse</p>
          <q-input v-model="user.alenvi.administrative.contact.additionalAddress"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.addionalAddress')"
            @blur="updateUser({ alenvi: 'administrative.contact.additionalAddress', ogust: 'supplement' })"
          />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Code postal</p>
            <q-icon v-if="$v.user.alenvi.administrative.contact.zipCode.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.contact.zipCode.$error" :error-label="zipCodeError">
            <q-input v-model="user.alenvi.administrative.contact.zipCode"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.zipCode')"
            @blur="updateUser({ alenvi: 'administrative.contact.zipCode', ogust: 'zip' })"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Ville</p>
            <q-icon v-if="$v.user.alenvi.administrative.contact.city.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.contact.city.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.administrative.contact.city"
            color="white"
            inverted-light
            @focus="saveTmp('administrative.contact.city')"
            @blur="updateUser({ alenvi: 'administrative.contact.city', ogust: 'city' })"
          />
          </q-field>
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
          <div class="row justify-between">
            <p class="input-caption">Prénom et nom</p>
            <q-icon v-if="$v.user.alenvi.administrative.emergencyContact.name.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.emergencyContact.name.$error" :error-label="requiredField">
            <q-input v-model="user.alenvi.administrative.emergencyContact.name"
              color="white"
              inverted-light
              @focus="saveTmp('administrative.emergencyContact.name')"
              @blur="updateUser({ alenvi: 'administrative.emergencyContact.name' })"
            />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Numéro de téléphone</p>
            <q-icon v-if="$v.user.alenvi.administrative.emergencyContact.phoneNumber.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.emergencyContact.phoneNumber.$error" :error-label="emergencyPhoneNbrError">
            <q-input v-model.trim="user.alenvi.administrative.emergencyContact.phoneNumber"
              color="white"
              inverted-light
              @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
              @blur="updateUser({ alenvi: 'administrative.emergencyContact.phoneNumber' })"
            />
          </q-field>
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
          <div class="row justify-between">
            <p class="input-caption">IBAN</p>
            <q-icon v-if="$v.user.alenvi.administrative.payment.rib.iban.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.payment.rib.iban.$error" :error-label="ibanError">
            <q-input upper-case v-mask="'SS## XXXX XXXX XXXX XXXX XXXX XXX'" v-model="user.alenvi.administrative.payment.rib.iban"
            color="white" inverted-light @blur="updateUser({ alenvi: 'administrative.payment.rib.iban', ogust: 'iban_number' })"
            @focus="saveTmp('administrative.payment.rib.iban')"
          />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">BIC</p>
            <q-icon v-if="$v.user.alenvi.administrative.payment.rib.bic.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.payment.rib.bic.$error" :error-label="bicError">
            <q-input v-model="user.alenvi.administrative.payment.rib.bic"
            upper-case color="white" inverted-light @blur="updateUser({ alenvi: 'administrative.payment.rib.bic', ogust: 'bic_number' })"
            @focus="saveTmp('administrative.payment.rib.bic')"
          />
          </q-field>
        </div>
      </div>
    </div>
    <div v-if="user.alenvi.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
        <p :class="[groupErrors('documents').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('documents').msg }}</p>
      </div>
      <div class="row gutter-profile items-stretch">
        <div class="col-xs-12">
          <div class="row justify-between">
            <p v-if="currentUser.role.name === 'Auxiliaire'" class="input-caption">Merci de nous indiquer le type de document d'identité que tu possèdes.</p>
            <q-icon v-if="$v.user.alenvi.administrative.identityDocs.$error" name="error_outline" color="secondary" />
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
          <div class="row justify-between">
            <p class="input-caption">Carte d'identité (recto)</p>
            <q-icon v-if="$v.user.alenvi.administrative.idCardRecto.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <div v-if="user.alenvi.administrative.idCardRecto && user.alenvi.administrative.idCardRecto.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardRecto.driveId)" alt="cni recto">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.idCardRecto.driveId, 'administrative.idCardRecto')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.idCardRecto.link)" />
            </div>
          </div>
          <q-field v-if="$v.user.alenvi.administrative.idCardRecto.driveId.$error" :error="$v.user.alenvi.administrative.idCardRecto.driveId.$error">
            <q-uploader ref="idCardRecto" name="idCardRecto" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `cni_recto_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('idCardRecto')" @finish="refreshUser" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Carte d'identité (verso)</p>
          </div>
          <div v-if="user.alenvi.administrative.idCardVerso && user.alenvi.administrative.idCardVerso.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.idCardVerso.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.idCardVerso.driveId, 'administrative.idCardVerso')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.idCardVerso.link)" />
            </div>
          </div>
          <q-field v-if="!user.alenvi.administrative.idCardVerso.driveId">
            <q-uploader ref="idCardVerso" name="idCardVerso" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `cni_verso_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('idCardVerso')" @finish="refreshUser" />
            <!-- <q-uploader url="test" color="white" inverted-light /> -->
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Passeport</p>
            <q-icon v-if="$v.user.alenvi.administrative.passport.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <div v-if="user.alenvi.administrative.passport && user.alenvi.administrative.passport.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.passport.driveId)" alt="passeport">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.passport.driveId, 'administrative.passport')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.passport.link)" />
            </div>
          </div>
          <q-field v-if="$v.user.alenvi.administrative.passport.driveId.$error" :error="$v.user.alenvi.administrative.passport.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="passport" name="passport" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `passeport_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('passport')" @finish="refreshUser" />
            <!-- <q-uploader url="test" color="white" inverted-light /> -->
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Titre de séjour</p>
            <q-icon v-if="$v.user.alenvi.administrative.residencePermit.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <div v-if="user.alenvi.administrative.residencePermit && user.alenvi.administrative.residencePermit.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.residencePermit.driveId)" alt="titre de séjour">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.residencePermit.driveId, 'administrative.residencePermit')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.residencePermit.link)" />
            </div>
          </div>
          <q-field v-if="$v.user.alenvi.administrative.residencePermit.driveId.$error" :error="$v.user.alenvi.administrative.residencePermit.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="residencePermit" name="residencePermit" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `titre_de_séjour_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('residencePermit')" @finish="refreshUser" />
            <!-- <q-uploader url="test" color="white" inverted-light /> -->
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Attestation de sécurité sociale</p>
            <q-icon v-if="$v.user.alenvi.administrative.healthAttest.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <div v-if="user.alenvi.administrative.healthAttest && user.alenvi.administrative.healthAttest.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.healthAttest.driveId)" alt="attestation secu">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.healthAttest.driveId, 'administrative.healthAttest')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.healthAttest.link)" />
            </div>
          </div>
          <q-field v-if="$v.user.alenvi.administrative.healthAttest.driveId.$error" :error="$v.user.alenvi.administrative.healthAttest.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="healthAttest" name="healthAttest" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `assurance_maladie_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('healthAttest')" @finish="refreshUser" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row justify-between">
            <p class="input-caption">Facture téléphonique</p>
            <q-icon v-if="$v.user.alenvi.administrative.phoneInvoice.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <div v-if="user.alenvi.administrative.phoneInvoice && user.alenvi.administrative.phoneInvoice.driveId" class="row justify-between"
            style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.phoneInvoice.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.phoneInvoice.driveId, 'administrative.phoneInvoice')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.phoneInvoice.link)" />
            </div>
          </div>
          <q-field v-if="$v.user.alenvi.administrative.phoneInvoice.driveId.$error" :error="$v.user.alenvi.administrative.phoneInvoice.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="phoneInvoice" name="phoneInvoice" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `facture_telephone_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('phoneInvoice')" @finish="refreshUser" />
          </q-field>
        </div>
        <div class="col-xs-12">
          <div class="row">
            <p class="input-caption">Diplome(s) ou certificat(s)</p>
          </div>
          <q-field>
            <q-uploader ref="certificates" name="certificates" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `diplomes_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
              hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
              hide-upload-button @add="uploadDocument('certificates')" @finish="refreshUser" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.certificates && user.alenvi.administrative.certificates.length > 0" class="col-xs-12 col-md-6"
          v-for="(certificate, index) in user.alenvi.administrative.certificates" :key="index">
          <p class="input-caption col-xs-12">Diplome(s) ou certificat(s) ({{ index + 1 }})</p>
          <div v-if="certificate.driveId" class="row justify-between" style="background: white">
            <img class="doc-thumbnail" :src="getThumbnailUrl(certificate.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(certificate.driveId, 'certificates')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(certificate.link)" />
            </div>
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
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.mutualFund.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.mutualFund.driveId, 'administrative.mutualFund')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.mutualFund.link)" />
            </div>
          </div>
        </div>
        <div v-if="user.alenvi.administrative.mutualFund.has && !user.alenvi.administrative.mutualFund.driveId" class="col-xs-12">
          <div class="row justify-between">
            <p v-if="currentUser.role.name === 'Auxiliaire'" class="input-caption">Merci de nous transmettre une attestation prouvant que tu es déjà affilié(e) à une autre mutuelle</p>
            <q-icon v-if="$v.user.alenvi.administrative.mutualFund.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.mutualFund.driveId.$error" :error-label="requiredDoc">
            <q-uploader ref="mutualFund" name="mutualFund" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `mutuelle_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
            hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
            hide-upload-button @add="uploadDocument('mutualFund')" @finish="refreshUser" />
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
            <q-icon v-if="$v.user.alenvi.administrative.transportInvoice.transportType.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.transportInvoice.transportType.$error" :error-label="requiredField">
            <q-option-group color="primary" v-model="user.alenvi.administrative.transportInvoice.transportType" @input="updateUser({ alenvi: 'administrative.transportInvoice.transportType' })"
            :options="[
                { label: 'Abonnement transports en commun', value: 'public' },
                { label: 'Voiture personnelle', value: 'private' },
                { label: 'Aucun', value: 'none' }
              ]" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.transportInvoice.transportType === 'public'" class="col-xs-12">
          <div v-if="currentUser.role.name === 'Auxiliaire'" class="row justify-between">
            <p class="input-caption">Merci de nous transmettre ton justificatif d'abonnement</p>
            <q-icon v-if="$v.user.alenvi.administrative.transportInvoice.driveId.$error" name="error_outline" color="secondary" />
          </div>
          <q-field :error="$v.user.alenvi.administrative.transportInvoice.driveId.$error" :error-label="requiredDoc">
           <q-uploader ref="transportInvoice" name="transportInvoice" :url="docsUploadUrl" :headers="headers" :additional-fields="[{ name: 'fileName', value: `justif_transport_${userProfile.firstname}_${userProfile.lastname}` }, { name: '_id', value: `${userProfile._id}` }]"
            hide-underline extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" color="white" inverted-light
            hide-upload-button @add="uploadDocument('transportInvoice')" @finish="refreshUser" />
          </q-field>
        </div>
        <div v-if="user.alenvi.administrative.transportInvoice && user.alenvi.administrative.transportInvoice.driveId" class="row justify-between"
            style="background: white; margin-top: 24px;">
            <img class="doc-thumbnail" :src="getThumbnailUrl(user.alenvi.administrative.transportInvoice.driveId)" alt="cni verso">
            <div class="self-end doc-delete">
              <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument(user.alenvi.administrative.transportInvoice.driveId, 'administrative.transportInvoice')" />
              <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(user.alenvi.administrative.transportInvoice.link)" />
            </div>
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

import { frPhoneNumber, iban, frZipCode, bic } from '../../../../../helpers/vuelidateCustomVal';
import gdrive from '../../../../../api/GoogleDrive.js';
import cloudinary from '../../../../../api/Cloudinary.js';
import nationalities from '../../../../../data/nationalities.js';
import countries from '../../../../../data/countries.js';
import SelectSector from '../../../../../components/SelectSector';
import SelectMentor from '../../../../../components/SelectMentor';
import { extend } from '../../../../../helpers/utils.js';

export default {
  components: {
    SelectSector,
    SelectMentor
  },
  data () {
    return {
      requiredField: 'Champ requis',
      requiredDoc: 'Document requis',
      croppa: {},
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
        'user.alenvi.administrative.identity.dateOfBirth',
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
        'user.alenvi.administrative.idCardRecto.driveId',
        'user.alenvi.administrative.passport.driveId',
        'user.alenvi.administrative.residencePermit.driveId',
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
            residencePermit: {},
            mutualFund: {
              has: null
            },
            certificates: [],
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
              dateOfBirth: '',
              birthCountry: '',
              birthState: '',
              birthCity: '',
              socialSecurityNumber: 0
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
          mobilePhone: { required, frPhoneNumber },
          sector: { required },
          mentorId: { required },
          administrative: {
            identity: {
              nationality: { required },
              dateOfBirth: { required },
              birthCountry: { required },
              birthState: {
                required,
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
              zipCode: { required, frZipCode },
              city: { required }
            },
            emergencyContact: {
              name: { required },
              phoneNumber: { required, frPhoneNumber }
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
            residencePermit: {
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
      currentUser: 'main/user'
    }),
    nationalitiesOptions () {
      return Object.keys(nationalities).map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')].map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/gdrive/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/cloudinary/uploadImage`;
    },
    headers () {
      return {
        'x-access-token': Cookies.get('alenvi_token') || ''
      }
    },
    hasPicture () {
      return !this.user.alenvi.picture ? '' : this.user.alenvi.picture.link === 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png' ? '' : this.user.alenvi.picture.link;
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
      } else if (!this.$v.user.alenvi.mobilePhone.frPhoneNumber) {
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
      } else if (!this.$v.user.alenvi.administrative.contact.zipCode.frZipCode) {
        return 'Code postal non valide';
      }
    },
    emergencyPhoneNbrError () {
      if (!this.$v.user.alenvi.administrative.emergencyContact.phoneNumber.required) {
        return 'Champ requis';
      } else if (!this.$v.user.alenvi.administrative.emergencyContact.phoneNumber.frPhoneNumber) {
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
    }
  },
  mounted () {
    this.mergeUser();
    this.$v.user.alenvi.$touch();
  },
  watch: {
    userProfile (value) {
      this.mergeUser(value);
    }
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.user.alenvi, value || this.$store.state.rh.userProfile];
      this.user.alenvi = Object.assign({}, extend(true, ...args));
      this.isLoaded = true;
    },
    getThumbnailUrl (fileId) {
      return `https://drive.google.com/u/1/thumbnail?id=${fileId}`
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.user.alenvi, path)
    },
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.user.alenvi, paths.alenvi)) return;
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
        if (paths.alenvi && paths.ogust) {
          await this.updateAlenviUser(paths.alenvi);
          await this.updateOgustUser(paths);
        } else if (paths.alenvi) {
          await this.updateAlenviUser(paths.alenvi);
        } else {
          await this.updateOgustUser(paths);
        }
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
        this.$q.notify({
          color: 'positive',
          icon: 'done',
          detail: 'Modification enregistrée',
          position: 'bottom-left',
          timeout: 2500
        });
      } catch (e) {
        console.error(e);
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
        this.$q.notify({
          color: 'negative',
          icon: 'warning',
          detail: 'Erreur lors de la modification',
          position: 'bottom-left',
          timeout: 2500
        });
      }
    },
    async updateAlenviUser (path) {
      let value = this.$_.get(this.user.alenvi, path);
      if (path.match(/dateOfBirth/i)) {
        value = this.$moment(value).format('YYYY-MM-DD');
      }
      if (path.match(/iban/i)) {
        value = value.split(' ').join('');
      }
      const payload = this.$_.set({}, path, value);
      payload._id = this.userProfile._id;
      console.log('PAYLOAD ALENVI', payload);
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
      console.log('PAYLOAD OGUST', payload);
    },
    uploadDocument (refName) {
      this.$refs[refName].upload();
      this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) {
          this.deleteImage({ beforeUpload: true });
        }
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('_id', this.userProfile._id);
        data.append('role', this.userProfile.role.name);
        data.append('fileName', `photo_${this.userProfile.firstname}_${this.userProfile.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        await this.$axios.post(`${process.env.API_HOSTNAME}/cloudinary/upload`, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
        this.fileChosen = false;
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
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
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
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
        if (params.beforeUpload) {
          await cloudinary.deleteImageById({ id: this.userProfile.picture.publicId });
          return;
        }
        if (this.userProfile.picture && !this.userProfile.picture.link) {
          return this.croppa.remove();
        }
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
        this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
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
    refreshUser () {
      this.$store.dispatch('rh/getUserProfile', this.userProfile._id);
      this.$q.notify({
        color: 'positive',
        icon: 'done',
        detail: 'Document envoyé',
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
      openURL(url);
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

  .gutter-profile
    margin-top: -24px
    margin-left: -24px
    & > div
      padding-top: 24px
      padding-left: 24px
    &-x
      margin-top: -24px
      & > div
        padding-top: 24px

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
</style>
