<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" v-model="customer.identity.firstname" @focus="saveTmp('identity.firstname')"
          @blur="updateCustomer('identity.firstname')" />
        <ni-input caption="Nom" :error="$v.customer.identity.lastname.$error" v-model="customer.identity.lastname"
          @focus="saveTmp('identity.lastname')" @blur="updateCustomer('identity.lastname')" />
        <div class="col-xs-12 col-md-6">
          <ni-datetime-picker v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')"
            caption="Date de naissance" @blur="updateCustomer('identity.birthDate')" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error"
          error-label="Numéro de téléphone non valide" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-search-address v-model="customer.contact.primaryAddress" color="white" inverted-light
          :error-label="addressError" :error="$v.customer.contact.primaryAddress.$error" caption="Addresse principale"
          @focus="saveTmp('contact.primaryAddress.fullAddress')" @blur="updateCustomer('contact.primaryAddress')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Souscriptions</p>
      <q-card>
        <q-table :data="subscriptions" :columns="subscriptionsColumns" row-key="name" table-style="font-size: 1rem"
          hide-bottom class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-btn flat round small color="grey" icon="history" @click="showHistory(col.value)" />
                  <q-btn flat round small color="grey" icon="edit" @click="startSubscriptionEdition(col.value)" />
                  <q-btn flat round small color="grey" icon="delete" :disable="props.row.eventCount > 0"
                    @click="removeSubscriptions(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn :disable="serviceOptions.length === 0" flat no-caps color="primary" icon="add"
            label="Ajouter une souscription" @click="subscriptionCreationModal = true" />
        </q-card-actions>
      </q-card>
      <div v-if="subscriptions && subscriptions.length > 0" class="row">
        <div class="col-xs-12">
          <q-checkbox v-model="customer.subscriptionsAccepted" disable class="q-mr-sm" />
          <span style="vertical-align: middle">
            Validation en ligne des souscriptions
            <span class="text-weight-thin text-italic">
              {{ acceptedByHelper }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <q-card>
        <q-table :data="userHelpers" :columns="helpersColumns" row-key="name" table-style="font-size: 1rem" hide-bottom
          class="table-responsive">
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
        <ni-input caption="Nom associé au compte bancaire" :error="$v.customer.payment.bankAccountOwner.$error"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')"
          @blur="updateCustomer('payment.bankAccountOwner')" />
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" error-label="IBAN non valide"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" error-label="BIC non valide"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mandats de prélèvement</p>
      </div>
      <q-card>
        <q-table :columns="mandateColumns" :data="customer.payment.mandates" hide-bottom :pagination.sync="pagination"
          :visible-columns="visibleMandateColumns" binary-state-sort class="table-responsive mandate-table">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'emptyMandate'">
                <q-btn v-if="customer.payment.mandates && props.row.__index == 0" flat round small color="primary"
                  @click="downloadMandate(props.row)">
                  <q-icon name="file download" />
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else-if="col.name === 'signedMandate'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-center table-actions">
                  <q-uploader :ref="`signedMandate_${props.row._id}`" name="signedMandate" :url="docsUploadUrl"
                    extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf" :headers="headers"
                    hide-underline hide-upload-button @add="uploadDocument($event, `signedMandate_${props.row._id}`)"
                    @uploaded="refreshMandates" @fail="failMsg" :additional-fields="formatAdditionalFields(props.row)" />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedAt'">
                <ni-datetime-picker v-model="customer.payment.mandates[props.row.__index].signedAt" withBorders @blur="updateSignedAt(props.row)"
                  @focus="saveTmpSignedAt(props.row.__index)" in-modal class="datetime" />
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
        <q-table :data="fundings" :columns="fundingColumns" :visible-columns="fundingVisibleColumns"
          :rows-per-page-options="[0]" row-key="name" table-style="font-size: 1rem" hide-bottom class="table-responsive">
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
          <q-btn :disable="fundingSubscriptionsOptions().length === 0" flat no-caps color="primary" icon="add" label="Ajouter un financement"
            @click="openFundingCreationModal" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-lg">
      <p class="text-weight-bold">Justificatifs APA ou autres financements</p>
      <ni-multiple-files-uploader path="financialCertificates" alt="justificatif financement" @uploaded="documentUploaded"
        name="financialCertificates" collapsibleLabel="Ajouter un justificatif" :user-profile="customer" :url="docsUploadUrl"
        @delete="deleteDocument($event)" additional-fields-name="financialCertificate" />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <q-table :data="customer.quotes" :columns="quoteColumns" row-key="name" table-style="font-size: 1rem"
          hide-bottom :pagination.sync="pagination" :visible-columns="visibleQuoteColumns" binary-state-sort class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'emptyQuote'">
                <q-btn flat round small color="primary" @click="downloadQuote(props.row)">
                  <q-icon name="file download" />
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedQuote'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-center table-actions">
                  <q-uploader :ref="`signedQuote_${props.row._id}`" name="signedQuote" hide-underline :url="docsUploadUrl"
                    :headers="headers" extensions="image/jpg, image/jpeg, image/gif, image/png, application/pdf"
                    hide-upload-button @add="uploadDocument($event, `signedQuote_${props.row._id}`)" @uploaded="refreshQuotes"
                    @fail="failMsg" :additional-fields="[
                      { name: 'quoteId', value: props.row._id },
                      { name: 'fileName', value: `devis_signe_${customer.identity.firstname}_${customer.identity.lastname}` }
                    ]" />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download target="_blank">
                    <q-icon name="file download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="end">
          <q-btn :disabled="this.subscriptions.length === 0" flat no-caps color="primary" icon="add" label="Générer un devis"
            @click="generateQuote" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add helper modal -->
    <q-modal v-model="addHelper" @hide="resetHelperForm" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter une <span class="text-weight-bold">personne</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="addHelper = false" /></span>
          </div>
        </div>
        <ni-input in-modal v-model="newHelper.identity.lastname" :error="$v.newHelper.identity.lastname.$error"
          caption="Nom" @blur="$v.newHelper.identity.lastname.$touch" required-field />
        <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-model="newHelper.local.email" last :error="$v.newHelper.local.email.$error" caption="Email"
          @blur="$v.newHelper.local.email.$touch" :error-label="emailError" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary" :loading="loading"
        @click="submitHelper" />
    </q-modal>

    <!-- Subscription creation modal -->
    <q-modal v-model="subscriptionCreationModal" @hide="resetCreationSubscriptionData" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter une <span class="text-weight-bold">souscription</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="subscriptionCreationModal = false" /></span>
          </div>
        </div>
        <ni-select in-modal caption="Service" :options="serviceOptions" v-model="newSubscription.service" :error="$v.newSubscription.service.$error"
          @blur="$v.newSubscription.service.$touch" required-field />
        <ni-input in-modal v-model="newSubscription.unitTTCRate" :error="$v.newSubscription.unitTTCRate.$error" caption="Prix unitaire TTC"
          @blur="$v.newSubscription.unitTTCRate.$touch" type="number" required-field />
        <ni-input in-modal v-model="newSubscription.estimatedWeeklyVolume" :error="$v.newSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.newSubscription.estimatedWeeklyVolume.$touch" type="number"
          required-field />
        <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.sundays" caption="Dont dimanche (h)"
          type="number" />
        <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.evenings" caption="Dont soirée (h)"
          last type="number" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary"
        :loading="loading" @click="submitSubscription" />
    </q-modal>

    <!-- Subscription edition modal -->
    <q-modal v-model="subscriptionEditionModal" content-classes="modal-container-sm" @hide="resetEditionSubscriptionData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Editer la <span class="text-weight-bold">souscription</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="subscriptionEditionModal = false" /></span>
          </div>
        </div>
        <ni-input in-modal v-model="editedSubscription.unitTTCRate" :error="$v.editedSubscription.unitTTCRate.$error"
          caption="Prix unitaire TTC" @blur="$v.editedSubscription.unitTTCRate.$touch" type="number" required-field />
        <ni-input in-modal v-model="editedSubscription.estimatedWeeklyVolume" :error="$v.editedSubscription.estimatedWeeklyVolume.$error"
          caption="Volume hebdomadaire estimatif" @blur="$v.editedSubscription.estimatedWeeklyVolume.$touch" type="number"
          required-field />
        <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.sundays" caption="Dont dimanche (h)"
          type="number" />
        <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.evenings"
          caption="Dont soirée (h)" last type="number" />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Editer la souscription" icon-right="check" color="primary"
        :loading="loading" @click="updateSubscription" />
    </q-modal>

    <!-- Subscription history modal -->
    <q-modal v-model="subscriptionHistoryModal" content-classes="modal-container-sm" @hide="resetSubscriptionHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique de la souscription <span class="text-weight-bold">{{selectedSubscription.service &&
                selectedSubscription.service.name}}</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="subscriptionHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-responsive" :data="selectedSubscription.versions" :columns="subscriptionHistoryColumns"
          hide-bottom binary-state-sort :pagination.sync="paginationHistory">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding details modal -->
    <q-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingDetailsModal" content-classes="modal-container-sm"
      @hide="resetFundingDetailsData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Détail du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="fundingDetailsModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-grid" :data="fundingDetailsData" :columns="fundingColumns" hide-bottom
          binary-state-sort :visible-columns="fundingDetailsVisibleColumns" :rows-per-page-options="[0]">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding history modal -->
    <q-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingHistoryModal" content-classes="modal-container-sm"
      @hide="resetFundingHistoryData">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Historique du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="fundingHistoryModal = false" /></span>
          </div>
        </div>
        <q-table class="q-mb-xl table-grid" :data="selectedFunding.versions" :columns="fundingColumns" hide-bottom
          binary-state-sort :pagination.sync="paginationFundingHistory" :visible-columns="fundingHistoryVisibleColumns">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </q-modal>

    <!-- Funding creation modal -->
    <q-modal v-model="fundingCreationModal" @hide="resetCreationFundingData" content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Ajouter un <span class="text-weight-bold">financement</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="fundingCreationModal = false" /></span>
          </div>
        </div>
        <ni-select in-modal caption="Tiers payeur" :options="fundingTppOptions" v-model="newFunding.thirdPartyPayer"
          :error="$v.newFunding.thirdPartyPayer.$error" @blur="$v.newFunding.thirdPartyPayer.$touch" required-field />
        <ni-select in-modal v-model="newFunding.subscription" :options="fundingSubscriptionsOptions()" caption="Souscription"
          @blur="$v.newFunding.subscription.$touch" :error="$v.newFunding.subscription.$error" required-field />
        <ni-datetime-picker v-model="newFunding.startDate" caption="Date de début de prise en charge"
          in-modal @blur="$v.newFunding.startDate.$touch" :error="$v.newFunding.startDate.$error" required-field />
        <ni-datetime-picker v-model="newFunding.endDate" :min="$moment(newFunding.startDate).add(1, 'day').toISOString()"
          in-modal caption="Date de fin de prise en charge" />
        <ni-input in-modal v-model="newFunding.folderNumber" caption="Numéro de dossier" />
        <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" v-model="newFunding.frequency" @blur="$v.newFunding.frequency.$touch"
          :error="$v.newFunding.frequency.$error" required-field />
        <ni-select in-modal caption="Nature" :options="fundingNatureOptions" v-model="newFunding.nature" :error="$v.newFunding.nature.$error"
          @blur="$v.newFunding.nature.$touch" required-field @input="resetFundingFrequency" />
        <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.unitTTCRate" caption="Prix unitaire TTC"
          type="number" @blur="$v.newFunding.unitTTCRate.$touch" :error="$v.newFunding.unitTTCRate.$error"
          required-field />
        <ni-input in-modal v-if="isOneTimeFundingNature" v-model="newFunding.amountTTC" caption="Montant forfaitaire TTC"
          type="number" @blur="$v.newFunding.amountTTC.$touch" :error="$v.newFunding.amountTTC.$error" required-field />
        <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.careHours" caption="Nb. heures prises en charge"
          type="number" suffix="h" @blur="$v.newFunding.careHours.$touch" :error="$v.newFunding.careHours.$error"
          required-field />
        <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.customerParticipationRate" caption="Taux de participation du bénéficiaire"
          type="number" suffix="%" @blur="$v.newFunding.customerParticipationRate.$touch" :error="$v.newFunding.customerParticipationRate.$error"
          required-field />
        <ni-option-group v-model="newFunding.careDays" :options="daysOptions" caption="Jours pris en charge" type="checkbox"
          inline @blur="$v.newFunding.careDays.$touch" :error="$v.newFunding.careDays.$error" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un financement" icon-right="add" color="primary"
        :loading="loading" @click="submitFunding" />
    </q-modal>

    <!-- Funding edition modal -->
    <q-modal v-if="Object.keys(editedFunding).length > 0" v-model="fundingEditionModal" @hide="resetEditionFundingData"
      content-classes="modal-container-sm">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5>Modifier le <span class="text-weight-bold">financement</span></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" @click.native="fundingEditionModal = false" /></span>
          </div>
        </div>
        <ni-datetime-picker v-model="editedFunding.startDate" caption="Date de début de prise en charge" :max="editedFundingMaxStartDate"
          class="last" in-modal @blur="$v.editedFunding.startDate.$touch" :error="$v.editedFunding.startDate.$error"
          required-field />
        <ni-datetime-picker v-model="editedFunding.endDate" caption="Date de fin de prise en charge" in-modal
          :min="$moment(editedFunding.startDate).add(1, 'day').toISOString()" />
        <ni-input in-modal v-model="editedFunding.folderNumber" caption="Numéro de dossier" />
        <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" v-model="editedFunding.frequency" @blur="$v.editedFunding.frequency.$touch"
          :error="$v.editedFunding.frequency.$error" required-field />
        <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.unitTTCRate" caption="Prix unitaire TTC"
          type="number" @blur="$v.editedFunding.unitTTCRate.$touch" :error="$v.editedFunding.unitTTCRate.$error"
          required-field />
        <ni-input in-modal v-if="isOneTimeEditedFundingNature" v-model="editedFunding.amountTTC" caption="Montant forfaitaire TTC"
          type="number" @blur="$v.editedFunding.amountTTC.$touch" :error="$v.editedFunding.amountTTC.$error"
          required-field />
        <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.careHours" caption="Nb. heures prises en charge"
          type="number" @blur="$v.editedFunding.careHours.$touch" :error="$v.editedFunding.careHours.$error"
          required-field suffix="h" />
        <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.customerParticipationRate" caption="Taux de participation du bénéficiaire"
          type="number" suffix="%" @blur="$v.editedFunding.customerParticipationRate.$touch" :error="$v.editedFunding.customerParticipationRate.$error"
          required-field />
        <ni-option-group v-model="editedFunding.careDays" :options="daysOptions" caption="Jours pris en charge" type="checkbox"
          inline @blur="$v.editedFunding.careDays.$touch" :error="$v.editedFunding.careDays.$error" required-field />
      </div>
      <q-btn no-caps class="full-width modal-btn" label="Modifier le financement" icon-right="check" color="primary"
        :loading="loading" @click="editFunding" />
    </q-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required, email, requiredIf } from 'vuelidate/lib/validators';
import randomize from 'randomatic';

import { extend, clear } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import SearchAddress from '../form/SearchAddress';
import NiInput from '../form/Input';
import NiSelect from '../form/Select';
import NiOptionGroup from '../form/OptionGroup';
import MultipleFilesUploader from '../form/MultipleFilesUploader.vue';
import DatetimePicker from '../form/DatetimePicker';
import { downloadDocxFile } from '../../helpers/downloadFile';
import { customerMixin } from '../../mixins/customerMixin.js';
import { subscriptionMixin } from '../../mixins/subscriptionMixin.js';
import { days } from '../../data/days.js';
import { FUNDING_FREQ_OPTIONS, NATURE_OPTIONS, FIXED, HOURLY, REQUIRED_LABEL, ONCE, HELPER } from '../../data/constants.js';
import { financialCertificatesMixin } from '../../mixins/financialCertificatesMixin.js';
import { fundingMixin } from '../../mixins/fundingMixin.js';
import { validationMixin } from '../../mixins/validationMixin.js';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';

export default {
  name: 'ProfileInfo',
  components: {
    NiSearchAddress: SearchAddress,
    NiInput,
    NiSelect,
    'ni-datetime-picker': DatetimePicker,
    NiOptionGroup,
    'ni-multiple-files-uploader': MultipleFilesUploader,
  },
  mixins: [
    customerMixin,
    subscriptionMixin,
    financialCertificatesMixin,
    fundingMixin,
    validationMixin,
  ],
  data () {
    return {
      FIXED,
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
          primaryAddress: {},
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
      services: [],
      helpersColumns: [
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => row.identity.lastname,
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => row.identity.firstname,
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
        },
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
          field: row => row.drive && row.drive.driveId,
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
        identity: {
          lastname: '',
          firstname: '',
        },
        local: { email: '' },
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
        sortBy: 'createdAt',
        descending: true,
      },
      fundingTppOptions: [],
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
        subscription: '',
      },
      fundingNatureOptions: NATURE_OPTIONS,
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

      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}/upload`;
    },
    headers () {
      return { 'x-access-token': Cookies.get('alenvi_token') || '' };
    },
    company () {
      return this.$store.getters['main/company'];
    },
    serviceOptions () {
      if (!this.services) return [];

      const subscribedServices = this.subscriptions.map(subscription => subscription.service._id);
      const availableServices = this.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: this.getServiceLastVersion(service).name,
        value: { _id: service._id, nature: service.nature },
      }));
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    addressError () {
      if (!this.$v.customer.contact.primaryAddress.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.iban.iban) {
        return 'IBAN non valide';
      }
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.bic.bic) {
        return 'BIC non valide';
      }
    },
    emailError () {
      if (!this.$v.newHelper.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
    },
    fundingHistoryVisibleColumns () {
      if (this.selectedFunding.nature === FIXED) {
        return ['startDate', 'endDate', 'frequency', 'amountTTC', 'customerParticipationRate', 'careDays'];
      }
      return ['startDate', 'endDate', 'frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays'];
    },
    fundingDetailsVisibleColumns () {
      if (this.selectedFunding.nature === FIXED) {
        return ['frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'subscription'];
      }
      return ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];
    },
    isOneTimeFundingNature () {
      return this.newFunding.nature === FIXED;
    },
    isOneTimeEditedFundingNature () {
      return this.editedFunding.nature === FIXED;
    },
    fundingFreqOptions () {
      if ((this.fundingCreationModal && this.newFunding.nature === FIXED) ||
        (this.fundingEditionModal && this.editedFunding.nature === FIXED)) {
        return FUNDING_FREQ_OPTIONS.filter(option => option.value === ONCE);
      }

      return FUNDING_FREQ_OPTIONS;
    },
    daysOptions () {
      return days.map((day, i) => ({
        label: day !== 'Jours fériés' ? day.slice(0, 2) : day,
        value: i,
      }));
    },
    editedFundingMaxStartDate () {
      if (this.editedFunding && this.editedFunding.endDate) {
        return this.$moment(this.editedFunding.endDate).subtract(1, 'day').toISOString();
      }
      return '';
    },
  },
  validations: {
    customer: {
      identity: {
        lastname: { required },
      },
      contact: {
        phone: { frPhoneNumber },
        primaryAddress: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { required, frAddress },
        },
      },
      payment: {
        bankAccountOwner: { required },
        bic: { required, bic },
        iban: { required, iban },
      },
    },
    newHelper: {
      identity: { lastname: { required } },
      local: {
        email: { required, email },
      },
    },
    newSubscription: {
      service: { required },
      unitTTCRate: { required },
      estimatedWeeklyVolume: { required },
    },
    editedSubscription: {
      unitTTCRate: { required },
      estimatedWeeklyVolume: { required },
    },
    newFunding: {
      thirdPartyPayer: { required },
      subscription: { required },
      nature: { required },
      frequency: { required },
      amountTTC: { required: requiredIf((item) => {
        return item.nature === FIXED;
      }) },
      unitTTCRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careHours: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careDays: { required },
      startDate: { required },
      customerParticipationRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
    },
    editedFunding: {
      frequency: { required },
      amountTTC: { required: requiredIf((item) => {
        return item.nature === FIXED;
      }) },
      unitTTCRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careHours: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careDays: { required },
      startDate: { required },
      customerParticipationRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
    },
  },
  watch: {
    userProfile (value) {
      if (!this.$_.isEqual(value, this.customer)) {
        this.mergeUser(value);
      }
    },
  },
  async mounted () {
    await this.getUserHelpers();
    await this.refreshCustomer();
    await this.getServices();
    this.isLoaded = true;
  },
  methods: {
    formatAdditionalFields (row) {
      return [
        { name: 'mandateId', value: row._id },
        {
          name: 'fileName',
          value: `mandat_signe_${this.customer.identity.firstname}_${this.customer.identity.lastname}`,
        },
      ]
    },
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    },
    mergeUser (value = null) {
      const args = [this.customer, value];
      this.customer = Object.assign({}, extend(true, ...args));
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
    async getServices () {
      try {
        this.services = await this.$services.showAll({ company: this.company._id });
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
      const customer = await this.$customers.getById(this.userProfile._id);
      this.mergeUser(customer);
      await this.refreshSubscriptions();
      await this.refreshFundings();

      this.$store.commit('rh/saveUserProfile', this.customer);
      this.$v.customer.$touch();
    },
    // Subscriptions
    formatCreatedSubscription () {
      const { service, unitTTCRate, estimatedWeeklyVolume, sundays, evenings } = this.newSubscription;
      const formattedService = { service: service._id, versions: [{ unitTTCRate, estimatedWeeklyVolume }] }

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
    async submitSubscription () {
      try {
        this.$v.newSubscription.$touch();
        if (this.$v.newSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedSubscription();
        await this.$customers.addSubscription(this.customer._id, payload);
        await this.refreshCustomer();
        this.subscriptionCreationModal = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'une souscription");
      } finally {
        this.loading = false;
      }
    },
    startSubscriptionEdition (id) {
      const selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      const { _id, service, unitTTCRate, estimatedWeeklyVolume, evenings, sundays } = selectedSubscription;
      this.editedSubscription = {
        _id,
        nature: service.nature,
        unitTTCRate,
        estimatedWeeklyVolume,
        evenings,
        sundays,
      };

      this.subscriptionEditionModal = true;
    },
    resetEditionSubscriptionData () {
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
        this.refreshCustomer();
        this.subscriptionEditionModal = false;
        NotifyPositive('Souscription modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification d'une souscription")
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
          cancel: 'Annuler',
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
    async createAlenviHelper () {
      this.newHelper.local.password = randomize('0', 6);
      this.newHelper.customers = [this.userProfile._id];
      const roles = await this.$roles.showAll({ name: HELPER });
      if (roles.length === 0) throw new Error('Role not found');
      this.newHelper.role = roles[0]._id;
      this.newHelper.company = this.company._id;
      this.newHelper.identity = this.$_.pickBy(this.newHelper.identity);
      const payload = this.$_.pickBy(this.newHelper);
      await this.$users.create(payload);
    },
    async sendWelcomingEmail () {
      await this.$email.sendWelcome({
        receiver: {
          email: this.newHelper.local.email,
          password: this.newHelper.local.password,
        },
      });
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.createAlenviHelper();
        NotifyPositive('Aidant créé');
        await this.sendWelcomingEmail();
        NotifyPositive('Email envoyé');
        await this.getUserHelpers();
        this.addHelper = false
      } catch (e) {
        e.response ? console.error(e.response) : console.error(e);
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
          cancel: 'Annuler',
        });
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
          customerAddress: this.customer.contact.primaryAddress.fullAddress,
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
        this.$refs[refName][0].reset();
        return NotifyNegative('Fichier trop volumineux (> 5 Mo)');
      } else {
        this.$refs[refName][0].upload();
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
            weeklyRate: estimatedWeeklyRate ? `${this.formatNumber(estimatedWeeklyRate)}€` : '',
            sundays: subscription.sundays || '',
            evenings: subscription.evenings || '',
          }
        });

        const data = {
          quoteNumber: doc.quoteNumber,
          customerFirstname: this.customer.identity.firstname,
          customerLastname: this.customer.identity.lastname,
          customerAddress: this.customer.contact.primaryAddress.fullAddress,
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
        const subscriptions = this.subscriptions.map(subscription => {
          const sub = {
            serviceName: subscription.service.name,
            unitTTCRate: subscription.unitTTCRate,
            estimatedWeeklyVolume: subscription.estimatedWeeklyVolume,
          }
          if (subscription.sundays) sub.sundays = subscription.sundays;
          if (subscription.evenings) sub.evenings = subscription.evenings;

          return sub;
        });
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
    async getThirdPartyPayersOptions () {
      try {
        const thirdPartyPayers = await this.$thirdPartyPayers.showAll({ company: this.company._id });
        this.fundingTppOptions = thirdPartyPayers.map(tpp => ({ label: tpp.name, value: tpp._id }));
      } catch (e) {
        this.fundingTppOptions = [];
        console.error(e);
      }
    },
    async openFundingCreationModal () {
      await this.getThirdPartyPayersOptions();
      this.fundingCreationModal = true;
    },
    resetFundingFrequency () {
      if (this.newFunding.nature === FIXED && this.newFunding.frequency !== ONCE) {
        this.newFunding.frequency = '';
      }
    },
    fundingSubscriptionsOptions () {
      return this.subscriptions.filter(sub => sub.service.nature !== FIXED).map(sub => ({ label: sub.service.name, value: sub._id }));
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
      this.fundingCreationModal = false;
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
        subscription: '',
      };
    },
    formatCreatedFunding () {
      const cleanPayload = this.$_.pickBy(this.newFunding);
      const { nature, thirdPartyPayer, subscription, ...version } = cleanPayload;
      return {
        nature,
        thirdPartyPayer,
        subscription,
        versions: [{...version}],
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
        NotifyPositive('Financement ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'un financement");
      } finally {
        this.loading = false;
      }
    },
    async removeFunding (fundingId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce financement ?',
          ok: true,
          cancel: 'Annuler',
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
      this.editedFunding = Object.assign({}, this.fundings.find(fund => fund._id === id));
      this.editedFunding.subscription = this.editedFunding.subscription._id;
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
        const { folderNumber, endDate, frequency, amountTTC, unitTTCRate, careHours, careDays, customerParticipationRate, startDate, subscription } = this.editedFunding;
        const payload = {
          folderNumber,
          frequency,
          careDays,
          customerParticipationRate,
          startDate,
          endDate,
          subscription,
        };
        if (this.editedFunding.nature === FIXED) payload.amountTTC = amountTTC;
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
    },
  },
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
