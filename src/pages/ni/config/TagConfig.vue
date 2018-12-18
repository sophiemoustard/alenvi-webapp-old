<template>
  <q-page  class="neutral-background" padding>
    <div class="q-mb-xl">
      <table>
        <th>Nom tag</th>
        <th>Description</th>
        <tr v-for="(tag, index) in tags" :key="index">
          <td>{{`{${index}\}`}}</td>
          <td>{{tag}}</td>
        </tr>
      </table>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      tags: {
        'customerFirstname': 'Prénom du bénéficiaire',
        'customerLastname': 'Nom du bénéficiaire',
        'customerAddress': 'Adresse du bénéficiaire',
        'ics': 'ICS',
        'rum': 'RUM',
        'iban': 'IBAN',
        'bic': 'BIC',
        'companyName': 'Nom de l’organisation',
        'companyAddress': 'Adresse de l\'organisation',
        'uploadDate': 'Date de l\'upload du contrat pour la date de signature',
        'quoteNumber': 'Numéro du devis',
        'rcs': 'RCS de l’organisation',
        'services': 'Liste des services',
        'serviceName': 'Nom du service',
        'unitTTCRate': 'Tarif horaire TTC',
        'estimatedWeeklyVolume': 'Volume hebdomadaire estimé total',
        'sundays': 'Dont dimanche',
        'evenings': 'Dont soir après 20h',
        'estimatedWeeklyRate': 'Tarif hebdomadaire estimé',
        'auxiliaryTitle': 'Civilité',
        'auxiliaryFirstname': 'Prénom',
        'auxiliaryLastname': 'Nom',
        'auxiliaryAddress': 'Adresse',
        'auxiliaryCity': 'Ville',
        'auxiliaryZipCode': 'Code postal',
        'auxiliaryBirthDate': 'Date de naissance',
        'auxiliaryBirthCountry': 'Pays de naissance',
        'auxiliaryBirthState': 'Département de naissance',
        'auxiliaryNationality': 'Nationalité',
        'auxiliarySSN': 'Numéro de sécurité sociale',
        'grossHourlyRate': 'Taux horaire brut',
        'monthlyHours': 'Volume d\'heure mensuel (Volume d\'heures hebdomadaire * 4,33)',
        'salary': 'Salaire mensuel (Volume d\'heures mensuel * taux horaire brut)',
        'startDate': 'Date d\'effet du contrat / de la version',
        'weeklyHours': 'Volume horaire hebdomadaire',
        'yearlyHours': 'Volume horaire annuel (Volume d\'heure mensuel * 52)',
        'initialContractStartDate': 'Date d’effet du contrat initial',
      },
    };
  },
}
</script>

<style lang="stylus" scoped>
  th
    text-align: left
</style>
