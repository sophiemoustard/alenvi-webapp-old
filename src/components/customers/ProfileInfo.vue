<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" v-model="customer.identity.firstname" @focus="saveTmp('identity.firstname')" @blur="updateUser({ alenvi: 'identity.firstname', ogust: 'first_name' })" />
        <ni-input caption="Nom" :error="$v.customer.identity.lastname.$error" errorLabel="Champ requis" v-model="customer.identity.lastname" @focus="saveTmp('identity.lastname')" @blur="updateUser({ alenvi: 'identity.lastname', ogust: 'last_name' })" />
        <div class="col-xs-12 col-md-6">
          <ni-datetime-picker v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')" caption="Date de naissance"
            @blur="updateUser({ alenvi: 'identity.birthDate', ogust: 'date_of_birth' })"
          />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error" errorLabel="Numéro de téléphone non valide"
          v-model.trim="customer.contact.phone" @focus="saveTmp('contact.phone')" @blur="updateUser({ alenvi: 'contact.phone', ogust: 'mobile_phone' })" />
        <ni-search-address v-model="customer.contact.address.fullAddress" color="white" inverted-light @focus="saveTmp('contact.address.fullAddress')"
          @blur="updateUser({ alenvi: 'contact.address', ogust: 'address' })" @selected="selectedAddress" :error-label="addressError"
          :error="$v.customer.contact.address.fullAddress.$error"
        />
        <ni-input caption="Code porte" v-model="customer.contact.doorCode" @focus="saveTmp('contact.doorCode')" @blur="updateUser({ alenvi: 'contact.doorCode', ogust: 'door_code' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Souscriptions</p>
      <q-card>
        <q-table :data="subscriptions" :columns="subscriptionsColumns" row-key="name" table-style="font-size: 1rem" hide-bottom class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round small color="grey" icon="history" @click.native="showHistory(col.value)" />
                  <q-btn flat round small color="grey" icon="edit" @click.native="startEdition(col.value)" />
                  <q-btn flat round small color="grey" icon="delete" @click.native="removeSubscriptions(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn :disable="serviceOptions.length === 0" flat no-caps color="primary" icon="add" label="Ajouter une souscription" @click="subscriptionCreationModal = true"/>
        </q-card-actions>
      </q-card>
      <div v-if="subscriptions && subscriptions.length > 0" class="row">
          <div class="col-xs-12">
            <q-checkbox v-model="customer.subscriptionsAccepted" disable class="q-mr-sm" />
            <span style="vertical-align: middle">Validation en ligne des souscriptions<span class="text-weight-thin text-italic"> {{ acceptedByHelper }}</span></span>
          </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <q-card>
        <q-table :data="userHelpers" :columns="helpersColumns" row-key="name" table-style="font-size: 1rem" hide-bottom class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round small color="grey" icon="delete" @click.native="removeHelper(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un aidant" @click="addHelper = true" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input caption="Nom associé au compte bancaire" :error="$v.customer.payment.bankAccountOwner.$error" errorLabel="Champ requis"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')" @blur="updateUser({ alenvi: 'payment.bankAccountOwner', ogust: 'holder' })" />
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" errorLabel="IBAN non valide"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateUser({ alenvi: 'payment.iban', ogust: 'iban_number' })" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" errorLabel="BIC non valide"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateUser({ alenvi: 'payment.bic', ogust: 'bic_number' })" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mandats de prélèvement</p>
      </div>
      <q-card>
        <q-table :columns="mandateColumns" :data="customer.payment.mandates" hide-bottom :pagination.sync="pagination" :visible-columns="visibleMandateColumns"
          binary-state-sort class="table-responsive mandate-table">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'emptyMandate'">
                <q-btn v-if="customer.payment.mandates && props.row.__index == 0" flat round small color="primary" @click="downloadMandate(props.row)">
                  <q-icon name="file download" />
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else-if="col.name === 'signedMandate'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-between uploader-responsive">
                  <q-uploader :ref="`signedMandate_${props.row._id}`" name="signedMandate" :url="docsUploadUrl" :headers="headers" hide-underline
                    extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" hide-upload-button @add="uploadDocument($event, `signedMandate_${props.row._id}`)"
                    @uploaded="refreshMandates" @fail="failMsg" :additional-fields="[
                      { name: 'mandateId', value: props.row._id },
                      { name: 'fileName', value: `mandat_signe_${customer.identity.firstname}_${customer.identity.lastname}` }
                    ]"
                  />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedAt'">
                <ni-datetime-picker v-model="customer.payment.mandates[props.row.__index].signedAt" withBorders @blur="updateSignedAt(props.row)"
                  @focus="saveTmpSignedAt(props.row.__index)" inModal class="datetime" />
              </template>
              <template v-else>{{ col.value}}</template>
            </q-td>
          </q-tr>
        </q-table>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <q-card>
        <q-table :data="fundings" :columns="fundingColumns" :visible-columns="fundingVisibleColumns" :rows-per-page-options="[0]" row-key="name" table-style="font-size: 1rem" hide-bottom class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round small color="grey" icon="remove_red_eye" @click.native="showFundingDetails(col.value)" />
                  <q-btn flat round small color="grey" icon="history" @click.native="showFundingHistory(col.value)" />
                  <q-btn flat round small color="grey" icon="edit" @click.native="startFundingEdition(col.value)" />
                  <q-btn flat round small color="grey" icon="delete" @click.native="removeFunding(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn :disable="fundingServicesOptions().length === 0" flat no-caps color="primary" icon="add" label="Ajouter un financement" @click="fundingCreationModal = true"/>
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-lg">
      <p class="text-weight-bold">Justificatifs APA ou autres financements</p>
      <ni-multiple-files-uploader path="financialCertificates" alt="justificatif financement" @uploaded="documentUploaded" name="financialCertificates"
        collapsibleLabel="Ajouter un justificatif" :userProfile="customerUploadData" :url="docsUploadUrl" @delete="deleteDocument($event)"
        additionalFieldsName="financialCertificate" />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <q-table :data="customer.quotes" :columns="quoteColumns" row-key="name" table-style="font-size: 1rem" hide-bottom :pagination.sync="pagination"
          :visible-columns="visibleQuoteColumns" binary-state-sort class="table-responsive" >
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'emptyQuote'">
                <q-btn flat round small color="primary" @click="downloadQuote(props.row)">
                  <q-icon name="file download" />
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedQuote'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-between uploader-responsive">
                  <q-uploader :ref="`signedQuote_${props.row._id}`" name="signedQuote" hide-underline :url="docsUploadUrl" :headers="headers"
                    extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" hide-upload-button @add="uploadDocument($event, `signedQuote_${props.row._id}`)"
                    @uploaded="refreshQuotes" @fail="failMsg" :additional-fields="[
                      { name: 'quoteId', value: props.row._id },
                      { name: 'fileName', value: `devis_signe_${customer.identity.firstname}_${customer.identity.lastname}` }
                    ]"
                  />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download>
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else->{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn :disabled="this.subscriptions.length === 0" flat no-caps color="primary" icon="add" label="Générer un devis" @click="generateQuote"/>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add helper modal -->
    <q-modal v-model="addHelper" @hide="resetHelperForm" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter une <span class="text-weight-bold">personne</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="addHelper = false" /></span>
          </div>
        </div>
        <ni-modal-input v-model="newHelper.lastname" :error="$v.newHelper.lastname.$error" caption="Nom" @blur="$v.newHelper.lastname.$touch" />
        <ni-modal-input v-model="newHelper.firstname" caption="Prénom" />
        <ni-modal-input v-model="newHelper.local.email" last :error="$v.newHelper.local.email.$error" caption="Email"
          @blur="$v.newHelper.local.email.$touch" :errorLabel="emailError" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary" :loading="loading" @click="submitHelper" />
    </q-modal>

    <!-- Subscription creation modal -->
    <q-modal v-model="subscriptionCreationModal" @hide="resetCreationSubscriptionData" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter une <span class="text-weight-bold">souscription</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="subscriptionCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Service" :options="serviceOptions" v-model="newSubscription.service" :error="$v.newSubscription.service.$error"
          @blur="$v.newSubscription.service.$touch" @input="updateNewSubscription"
        />
        <ni-modal-input v-model="newSubscription.unitTTCRate" :error="$v.newSubscription.unitTTCRate.$error" caption="Prix unitaire TTC"
          @blur="$v.newSubscription.unitTTCRate.$touch" type="number"
        />
        <ni-modal-input v-model="newSubscription.estimatedWeeklyVolume" :error="$v.newSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.newSubscription.estimatedWeeklyVolume.$touch" type="number"
        />
        <ni-modal-input v-if="newSubscription.nature !== 'Forfaitaire'" v-model="newSubscription.sundays" caption="Dont dimanche (h)" type="number" />
        <ni-modal-input v-if="newSubscription.nature !== 'Forfaitaire'" v-model="newSubscription.evenings" caption="Dont soirée (h)" last type="number" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary" :loading="loading"
        @click="submitSubscription" />
    </q-modal>

    <!-- Subscription edition modal -->
    <q-modal v-model="subscriptionEditionModal" content-classes="modal-container-sm" @hide="resetEditionSubscriptionData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer la <span class="text-weight-bold">souscription</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="subscriptionEditionModal = false" /></span>
          </div>
        </div>
        <ni-datetime-picker v-model="editedSubscription.startDate" :error="$v.editedSubscription.startDate.$error" caption="Dated'effet"
          @blur="$v.editedSubscription.startDate.$touch" :min="minStartDate" inModal />
        <ni-modal-input v-model="editedSubscription.unitTTCRate" :error="$v.editedSubscription.unitTTCRate.$error" caption="Prix unitaire TTC"
          @blur="$v.editedSubscription.unitTTCRate.$touch" type="number" />
        <ni-modal-input v-model="editedSubscription.estimatedWeeklyVolume" :error="$v.editedSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.editedSubscription.estimatedWeeklyVolume.$touch" type="number" />
        <ni-modal-input v-if="editedSubscription.nature !== 'Forfaitaire'" v-model="editedSubscription.sundays" caption="Dont dimanche (h)" type="number" />
        <ni-modal-input v-if="editedSubscription.nature !== 'Forfaitaire'" v-model="editedSubscription.evenings" caption="Dont soirée (h)" last type="number" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer la souscription" icon-right="add" color="primary" :loading="loading" @click="updateSubscription" />
    </q-modal>

    <!-- Subscription history modal -->
    <q-modal v-model="subscriptionHistoryModal" content-classes="modal-container-sm" @hide="resetSubscriptionHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique de la souscription <span class="text-weight-bold">{{selectedSubscription.service && selectedSubscription.service.name}}</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="subscriptionHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-responsive" :data="selectedSubscription.versions" :columns="subscriptionHistoryColumns" hide-bottom binary-state-sort
          :pagination.sync="paginationHistory">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'startDate'"> {{ $moment(col.value).format('DD/MM/YYYY') }} </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding details modal -->
    <q-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingDetailsModal" content-classes="modal-container-sm" @hide="resetFundingDetailsData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Détail du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="fundingDetailsModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-grid" :data="fundingDetailsData" :columns="fundingColumns" hide-bottom binary-state-sort
           :visible-columns="fundingDetailsVisibleColumns" :rows-per-page-options="[0]">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding history modal -->
    <q-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingHistoryModal" content-classes="modal-container-sm" @hide="resetFundingHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span>
              <q-icon name="clear" size="1rem" @click.native="fundingHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-grid" :data="selectedFunding.versions" :columns="fundingColumns" hide-bottom binary-state-sort
          :pagination.sync="paginationFundingHistory" :visible-columns="fundingHistoryVisibleColumns">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'effectiveDate'">{{ $moment(col.value).format('DD/MM/YYYY') }}</template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding creation modal -->
    <q-modal v-model="fundingCreationModal" @hide="resetCreationFundingData" @show="checkAll" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Ajouter un <span class="text-weight-bold">financement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="fundingCreationModal = false" /></span>
          </div>
        </div>
        <ni-modal-select caption="Tiers payeur" :options="fundingTppOptions" v-model="newFunding.thirdPartyPayer" :error="$v.newFunding.thirdPartyPayer.$error"
          @blur="$v.newFunding.thirdPartyPayer.$touch" requiredField />
        <ni-modal-input v-model="newFunding.folderNumber" caption="Numéro de dossier" />
        <ni-option-group v-model="newFunding.services" :options="fundingServicesOptions()" caption="Souscriptions" type="checkbox"
          @blur="$v.newFunding.services.$touch" :error="$v.newFunding.services.$error" requiredField />
        <ni-datetime-picker v-model="newFunding.startDate" caption="Date de début de prise en charge" :min="fundingMinStartDate" inModal />
        <ni-modal-select caption="Fréquence" :options="fundingFreqOptions" v-model="newFunding.frequency" />
        <ni-datetime-picker v-model="newFunding.endDate" caption="Fin de prise en charge"
          :min="$moment(this.newFunding.startDate).add(1, 'day').toISOString()" inModal />
        <ni-modal-select caption="Nature" :options="fundingNatureOptions" v-model="newFunding.nature" inModal
          @blur="$v.newFunding.nature.$touch" :error="$v.newFunding.nature.$error" requiredField />
        <ni-modal-input v-if="!isOneTimeFundingNature" v-model="newFunding.unitTTCRate" caption="Prix unitaire TTC" type="number" />
        <ni-modal-input v-if="isOneTimeFundingNature" v-model="newFunding.amountTTC" caption="Montant forfaitaire TTC" type="number" />
        <ni-modal-input v-if="!isOneTimeFundingNature" v-model="newFunding.careHours" caption="Nb. heures prises en charge" type="number" suffix="h" />
        <ni-modal-input v-model="newFunding.customerParticipationRate" caption="Taux de participation du bénéficiaire" type="number" suffix="%" />
        <ni-option-group v-model="newFunding.careDays" :options="daysOptions" caption="Jours pris en charge" type="checkbox" inline />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un financement" icon-right="add" color="primary" :loading="loading"
        @click="submitFunding" />
    </q-modal>

    <!-- Funding edition modal -->
    <q-modal v-if="Object.keys(editedFunding).length > 0" v-model="fundingEditionModal" @hide="resetEditionFundingData" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-8">
            <h5>Modifier le <span class="text-weight-bold">financement</span></h5>
          </div>
          <div class="col-1 cursor-pointer" style="text-align: right">
            <span><q-icon name="clear" size="1rem" @click.native="fundingEditionModal = false" /></span>
          </div>
        </div>
        <ni-option-group v-model="editedFunding.services" :options="fundingServicesOptions(editedFunding._id)" caption="Souscriptions" type="checkbox"
          @blur="$v.editedFunding.services.$touch" :error="$v.editedFunding.services.$error" requiredField />
        <ni-modal-select caption="Fréquence" :options="fundingFreqOptions" v-model="editedFunding.frequency" />
        <ni-datetime-picker v-model="editedFunding.endDate" caption="Fin de prise en charge" :min="editedFundingMinEffectiveDate" inModal />
        <ni-modal-input v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.unitTTCRate" caption="Prix unitaire TTC" type="number" />
        <ni-modal-input v-if="isOneTimeEditedFundingNature" v-model="editedFunding.amountTTC" caption="Montant forfaitaire TTC" type="number" />
        <ni-modal-input v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.careHours" caption="Nb. heures prises en charge" type="number" suffix="h" />
        <ni-modal-input v-model="editedFunding.customerParticipationRate" caption="Taux de participation du bénéficiaire" type="number" suffix="%" />
        <ni-option-group v-model="editedFunding.careDays" :options="daysOptions" caption="Jours pris en charge" type="checkbox" inline />
        <ni-datetime-picker v-model="editedFunding.effectiveDate" caption="Date d'effet" :max="editedFundingMaxEffectiveDate" :min="editedFundingMinEffectiveDate" inModal
          @blur="$v.editedFunding.effectiveDate.$touch" :error="$v.editedFunding.effectiveDate.$error" class="last" requiredField />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Modifier le financement" icon-right="add" color="primary" :loading="loading"
        @click="editFunding" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required, email } from 'vuelidate/lib/validators';
import randomize from 'randomatic';

import { extend, clear } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import SearchAddress from '../form/SearchAddress';
import Input from '../form/Input.vue';
import NiModalInput from '../form/ModalInput';
import NiModalSelect from '../form/ModalSelect';
import NiOptionGroup from '../form/OptionGroup';
import MultipleFilesUploader from '../form/MultipleFilesUploader.vue';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';
import DatetimePicker from '../form/DatetimePicker';
import { downloadDocxFile } from '../../helpers/downloadFile';
import { customerMixin } from '../../mixins/customerMixin.js';
import { subscriptionMixin } from '../../mixins/subscriptionMixin.js';
import { days } from '../../data/days.js';
import { FUNDING_FREQ_OPTIONS, FUNDING_NATURE_OPTIONS, ONCE, FIXED, HOURLY } from '../../data/constants.js';
import { financialCertificatesMixin } from '../../mixins/financialCertificatesMixin.js';
import { fundingMixin } from '../../mixins/fundingMixin.js';

export default {
  name: 'ProfileInfo',
  components: {
    NiSearchAddress: SearchAddress,
    NiInput: Input,
    NiModalInput,
    NiModalSelect,
    'ni-datetime-picker': DatetimePicker,
    NiOptionGroup,
    'ni-multiple-files-uploader': MultipleFilesUploader,
  },
  mixins: [customerMixin, subscriptionMixin, financialCertificatesMixin, fundingMixin],
  data () {
    return {
      days,
      loading: false,
      addHelper: false,
      subscriptionCreationModal: false,
      subscriptionEditionModal: false,
      isLoaded: false,
      tmpInput: '',
      customer: {
        identity: {},
        contact: {
          address: {}
        },
        payment: {
          mandates: [],
        },
        subscriptions: [],
        quotes: [],
        financialCertificates: [],
      },
      subscriptions: [],
      selectedSubscription: [],
      helpersColumns: [
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: 'lastname'
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: 'firstname'
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => row.local ? row.local.email : '',
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        }
      ],
      quoteColumns: [
        {
          name: 'quoteNumber',
          label: 'Numéro du devis',
          align: 'left',
          field: 'quoteNumber',
        },
        {
          name: 'emptyQuote',
          label: 'Devis',
          align: 'center',
          field: 'emptyQuote',
        },
        {
          name: 'signedQuote',
          label: 'Devis signé',
          align: 'center',
          field: 'signedQuote',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'center',
          field: row => row.drive && row.drive.id,
        },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      userHelpers: [],
      newHelper: {
        lastname: '',
        firstname: '',
        local: { email: '' }
      },
      newSubscription: {
        service: '',
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      },
      editedSubscription: {},
      visibleMandateColumns: ['rum', 'emptyMandate', 'signedMandate', 'signed', 'signedAt'],
      visibleQuoteColumns: ['quoteNumber', 'emptyQuote', 'signedQuote', 'signed'],
      mandateColumns: [
        {
          name: 'rum',
          label: 'RUM',
          align: 'left',
          field: 'rum',
        },
        {
          name: 'emptyMandate',
          label: 'Mandat',
          align: 'center',
          field: 'emptyMandate',
        },
        {
          name: 'signedMandate',
          label: 'Mandat signé',
          align: 'center',
          field: 'signedMandate',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'center',
          field: 'signedAt',
        },
        {
          name: 'signedAt',
          label: 'Date de signature',
          align: 'left',
          field: 'signedAt',
        },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      fundingVisibleColumns: ['thirdPartyPayer', 'folderNumber', 'nature', 'startDate', 'endDate', 'actions'],
      fundingHistoryModal: false,
      paginationFundingHistory: {
        rowsPerPage: 0,
        sortBy: 'effectiveDate',
        descending: true,
      },
      newFunding: {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: '',
        endDate: '',
        nature: '',
        amountTTC: '',
        unitTTCRate: '',
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        services: []
      },
      fundingFreqOptions: FUNDING_FREQ_OPTIONS,
      fundingNatureOptions: FUNDING_NATURE_OPTIONS,
      fundingCreationModal: false,
      fundingEditionModal: false,
      fundingDetailsModal: false,
      fundingDetailsData: [],
      editedFunding: {},
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
    }
  },
  computed: {
    docsUploadUrl () {
      if (!this.customer.driveFolder) return '';

      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.id}/upload`;
    },
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    company () {
      return this.$store.getters['main/company'];
    },
    serviceOptions () {
      if (!this.company.customersConfig || !this.company.customersConfig.services) return [];

      const subscribedServices = this.subscriptions.map(subscription => subscription.service._id);
      const availableServices = this.company.customersConfig.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: this.getServiceLastVersion(service).name,
        value: service._id,
      }));
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    addressError () {
      if (!this.$v.customer.contact.address.fullAddress.required) {
        return 'Champ requis';
      }
      return 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) {
        return 'Champ requis';
      } else if (!this.$v.customer.payment.iban.iban) {
        return 'IBAN non valide';
      }
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) {
        return 'Champ requis';
      } else if (!this.$v.customer.payment.bic.bic) {
        return 'BIC non valide';
      }
    },
    emailError () {
      if (!this.$v.newHelper.local.email.required) {
        return 'Champ requis';
      } else if (!this.$v.newHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
    },
    minStartDate () {
      const selectedSubscription = this.subscriptions.find(sub => sub._id === this.editedSubscription._id);
      return selectedSubscription ? this.$moment(selectedSubscription.startDate).add(1, 'd').toISOString() : '';
    },
    fundingHistoryVisibleColumns () {
      if (this.selectedFunding.nature === 'fixed') {
        return ['effectiveDate', 'endDate', 'frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'services'];
      }
      return ['effectiveDate', 'endDate', 'frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'services'];
    },
    fundingDetailsVisibleColumns () {
      if (this.selectedFunding.nature === 'fixed') {
        return ['frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'services'];
      }
      return ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'services'];
    },
    fundingTppOptions () {
      if (!this.company.customersConfig || !this.company.customersConfig.thirdPartyPayers) return [];

      return this.company.customersConfig.thirdPartyPayers.map(tpp => ({
        label: tpp.name,
        value: tpp._id,
      }));
    },
    isOneTimeFundingFrequency () {
      return this.newFunding.frequency === ONCE;
    },
    isOneTimeFundingNature () {
      return this.newFunding.nature === FIXED;
    },
    isOneTimeEditedFundingFrequency () {
      return this.editedFunding.frequency === ONCE;
    },
    isOneTimeEditedFundingNature () {
      return this.editedFunding.nature === FIXED;
    },
    daysOptions () {
      return days.map((day, i) => ({
        label: day !== 'Jours fériés' ? day.slice(0, 2) : day,
        value: i
      }));
    },
    fundingMinStartDate () {
      if (this.newFunding.services.length > 0) {
        const latestFunding = this.fundings
          .filter(funding => funding.services.some(sub => this.newFunding.services.includes(sub._id)))
          .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
        return latestFunding && latestFunding.endDate ? this.$moment(latestFunding.endDate).add(1, 'day').toISOString() : '';
      }
    },
    editedFundingMinEffectiveDate () {
      if (Object.keys(this.editedFunding).length > 0 && this.editedFunding.services.length > 0) {
        const latestFunding = this.fundings
          .filter(funding => funding.services.some(sub => this.editedFunding.services.includes(sub._id)))
          .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))[0];
        return latestFunding && latestFunding.endDate ? this.$moment(latestFunding.endDate).add(1, 'day').toISOString() : this.$moment(latestFunding.effectiveDate).add(1, 'day').toISOString();
      }
    },
    editedFundingMaxEffectiveDate () {
      if (this.editedFunding && this.editedFunding.endDate) {
        return this.$moment(this.editedFunding.endDate).subtract(1, 'day').toISOString();
      }
      return '';
    }
  },
  validations: {
    customer: {
      identity: {
        lastname: { required }
      },
      contact: {
        phone: { frPhoneNumber },
        address: {
          fullAddress: { required, frAddress }
        }
      },
      payment: {
        bankAccountOwner: { required },
        bic: { required, bic },
        iban: { required, iban }
      }
    },
    newHelper: {
      lastname: { required },
      local: {
        email: { required, email }
      }
    },
    newSubscription: {
      service: { required },
      unitTTCRate: { required },
      estimatedWeeklyVolume: { required },
    },
    editedSubscription: {
      startDate: { required },
      unitTTCRate: { required },
      estimatedWeeklyVolume: { required },
    },
    newFunding: {
      thirdPartyPayer: { required },
      services: { required },
      nature: { required }
    },
    editedFunding: {
      effectiveDate: { required },
      services: { required }
    }
  },
  watch: {
    userProfile (value) {
      if (!this.$_.isEqual(value, this.customer)) {
        this.mergeUser(value);
      }
    }
  },
  async mounted () {
    await this.getUserHelpers();
    await this.refreshCustomer();
    this.isLoaded = true;
  },
  methods: {
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    },
    mergeUser (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
    },
    selectedAddress (item) {
      this.customer.contact.address = Object.assign({}, this.customer.contact.address, item);
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path)
    },
    saveTmpSignedAt (index) {
      this.tmpInput = this.customer.payment.mandates[index].signedAt;
    },
    // Refresh data
    async getUserHelpers () {
      try {
        this.userHelpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        console.error(e);
      }
    },
    async refreshMandates () {
      try {
        this.customer.payment.mandates = await this.$customers.getMandates(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshQuotes () {
      try {
        this.customer.quotes = await this.$customers.getQuotes(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshCustomer () {
      const customerRaw = await this.$customers.getById(this.userProfile._id);
      const customer = customerRaw.data.data.customer;
      this.mergeUser(customer);
      await this.refreshSubscriptions();
      await this.refreshFundings();

      this.$store.commit('rh/saveUserProfile', this.customer);
      this.$v.customer.$touch();
    },
    // Customer
    async updateUser (paths) {
      try {
        if (this.tmpInput === this.$_.get(this.customer, paths.alenvi)) return;
        if (this.$_.get(this.$v.customer, paths.alenvi)) {
          const isValid = await this.waitForValidation(paths.alenvi);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        if (paths.alenvi) await this.updateAlenviCustomer(paths.alenvi);
        if (paths.ogust) await this.updateOgustCustomer(paths);

        NotifyPositive('Modification enregistrée');
        if (paths.alenvi.match(/iban/i)) this.refreshCustomer();

        this.$store.commit('rh/saveUserProfile', this.customer);
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    async updateAlenviCustomer (path) {
      let value = this.$_.get(this.customer, path);
      if (path.match(/iban/i)) value = value.split(' ').join('');

      const payload = this.$_.set({}, path, value);
      payload._id = this.userProfile._id;
      await this.$customers.updateById(payload);
    },
    async updateOgustCustomer (paths) {
      let value = this.$_.get(this.customer, paths.alenvi);
      if (paths.ogust.match(/date_of_birth/i)) value = this.$moment(value).format('YYYYMMDD');
      if (paths.ogust.match(/iban_number/i)) value = value.split(' ').join('');

      const payload = this.$_.set({}, paths.ogust, value);
      if (paths.ogust.match(/((iban|bic)_number)|holder/i)) {
        if (this.customer.payment && this.customer.payment.bankAccountOwner && this.customer.payment.iban && this.customer.payment.bic) {
          payload.bic_number = this.customer.payment.bic;
          payload.iban_number = this.customer.payment.iban;
          payload.id_tiers = this.userProfile.customerId;
          await this.$ogust.setBankInfo(payload);
        }
      } else if (paths.ogust === 'address') {
        const { street, zipCode, city } = payload.address;
        const addressPayload = {
          line: street,
          zip: zipCode,
          city,
          id_address: this.userProfile.contact.ogustAddressId
        }
        await this.$ogust.setAddress(addressPayload);
      } else {
        await this.$ogust.editOgustCustomer(this.userProfile.customerId, payload);
      }
    },
    waitForValidation (path) {
      return new Promise((resolve) => {
        if (path === 'contact.address') {
          const unwatch = this.$watch(() => !this.$v.customer.contact.address.$pending, (notPending) => {
            if (notPending) {
              if (unwatch) {
                unwatch();
              }
              resolve(!this.$v.customer.contact.address.$error);
            }
          }, { immediate: true });
        } else {
          this.$_.get(this.$v.customer, path).$touch();
          resolve(!this.$_.get(this.$v.customer, path).$error);
        }
      })
    },
    // Subscriptions
    formatCreatedSubscription () {
      const { service, unitTTCRate, estimatedWeeklyVolume, sundays, evenings } = this.newSubscription;
      const formattedService = { service, versions: [{ unitTTCRate, estimatedWeeklyVolume }] }

      if (sundays) formattedService.versions[0].sundays = sundays;
      if (evenings) formattedService.versions[0].evenings = evenings;

      return formattedService;
    },
    resetCreationSubscriptionData () {
      this.$v.newSubscription.$reset();
      this.newSubscription = {
        service: '',
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      };
    },
    updateNewSubscription () {
      if (this.newSubscription.service !== '') {
        const selectedService = this.company.customersConfig.services.find(service => service._id === this.newSubscription.service);
        this.newSubscription.unitTTCRate = selectedService.defaultUnitAmount;
        this.newSubscription.nature = selectedService.nature;
      }
    },
    async submitSubscription () {
      try {
        this.$v.newSubscription.$touch();
        if (this.$v.newSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedSubscription();
        await this.$customers.addSubscription(this.customer._id, payload);
        this.resetCreationSubscriptionData();
        await this.refreshCustomer();
        this.subscriptionCreationModal = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'un souscription");
      } finally {
        this.loading = false;
      }
    },
    startEdition (id) {
      const selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      const { _id, service, unitTTCRate, estimatedWeeklyVolume, evenings, sundays } = selectedSubscription;
      this.editedSubscription = {
        _id,
        nature: service.nature,
        unitTTCRate,
        estimatedWeeklyVolume,
        evenings,
        sundays,
        startDate: '',
      };

      this.subscriptionEditionModal = true;
    },
    resetEditionSubscriptionData () {
      this.subscriptionEditionModal = false;
      this.editedSubscription = {};
      this.$v.editedSubscription.$reset();
    },
    async updateSubscription () {
      try {
        this.$v.editedSubscription.$touch();
        if (this.$v.editedSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const subscriptionId = this.editedSubscription._id;
        const payload = this.$_.pickBy(this.editedSubscription);
        delete payload._id;
        delete payload.nature;
        await this.$customers.updateSubscription({ _id: this.customer._id, subscriptionId }, payload);
        this.resetEditionSubscriptionData();
        this.refreshCustomer();
        NotifyPositive('Souscription modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification d'un souscription")
      } finally {
        this.loading = false;
      }
    },
    async removeSubscriptions (subscriptionId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cette souscription ?',
          ok: true,
          cancel: 'Annuler'
        });

        const params = { subscriptionId, _id: this.customer._id };
        await this.$customers.removeSubscription(params);
        await this.refreshCustomer();
        NotifyPositive('Souscription supprimée');
      } catch (e) {
        console.error(e);
      }
    },
    // Helpers
    resetHelperForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
    },
    async createOgustHelper () {
      const payload = {
        id_customer: this.userProfile.customerId.toString(),
        last_name: this.newHelper.lastname,
        first_name: this.newHelper.firstname,
        email: this.newHelper.local.email
      };
      const newHelper = await this.$ogust.createContact(this.$_.pickBy(payload));
      return newHelper;
    },
    async createAlenviHelper () {
      this.newHelper.local.password = randomize('0', 6);
      this.newHelper.customers = [this.userProfile._id];
      this.newHelper.role = 'Aidants';
      this.newHelper.company = this.company.name;
      const payload = this.$_.pickBy(this.newHelper)
      await this.$users.create(payload);
    },
    async sendWelcomingEmail () {
      await this.$email.sendWelcome({
        sender: { email: 'support@alenvi.io' },
        receiver: {
          email: this.newHelper.local.email,
          password: this.newHelper.local.password
        }
      });
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) throw new Error('Invalid fields');

        const newHelper = await this.createOgustHelper();
        this.newHelper.ogustInterlocId = newHelper.data.data.contact.id_interloc;
        await this.createAlenviHelper();
        NotifyPositive('Aidant créé');
        await this.sendWelcomingEmail();
        NotifyPositive('Email envoyé');
        await this.getUserHelpers();
        this.addHelper = false
      } catch (e) {
        console.error(e);
        if (e && e.message === 'Invalid fields') return NotifyWarning('Champ(s) invalide(s)');
        if (e && e.response && e.response.status === 409) return NotifyNegative('Cet email est déjà utilisé par un compte existant');
        NotifyNegative('Erreur lors de la création de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
    async removeHelper (helperId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cet aidant ?',
          ok: true,
          cancel: 'Annuler'
        });
        const helper = this.userHelpers.find(helper => helper._id === helperId);
        const { ogustInterlocId } = helper;
        await this.$ogust.deleteContact(ogustInterlocId);
        await this.$users.deleteById(helperId);
        NotifyPositive('Aidant supprimé');
        await this.getUserHelpers();
      } catch (e) {
        console.error(e);
      }
    },
    // Mandates
    async updateSignedAt (mandate) {
      try {
        if (!mandate.signedAt || this.tmpInput === mandate.signedAt) return;
        const params = {
          _id: this.customer._id,
          mandateId: mandate._id,
        };
        await this.$customers.updateMandate(params, mandate);
        this.refreshMandates();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      }
    },
    async downloadMandate (doc) {
      try {
        const data = {
          bankAccountOwner: this.customer.payment.bankAccountOwner || '',
          customerAddress: this.customer.contact.address.fullAddress,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
          ics: this.company.ics,
          rum: doc.rum,
          bic: this.customer.payment.bic || '',
          iban: this.customer.payment.iban || '',
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
        };
        const params = { driveId: this.company.customersConfig.templates.debitMandate.driveId };

        await downloadDocxFile(params, data, 'mandat.docx');
        NotifyPositive('Mandat téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du mandat.');
      }
    },
    // Documents
    async uploadDocument (files, refName) {
      if (files[0].size > 5000000) {
        this.$refs[refName].reset();
        return NotifyNegative('Fichier trop volumineux (> 5 Mo)');
      } else {
        this.$refs[refName].upload();
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    // Quotes
    async downloadQuote (doc) {
      try {
        const subscriptions = this.subscriptions.map(subscription => {
          let estimatedWeeklyRate = this.computeWeeklyRate(subscription);

          return {
            serviceName: subscription.service.name,
            serviceNature: subscription.service.nature,
            unitTTCRate: subscription.unitTTCRate ? `${this.formatNumber(subscription.unitTTCRate)}€` : '',
            weeklyVolume: subscription.estimatedWeeklyVolume,
            sundays: subscription.sundays || '',
            evenings: subscription.evenings || '',
            weeklyRate: estimatedWeeklyRate ? `${this.formatNumber(estimatedWeeklyRate)}€` : '',
          }
        });

        const data = {
          quoteNumber: doc.quoteNumber,
          customerFirstname: this.customer.identity.firstname,
          customerLastname: this.customer.identity.lastname,
          customerAddress: this.customer.contact.address.fullAddress,
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
          rcs: this.company.rcs,
          subscriptions,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
        }
        const params = { driveId: this.company.customersConfig.templates.quote.driveId };
        await downloadDocxFile(params, data, 'devis.docx');
        NotifyPositive('Devis téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du devis.');
      }
    },
    async generateQuote () {
      try {
        const subscriptions = this.subscriptions.map(subscription => ({
          serviceName: subscription.service.name,
          unitTTCRate: subscription.unitTTCRate,
          estimatedWeeklyVolume: subscription.estimatedWeeklyVolume,
          sundays: subscription.sundays,
          evenings: subscription.evenings,
        }));
        const payload = { subscriptions };
        await this.$customers.addQuote(this.customer._id, payload);
        await this.refreshQuotes();
        NotifyPositive('Devis généré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la génération du devis');
      }
    },
    // Fundings
    fundingServicesOptions (fundingId = null) {
      let fundingServices = this.fundings.map(funding => ({ ...funding, services: funding.services.map(service => service._id) }));
      if (fundingId) {
        fundingServices = fundingServices.filter(funding => funding._id !== fundingId);
      }
      return this.subscriptions
        .filter(sub => !fundingServices.some(funding => funding.services.includes(sub.service._id) && !funding.endDate))
        .map(sub => ({
          label: sub.service.name,
          value: sub.service._id,
        }));
    },
    showFundingHistory (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingHistoryModal = true;
    },
    resetFundingHistoryData () {
      this.fundingHistoryModal = false;
      this.selectedFunding = {};
    },
    resetCreationFundingData () {
      this.$v.newFunding.$reset();
      this.newFunding = {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: '',
        endDate: '',
        nature: '',
        amountTTC: '',
        unitTTCRate: '',
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        services: []
      };
    },
    formatCreatedFunding () {
      const cleanPayload = this.$_.pickBy(this.newFunding);
      const { nature, thirdPartyPayer, startDate, folderNumber, ...version } = cleanPayload;
      return {
        nature,
        thirdPartyPayer,
        startDate,
        folderNumber,
        versions: [{...version}]
      };
    },
    async submitFunding () {
      try {
        this.$v.newFunding.$touch();
        if (this.$v.newFunding.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedFunding();
        await this.$customers.addFunding(this.customer._id, payload);
        this.resetCreationFundingData();
        await this.refreshCustomer();
        this.fundingCreationModal = false;
        NotifyPositive('Financement ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'un financement");
      } finally {
        this.loading = false;
      }
    },
    checkAll () {
      this.newFunding.services.push(...this.fundingServicesOptions().map(sub => sub.value));
    },
    async removeFunding (fundingId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce financement ?',
          ok: true,
          cancel: 'Annuler'
        });

        const params = { fundingId, _id: this.customer._id };
        await this.$customers.removeFunding(params);
        await this.refreshCustomer();
        NotifyPositive('Financement supprimé');
      } catch (e) {
        console.error(e);
      }
    },
    showFundingDetails (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingDetailsData.push(this.selectedFunding);
      this.fundingDetailsModal = true;
    },
    resetFundingDetailsData () {
      this.fundingDetailsModal = false;
      this.selectedFunding = {};
      this.fundingDetailsData = []
    },
    startFundingEdition (id) {
      this.editedFunding = Object.assign({}, this.fundings.find(fund => fund._id === id), { effectiveDate: '' });
      this.editedFunding.effectiveDate = '';
      this.editedFunding.services = this.editedFunding.services.map(service => service._id);
      this.fundingEditionModal = true;
    },
    resetEditionFundingData () {
      this.fundingEditionModal = false;
      this.editedFunding = {};
      this.$v.editedFunding.$reset();
    },
    async editFunding () {
      try {
        this.$v.editedFunding.$touch();
        if (this.$v.editedFunding.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const { services, endDate, frequency, amountTTC, unitTTCRate, careHours, careDays, customerParticipationRate, effectiveDate } = this.editedFunding;
        const payload = {
          services,
          frequency,
          careDays,
          customerParticipationRate,
          effectiveDate,
          endDate
        };
        if (this.editedFunding.nature === FIXED) {
          payload.amountTTC = amountTTC;
        }
        if (this.editedFunding.nature === HOURLY) {
          payload.unitTTCRate = unitTTCRate;
          payload.careHours = careHours;
        }
        const cleanPayload = this.$_.pickBy(payload);
        await this.$customers.updateFunding({ _id: this.customer._id, fundingId: this.editedFunding._id }, cleanPayload);
        this.resetEditionFundingData();
        await this.refreshCustomer();
        NotifyPositive('Financement modifié');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de la modification d'un financement");
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~variables';

  .q-card
    background: white
    width: 100%
    margin-bottom: 20px

  .q-checkbox
    font-size: 12px

  /deep/ .q-option-inner
    margin-right: 5px

  /deep/ .q-option.inline > .q-option-inner
    margin-right: 0px

  /deep/ i.q-checkbox-icon
    opacity: 1 !important

  a
    color: $primary
    text-decoration: none

  .mandate-table
    /deep/ .q-table
      margin: 10px 0px
    td
      word-break: break-all

  .inactiveDot
    background: $secondary
</style>
